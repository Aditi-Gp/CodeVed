import { Link } from 'react-router-dom';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial, useGLTF, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';

// Define custom shader material without babel-plugin-glsl
const CodeRainMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0x00ff99),
  },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    #define NUM_CODES 18
    varying vec2 vUv;
    uniform float time;
    uniform vec3 color;

    float hash(float n) { return fract(sin(n) * 43758.5453123); }

    void main() {
      float accum = 0.0;
      for (int i = 0; i < NUM_CODES; i++) {
        float y = fract(vUv.y * NUM_CODES - float(i) + time * (0.5 + hash(float(i)) * 0.5));
        float mask = smoothstep(0.95, 1.0, y) * 0.6 + smoothstep(0.0, 0.03, y) * 0.2;
        accum += mask * hash(float(i) + floor(vUv.x * 10.0));
      }
      vec3 codeColor = color * (0.4 + 0.6 * accum);
      gl_FragColor = vec4(codeColor, accum * 0.93 + 0.07);
    }
  `
);

// Register material so you can use <codeRainMaterial /> in JSX
extend({ CodeRainMaterial });

function LaptopModelWithCodeScreen() {
  const { scene } = useGLTF('/models/laptop.glb');
  const materialRef = useRef();

  // Update the time uniform every frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.time = clock.getElapsedTime();
    }
  });

  // Find the screen mesh by name
  const screenMesh = scene.getObjectByName('screen') || scene.children.find(c => c.name.toLowerCase().includes('screen'));

  if (screenMesh) {
    // Assign your custom shader material once
    screenMesh.material = new THREE.ShaderMaterial({
      vertexShader: CodeRainMaterial.vertexShader,
      fragmentShader: CodeRainMaterial.fragmentShader,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x09ff90) },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
    // Pass ref to uniforms for update
    materialRef.current = screenMesh.material.uniforms;
  }

  return (
    <primitive object={scene} position={[0, 0, 0]} scale={1.6} rotation={[-0.18, 0.38, 0]} />
  );
}


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-indigo-900 via-gray-900 to-black text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 bg-opacity-90 backdrop-blur-md p-4 flex justify-between items-center shadow-md z-20 sticky top-0">
        <h1 className="text-3xl font-extrabold text-indigo-400 tracking-tight select-none">CodeVed</h1>
        <div className="space-x-8 text-lg font-medium">
          <Link to="/login" className="hover:text-indigo-300 transition">Login</Link>
          <Link to="/register" className="hover:text-indigo-300 transition">Sign Up</Link>
          <Link to="/compiler" className="hover:text-indigo-300 transition">Online Compiler</Link>
        </div>
      </nav>

      {/* Background Canvas */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <Canvas>
          <color attach="background" args={['#0a0a1a']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars radius={150} depth={60} count={3000} factor={6} saturation={0} fade />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row items-center justify-between px-8 lg:px-24 py-16 max-w-7xl mx-auto z-10">
        <section className="max-w-xl space-y-8">
          <h2 className="text-6xl lg:text-7xl font-extrabold text-indigo-400 leading-tight">
            Welcome to CodeVed
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Your all-in-one platform for coding challenges and learning — practice problems, run code instantly, and harness AI-powered guidance to sharpen your skills.
          </p>
          <div className="flex space-x-6 mt-6">
            <Link
              to="/problems"
              className="bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-400 focus:outline-none px-7 py-3 rounded-lg text-lg font-semibold transition"
            >
              Explore Problems
            </Link>
            <Link
              to="/compiler"
              className="bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-400 focus:outline-none px-7 py-3 rounded-lg text-lg font-semibold transition"
            >
              Try Online Compiler
            </Link>
          </div>
        </section>
        {/* 3D Animated Laptop with Shader Code Rain */}
        <aside className="hidden lg:flex items-center justify-center w-96 h-80">
          <Canvas shadows camera={{ position: [0, 1.6, 3.2], fov: 42 }}>
            <ambientLight intensity={0.75} />
            <directionalLight position={[4, 9, 7]} intensity={0.8} />
            {/* Soft shadow plane */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.51, 0]}>
              <planeGeometry args={[8, 8]} />
              <meshStandardMaterial color="#181932" roughness={0.83} />
            </mesh>
            <LaptopModelWithCodeScreen />
            <OrbitControls enablePan={false} enableZoom={false} enableRotate />
          </Canvas>
        </aside>
      </main>

      {/* Footer */}
      <footer className="text-center p-5 text-sm text-gray-400 bg-gray-900 bg-opacity-80 backdrop-blur-sm z-10 relative">
        Developed by{' '}
        <a
          href="https://www.linkedin.com/in/aditi-gupta-56429322a/"
          className="text-indigo-400 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Aditi Gupta
        </a>
      </footer>
    </div>
  );
}
