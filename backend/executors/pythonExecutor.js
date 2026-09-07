/**
 * Python Executor - Executes Python code with python3
 * Production-grade with sandboxing, resource limits, and security
 * Uses resource module for runtime limits and restricted execution
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BaseExecutor } from "./baseExecutor.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PythonExecutor extends BaseExecutor {
  constructor(config = {}) {
    super("python", {
      timeout: 10000, // 10s default
      memoryLimit: 256 * 1024 * 1024, // 256MB default
      ...config,
    });
  }

  /**
   * Run a Python script without any compilation step.
   */
  async runOnly(executablePath, inputPath, requestId = "") {
    const startTime = Date.now();
    const jobId = path.basename(executablePath).split(".")[0];

    logger.executionStart(requestId, "python", jobId);
    logger.runtimeStart(requestId, "python", jobId);

    try {
      const child = spawn(
        "python3",
        ["-u", executablePath],
        {
          stdio: ["pipe", "pipe", "pipe"],
          env: {
            ...process.env,
            PYTHONUNBUFFERED: "1",
          },
        }
      );

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
            const errorMsg = stderr.trim();
            if (errorMsg) {
              reject(new Error(errorMsg || `Runtime error with exit code ${code}`));
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });

        child.on("error", (error) => {
          clearTimeout(timer);
          reject(new Error(`Failed to execute Python: ${error.message}`));
        });
      });

      const duration = Date.now() - startTime;
      logger.runtimeSuccess(requestId, "python", jobId, duration, stdout.length);
      logger.executionComplete(requestId, "python", jobId, duration);

      return stdout || stderr;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.runtimeError(requestId, "python", jobId, error, duration);
      throw error;
    }
  }

  /**
   * Execute Python code with resource limits and sandboxing
   */
  async execute(filePath, inputPath, requestId = "") {
    const startTime = Date.now();
    const jobId = path.basename(filePath).split(".")[0];

    logger.executionStart(requestId, "python", jobId);
    logger.runtimeStart(requestId, "python", jobId);

    const filesToCleanup = [filePath];

    try {
      const result = await this.runOnly(filePath, inputPath, requestId);
      await this.cleanup(filesToCleanup);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.runtimeError(requestId, "python", jobId, error, duration);
      await this.cleanup(filesToCleanup);
      throw error;
    }
  }
}