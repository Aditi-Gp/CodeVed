import { useState } from 'react';
import axios from 'axios';
import './App.css';
import CodeBlock from './CodeBlock';

function App() {
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
  const [explanation, setExplanation] = useState('');
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  

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

  const explainCode = async () => {
    setLoadingExplain(true);
    try {
      const res = await axios.post('http://localhost:8000/api/explain', { code });
      setExplanation(res.data.explanation);
    } catch (err) {
      console.error('Explain API Error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      setExplanation('Failed to generate explanation: ' + errorMsg);
    } finally {
      setLoadingExplain(false);
    }
  };

  return (
    <div className={darkMode ? 'dark bg-[#1e1e1e] text-gray-200 min-h-screen' : 'bg-gray-50 text-gray-800 min-h-screen'}>
      <div className="p-4 flex justify-between items-center shadow-md bg-opacity-10 backdrop-blur border-b border-gray-500">
  <div className="flex items-center gap-3">
    <img src="/logo.png" alt="Codeved Logo" className="w-10 h-10 rounded" />
    <h1 className="text-3xl font-bold text-indigo-400">CodeVed</h1>
  </div>
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm shadow"
  >
    {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
  </button>
</div>


      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Editor + Preview + Buttons + AI */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">C++ Code Editor</label>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={12}
              className={`w-full font-mono p-3 rounded-md text-sm resize-none border ${
                darkMode
                  ? 'bg-gray-900 text-green-200 border-gray-700'
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="text-sm font-medium">🔎 Preview</label>
            <div
              className={`p-3 rounded border overflow-auto max-h-[300px] ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <CodeBlock language="cpp" code={code} />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded text-white font-semibold transition ${
                isLoading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? '⏳ Running...' : '▶️ Run Code'}
            </button>

            <button
              onClick={explainCode}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
            >
              {loadingExplain ? '🔄 Explaining...' : '🧠 Explain Code'}
            </button>
          </div>

          {explanation && (
            <div
              className={`p-4 rounded border ${
                darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-100 border-gray-300'
              }`}
            >
              <h2 className="text-lg font-semibold mb-2 text-purple-300">📝 AI Explanation</h2>
              <p className="whitespace-pre-wrap text-sm">
                {explanation}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Input + Output */}
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium">Program Input</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={5}
              className={`w-full p-3 rounded-md text-sm resize-none border ${
                darkMode
                  ? 'bg-gray-900 text-green-200 border-gray-700'
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
              placeholder="Enter input (optional)"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Output</label>
            <div
              className={`p-3 h-28 rounded-md overflow-y-auto font-mono text-sm border ${
                darkMode
                  ? 'bg-gray-900 border-gray-700 text-green-300'
                  : 'bg-gray-100 border-gray-200 text-gray-800'
              }`}
            >
              {isLoading ? 'Running your code...' : output || 'Output will appear here...'}
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center py-4 text-xs opacity-70">
  Developed by{' '}
  <a
    href="https://www.linkedin.com/in/aditi-gupta-56429322a/"
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-indigo-400 hover:underline"
  >
    Aditi Gupta
  </a>
</footer>


    </div>
  );
}

export default App;
