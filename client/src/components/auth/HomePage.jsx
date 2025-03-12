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

  const {currentUser, loading, logout} = useAuth()
  const navigate = useNavigate()

  const handleJoinFamily = async (e) => {
    e.preventDefault();

    try {
      setJoiningFamily(true)
      const result = await fetch('http://localhost:5000/api/family/join',{
        method : "POST",
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

  if(loading) return (
    <div>
      <span className="loading loading-ring loading-xl"></span>
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
        
        { errorMessage && (
          <div className='fixed top-4 inset-x-0 flex justify-center items-center z-50'>
            <div role="alert" className="alert alert-error alert-soft shadow-lg maw-w-md">
            <span>{errorMessage}</span>
          </div>
        </div>
        )}

        {/* LOGO */}
        <img src="/src/assets/img/logo/logo white.png" className='w-40 h-auto'/>
        
        { currentUser ? (
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
                        setShowLoginForm(true)
                      }}
              >
                  S&apos;inscrire
              </button>
          </div>
        )}

      </header>

      {/* Navigation panel */}
      {currentUser && (
        <div className="bg-base-100 p-4 mb-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-2">Welcome, {currentUser.username}!</h3>
          <div className="flex space-x-4">
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/profile')}>
              Profile
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow flex flex-col md:flex-row px-4 py-2">
        
        {/* Join Family Side */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 rounded-lg md:mr-2  md:mb-0">
          <h2 className="text-3xl font-bold mb-6 text-primary">Join a Family</h2>
          <form onSubmit={handleJoinFamily} className="w-full max-w-xs">
            <div className="form-control">
              <label className="label">
                <span className="label-text mb-2">Enter Family Code</span>
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
              Join 
            </button>
          </form>

        </div>

        <div className="divider md:divider-horizontal text-xl text-white font-bold">OR</div>
        
        {/* Create Family Side */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 rounded-lg md:ml-2">
          <h2 className="text-3xl font-bold mb-6 text-secondary ">Create a Family</h2>
          <form onSubmit={handleCreateFamily} className="w-full max-w-xs">
            <div className="form-control">
              <label className="label">
                <span className="label-text mb-2">Family Name</span>
              </label>
              <input 
                type="text" 
                placeholder="Smith Family" 
                className="input input-bordered w-full" 
                value={familyName}
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
              Create 
            </button>
          </form>
        </div>
        
        
        { showLoginForm && (
          <Auth 
            onClose={() => setShowLoginForm(false)}
            onLoginSuccess={() => {
              setSuccessLogin(true)
              setShowLoginForm(false)
            }}
          />
        )}
        
       
      </main>
      
      <footer className="p-4 text-center text-sm opacity-70">
        © 2025 Peakture - Share your family moments
      </footer>
    </div>
  );
};

export default HomePage;