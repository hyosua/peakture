import { BrowserRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import PropTypes from 'prop-types';
import FamilyHome from "@/pages/FamilyPage.jsx"
import AlbumPage from "@/pages/AlbumPage.jsx"
import '@/App.css'
import Auth from '@/components/auth/Auth.jsx'
import HomePage from '@/pages/HomePage.jsx'
import Login from '@/components/auth/Login'
import Layout from '@/components/layout/Layout.jsx'
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux'
import { store } from '@/store/index.js'
import Classements from '@/components/contest/Classements.jsx';
import { ToastProvider } from '@/context/ToastContext.jsx';
import Profile from '@/pages/ProfilePage.jsx';
import { useParams } from 'react-router-dom';
import Loader from '@/components/ui/Loader.jsx'
import Forbidden from '@/components/auth/Forbidden.jsx';

// Family Wrapper
const FamilyRouteWrapper = () => {
  const {familyId} = useParams()

  return (
    <ProtectedRoute familyId={familyId}>
      <FamilyHome />
    </ProtectedRoute>
  )
}

// Protected Route
const ProtectedRoute = ({ children, familyId}) => {
  const {currentUser, loading} = useAuth()

  if(loading) return <Loader />
  if(!currentUser || currentUser.familyId !== familyId ) return <Navigate to="/forbidden" />

  return children
}


ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  familyId: PropTypes.string, 
};

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();
  const [familyExists, setFamilyExists] = useState(null);

  useEffect(() => {
    const checkFamilyExists = async () => {
      if(currentUser?.familyId){
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/family/${currentUser.familyId}`)
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
    return  <Loader />
  }
  
  return (
    <Layout>
      <Routes>
        {/* Page d'accueil avec redirection vers la famille si connecté */}
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
        {/* Routes protégées pour la famille */}
        <Route 
          path="/family/:familyId" 
          element={ 
            <FamilyRouteWrapper />
          } 
        />
        {/* Routes publiques */}
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/auth" element={<Auth />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/forbidden" element={<Forbidden />} />
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
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
          </Provider>
      </AuthProvider>
    </BrowserRouter>
    </div>
  )
}

export default App
