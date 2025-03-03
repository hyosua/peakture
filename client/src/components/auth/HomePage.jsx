import '../../App.css';

import  { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [serverResponse, setServerResponse] = useState(null)
  const inputRef = useRef(null); // Référence pour l'input
  const navigate = useNavigate()

  const handleJoinFamily = async (e) => {
    e.preventDefault();

    if (!inputRef.current.checkValidity()) {
      inputRef.current.reportValidity(); // Force la validation du champ
      return;
    }

    try {
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
      console.log("family:", familyData)
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

  const handleCreateFamily = (e) => {
    e.preventDefault();
    console.log('Creating family named:', familyName);
    // Add actual create functionality here
  };

  return (
    <div className="min-h-screen bg-base-300 flex flex-col">
      {/* Header with Logo */}
      <header className="py-4 px-4 flex justify-center">
        <img src="/src/assets/img/logo/logo white.png" className='w-40 h-auto'/>
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
                  ref={inputRef}
                  type="text" 
                  placeholder="ABC123" 
                  className="input input-bordered w-full" 
                  pattern="[A-F0-9]{6}" 
                  value={joinCode}
                  onChange={
                    (e) => {setJoinCode(e.target.value)
                    inputRef.current.setCustomValidity("") // Réinitialise l’erreur
                  }}
                  title="Code hexadécimal (6 caractères, A-F, 0-9)" 
                  required 
                  onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
                  />
              <p className="validator-hint">
                Le code doit contenir exactement 6 caractères
              </p>
            </div>
            { serverResponse && !serverResponse.family && (
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
            </div>
            <button type="submit" className="btn btn-secondary hover:bg-orange-500 w-full mt-6 text-lg">
              Create 
            </button>
          </form>
        </div>
       
      </main>
      
      <footer className="p-4 text-center text-sm opacity-70">
        © 2025 Peakture - Share your family moments
      </footer>
    </div>
  );
};

export default HomePage;