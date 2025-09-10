import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// Tailwind styles are globally imported via index.css

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <div className="flex items-center justify-center gap-8">
        <a href="https://vite.dev" target="_blank" className="transition-transform hover:scale-105">
          <img src={viteLogo} className="h-24 drop-shadow-[0_0_2em_#646cffaa] hover:drop-shadow-[0_0_2em_#646cff]" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="transition-transform hover:scale-105">
          <img src={reactLogo} className="h-24 drop-shadow-[0_0_2em_#61dafbaa] hover:drop-shadow-[0_0_2em_#61dafb]" alt="React logo" />
        </a>
      </div>
      <h1 className="mt-10 text-5xl font-extrabold tracking-tight bg-gradient-to-br from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Vite + React + Tailwind</h1>
      <div className="mt-8 rounded-xl border border-neutral-700/60 bg-neutral-800/60 p-8 backdrop-blur shadow-md">
        <button
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <p className="mt-4 text-sm text-neutral-300">
          Edit <code className="font-mono text-indigo-300">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="mt-6 text-neutral-400 text-sm">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
