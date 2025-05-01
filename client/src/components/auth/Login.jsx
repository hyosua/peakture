import '../../App.css'
import { Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react'
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';


const Login = ({ onClose, onLoginSuccess, onSwitchToSignup}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    console.log("Login tentative pour:", username);
    
    try {
      const userData = await login(username, password);
      console.log("Résultat du login:", userData);
      
      if (userData && !userData.error) {
        console.log("Login réussi, appel à onLoginSuccess");
        onLoginSuccess(userData);
      } else {
        console.error("Erreur de login détectée:", userData?.error);
        setErrorMessage(userData?.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Exception lors du login:", error);
      setErrorMessage(error.message || "Une erreur de connexion s'est produite.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-full bg-base-100 shadow-2xl">
      <div className="card-body relative">
        <h2 className="card-title">Se Connecter</h2>
        <button 
          className="absolute cursor-pointer text-secondary top-4 right-4"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X />
        </button>
        <form 
          className="space-y-4"
          onSubmit={(e) => handleLoginSubmit(e)}
        >
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            className="input input-bordered w-full"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            required
          />
          <div className='relative'>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe" 
              className="input input-bordered w-full"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button 
              type="button" 
              tabIndex={"-1"} 
              className='absolute right-4 top-2 hover:border cursor-pointer hover:border-accent rounded-md p-1'
              title="Voir/Masquer mdp"
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18} />}
            </button>
            <button
              type="button"
              className="btn btn-link text-accent btn-accent text-sm"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  window.location.href = '/forgot-password';
                }, 200);
              }
              }
            >
            Mot de passe oublié ?
            </button>
          </div>
          

          <button 
            type="submit" 
            className={`btn btn-primary w-full`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner text-secondary loading-md"></span>
            ) : (
              'Se connecter'
            )}
          </button>
          <div className="text-center">
            Pas encore de compte ? 
            <button
              type="button"
              className="btn btn-link text-accent btn-accent text-sm"
              onClick={onSwitchToSignup}
            >
              S&apos;inscrire
            </button>
          </div>
          {errorMessage && (
            <div role="alert" className="alert alert-error alert-soft font-semibold">
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
Login.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
  onSwitchToSignup: PropTypes.func.isRequired,
};

export default Login
