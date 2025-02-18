import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./Home"
import AlbumPage from "./AlbumPage"
import '../App.css'



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} >
            <Route path="/album/:month" element={<AlbumPage />} />
        {/* <Route path="/admin" element={<Admin />} > */}
        </Route>
    </Routes>
    </Router>
  )
}

export default App
