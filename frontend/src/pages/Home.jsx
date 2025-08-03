import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg z-10 relative">
        <div className="text-3xl font-extrabold text-indigo-400 tracking-wide">CodeVed</div>
        <div className="space-x-6 text-lg">
          <Link to="/login" className="hover:text-indigo-400 transition">Login</Link>
          <Link to="/register" className="hover:text-indigo-400 transition">Signup</Link>
          <Link to="/compiler" className="hover:text-indigo-400 transition">Online Compiler</Link>
        </div>
      </nav>

      {/* Background with Three.js */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Canvas>
          {/* Background color to avoid pink clouds */}
          <color attach="background" args={['#0a0a1a']} /> 
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </div>

      {/* Main Section */}
      <div className="flex-grow flex flex-col lg:flex-row items-center justify-between px-10 text-white relative z-10">
        <div className="max-w-xl space-y-6">
          <h1 className="text-6xl lg:text-7xl font-extrabold text-indigo-400 leading-tight">
            CodeVed
          </h1>
          <p className="text-lg text-gray-300">
            A next-gen platform for <span className="text-indigo-400">Coding</span> and <span className="text-purple-400">Learning</span>.<br />
            Practice problems, run code instantly, and get AI-powered explanations to learn smarter.
          </p>
          <div className="space-x-4 mt-4">
            <Link to="/problems" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded text-lg font-semibold">
              Explore Problems
            </Link>
            <Link to="/compiler" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded text-lg font-semibold">
              Try Online Compiler
            </Link>
          </div>
        </div>

        <img src="/logo.png" alt="CodeVed Logo" className="w-80 h-80 opacity-80 rounded hidden lg:block animate-pulse" />
      </div>

      <footer className="text-center p-4 text-xs text-gray-400 bg-gray-950 relative z-10">
        Developed by <a href="https://www.linkedin.com/in/aditi-gupta-56429322a/" className="text-indigo-400 hover:underline" target="_blank" rel="noreferrer">Aditi Gupta</a>
      </footer>
    </div>
  );
}
