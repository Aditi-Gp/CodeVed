// executeCpp.js
import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Support for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, inputPath, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const jobId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.out`);

    exec(`g++ "${filepath}" -o "${outPath}"`, (compileErr, _, compileStderr) => {
      if (compileErr) {
        return reject(new Error(compileStderr || compileErr.message || "Compilation failed"));
      }

      const child = spawn(`./${jobId}.out`, {
        cwd: outputPath,
        stdio: ["pipe", "pipe", "pipe"],
      });

      const inputStream = fs.createReadStream(inputPath);
      inputStream.pipe(child.stdin);

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        return reject(new Error("Execution timed out"));
      }, timeout);

      child.on("close", (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          return reject(new Error(stderr || `Runtime error with exit code ${code}`));
        }
        return resolve(stdout || stderr);
      });
    });
  });
};

export { executeCpp };
