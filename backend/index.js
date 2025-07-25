import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import { executeCpp } from './executeCpp.js';
import explainRoute from './routes/explain.js';

// Polyfill fetch and related APIs in Node.js
import fetch from 'node-fetch';
import { Headers, Request, Response } from 'node-fetch';
import { Blob } from 'fetch-blob';
import { FormData } from 'formdata-node';

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Blob = Blob;
globalThis.FormData = FormData;

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware setup
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use('/api/explain', explainRoute);

// Health check
app.get("/", (req, res) => {
  res.json({ online: 'compiler' });
});

// Code execution endpoint
app.post("/run", async (req, res) => {
  const { language = 'cpp', code, input = '' } = req.body;
  console.log("Request payload:", req.body);

  if (!code || code.trim() === '') {
    return res.status(400).json({
      success: false,
      error: "Empty code! Please provide some code to execute."
    });
  }

  try {
    const filePath = await generateFile(language, code);
    const inputPath = await generateInputFile(input);
    const output = await executeCpp(filePath, inputPath);
    console.log("Output:", output);

    res.json({
      success: true,
      filePath,
      inputPath,
      output
    });
  } catch (error) {
    console.error('Error executing code:', error);

    res.status(500).json({
      success: false,
      error: error.message || error.toString() || 'An error occurred while executing the code'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});
