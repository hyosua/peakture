import { useState } from 'react';
import PropTypes from 'prop-types';
import { EyeOff,Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import InviteCode from '../InviteCode.jsx';

const Signup = ({ onClose, onSwitchToLogin, onSignupSuccess }) => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return false;
    }
    
    if (formData.password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("adresse email non valide");
      return false;
    }
    
    return true;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          inviteCode: formData.inviteCode
        })
      });

      const response = await result.json();

      if (response.error) {
        console.log("Erreur lors de l'inscription: ", response.error);
        setErrorMessage(response.error);
        setIsLoading(false);
        return;
      }
      console.log("Inscription réussie: ", response);
      await login(formData.username, formData.password)
      onSignupSuccess()
    } catch (error) {
      console.error("Erreur lors de l'inscription: ", error);
      setErrorMessage("Une erreur de connexion s'est produite.");
      setIsLoading(false);
    }
  };

  const handleInviteInputChange = (value) => {
    console.log("handleinviteinputchange: ", value)
    setFormData(prev => ({
      ...prev,
      inviteCode: value
    }));
    console.log("Form data: ", formData)
  }

  return (
    <div className="card w-full bg-base-100 shadow-2xl">
      <div className="card-body relative">
        <h2 className="card-title">Créer un compte</h2>
        <button
          className="absolute cursor-pointer text-secondary top-4 right-4"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X />
        </button>
        <form className="space-y-4" onSubmit={handleSignupSubmit}>
          <input 
            type="text" 
            name="username"
            placeholder="Nom d'utilisateur" 
            className="input input-bordered w-full" 
            value={formData.username}
            onChange={handleChange}
            required 
          />
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            className="input input-bordered w-full" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
          <div className='relative'>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              placeholder="Entrer le mot de passe" 
              className="input input-bordered w-full" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
            <button 
                  type="button"
                  tabIndex={"-1"} // empêche le focus sur le bouton
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer'
                  onClick={(e) => {
                    e.preventDefault()
                    setShowPassword(!showPassword)
                  }}
                  >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}        
            </button>
          </div>
          <div className='relative'>
            <input 
              type={showPassword ? "text" : "password"} 
              name="confirmPassword"
              placeholder="Confirmer le mot de passe" 
              className="input input-bordered w-full" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
            <button 
                  type="button"
                  tabIndex={"-1"}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer'
                  onClick={(e) => {
                    e.preventDefault()
                    setShowPassword(!showPassword)
                  }}
                  >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}        
            </button>
          </div>

          <InviteCode onInputChange={handleInviteInputChange}/>
          
          <button 
            type="submit" 
            className={`btn btn-accent w-full ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Inscription...' : 'S\'inscrire'}
          </button>
          <div className="text-center">
            Déjà inscrit ?{" "}
            <button
              type="button"
              className="btn btn-link text-primary btn-primary text-sm"
              onClick={onSwitchToLogin}
            >
              Se connecter
            </button>
          </div>
          {errorMessage && (
            <div role="alert" className="alert alert-error  font-semibold alert-soft">
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
Signup.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSwitchToLogin: PropTypes.func.isRequired,
  onSignupSuccess: PropTypes.func.isRequired,  
};

export default Signup;
