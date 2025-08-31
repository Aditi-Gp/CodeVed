import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';

// Optional: Subtle animated gradient plane as background
function AnimatedBackground() {
  const mesh = React.useRef();
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -10]} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float gradient = smoothstep(0.0, 1.0, vUv.y + 0.06 * sin(uTime));
            gl_FragColor = vec4(vec3(0.06, 0.10, 0.14) * gradient, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      setLoading(false);
      alert(res.data.msg);
      navigate('/login');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative text-white">
      {/* Advanced fullscreen animated background */}
      <div className="fixed inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 2.7], fov: 60 }}>
          <color attach="background" args={['#0b1226']} />
          <ambientLight intensity={0.42} />
          <AnimatedBackground />
        </Canvas>
      </div>

      {/* Registration form */}
      <div className="max-w-md w-full mx-auto p-8 bg-gray-800 rounded-lg shadow-md bg-opacity-95">
        <h2 className="text-3xl font-semibold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="username" className="block mb-2 font-medium">
            Username
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
          <label htmlFor="email" className="block mb-2 font-medium mt-4">
            Email
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
          <label htmlFor="password" className="block mb-2 font-medium mt-4">
            Password
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
