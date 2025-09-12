import NavBar from "./components/NavBar"

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <NavBar />
      {/* Landing page content will go here later */}
      <section className="text-center mt-20">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Welcome to DSA VisualiZor
        </h1>
        <p className="mt-4 text-lg text-neutral-400">
          Visualize your algorithms and data structures in real-time 🚀
        </p>
      </section>
    </div>
  )
}

export default App
