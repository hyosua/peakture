// Routes.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Home from "./Home"
import AlbumPage from "./AlbumPage"

const AppRoutes = () => {
    return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/album/:month" element={<AlbumPage />} />
    </Routes>
    )
}
  
export default AppRoutes  
  
