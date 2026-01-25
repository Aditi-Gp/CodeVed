// generateInputFile.js (ESM version)

import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// __dirname workaround in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dirInputs = path.join(__dirname, 'inputs');

if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

// Creates a temporary file with user's input data
const generateInputFile = async (input) => {
    const jobID = uuid();
    const input_filename = `${jobID}.txt`;
    const input_filePath = path.join(dirInputs, input_filename);
    await fs.promises.writeFile(input_filePath, input);
    return input_filePath;
};

export { generateInputFile };
