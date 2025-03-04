import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FamilyHome from "./FamilyHome"
import AlbumGallery from "./AlbumGallery"
import '../App.css'
import SignUp from './auth/SignUp'
import HomePage from './auth/HomePage'
import LogIn from './auth/LogIn'



const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} /> 
          <Route path="/signup" element={<SignUp />} /> 
          <Route path="/login" element={<LogIn />} /> 
          <Route path="/family/:id" element={<FamilyHome />} /> 
          <Route path="/album/:id" element={<AlbumGallery />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
