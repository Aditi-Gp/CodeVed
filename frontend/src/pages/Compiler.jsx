import { useState } from 'react';
import axios from 'axios';
import CodeBlock from '../CodeBlock';

export default function Compiler() {
  const [code, setCode] = useState(`#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}`);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setOutput('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { data } = await axios.post(backendUrl, { language: 'cpp', code, input });
      setOutput(data.output);
    } catch (err) {
      setOutput('Error running code');
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
          <label className="text-sm font-medium">C++ Code Editor</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={14}
            className="w-full font-mono p-3 rounded-md text-sm bg-gray-900 text-green-200 border border-gray-700 resize-none"
          />
          <button
            onClick={handleRun}
            disabled={isLoading}
            className={`mt-4 w-full px-4 py-2 rounded text-white font-semibold ${
              isLoading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Running...' : 'Run Code'}
          </button>
        </div>

        {/* Input/Output */}
        <div>
          <label className="text-sm font-medium">Program Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-md text-sm bg-gray-900 text-green-200 border border-gray-700 resize-none"
          />

          <label className="text-sm font-medium mt-4 block">Output</label>
          <div className="p-3 rounded-md h-40 bg-gray-900 text-green-300 border border-gray-700 overflow-y-auto">
            {isLoading ? 'Running...' : output || 'Output will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
}
