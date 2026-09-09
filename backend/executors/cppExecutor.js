/**
 * cppExecutor.js
 * C++ Executor - Compiles and executes C++ code with g++
 * Production-grade with proper error handling and resource limits
 */

import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BaseExecutor } from "./baseExecutor.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CppExecutor extends BaseExecutor {
  constructor(config = {}) {
    super("cpp", {
      timeout: 10000, // 10s default
      compilationTimeout: 5000, // 5s for compilation
      ...config,
    });
    this.outputPath = path.join(__dirname, "../outputs");
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
  }

  /**
   * Compile C++ code using g++
   */
  async compile(filePath, jobId) {
    const outPath = path.join(this.outputPath, `${jobId}.out`);
    const compileStart = Date.now();

    return new Promise((resolve, reject) => {
      // Use timeout for compilation
      const compileProcess = exec(
        `g++ -std=c++17 -O2 -Wall "${filePath}" -o "${outPath}"`,
        { timeout: this.config.compilationTimeout },
        (error, stdout, stderr) => {
          const duration = Date.now() - compileStart;
          const compilerUnavailable = error?.code === "ENOENT"
            || stderr.includes("g++' is not recognized")
            || stderr.includes("g++: command not found");

          if (compilerUnavailable) {
            const setupMessage = process.platform === "win32"
              ? "C++ compiler not found. Install MSYS2, add C:\\msys64\\ucrt64\\bin to PATH, then restart the backend."
              : "C++ compiler not found. Install g++ and make sure it is available on PATH.";
            logger.compilationError("", "cpp", jobId, new Error(setupMessage), duration);
            return reject(new Error(setupMessage));
          }
          
          if (error) {
            logger.compilationError("", "cpp", jobId, 
              new Error(stderr || error.message), duration);
            return reject(new Error(stderr || error.message || "Compilation failed"));
          }

          logger.compilationSuccess("", "cpp", jobId, duration);
          resolve(outPath);
        }
      );
    });
  }

  /**
   * Run an already compiled C++ binary without recompiling.
   */
  async runOnly(executablePath, inputPath, requestId = "") {
    const startTime = Date.now();
    const jobId = path.basename(executablePath).split(".")[0];

    logger.executionStart(requestId, "cpp", jobId);
    logger.runtimeStart(requestId, "cpp", jobId);

    try {
      const child = spawn(executablePath, [], {
        cwd: path.dirname(executablePath),
        stdio: ["pipe", "pipe", "pipe"],
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
            reject(new Error(stderr || `Runtime error with exit code ${code}`));
          } else {
            resolve();
          }
        });

        child.on("error", (error) => {
          clearTimeout(timer);
          reject(new Error(`Failed to execute: ${error.message}`));
        });
      });

      const duration = Date.now() - startTime;
      logger.runtimeSuccess(requestId, "cpp", jobId, duration, stdout.length);
      logger.executionComplete(requestId, "cpp", jobId, duration);

      return stdout || stderr;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.runtimeError(requestId, "cpp", jobId, error, duration);
      throw error;
    }
  }

  /**
   * Execute compiled C++ binary
   */
  async execute(filePath, inputPath, requestId = "") {
    const startTime = Date.now();
    const jobId = path.basename(filePath).split(".")[0];

    logger.executionStart(requestId, "cpp", jobId);
    logger.compilationStart(requestId, "cpp", jobId);

    const filesToCleanup = [filePath];

    try {
      const executablePath = await this.compile(filePath, jobId);
      filesToCleanup.push(executablePath);

      const result = await this.runOnly(executablePath, inputPath, requestId);
      await this.cleanup(filesToCleanup);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.runtimeError(requestId, "cpp", jobId, error, duration);
      await this.cleanup(filesToCleanup);
      throw error;
    }
  }
}

