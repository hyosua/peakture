import '../../App.css';
import  { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom'
import Auth from './Auth.jsx'
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const HomePage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [serverResponse, setServerResponse] = useState(null)
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [joiningFamily, setJoiningFamily] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [successLogin, setSuccessLogin] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [signupForm, setSignupForm] = useState(false)
  const [loading, setLoading] = useState(true);
  const [successSignup, setSuccessSignup] = useState(false)

  const {currentUser, logout} = useAuth()
  const navigate = useNavigate()

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
  
      const familyData = await result.json()
      setServerResponse(familyData)
    }catch(error){
      setServerResponse({ message: "Une erreur est survenue lors du fetching des données", error})
    }
  };

  useEffect(() => {
    if(serverResponse?.family && serverResponse.family._id){
      navigate(`/family/${serverResponse.family._id}`)
      setServerResponse(null); 
    }
  },[serverResponse, navigate])

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
      },5000)
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
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if(loading) return (
    <div className="fixed inset-0 flex items-center justify-center scale-200 z-50">
                    <span className="loading loading-infinity text-secondary loading-xl"></span>
                 </div>
    )

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
        
        { errorMessage && (
          <div className='fixed top-4 inset-x-0 flex justify-center items-center z-50'>
            <div role="alert" className="alert alert-error alert-soft shadow-lg maw-w-md">
            <span>{errorMessage}</span>
          </div>
        </div>
        )}

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
          <h2 className="text-3xl font-bold mb-6 text-primary">Rejoins une Family</h2>
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
          <Auth
            signUp={signupForm} 
            onClose={() => {
              setShowLoginForm(false)
              setSignupForm(false)
            }}
            onLoginSuccess={() => {
              setSuccessLogin(true)
              setShowLoginForm(false)
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
        © 2025 Peakture - Partage des moments avec ta famille
      </footer>
    </div>
  );
};

export default HomePage;