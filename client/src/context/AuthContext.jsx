import { createContext, useState, useEffect, useContext, useMemo } from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [currentFamily, setCurrentFamily] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchCurrentUser = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:5000/api/auth/me', {
                credentials: 'include'  // pour inclure les cookies
            })

            if(!response.ok){
                // User not logged in ou autre erreur
                setCurrentUser(null)
                setCurrentFamily(null)
                setLoading(false)
                return
            }

            const userData = await response.json()
            setCurrentUser(userData)
            
            if(userData.familyId){
                try {
                    const familyResponse = await fetch(`http://localhost:5000/api/family/${userData.familyId}`, {
                        credentials: 'include'
                    })
            
                    if(familyResponse.ok){
                        const familyData = await familyResponse.json()
                        setCurrentFamily(familyData)
                    }
                } catch (error) {
                    console.error("Error fetching family data:", error)
                }
                
                const currentPath = window.location.pathname
                if(currentPath === '/' || currentPath.includes('login') || currentPath.includes('signup')){
                    window.location.href = `/family/${userData.familyId}`
                }
            }
        } catch (error) {
            console.error('Erreur en fetchant l\'utilisateur actuel:', error)
            setError('Echec lors de la récupération des données utilisateur')
        } finally {
            setLoading(false)
        }
    }

    // s'éxecute lors du chargement de l'appli
    useEffect(() => {
        fetchCurrentUser()
    }, [])

    const login = async (username, password) => {
        const result = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password
            })
        })

        const response = await result.json()
        

        if(response.error) {
            throw new Error(response.error)
        }

        // Maj des données utilisateur après login réussi
        setCurrentUser(response);

        if (response.familyId) {
            try {
                const familyResponse = await fetch(`http://localhost:5000/api/family/${response.familyId}`, {
                    credentials: 'include'
                })

                if(familyResponse.ok){
                    const familyData = await familyResponse.json()
                    setCurrentFamily(familyData)
                    window.location.href = `/family/${response.familyId}`
                }
            } catch (error){
                console.error("AuthContext, login: erreur lors de la récupération de données de la famille: ",error)
            }
            window.location.href = `/family/${response.familyId}`
        }
        
        return response
    }

    useEffect(() => {
        if (currentUser && currentUser.familyId && !currentFamily) {
            setCurrentFamily(currentUser.familyId);
    
            // Vérifie si on est déjà sur la bonne page avant de rediriger
            const currentPath = window.location.pathname;
            const targetPath = `/family/${currentUser.familyId}`;
            
            if (currentPath !== targetPath) {
                window.location.href = targetPath;
            }
        }
    }, [currentUser, currentFamily]);
    

    
    const logout = async () => {
        try{
            const result = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })

            const response = await result.json()

            // Nettoyer user data
            setCurrentUser(null)
            setCurrentFamily(null)
            return response
        }catch(error) {
            console.error('Erreur lors de la déconnexion', error)
            throw error
        }
    }

    const isAdmin = useMemo(() => {
        if (!currentUser || !currentFamily) return false
        console.log("Admin ID:", currentFamily?.family?.admin);
        return currentUser._id === currentFamily?.family?.admin
    }, [currentUser, currentFamily])



    return (
        <AuthContext.Provider value={{
            currentUser,
            currentFamily,
            loading,
            error,
            login,
            logout,
            fetchCurrentUser,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
)} 

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext)
