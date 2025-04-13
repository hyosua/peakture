import '../../App.css';
import  { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom'
import Auth from './Auth.jsx'
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import ConfirmMessage from '../ConfirmMessage.jsx';

const HomePage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [serverResponse, setServerResponse] = useState(null)
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [joiningFamily, setJoiningFamily] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [successLogin, setSuccessLogin] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [signupForm, setSignupForm] = useState(false)
  const [loading, setLoading] = useState(true);
  const [successSignup, setSuccessSignup] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {currentUser, logout, fetchCurrentUser, error} = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (errorMessage) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage(null);
      }, 3000); 

      return () => clearTimeout(timer);
    }
  }, [errorMessage,setErrorMessage]);

  const handleJoinFamily = async (e) => {
    e.preventDefault();

    try {
      setJoiningFamily(true)
      const result = await fetch('http://localhost:5000/api/family/join',{
        method : "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inviteCode: joinCode
        })
      }) 
      
      if(result.status === 400){
        setIsConfirmOpen(true)
        return
      }

      const familyData = await result.json()
      
      setServerResponse(familyData)
    }catch(error){
      setServerResponse({ message: "Une erreur est survenue lors du fetching des données", error})
    }finally{
      if (!isConfirmOpen) {
        setJoiningFamily(false);
      }
    }
  };

  const handleChangeFamily = async () => {
    try{
      const result = await fetch('http://localhost:5000/api/family/change',{
        method :"PATCH",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inviteCode: joinCode
        })
    })

    if (!result.ok) {
      const errorText = await result.text();
      console.error("Erreur de réponse:", result.status, errorText);
      throw new Error(`Erreur ${result.status}: ${result.statusText}`);
    }
    
      const familyData = await result.json()
      setServerResponse(familyData)
      setIsConfirmOpen(false)
    }catch(error){
      console.error("Erreur lors du changement de famille: ", error)
    }finally {
      setJoiningFamily(false);
    }
  }

  useEffect(() => {
    const handleFamilyJoin = async() => {
      if(serverResponse?.family && serverResponse.family._id){
        fetchCurrentUser()
        navigate(`/family/${serverResponse.family._id}`)
        setServerResponse(null); 
      }
    }
    handleFamilyJoin()
    
  },[serverResponse, navigate, fetchCurrentUser])

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    setCreatingFamily(true)
    try {
      
      const result = await fetch('http://localhost:5000/api/family/create',{
        method : "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: familyName
        })
      }) 
      const familyData = await result.json()
      setServerResponse(familyData)
    }catch(error){
      setServerResponse({ message: "Une erreur est survenue lors du fetching des données", error})
    }
  };

  

  useEffect(() => {
    let timer
    if(successLogin){
      timer = setTimeout(() => {
        setSuccessLogin(false)
      },2000)
    }
    return () => clearTimeout(timer)
  },[successLogin])

  const handleLogout = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    try {
      await logout()
      navigate('/')
      console.log("Logout: ", currentUser)
    } catch (error) {
      console.error("Erreur lors du logout: ", error);
      setErrorMessage("Une erreur lors de la déconnexion s'est produite.");
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-base-300 flex flex-col">
      {/* Header with Logo */}
      <header className="relative py-4 px-4 flex justify-center">

        { successLogin && (
          <div className='fixed top-4 inset-x-0 flex justify-center items-center z-50'>
            <div role="alert" className="alert alert-success alert-soft shadow-lg maw-w-md">
              <CheckCircle />
            <span>Bienvenue à la maison {currentUser?.username}</span>
          </div>
        </div>
        )}

        { successSignup && (
                <div role="alert" className="fixed alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Inscription réussie!</span>
                </div>
            )}
        
        { showError && (
          <div className='fixed top-4 inset-x-0 flex justify-center items-center z-50'>
            <div role="alert" className="alert alert-error alert-soft shadow-lg maw-w-sm">
            <span>{errorMessage || error}</span>
          </div>
        </div>
        )}

        <ConfirmMessage 
          isOpen={isConfirmOpen}
          onCancel={() => {
            console.log("Set confirm open to false")
            setIsConfirmOpen(false)
            console.log("Set joining family to false")
            setJoiningFamily(false)
          }}
          title={"Changement de Family"}
          message="Hey ! Tu fais déjà partie d’une famille sur Peakture. Si tu rejoins celle-ci, tu perdras l’accès à l’ancienne. Es-tu sûr de vouloir continuer ?"
          onConfirm={handleChangeFamily}
        />

        {/* LOGO */}
        <img src="/src/assets/img/logo/logo white.png" className='w-40 h-auto'/>
        
        { currentUser && !currentUser.sessionId ? (
          <button className='btn btn-sm btn-outline   btn-accent absolute top-4 right-4'
                onClick={handleLogout}
        >
                  Se Déconnecter
        </button>
        ) : (
          <div>
              <button className='btn btn-sm btn-outline   btn-accent absolute top-4 right-4'
                       onClick={() => setShowLoginForm(true)}
               >
                  Se Connecter
              </button>
              <button className='btn btn-sm btn-soft hidden lg:block btn-accent absolute top-4 right-32'
                      onClick={() => {
                        setSignupForm(true)
                        setShowLoginForm(true)
                      }}
              >
                  S&apos;inscrire
              </button>
          </div>
        )}

      </header>
      

      <main className="flex-grow flex flex-col md:flex-row px-4 py-2">
        
        {/* Join Family Side */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 rounded-lg md:mr-2  md:mb-0">
          <h2 className="relative text-3xl font-bold mb-6 text-primary">Rejoins une Family</h2>
          <div className="tooltip tooltip-info" data-tip="Une communauté où les membres peuvent créer des albums photo, participer aux concours mensuels et voter ensemble.">
          <button className="absolute -top-4 -right-4 btn btn-info">?</button>
        </div>
          <form onSubmit={handleJoinFamily} className="w-full max-w-xs">
            <div className="form-control">
              <label className="label">
                <span className="label-text mb-2">Entre le Family Code</span>
              </label>
                <input 
                  type="text" 
                  placeholder="ABC123" 
                  className="input input-bordered w-full" 
                  pattern="[A-F0-9]{6}" 
                  value={joinCode}
                  onChange={
                    (e) => {setJoinCode(e.target.value)
                  }}
                  title="Code hexadécimal (6 caractères, A-F, 0-9)" 
                  required 
                  onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                  />
              <p className="validator-hint">
                Le code doit contenir exactement 6 caractères (A-F, 0-9)
              </p>
            </div>
            { serverResponse && !serverResponse.family && joiningFamily && (
              <div role="alert" className="alert alert-error alert-soft mt-2">
              <span>{serverResponse.message}</span>
              </div>
            )}
            <button type="submit" className="btn btn-primary w-full mt-6 text-lg hover:bg-emerald-500">
              Rejoindre 
            </button>
          </form>

        </div>

        <div className="divider md:divider-horizontal text-xl text-white font-bold">OU</div>
        
        {/* Create Family Side */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 rounded-lg md:ml-2">
          <h2 className="text-3xl font-bold mb-6 text-secondary ">Crée ta Family</h2>
          <form onSubmit={handleCreateFamily} className="w-full max-w-xs">
            <div className="form-control">
              <label className="label">
                <span className="label-text mb-2">Nom de la Family</span>
              </label>
              <input 
                type="text" 
                placeholder="Smith Family" 
                className="input input-bordered w-full" 
                value={familyName}
                title="Entrer le nom de votre Famille" 

                onChange={(e) => setFamilyName(e.target.value)}
                required
              />
              { serverResponse?.message && creatingFamily && (
              <div role="alert" className="alert alert-error alert-soft mt-2">
              <span>{serverResponse.message}</span>
              </div>
            )}
            </div>
            <button type="submit" className="btn btn-secondary hover:bg-orange-500 w-full mt-6 text-lg">
              Créer 
            </button>
          </form>
        </div>
        
        
        { showLoginForm && (
          // Dans HomePage.jsx
        <Auth
          signUp={signupForm} 
          isOpen={showLoginForm}  // Contrôle l'ouverture du modal depuis le parent
          onClose={() => {
            setShowLoginForm(false)
            setSignupForm(false)
          }}
          onLoginSuccess={() => {
            setSuccessLogin(true);
            setShowLoginForm(false);
          }}
          onSignupSuccess={() => {
            setSuccessSignup(true)
            setSuccessLogin(true)
            setTimeout(() => {setSuccessSignup(false)}, 3000)
            setShowLoginForm(false)
          }}
        />
        )}
        
       
      </main>
      
      <footer className="p-4 text-center text-sm opacity-70">
        © 2025 Peakture - Chaque photo nous rapproche du sommet
      </footer>
    </div>
  );
};

export default HomePage;