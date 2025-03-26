import { LogOut } from 'lucide-react'
import { useState, useRef } from 'react';
import { motion } from "framer-motion";
import { useAuth } from '../../context/AuthContext.jsx';
import { useParams, useNavigate } from 'react-router-dom'
import { useClickAway } from "react-use";
import PropTypes from "prop-types";




const LogoutOptions = ({ setErrorMessage }) => {

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate()
    const { familyId } = useParams()
    useClickAway(dropdownRef, () => setIsOpen(false));

    const {currentUser,logout, fetchCurrentUser} = useAuth()
    

    const handleLogout = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        try {
          await logout()
          navigate('/')
        } catch (error) {
          console.error("Erreur lors du logout: ", error);
          setErrorMessage("Une erreur lors de la déconnexion s'est produite.");
        }
      }

    const handleFamilyLogout = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        try {
            await fetch(`http://localhost:5000/api/family/${familyId}/logout`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                credentials: "include",
            })
            fetchCurrentUser()
            navigate('/')
        }catch(error){
            console.error("Family Logout Error:", error)
            setErrorMessage("Erreur: impossible de quitter la family")
        }
    }
      
  
      return (
        
          <div className="relative 
          " ref={dropdownRef}>
              <button
                  onClick={(e) => {
                      e.stopPropagation() // Empêche le clic de se propager au parent
                      setIsOpen((prev) => !prev)
                    }}
                  className="btn btn-sm btn-outline   btn-accent absolute top-4 right-4"
                  >
                  <LogOut /> 
              </button>
  
              {isOpen && (
                  <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 mt-2 w-48 bg-neutral shadow-lg rounded-xl border-2 border-gray-200"
                  >
                  <ul className="">
                    {!currentUser.sessionId && (
                      <li>
                          <button
                          onClick={(e) => {
                              e.stopPropagation() 
                              handleLogout(e)
                              setIsOpen(false)
                          }}
                          className="flex cursor-pointer font-bold rounded-lg items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-100"
                          >
                          Se déconnecter
                          </button>
                      </li>
                    )}
                      
                      {currentUser.familyId && (
                        <li>
                          <button
                          onClick={(e) => {
                              e.stopPropagation() 
                              handleFamilyLogout(e)
                              setIsOpen(false)
                          }}
                          className="flex cursor-pointer font-bold rounded-lg items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-100"
                          >
                          Quitter la family
                          </button>
                      </li>
                      )}
                      
                  </ul>
                  </motion.div>
                )}
            
          </div>
      )
}

LogoutOptions.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
};

export default LogoutOptions