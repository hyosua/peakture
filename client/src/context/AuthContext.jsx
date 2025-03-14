import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
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
                setLoading(false)
                return
            }

            const userData = await response.json()
            setCurrentUser(userData)
            
            if(userData.families.length > 0){
                const currentPath = window.location.pathname

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
        setCurrentUser(response)

        if (response.familyId) {
            window.location.href = `/family/${response.families[0]}`;
        }
        return response
    }

    const logout = async () => {
        try{
            const result = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })

            const response = await result.json()

            // Nettoyer user data
            setCurrentUser(null)
            return response
        }catch(error) {
            console.error('Erreur lors de la déconnexion', error)
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{
            currentUser,
            loading,
            error,
            login,
            logout,
            fetchCurrentUser
        }}>
            {children}
        </AuthContext.Provider>
)} 

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext)
