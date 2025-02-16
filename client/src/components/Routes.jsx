// Routes.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Home from "./Home"
import AlbumPage from "./AlbumPage"

const AppRoutes = () => {
    return (
    <Routes>
        <Route path="/" element={<Home />} >
            <Route path="/album/:month" element={<AlbumPage />} />
        </Route>
        <Route path="/admin" element={<Admin />} >
            <Route index element={<AdminHome />} />
            <Route path="albums/add" element={<AddAlbum />} />
            <Route path="albums/edit/:id" element={<EditAlbum />} />
            <Route path="albums/delete/:id" element={<DeleteAlbum />} />
        </Route>
    </Routes>
    )
}
  
export default AppRoutes  
  
