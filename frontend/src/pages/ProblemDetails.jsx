import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/axiosConfig.js';
import CodeBlock from '../CodeBlock';
import { codeTemplates, getLanguageName, getPrismLanguage } from '../utils/codeTemplates.js';

export default function ProblemDetails() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(codeTemplates.cpp);
  const [verdict, setVerdict] = useState(null);
  const [results, setResults] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState(['cpp', 'java', 'python']);

  useEffect(() => {
    api.get(`/api/problems/${id}`).then(res => setProblem(res.data));
    
    // Fetch supported languages
    const fetchLanguages = async () => {
      try {
        const response = await api.get('/languages');
        if (response.data.success) {
          setSupportedLanguages(response.data.languages);
        }
      } catch (err) {
        console.warn('Failed to fetch supported languages');
      }
    };
    fetchLanguages();
  }, [id]);

  useEffect(() => {
    if (codeTemplates[language]) {
      setCode(codeTemplates[language]);
    }
    setVerdict(null);
    setResults([]);
  }, [language]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setVerdict(null);
    setResults([]);

    try {
      const res = await api.post(`/api/submit/${id}`, { 
        code, 
        language 
      });
      
      if (res.data.verdict) {
        setVerdict(res.data.verdict);
        setResults(res.data.results || []);
      } else {
        throw new Error(res.data.error || 'Submission failed');
      }
    } catch (err) {
      console.error('Submission error:', err);
      
      let errorMsg = 'Submission failed';
      
      if (err.response?.status === 401) {
        errorMsg = 'Authentication required. Please login.';
      } else if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 60;
        errorMsg = `Rate limit exceeded. Please try again in ${retryAfter} seconds.`;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setVerdict(`Error: ${errorMsg}`);
      setResults([]);
    } finally {
      setIsSubmitting(false);
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
      }
      
      setExplanation(`❌ Error: ${errorMsg}`);
    } finally {
      setLoadingExplain(false);
    }
  };

  if (!problem) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-4">
      <h1 className="text-3xl font-bold text-indigo-400">{problem.name}</h1>
      <p className="text-lg">{problem.statement}</p>

      <div className="flex items-center justify-between mt-6">
        <label className="text-sm font-medium">Code</label>
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
        onChange={e => setCode(e.target.value)}
        rows={12}
        className="w-full font-mono p-3 rounded-md text-sm resize-none bg-gray-800 text-green-200 border border-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={`Enter your ${getLanguageName(language)} code here...`}
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded font-semibold transition ${
            isSubmitting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </span>
          ) : (
            'Submit Code'
          )}
        </button>

      <button
        onClick={explainCode}
        disabled={loadingExplain}
        className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold"
      >
        {loadingExplain ? 'Generating...' : 'Explain Code'}
      </button>


      {verdict && (
        <div className="mt-4 p-4 rounded border border-indigo-500 bg-gray-900">
          <h2 className="text-lg font-semibold mb-2">Verdict: {verdict}</h2>
          <ul className="text-sm">
            {results.map((r, i) => (
              <li key={i} className={r.passed ? 'text-green-400' : 'text-red-400'}>
                Input: {r.input} | Expected: {r.expected} | Your Output: {r.actual}
              </li>
            ))}
          </ul>
        </div>
      )}

      {explanation && (
        <div className="mt-4 p-4 rounded border border-purple-500 bg-gray-900">
          <h2 className="text-lg font-semibold mb-2 text-purple-300">🧠 AI Explanation</h2>
          <p className="whitespace-pre-wrap text-sm">{explanation}</p>
        </div>
      )}

    </div>
  );
}
