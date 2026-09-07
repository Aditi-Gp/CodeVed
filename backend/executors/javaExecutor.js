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

          const code = fs.readFileSync(filePath, "utf-8");
          const className = this.extractClassName(code);
          const jobDir = path.dirname(filePath);
          resolve(path.join(jobDir, `${className}.class`));
        }
      );
    });
  }

  /**
   * Run an already compiled Java class without recompiling.
   */
  async runOnly(executablePath, inputPath, requestId = "") {
    const startTime = Date.now();
    const className = path.extname(executablePath) === ".class"
      ? path.basename(executablePath, ".class")
      : path.basename(executablePath);
    const jobDir = path.dirname(executablePath);
    const jobId = className;

    logger.executionStart(requestId, "java", jobId);
    logger.runtimeStart(requestId, "java", jobId);

    try {
      const memoryLimitMB = Math.floor(this.config.memoryLimit / (1024 * 1024));
      const policyPath = path.join(__dirname, "../java.policy");
      const hasPolicyFile = fs.existsSync(policyPath);

      const javaArgs = [
        "-cp", jobDir,
        `-Xmx${memoryLimitMB}m`,
        "-Xms64m",
        "-XX:MaxMetaspaceSize=64m",
        className,
      ];

      if (hasPolicyFile) {
        javaArgs.push(`-Djava.security.manager`);
        javaArgs.push(`-Djava.security.policy=${policyPath}`);
      }

      const child = spawn("java", javaArgs, {
        cwd: jobDir,
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          JAVA_HOME: process.env.JAVA_HOME || "/usr/lib/jvm/default-java",
        },
      });

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
            const filteredStderr = stderr
              .split("\n")
              .filter((line) => {
                const trimmed = line.trim();
                return trimmed !== "" && !trimmed.includes("Picked up") && !trimmed.includes("WARNING");
              })
              .join("\n")
              .trim();

            if (filteredStderr) {
              reject(new Error(filteredStderr || `Runtime error with exit code ${code}`));
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });

        child.on("error", (error) => {
          clearTimeout(timer);
          if (error.code === "ENOENT") {
            reject(new Error("Java runtime not found. Please ensure Java is installed and in PATH."));
          } else {
            reject(new Error(`Failed to execute Java: ${error.message}`));
          }
        });
      });

      const duration = Date.now() - startTime;
      logger.runtimeSuccess(requestId, "java", jobId, duration, stdout.length);
      logger.executionComplete(requestId, "java", jobId, duration);

      return stdout || stderr;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.runtimeError(requestId, "java", jobId, error, duration);
      throw error;
    }
  }

  /**
   * Execute compiled Java class with security manager and resource limits
   */
  async execute(filePath, inputPath, requestId = "") {
    const startTime = Date.now();
    const jobId = path.basename(filePath).split(".")[0];

    logger.executionStart(requestId, "java", jobId);

    const filesToCleanup = [filePath];

    try {
      const compiledPath = await this.compile(filePath, jobId);
      filesToCleanup.push(compiledPath);

      const result = await this.runOnly(compiledPath, inputPath, requestId);
      await this.cleanup(filesToCleanup);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.runtimeError(requestId, "java", jobId, error, duration);
      await this.cleanup(filesToCleanup);
      throw error;
    }
  }
}

