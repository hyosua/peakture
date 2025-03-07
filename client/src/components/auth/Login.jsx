import '../../App.css'
import { Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react'
import PropTypes from 'prop-types';


const Login = ({ onClose, onLoginSuccess, onSwitchToSignup}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const result = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const response = await result.json();

      if (response.error) {
        setErrorMessage(response.error);
        setIsLoading(false);
        return;
      }

      // Si la connexion réussit, notifier le composant parent
      onLoginSuccess(response);
    } catch (error) {
      console.error("Erreur lors du login: ", error);
      setErrorMessage("Une erreur de connexion s'est produite.");
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-full bg-base-100 shadow-2xl">
      <div className="card-body relative">
        <h2 className="card-title">Se Connecter</h2>
        <button 
          className="absolute text-secondary top-4 right-4"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X />
        </button>
        <form 
          className="space-y-4"
          onSubmit={handleLoginSubmit}
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
            <button className='absolute right-4 top-3'
                    onClick={(e) => {
                      e.preventDefault()
                      setShowPassword(!showPassword)}}
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18} />}
            </button>
          </div>
          

          <button 
            type="submit" 
            className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
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
