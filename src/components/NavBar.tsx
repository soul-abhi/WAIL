
import { Link } from "react-router-dom"
function NavBar() {
  return (
    <nav className="relative flex items-center justify-between px-8 py-4 shadow-lg bg-gradient-to-r from-neutral-950 via-indigo-950 to-neutral-950 animate-gradient-x">
      <Link to="/" className="text-3xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(99,102,241,0.5)] hover:scale-105 transition-transform duration-200">DSA VisualiZor</Link>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-10 text-base font-semibold">
        <a href="#features" className="group relative overflow-hidden px-2 py-1">
          <span className="transition-colors group-hover:text-fuchsia-400">Features</span>
          <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-fuchsia-400 to-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </a>
        <a href="#about" className="group relative overflow-hidden px-2 py-1">
          <span className="transition-colors group-hover:text-cyan-400">About</span>
          <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-fuchsia-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </a>
        <a href="#contact" className="group relative overflow-hidden px-2 py-1">
          <span className="transition-colors group-hover:text-indigo-300">Contact</span>
          <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-indigo-300 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </a>
      </div>

      {/* Get Started Button */}
      <Link
        to="/visualizer"
        className="rounded-lg bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-6 py-2 text-base font-bold text-white shadow-lg hover:from-fuchsia-500 hover:to-indigo-400 hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-fuchsia-400"
        style={{textShadow:'0 0 8px #fff, 0 0 16px #6366f1'}}
      >
        Get Started
      </Link>
    </nav>
  )
}

export default NavBar