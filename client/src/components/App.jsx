import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FamilyHome from "./FamilyHome"
import AlbumGallery from "./AlbumGallery"
import '../App.css'
import Auth from './auth/Auth.jsx'
import HomePage from './auth/HomePage'
import LogIn from './auth/LoginSignup'



const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} /> 
          <Route path="/auth" element={<Auth />} /> 
          <Route path="/login" element={<LogIn />} /> 
          <Route path="/family/:id" element={<FamilyHome />} /> 
          <Route path="/album/:id" element={<AlbumGallery />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
