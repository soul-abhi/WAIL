import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white">
      
      {/* Animated Title */}
      <motion.h1
        className="text-6xl font-bold mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        DSA VisualiZor 🚀
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg mb-10 max-w-xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Learn Data Structures and Algorithms with real-time interactive visualization.
        Type your own code, see it come alive!
      </motion.p>

      {/* Button */}
      <motion.button
        onClick={() => navigate("/visualizer")}
        className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        Get Started
      </motion.button>
    </div>
  );
}
