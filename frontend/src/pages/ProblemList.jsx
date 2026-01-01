import { useEffect, useState } from 'react';
import api from '../utils/axiosConfig.js';
import { Link } from 'react-router-dom';

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProblems() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get('/api/problems');
        setProblems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load problems:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load problems');
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Problem List</h1>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-3">Loading problems...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-600 rounded p-4 mb-4">
          <p className="text-red-300">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-400 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4">
          {problems.length === 0 ? (
            <p className="text-gray-400">No problems found.</p>
          ) : (
            problems.map((problem) => (
              <div
                key={problem._id}
                className="bg-gray-800 p-4 rounded shadow hover:bg-gray-700 transition"
              >
                <h2 className="text-xl font-semibold text-indigo-300">{problem.name}</h2>
                <p className="text-sm text-gray-300 mb-2">
                  {problem.statement ? problem.statement.slice(0, 100) + '...' : 'No description'}
                </p>
                <p className="text-xs text-indigo-400">Difficulty: {problem.difficulty || 'Unspecified'}</p>

                <div className="mt-3">
                  <Link
                    to={`/problems/${problem._id}`}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    View & Solve →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
