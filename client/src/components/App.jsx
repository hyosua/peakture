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
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux'
import { store } from '../store/index.js'
import Classements from './Classements.jsx';

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
  const [familyExists, setFamilyExists] = useState(null);

  useEffect(() => {
    const checkFamilyExists = async () => {
      if(currentUser?.familyId){
        try {
          const response = await fetch(`http://localhost:5000/api/family/${currentUser.familyId}`)
          if(response.ok){
            setFamilyExists(true)
          }else{
            setFamilyExists(false)
          }
        }catch (error) {
          console.error("Erreur lors de la vérification de l'existence de la famille", error)
          setFamilyExists(false)
        }
      }
    }
    checkFamilyExists()
  }, [currentUser])
  
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
            currentUser?.familyId && familyExists !== null
              ? familyExists
                ? <Navigate to={`/family/${currentUser.familyId}`} />
                : <HomePage />
              : <HomePage />
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
        <Route path="/classement" element={<Classements />} />
      </Routes>
    </Layout>
    
  )
}

const App = () => {
  return (
    <div>
    <BrowserRouter>
      <AuthProvider>
         <Provider store={store}>
              <AppRoutes />
          </Provider>
      </AuthProvider>
    </BrowserRouter>
    </div>
  )
}

export default App
