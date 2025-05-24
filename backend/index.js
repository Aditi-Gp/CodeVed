const express = require('express');
const app = express();
const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');
const { executeCpp } = require('./executeCpp');
const cors = require('cors');

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.json()); // Parse JSON data

// Basic health check endpoint
app.get("/", (req, res) => {
    res.json({ online: 'compiler' });
});

// Main endpoint to compile and run C++ code
app.post("/run", async (req, res) => {
    // Extract language, code, and input from request body with defaults
    const { language = 'cpp', code, input = '' } = req.body;
    
    // Validate that code is provided
    if (code === undefined || code.trim() === '') {
        return res.status(400).json({ 
            success: false, 
            error: "Empty code! Please provide some code to execute." 
        });
    }
    
    try {
        // Generate a temporary file with the user's code
        const filePath = await generateFile(language, code);
        
        // Generate a temporary file with the user's input (if any)
        const inputPath = await generateInputFile(input);
        
        // Compile and execute the C++ code
        const output = await executeCpp(filePath, inputPath);
        
        // Send successful response with output
        res.json({ 
            success: true,
            filePath, 
            inputPath, 
            output 
        });
    } catch (error) {
        console.error('Error executing code:', error);
        
        // Send error response with proper error message
        res.status(500).json({ 
            success: false,
            error: error.message || error.toString() || 'An error occurred while executing the code'
        });
    }
});

// Start the server on port 8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}!`);
});