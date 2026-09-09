// generateFile.js (ESM version)

import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dirCodes = path.join(__dirname, 'codes');

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

function getFileExtension(language) {
    const extensionMap = {
        cpp: 'cpp',
        java: 'java',
        python: 'py', 
    };
    return extensionMap[language.toLowerCase()] || language.toLowerCase();
}

/**
 * Creates a temporary file with user's code content
 * @param {string} language - Language identifier (cpp, java, python)
 * @param {string} content - Code content
 * @returns {Promise<string>} Path to the generated file
 */
const generateFile = async (language, content) => {
    const jobID = uuid();
    const extension = getFileExtension(language);
    if (language.toLowerCase() === 'java') {
        content = content.replace(/public\s+class\s+\w+/, `public class CodeVed_${jobID.replaceAll('-', '_')}`);
    }
    const filename = `${jobID}.${extension}`;
    const filePath = path.join(dirCodes, filename);
    await fs.promises.writeFile(filePath, content);
    return filePath;
};

export { generateFile };
