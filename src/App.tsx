import { Outlet } from "react-router-dom"
import NavBar from "./components/NavBar"

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <NavBar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default App