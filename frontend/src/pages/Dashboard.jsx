import { useEffect, useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    axios.get(`/api/user/${localStorage.getItem("userId")}/progress`)
      .then(res => setProgress(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!progress) return <div>Loading...</div>;

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
