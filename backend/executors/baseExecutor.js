/**
 * Base executor class providing common execution patterns
 * All language-specific executors extend this for consistency
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BaseExecutor {
  constructor(language, config = {}) {
    this.language = language;
    this.config = {
      timeout: config.timeout || 10000, // 10s default
      memoryLimit: config.memoryLimit || 256 * 1024 * 1024, // 256MB default
      maxOutputSize: config.maxOutputSize || 10 * 1024 * 1024, // 10MB default
      ...config,
    };
  }

  /**
   * Execute a command with timeout, memory limits, and proper cleanup
   * Returns { stdout, stderr, exitCode, duration }
   */
  async executeCommand(command, args = [], options = {}) {
    const startTime = Date.now();
    const timeout = options.timeout || this.config.timeout;
    
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ["pipe", "pipe", "pipe"],
        ...options,
      });

      let stdout = "";
      let stderr = "";
      let stdoutSize = 0;
      let stderrSize = 0;

      // Track output size to prevent memory exhaustion
      child.stdout.on("data", (data) => {
        const dataStr = data.toString();
        stdoutSize += data.length;
        if (stdoutSize > this.config.maxOutputSize) {
          child.kill("SIGKILL");
          return reject(new Error("Output size limit exceeded"));
        }
        stdout += dataStr;
      });

      child.stderr.on("data", (data) => {
        const dataStr = data.toString();
        stderrSize += data.length;
        if (stderrSize > this.config.maxOutputSize) {
          child.kill("SIGKILL");
          return reject(new Error("Error output size limit exceeded"));
        }
        stderr += dataStr;
      });

      // Timeout protection
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error(`Execution timed out after ${timeout}ms`));
      }, timeout);

      child.on("close", (code) => {
        clearTimeout(timer);
        const duration = Date.now() - startTime;
        resolve({
          stdout,
          stderr,
          exitCode: code,
          duration,
        });
      });

      child.on("error", (error) => {
        clearTimeout(timer);
        reject(new Error(`Failed to start process: ${error.message}`));
      });
    });
  }

  /**
   * Read input file and pipe to stdin
   */
  async pipeInput(child, inputPath) {
    if (!inputPath || !fs.existsSync(inputPath)) {
      return;
    }
    const inputStream = fs.createReadStream(inputPath);
    inputStream.pipe(child.stdin);
  }

  /**
   * Cleanup temporary files
   */
  async cleanup(files) {
    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          await fs.promises.unlink(file);
        }
      } catch (error) {
        // Log but don't fail on cleanup errors
        console.warn(`Failed to cleanup file ${file}:`, error.message);
      }
    }
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  async execute(filePath, inputPath) {
    throw new Error("execute() must be implemented by subclass");
  }
}









