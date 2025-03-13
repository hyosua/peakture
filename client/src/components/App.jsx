import { BrowserRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';
import FamilyHome from "./FamilyHome"
import AlbumGallery from "./AlbumGallery"
import '../App.css'
import Auth from './auth/Auth.jsx'
import HomePage from './auth/HomePage'
import Login from './auth/Login'

// Protection des routes enfants
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div><span className="loading loading-ring loading-xl"></span></div>;
  
  if (!currentUser) return <Navigate to="/" />;
  
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or your loading spinner component
  }
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          currentUser && currentUser.familyId ? 
          <Navigate to={`/family/${currentUser.familyId}`} /> : 
          <HomePage />
        } 
      />
      <Route 
        path="/family/:familyId" 
        element={
          <ProtectedRoute>
            <FamilyHome />
          </ProtectedRoute>
        } 
      />
      <Route path="/auth" element={<Auth />} /> 
      <Route path="/login" element={<Login />} /> 
      <Route path="/album/:id" element={<AlbumGallery />} />
    </Routes>
  )
}

const App = () => {
  return (
    <div>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
    </div>
  )
}

export default App
