import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // ✅ Add this

export default function ProblemList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const { data } = await axios.get('http://localhost:5000/api/problems');
        setProblems(data);
      } catch (err) {
        console.error('Failed to load problems:', err);
      }
    }
    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">📘 Problem List</h1>

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
              <p className="text-sm text-gray-300 mb-2">{problem.statement.slice(0, 100)}...</p>
              <p className="text-xs text-indigo-400">Difficulty: {problem.difficulty || 'Unspecified'}</p>

              {/* ✅ View & Solve Link */}
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
    </div>
  );
}
