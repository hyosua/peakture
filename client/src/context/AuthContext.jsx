import { createContext, useState, useEffect, useContext, useMemo } from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [currentFamily, setCurrentFamily] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // empêche le rechargement de la page si l'utilisateur est déjà sur la bonne page
    const safeNavigate = (path) => {
        if (window.location.pathname !== path) {
            window.location.href = path;
        }
    };

    const fetchCurrentUser = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                credentials: 'include'  // pour inclure les cookies
            })
            console.log("fetch /api/auth/me response:", response);
            if(!response.ok){
                // User not logged in ou autre erreur
                console.log("fetch /api/auth/me error status:", response.status);
                setCurrentUser(null)
                setCurrentFamily(null)
                setLoading(false)
                return
            }

            const userData = await response.json()
            console.log("AuthContext, fetchCurrentUser: userData:", userData)
            setCurrentUser(userData)
            
            if(userData.familyId){
                try {
                    console.log("Fetching family data for familyId:", userData.familyId)
                    const familyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/family/${userData.familyId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    })
                    
                    if(familyResponse.status === 200){
                        const familyData = await familyResponse.json()
                        console.log("AuthContext, fetchCurrentUser: familyData:", familyData)
                        setCurrentFamily(familyData)
                        // Redirige l'utilisateur vers la page de la famille si il n'est pas déjà dessus
                        const currentPath = window.location.pathname
                        if(currentPath === '/' || currentPath.includes('login') || currentPath.includes('signup')){
                            
                            safeNavigate(`/family/${userData.familyId}`);
                        }
                    }else{
                        console.error("Erreur lors de la récupération des données de la famille")
                        setCurrentFamily(null)
                        setCurrentUser(prev => ({...prev, familyId: null}))
                        setLoading(false)
                    }
                } catch (error) {
                    setLoading(false)

                    console.error("AuthContext Error fetching family data:", error)
                }
            }
        } catch (error) {
            setLoading(false)

            console.error('AuthContext Erreur en fetchant l\'utilisateur actuel:', error)
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
        setError(null)
        const result = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
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
            setError(response.error)
            return response
        }

        // Maj des données utilisateur après login réussi
        setCurrentUser(response);

        if (response.familyId) {
            try {
                const familyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/family/${response.familyId}`, {
                    credentials: 'include'
                })

                if(familyResponse.ok){
                    const familyData = await familyResponse.json()
                    setCurrentFamily(familyData)
                   safeNavigate(`/family/${response.familyId}`)
                }else{
                    setLoading(false)
                    console.error("Erreur lors de la récupération des données de la famille")
                    setCurrentFamily(null)
                }
            } catch (error){
                console.error("AuthContext, login: erreur lors de la récupération de données de la famille: ",error)
            }
        }
        return response
    }
    

    
    const logout = async () => {
        try{
            const result = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
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