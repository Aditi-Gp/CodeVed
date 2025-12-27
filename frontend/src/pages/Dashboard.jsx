import { useEffect, useState } from "react";
import api from "../utils/axiosConfig.js";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { getCurrentUser, clearAuth } from "../utils/auth.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.id) {
        setError('User not found');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/auth/${user.id}/progress`);

        if (response.data.success) {
          setProgress(response.data.progress);
        } else {
          throw new Error(response.data.error || 'Failed to fetch progress');
        }
      } catch (err) {
        console.error('Progress fetch error:', err);
        
        // Handle authentication errors
        if (err.response?.status === 401) {
          clearAuth();
          navigate('/login');
          return;
        }

        setError(err.response?.data?.error || err.message || 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p>No progress data available</p>
      </div>
    );
  }

  const topicData = Object.entries(progress.topicWise).map(([key, value]) => ({
    name: key, solved: value
  }));

  const difficultyData = Object.entries(progress.difficultyWise).map(([key, value]) => ({
    name: key, solved: value
  }));

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent>
            <Typography variant="h6" fontWeight="bold">
            Overall Progress
            </Typography>
            <p>Total Solved: {progress.totalSolved}</p>
            <p>Total Attempted: {progress.totalAttempted}</p>
            <p>Accuracy: {(progress.totalSolved / progress.totalAttempted * 100).toFixed(2)}%</p>
            <p>Streak: {progress.streak} days</p>
        </CardContent>
      </Card>


      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">Topic Wise Progress</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topicData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="solved" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">Difficulty Wise Progress</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={difficultyData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="solved" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
