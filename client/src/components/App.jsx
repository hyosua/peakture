import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./Home"
import AlbumGallery from "./AlbumGallery"
import '../App.css'



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        {/* <Route path="/admin" element={<Admin />} > */}
        <Route path="/album/:month" element={<AlbumGallery />} />
      </Routes>
    </Router>
  )
}

export default App
