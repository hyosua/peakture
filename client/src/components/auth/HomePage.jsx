import '../../App.css';
import  { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import * as motion from "motion/react-client"
import { AnimatePresence } from "motion/react"

const HomePage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [serverResponse, setServerResponse] = useState(null)
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [joiningFamily, setJoiningFamily] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successLogin, setSuccessLogin] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false);

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await fetch("http://localhost:5000/api/auth/login",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      })

      const response = await result.json()

      if(response.error){
        setErrorMessage(response.error)
        return
      }

      setUserData(response)
      setSuccessLogin(true)


    }catch(error){
      console.error("Erreur lors du login: ",error)
    }
  }


  return (
    <div className="min-h-screen bg-base-300 flex flex-col">
      {/* Header with Logo */}
      <header className="relative py-4 px-4 flex justify-center">

        { successLogin && (
          <div role="alert" className="alert alert-success alert-soft">
          <span>Bienvenue à la maison {username}</span>
        </div>
        )}

        <img src="/src/assets/img/logo/logo white.png" className='w-40 h-auto'/>
        <button className='btn btn-sm btn-outline   btn-accent absolute top-4 right-4'
                onClick={() => setShowLoginForm(true)}
        >
            Se Connecter
        </button>
        <button className='btn btn-sm btn-soft hidden lg:block btn-accent absolute top-4 right-32'
                onClick={() => navigate("/auth")}
        >
            S&apos;inscrire
        </button>

      </header>

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
        
        
        <AnimatePresence initial={false}>
          { showLoginForm && (
            <motion.div className='fixed inset-0 min-h-screen flex items-center justify-center bg-base-200/20 backdrop-blur-sm z-50'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
            >
              {/* Conteneur principal */}
              <div className="w-96 m-4 h-auto perspective-1000 flex items-center justify-center">
                {/* Conteneur qui va tourner */}
                <motion.div 
                  className="w-full h-full flex items-center relative preserve-3d"
                  animate={{ rotateY: isSignUp ? 180 : 0 }}
                  transition={{ 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Face avant - Login */}
                  <div className="absolute w-full backface-hidden" style={{ backfaceVisibility: "hidden" }}>
                    <div className="card w-full bg-base-100 shadow-2xl">
                      <div className="card-body relative">
                        <h2 className="card-title">Se Connecter</h2>
                        <button 
                          className="absolute cursor-pointer text-secondary top-4 right-4"
                          onClick={() => setShowLoginForm(false)}
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
                          />
                          <input
                            type="password"
                            placeholder="Mot de passe" 
                            className="input input-bordered w-full"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                          />
                          <button type="submit" className="btn btn-primary w-full">
                            Se connecter
                          </button>
                          <div className="text-center">
                            Pas encore de compte ? 
                            <button
                              type="button"
                              className="btn btn-link text-accent btn-accent text-sm"
                              onClick={() => setIsSignUp(true)}
                            >
                              S&apos;inscrire
                            </button>
                          </div>
                          {errorMessage !== '' && (
                            <div role="alert" className="alert alert-error alert-soft">
                              <span>{errorMessage}</span>
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Face arrière - Signup */}
                  <div 
                    className="absolute w-full backface-hidden" 
                    style={{ 
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)" 
                    }}
                  >
                    <div className="card w-full bg-base-100 shadow-2xl">
                      <div className="card-body relative">
                        <h2 className="card-title">Créer un compte</h2>
                        <button
                          className="absolute cursor-pointer text-secondary top-4 right-4"
                          onClick={() => setShowLoginForm(false)}
                        >
                          <X />
                        </button>
                        <form className="space-y-4" onSubmit={""}>
                          <input type="text" placeholder="Nom d'utilisateur" className="input input-bordered w-full" required />
                          <input type="email" placeholder="Email" className="input input-bordered w-full" required />
                          <input type="password" placeholder="Mot de passe" className="input input-bordered w-full" required />
                          <button type="submit" className="btn btn-accent w-full">
                            S&apos;inscrire
                          </button>
                          <div className="text-center">
                            Déjà inscrit ?{" "}
                            <button
                              type="button"
                              className="btn btn-link text-primary btn-primary text-sm"
                              onClick={() => setIsSignUp(false)}
                            >
                              Se connecter
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
       
      </main>
      
      <footer className="p-4 text-center text-sm opacity-70">
        © 2025 Peakture - Share your family moments
      </footer>
    </div>
  );
};

export default HomePage;