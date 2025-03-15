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
            
            if(userData.families?.length > 0){
                const defaultFamily = userData.families[0]
                const currentPath = window.location.pathname

                setCurrentFamily(defaultFamily)
                if(currentPath === '/' || currentPath.includes('login') || currentPath.includes('signup')){
                    window.location.href = `/family/${userData.families[0]}`
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

        if (response.families?.length > 0) {
            setCurrentFamily(response.familyData)
            window.location.href = `/family/${response.families[0]}`
        }
        
        return response
    }

    useEffect(() => {
        if (currentUser && currentUser.families?.length > 0 && !currentFamily) {
            setCurrentFamily(currentUser.families[0]);
    
            // Vérifie si on est déjà sur la bonne page avant de rediriger
            const currentPath = window.location.pathname;
            const targetPath = `/family/${currentUser.families[0]}`;
            
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
        return currentUser._id === currentFamily.admin
    }, [currentUser, currentFamily])

    useEffect(() => {
        console.log("currentUser:", currentUser);
        console.log("currentFamily:", currentFamily);
        console.log("isAdmin :", isAdmin);
        console.log("family :", currentFamily);

    }, [currentUser, currentFamily, isAdmin]);

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
