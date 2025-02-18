// Routes.jsx
import { BrowserRouter as Routes, Route } from 'react-router-dom'
import Home from "./Home"
import AlbumPage from "./AlbumPage"

const AppRoutes = () => {
    return (
    <Routes>
        <Route path="/" element={<Home />} >
            <Route path="/album/:month" element={<AlbumPage />} />
        {/* <Route path="/admin" element={<Admin />} > */}
        </Route>
    </Routes>
    )
}
  
export default AppRoutes  
  
