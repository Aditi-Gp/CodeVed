import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import CodeBlock from '../CodeBlock';


export default function ProblemDetails() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(`#include <iostream>\nusing namespace std;\n\nint main() {\n  // your code here\n  return 0;\n}`);
  const [verdict, setVerdict] = useState(null);
  const [results, setResults] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [loadingExplain, setLoadingExplain] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/problems/${id}`).then(res => setProblem(res.data));
  }, [id]);

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/submit/${id}`, { code });
      setVerdict(res.data.verdict);
      setResults(res.data.results);
    } catch (err) {
        console.error('Submission error:', err); // Shows full Axios error object
        if (err.response) {
          console.error('Server responded with:', err.response.data);
        } else if (err.request) {
          console.error('No response from server:', err.request);
        } else {
          console.error('Error during request setup:', err.message);
        }
      
        setVerdict('Error during submission');
      }
      
  };

  const explainCode = async () => {
    setLoadingExplain(true);
    try {
      const res = await axios.post('http://localhost:5000/api/explain', { code });
      setExplanation(res.data.explanation);
    } catch (err) {
      console.error('Explain API Error:', err);
      setExplanation('Failed to generate explanation.');
    } finally {
      setLoadingExplain(false);
    }
  };

  if (!problem) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-4">
      <h1 className="text-3xl font-bold text-indigo-400">{problem.name}</h1>
      <p className="text-lg">{problem.statement}</p>

      <label className="text-sm font-medium block mt-6">C++ Code</label>
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        rows={12}
        className="w-full font-mono p-3 rounded-md text-sm resize-none bg-gray-800 text-green-200 border border-gray-700"
      />

      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
      >
        Submit Code
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
