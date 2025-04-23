import { useState, useRef } from 'react';
import { motion } from "framer-motion";
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useClickAway } from "react-use";
import { LogOut, Settings } from 'lucide-react';
import ConfirmMessage from './ConfirmMessage';

const SettingsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { familyId } = useParams();
  const { currentUser, logout, fetchCurrentUser } = useAuth();
  
  useClickAway(menuRef, () => setIsOpen(false));
  
  const handleLogout = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Erreur lors du logout: ", error);
      setErrorMessage("Une erreur lors de la déconnexion s'est produite.");
    }
  };

  const handleFamilyLogout = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/family/${familyId}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      });
      fetchCurrentUser();
      navigate('/');
    } catch(error) {
      console.error("Family Logout Error:", error);
      setErrorMessage("Erreur: impossible de quitter la family");
    }
  };
  
  return (
    <div className="relative" ref={menuRef}>
      <button 
        className='cursor-pointer'
        onClick={(e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }}>
        <Settings className="size-[1.2em]" />
        <span className="dock-label">Settings</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute bottom-16 right-0 w-48 bg-neutral shadow-lg rounded-xl border-2 border-gray-200"
        >
          <ul>
            {!currentUser?.sessionId && (
              <li>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout(e);
                    setIsOpen(false);
                  }}
                  className="flex cursor-pointer font-bold rounded-lg items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-100"
                >
                  <LogOut className="size-4" />
                  Se déconnecter
                </button>
              </li>
            )}
            
            {currentUser?.familyId && (
              <li>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                    setIsOpen(false);
                  }}
                  className="flex cursor-pointer font-bold rounded-lg items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-100"
                >
                  Quitter la family
                </button>
              </li>
            )}
            
            {/* <li>
              <button
                disabled
                onClick={(e) => {
                  e.stopPropagation();
                  // Navigation vers la page des paramètres si nécessaire
                  setIsOpen(false);
                }}
                className="flex cursor-pointer font-bold    rounded-lg items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-100"
              >
                Paramètres
              </button>
            </li> */}
          </ul>
        </motion.div>
      )}

      {errorMessage && (
        <div className="toast toast-center">
          <div className="alert alert-error">
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <ConfirmMessage
        title="Quitter cette Family ?"
        message="Attention, si tu te déconnectes de cette famille, tu devras entrer le code d'invitation pour revenir. Es-tu sûr(e) de vouloir partir ?"
        onConfirm={(e) => handleFamilyLogout(e)}
        onCancel={() => setIsConfirmOpen(false)}
        isOpen={isConfirmOpen}
      />
    </div>
  );
};

export default SettingsMenu;