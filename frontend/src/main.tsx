import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ScreenShare } from './comp/ScreenShare.tsx'
import { ScreenView } from './comp/ScreenView.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/shareScreen" element={<ScreenShare />} />
        <Route path="/accessScreen" element={<ScreenView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
