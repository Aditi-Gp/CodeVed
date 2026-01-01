import { useState, useEffect } from 'react';
import api from './utils/axiosConfig.js';
import executionApi from './utils/executionApi.js';
import './App.css';
import CodeBlock from './CodeBlock';
import { codeTemplates, getLanguageName, getPrismLanguage } from './utils/codeTemplates.js';

function App() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(codeTemplates.cpp);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [supportedLanguages, setSupportedLanguages] = useState(['cpp', 'java', 'python']);

  // Fetch supported languages from execution backend on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await executionApi.get('/languages');
        if (response.data.success) {
          setSupportedLanguages(response.data.languages);
        }
      } catch (err) {
        console.warn('Failed to fetch supported languages, using defaults');
      }
    };
    fetchLanguages();
  }, []);

  // Update code template when language changes
  useEffect(() => {
    if (codeTemplates[language]) {
      setCode(codeTemplates[language]);
    }
    setOutput('');
    setError(null);
    setExecutionTime(null);
  }, [language]);

  const handleSubmit = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setOutput('');
    setError(null);
    setExecutionTime(null);

    const payload = {
      language,
      code,
      input,
    };

    try {
      const startTime = Date.now();
      const { data } = await executionApi.post('/run', payload);
      const duration = Date.now() - startTime;
      
      if (data.success) {
        setOutput(data.output || '');
        setExecutionTime(data.executionTime || duration);
      } else {
        setError(data.error || 'Execution failed');
        setOutput('');
      }
    } catch (error) {
      let errorMessage = 'An error occurred';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
        setError(errorMessage);
        setOutput('');
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Could not connect to server. Please check if the backend is running.';
        setError(errorMessage);
        setOutput('');
      } else {
        // Error in request setup
        errorMessage = error.message || 'Unknown error occurred';
        setError(errorMessage);
        setOutput('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const explainCode = async () => {
    setLoadingExplain(true);
    setExplanation(''); // Clear previous explanation
    
    try {
      const res = await api.post('/api/explain', { 
        code,
        language,
      });
      
      if (res.data.success && res.data.explanation) {
        setExplanation(res.data.explanation);
      } else {
        throw new Error(res.data.error || 'Failed to generate explanation');
      }
    } catch (err) {
      console.error('Explain API Error:', err);
      
      let errorMsg = 'Failed to generate explanation.';
      
      if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 60;
        errorMsg = `Too many requests. Please try again in ${retryAfter} seconds.`;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setExplanation(`❌ Error: ${errorMsg}`);
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Code Editor</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`px-3 py-1 rounded text-sm border ${
                  darkMode
                    ? 'bg-gray-800 text-gray-200 border-gray-600'
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
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
              onChange={e => setCode(e.target.value)}
              rows={14}
              className={`w-full font-mono p-3 rounded-md text-sm resize-none border ${
                darkMode
                  ? 'bg-gray-900 text-green-200 border-gray-700 focus:border-indigo-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:border-indigo-500'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder={`Enter your ${getLanguageName(language)} code here...`}
            />
          </div>

          <div>
            <label className="text-sm font-medium">🔎 Preview</label>
            <div
              className={`p-3 rounded border overflow-auto max-h-[300px] ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <CodeBlock language={getPrismLanguage(language)} code={code} />
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Output</label>
              {executionTime && (
                <span className="text-xs text-gray-500">
                  ⏱️ {executionTime}ms
                </span>
              )}
            </div>
            <div
              className={`p-3 min-h-[120px] rounded-md overflow-y-auto font-mono text-sm border ${
                error
                  ? darkMode
                    ? 'bg-red-900/20 border-red-600 text-red-300'
                    : 'bg-red-50 border-red-300 text-red-700'
                  : darkMode
                  ? 'bg-gray-900 border-gray-700 text-green-300'
                  : 'bg-gray-100 border-gray-200 text-gray-800'
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
