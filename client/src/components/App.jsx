import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import '../App.css'
import AppRoutes from "./Routes";


const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App
