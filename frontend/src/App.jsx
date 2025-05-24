import { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/themes/prism.css';
import axios from 'axios';
import './App.css';

function App() {
  // State to manage user's C++ code, input, output, and loading status
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    int num1, num2, sum;
    cin >> num1 >> num2;
    sum = num1 + num2;
    cout << "The sum of the two numbers is: " << sum;
    return 0;
}`);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to send code to backend for compilation and execution
  const handleSubmit = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setOutput('');

    const payload = {
      language: 'cpp',
      code,
      input,
    };

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { data } = await axios.post(backendUrl, payload);
      setOutput(data.output);
    } catch (error) {
      // Handle different types of errors and show user-friendly messages
      if (error.response) {
        setOutput(`Error: ${error.response.data.error || 'Server error occurred'}`);
      } else if (error.request) {
        setOutput('Error: Could not connect to server.');
      } else {
        setOutput(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-8 px-4 lg:px-16 font-sans">
      <h1 className="text-4xl font-bold text-center mb-8 text-indigo-600">AlgoU Code Compiler with user input</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Code Editor Section */}
        <div className="lg:w-1/2 space-y-4">
          <div
            className="rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white"
            style={{ height: '400px', overflowY: 'auto' }}
          >
            {/* Code editor with C++ syntax highlighting */}
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => highlight(code, languages.cpp || languages.clike)}
              padding={12}
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 14,
                height: '100%',
                overflowY: 'auto',
                outline: 'none',
                backgroundColor: '#f9fafb',
              }}
            />
          </div>

          {/* Run button with loading state */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.6 3.11a.375.375 0 0 1-.56-.327V8.887c0-.285.308-.465.56-.326l5.6 3.11z"
              />
            </svg>
            {isLoading ? 'Running...' : 'Run Code'}
          </button>
        </div>

        {/* Input and Output Section */}
        <div className="lg:w-1/2 space-y-6">
          {/* Input Box for program input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Input
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none"
              placeholder="Enter input (optional)"
            />
          </div>

          {/* Output Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output
            </label>
            <div className="p-3 h-28 bg-gray-100 border border-gray-200 rounded-md overflow-y-auto font-mono text-sm">
              {output ? output : 'Output will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
