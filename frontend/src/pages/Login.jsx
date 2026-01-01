import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import api from '../utils/axiosConfig.js';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '../utils/auth.js';

// Animated background component
function AnimatedBackground() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float gradient = smoothstep(0.0, 1.0, vUv.y + 0.1 * sin(uTime));
            gl_FragColor = vec4(vec3(0.05, 0.07, 0.1) * gradient, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      const res = await api.post('/api/auth/login', form);
      
      if (res.data.success && res.data.token) {
        // Store tokens securely using utility
        setTokens(res.data.token, res.data.refreshToken, res.data.user);
        
        setLoading(false);
        navigate('/dashboard');
      } else {
        throw new Error(res.data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      
      let errorMsg = 'Login failed';
      
      if (err.code === 'ECONNREFUSED') {
        errorMsg = 'Cannot connect to server. Please ensure the server is running on port 5000.';
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.msg) {
        errorMsg = err.response.data.msg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      
      // Handle rate limiting
      if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 60;
        setError(`${errorMsg} Please try again in ${retryAfter} seconds.`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative text-white">
      {/* 3D Background */}
      <div className="fixed inset-0 -z-10">
        <Canvas camera={{ position: [0, 1.6, 3], fov: 50 }}>
          <color attach="background" args={['#0b1226']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedBackground />
        </Canvas>
      </div>

      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6 bg-gray-800 bg-opacity-90 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email" className="block mb-2 font-medium">
              Email
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>
            <label htmlFor="password" className="block mt-4 mb-2 font-medium">
              Password
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>

            {error && <p className="text-red-500 mt-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`mt-6 w-full py-3 rounded bg-indigo-600 hover:bg-indigo-700 font-semibold transition-colors ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
