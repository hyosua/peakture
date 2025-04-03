import { BrowserRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';
import FamilyHome from "./FamilyHome"
import AlbumPage from "./AlbumPage"
import '../App.css'
import Auth from './auth/Auth.jsx'
import HomePage from './auth/HomePage'
import Login from './auth/Login'
import Layout from './Layout.jsx'

// Protection des routes enfants
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center scale-200 z-50">
          <span className="loading loading-infinity text-secondary loading-xl"></span>
        </div>
  ) 
  
  if (!currentUser) return <Navigate to="/" />;
  
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return  <div className="fixed inset-0 flex items-center justify-center scale-200 z-50">
                <span className="loading loading-infinity text-secondary loading-xl"></span>
            </div>
  }
  
  return (
    <Layout>
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
            // Possibilité de protéger l'accès à une famille 
            // <ProtectedRoute>
              <FamilyHome />
            // </ProtectedRoute>
          } 
        />
        <Route path="/auth" element={<Auth />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/album/:id" element={<AlbumPage />} />
      </Routes>
    </Layout>
    
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
