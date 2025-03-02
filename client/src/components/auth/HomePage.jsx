import '../../App.css';

import  { useState } from 'react';

const HomePage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [familyName, setFamilyName] = useState('');

  const handleJoinFamily = (e) => {
    e.preventDefault();
    console.log('Joining family with code:', joinCode);
    // Add actual join functionality here
  };

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
          <h2 className="text-3xl font-bold mb-6 text-secondary">Join a Family</h2>
          <form onSubmit={handleJoinFamily} className="w-full max-w-xs">
            <div className="form-control">
              <label className="label">
                <span className="label-text mb-2">Enter Family Code</span>
              </label>
              <input 
                type="text" 
                placeholder="ABC123" 
                className="input input-bordered w-full" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary w-full mt-6">
              Join 
            </button>
          </form>
        </div>

        <div className="divider md:divider-horizontal text-xl text-white font-bold">OR</div>
        
        {/* Create Family Side */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 rounded-lg md:ml-2">
          <h2 className="text-3xl font-bold mb-6 text-primary">Create a Family</h2>
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
            <button type="submit" className="btn btn-primary w-full mt-6">
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