
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
    
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden"
    >
      {/* SVG-based dotted background */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3E%3Ccircle fill='%23374151' cx='16' cy='16' r='1.5'%3E%3C/circle%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0'
        }}
      />
      
      {/* Cyan dots overlay with mask effect */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-100 transition-all duration-300"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3E%3Ccircle fill='%2300f5d4' cx='16' cy='16' r='1.5'%3E%3C/circle%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0',
          maskImage: `radial-gradient(300px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(300px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, transparent 100%)`
        }}
      />
      
      {/* Additional glow layer for enhanced effect */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-60 transition-all duration-300"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3E%3Ccircle fill='%2300f5d4' cx='16' cy='16' r='2'%3E%3C/circle%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0',
          maskImage: `radial-gradient(200px at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(200px at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)`,
          filter: 'blur(1px)'
        }}
      />

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center space-y-8 px-4">
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-sm font-mono tracking-widest text-cyan-400 mb-4 animate-fade-in"
        >
          ⚡ NEON VISUALIZER
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-6xl md:text-8xl font-black text-center leading-tight animate-fade-in-delay"
          style={{
            background: `linear-gradient(45deg, 
              #00f5d4 0%, 
              #ff00ff 50%, 
              #8a2be2 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 20px rgba(0, 245, 212, 0.5))"
          }}
        >
          ALGORITHM
          <br />
          UNLOCKED
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-xl md:text-2xl text-center text-gray-300 max-w-2xl font-light tracking-wide animate-fade-in-delay-2"
        >
          Experience algorithms like never before
        </motion.p>

        {/* Enter Arena button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/visualizer")}
          className="mt-8 px-12 py-4 text-xl font-bold tracking-wider rounded-full relative overflow-hidden group"
          style={{
            background: `linear-gradient(45deg, 
              #00f5d4 0%, 
              #ff00ff 50%, 
              #8a2be2 100%)`,
            backgroundSize: "200% 200%",
          }}
        >
          <span className="relative z-10 text-black font-black">ENTER ARENA</span>
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(45deg, 
                rgba(0, 245, 212, 0.8) 0%, 
                rgba(255, 0, 255, 0.8) 50%, 
                rgba(138, 43, 226, 0.8) 100%)`,
              filter: "blur(10px)",
              transform: "scale(1.2)"
            }}
          />
        </motion.button>

        {/* Additional glow effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500 rounded-full opacity-15 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/3 w-24 h-24 bg-pink-500 rounded-full opacity-25 blur-2xl animate-pulse delay-500" />
      </div>
    </div>
  );
}
