import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import App from "./App"
import Landing from "./pages/Landing"
import Visualizer from "./pages/Visualizer"
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Landing />} />
          <Route path="visualizer" element={<Visualizer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)