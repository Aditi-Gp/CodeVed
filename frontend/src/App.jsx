// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProblemList from './pages/ProblemList.jsx';
import Editor from './Editor.jsx'; 
import ProblemDetails from './pages/ProblemDetails.jsx';
import Compiler from './pages/Compiler.jsx';
import Dashboard from './pages/Dashboard.jsx';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compiler" element={<Compiler />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/problems" element={<ProblemList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/problems/:id" element={<ProblemDetails />} />
      </Routes>
    </Router>
  );
}


export default App;
