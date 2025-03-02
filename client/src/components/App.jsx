import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FamilyHome from "./FamilyHome"
import AlbumGallery from "./AlbumGallery"
import '../App.css'



const App = () => {
  return (
    <div data-theme="coffee">
      <Router>
        
        <Routes>
          <Route path="/" element={<FamilyHome />} /> 
          <Route path="/album/:month" element={<AlbumGallery />} />
        </Routes>
        
      </Router>
    </div>
  )
}

export default App
