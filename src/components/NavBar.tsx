
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

function NavBar() {
  const [isDarkMode, setIsDarkMode] = useState(false) // Start with light mode by default

  // Initialize dark mode on component mount
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    console.log('Initial dark mode:', shouldBeDark) // Debug log
    setIsDarkMode(shouldBeDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    
    console.log('Toggling dark mode:', newDarkMode) // Debug log
    
    // Apply theme to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      console.log('Added dark class') // Debug log
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      console.log('Removed dark class') // Debug log
    }
  }
  return (
    <nav className="relative flex items-center justify-between px-8 py-4 shadow-lg bg-gradient-to-r from-neutral-950 via-indigo-950 to-neutral-950 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-gradient-x">
      <Link to="/" className="text-3xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(99,102,241,0.5)] hover:scale-105 transition-transform duration-200">DSA VisualiZor</Link>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-10 text-base font-semibold text-white dark:text-gray-200">
        <Link to="/visualizer" className="group relative overflow-hidden px-2 py-1">
          <span className="transition-colors group-hover:text-fuchsia-400">Visualizer</span>
          <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-fuchsia-400 to-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </Link>
        <a href="#about" className="group relative overflow-hidden px-2 py-1">
          <span className="transition-colors group-hover:text-cyan-400">About</span>
          <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-fuchsia-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </a>
        <a href="#contact" className="group relative overflow-hidden px-2 py-1">
          <span className="transition-colors group-hover:text-indigo-300">Contact</span>
          <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-indigo-300 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </a>
      </div>

      {/* Dark/Light Mode Toggle Button */}
      <motion.button
        onClick={toggleDarkMode}
        className="relative w-16 hidden h-8 rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#fbbf24',
          boxShadow: isDarkMode 
            ? '0 0 20px rgba(139, 92, 246, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.3)' 
            : '0 0 20px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Toggle Circle */}
        <motion.div
          className="w-6 h-6 rounded-full shadow-lg flex items-center justify-center"
          style={{
            backgroundColor: isDarkMode ? '#4f46e5' : '#ffffff',
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(79, 70, 229, 0.4)' 
              : '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
          animate={{
            x: isDarkMode ? 0 : 32,
            rotate: isDarkMode ? 0 : 180
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {/* Icon Container */}
          <motion.div
            initial={false}
            animate={{ 
              scale: 1,
              opacity: 1 
            }}
            transition={{ duration: 0.2 }}
          >
            {isDarkMode ? (
              // Moon Icon
              <motion.svg
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                  fill="#fbbf24"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                {/* Stars */}
                <circle cx="18" cy="6" r="1" fill="#fbbf24" />
                <circle cx="19" cy="9" r="0.5" fill="#fbbf24" />
                <circle cx="16" cy="4" r="0.5" fill="#fbbf24" />
              </motion.svg>
            ) : (
              // Sun Icon  
              <motion.svg
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="4" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"/>
                <path d="m12 2v2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                <path d="m12 20v2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                <path d="m4.93 4.93 1.41 1.41" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                <path d="m17.66 17.66 1.41 1.41" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12h2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 12h2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                <path d="m6.34 17.66-1.41 1.41" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                <path d="m19.07 4.93-1.41 1.41" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              </motion.svg>
            )}
          </motion.div>
        </motion.div>

        {/* Background Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: isDarkMode 
              ? "0 0 30px rgba(139, 92, 246, 0.2)" 
              : "0 0 30px rgba(251, 191, 36, 0.3)"
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Optional Text Labels */}
        <span className="sr-only">
          {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        </span>
      </motion.button>
    </nav>
  )
}

export default NavBar