import { useState, useEffect } from 'react';
import axios from 'axios';
import CodeBlock from '../CodeBlock';
import { codeTemplates, getLanguageName, getPrismLanguage } from '../utils/codeTemplates.js';

export default function Compiler() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(codeTemplates.cpp);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState(['cpp', 'java', 'python']);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/languages`);
        if (response.data.success) {
          setSupportedLanguages(response.data.languages);
        }
      } catch (err) {
        console.warn('Failed to fetch supported languages');
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (codeTemplates[language]) {
      setCode(codeTemplates[language]);
    }
    setOutput('');
    setError(null);
  }, [language]);

  const handleRun = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setOutput('');
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { data } = await axios.post(`${backendUrl}/run`, { language, code, input });
      
      if (data.success) {
        setOutput(data.output || '');
      } else {
        setError(data.error || 'Execution failed');
        setOutput('');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error running code';
      setError(errorMsg);
      setOutput('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      <h1 className="text-4xl font-bold text-indigo-400 mb-4">Online Compiler</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Code Editor</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 rounded text-sm bg-gray-800 text-gray-200 border border-gray-600"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {getLanguageName(lang)}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={14}
            className="w-full font-mono p-3 rounded-md text-sm bg-gray-900 text-green-200 border border-gray-700 resize-none focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={`Enter your ${getLanguageName(language)} code here...`}
          />
          <button
            onClick={handleRun}
            disabled={isLoading}
            className={`mt-4 w-full px-4 py-2 rounded text-white font-semibold transition ${
              isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running...
              </span>
            ) : (
              'Run Code'
            )}
          </button>
        </div>

        {/* Input/Output */}
        <div>
          <label className="text-sm font-medium">Program Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-md text-sm bg-gray-900 text-green-200 border border-gray-700 resize-none focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter input (optional)"
          />

          <label className="text-sm font-medium mt-4 block">Output</label>
          <div
            className={`p-3 rounded-md min-h-[160px] border overflow-y-auto font-mono text-sm ${
              error
                ? 'bg-red-900/20 border-red-600 text-red-300'
                : 'bg-gray-900 border-gray-700 text-green-300'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                <span>Compiling and running your code...</span>
              </div>
            ) : error ? (
              <div>
                <div className="font-semibold mb-1">❌ Error:</div>
                <div className="whitespace-pre-wrap">{error}</div>
              </div>
            ) : output ? (
              <div className="whitespace-pre-wrap">{output}</div>
            ) : (
              <div className="text-gray-500 italic">Output will appear here...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
