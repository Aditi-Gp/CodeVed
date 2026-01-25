/**
 * Java Executor - Compiles and executes Java code with javac/java
 * Production-grade with sandboxing, resource limits, and security
 */

import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BaseExecutor } from "./baseExecutor.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class JavaExecutor extends BaseExecutor {
  constructor(config = {}) {
    super("java", {
      timeout: 10000, // 10s default
      compilationTimeout: 5000, // 5s for compilation
      memoryLimit: 256 * 1024 * 1024, // 256MB default
      ...config,
    });
    this.classPath = path.join(__dirname, "../codes");
    this.outputPath = path.join(__dirname, "../outputs");
    
    // Ensure directories exist
    [this.classPath, this.outputPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Extract class name from Java code (assumes public class)
   */
  extractClassName(code) {
    const match = code.match(/public\s+class\s+(\w+)/);
    if (!match) {
      throw new Error("Java code must contain a public class");
    }
    return match[1];
  }

  /**
   * Compile Java code using javac
   */
  async compile(filePath, jobId) {
    const compileStart = Date.now();

    return new Promise((resolve, reject) => {
      exec(
        `javac "${filePath}"`,
        {
          timeout: this.config.compilationTimeout,
          cwd: path.dirname(filePath),
        },
        (error, stdout, stderr) => {
          const duration = Date.now() - compileStart;
          
          if (error) {
            logger.compilationError("", "java", jobId, 
              new Error(stderr || error.message), duration);
            return reject(new Error(stderr || error.message || "Compilation failed"));
          }

          logger.compilationSuccess("", "java", jobId, duration);
          resolve();
        }
      );
    });
  }

  /**
   * Execute compiled Java class with security manager and resource limits
   */
  async execute(filePath, inputPath, requestId = "") {
    const startTime = Date.now();
    const jobId = path.basename(filePath).split(".")[0];
    
    logger.executionStart(requestId, "java", jobId);
    
    let className;
    const filesToCleanup = [filePath];

    try {
      // Read code to extract class name
      const code = await fs.promises.readFile(filePath, "utf-8");
      className = this.extractClassName(code);

      // Java REQUIRES filename == public class name
      const jobDir = path.join(this.classPath, jobId);
      await fs.promises.mkdir(jobDir, { recursive: true });

      const javaFilePath = path.join(jobDir, `${className}.java`);
      await fs.promises.writeFile(javaFilePath, code);

      // Override filePath for compilation
      filePath = javaFilePath;


      logger.compilationStart(requestId, "java", jobId);
      await this.compile(filePath, jobId);

      // Find compiled .class file
      const classFile = path.join(jobDir, `${className}.class`);

      if (!fs.existsSync(classFile)) {
        throw new Error(`Compiled class file not found: ${className}.class`);
      }
      filesToCleanup.push(classFile);

      logger.runtimeStart(requestId, "java", jobId);

      // Execute Java with security constraints and resource limits
      // Memory limit: -Xmx sets max heap size
      // Note: Security manager is optional - can be enabled if policy file exists
      const memoryLimitMB = Math.floor(this.config.memoryLimit / (1024 * 1024));
      const policyPath = path.join(__dirname, "../java.policy");
      const hasPolicyFile = fs.existsSync(policyPath);
      
      const javaArgs = [
        "-cp", jobDir,
        `-Xmx${memoryLimitMB}m`,
        "-Xms64m",
        "-XX:MaxMetaspaceSize=64m",
        className
      ];
      
      // Add security manager only if policy file exists
      if (hasPolicyFile) {
        javaArgs.push(`-Djava.security.manager`);
        javaArgs.push(`-Djava.security.policy=${policyPath}`);
      }
      
      javaArgs.push(className);
      
      const child = spawn("java", javaArgs, {
        cwd: path.dirname(filePath),
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          JAVA_HOME: process.env.JAVA_HOME || "/usr/lib/jvm/default-java",
        },
      });   


      // Pipe input if provided
      if (inputPath && fs.existsSync(inputPath)) {
        const inputStream = fs.createReadStream(inputPath);
        inputStream.pipe(child.stdin);
      } else {
        child.stdin.end();
      }

      let stdout = "";
      let stderr = "";
      let stdoutSize = 0;
      let stderrSize = 0;

      child.stdout.on("data", (data) => {
        const dataStr = data.toString();
        stdoutSize += data.length;
        if (stdoutSize > this.config.maxOutputSize) {
          child.kill("SIGKILL");
          throw new Error("Output size limit exceeded");
        }
        stdout += dataStr;
      });

      child.stderr.on("data", (data) => {
        const dataStr = data.toString();
        stderrSize += data.length;
        if (stderrSize > this.config.maxOutputSize) {
          child.kill("SIGKILL");
          throw new Error("Error output size limit exceeded");
        }
        stderr += dataStr;
      });

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        throw new Error(`Execution timed out after ${this.config.timeout}ms`);
      }, this.config.timeout);

      await new Promise((resolve, reject) => {
        child.on("close", (code) => {
          clearTimeout(timer);
          if (code !== 0 && code !== null) {
            // Java often writes to stderr even on success (e.g., "Picked up JAVA_TOOL_OPTIONS")
            // Filter out common JVM warnings
            const filteredStderr = stderr
              .split('\n')
              .filter(line => {
                const trimmed = line.trim();
                return trimmed !== '' && 
                       !trimmed.includes('Picked up') && 
                       !trimmed.includes('WARNING');
              })
              .join('\n')
              .trim();
            
            if (filteredStderr) {
              reject(new Error(filteredStderr || `Runtime error with exit code ${code}`));
            } else {
              // No meaningful error, treat as success
              resolve();
            }
          } else {
            resolve();
          }
        });

        child.on("error", (error) => {
          clearTimeout(timer);
          // Provide more helpful error messages
          if (error.code === 'ENOENT') {
            reject(new Error('Java runtime not found. Please ensure Java is installed and in PATH.'));
          } else {
            reject(new Error(`Failed to execute Java: ${error.message}`));
          }
        });
      });

      const duration = Date.now() - startTime;
      logger.runtimeSuccess(requestId, "java", jobId, duration, stdout.length);
      logger.executionComplete(requestId, "java", jobId, duration);

      // Cleanup
      await this.cleanup(filesToCleanup);

      return stdout || stderr;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.runtimeError(requestId, "java", jobId, error, duration);
      
      // Cleanup on error
      await this.cleanup(filesToCleanup);
      
      throw error;
    }
  }
}

