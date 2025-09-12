import { Link } from "react-router-dom"

function NavBar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 shadow-md bg-neutral-900 text-white">
      <Link to="/" className="text-2xl font-bold text-indigo-400">DSA VisualiZor</Link>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 text-sm font-medium">
        <a href="#features" className="hover:text-indigo-300 transition-colors">Features</a>
        <a href="#about" className="hover:text-indigo-300 transition-colors">About</a>
        <a href="#contact" className="hover:text-indigo-300 transition-colors">Contact</a>
      </div>

      {/* Get Started Button */}
      <Link
        to="/visualizer"
        className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold hover:bg-indigo-500 transition-colors"
      >
        Get Started
      </Link>
    </nav>
  )
}

export default NavBar