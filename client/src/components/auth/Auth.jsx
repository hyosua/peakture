import '../../App.css';

const Auth = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-base-200'>
      <div className='card w-96 bg-base-100 shadow-2xl'>
        <div className='card-body'>
          <h2 className='card-title'>Se Connecter</h2>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered w-full"
              />
              <input
                type="password"
                placeholder="Mot de passe" 
                className="input input-bordered w-full"
              />
              <button type="submit" className="btn btn-primary w-full">
                Se connecter
              </button>
              <div className="text-center">
              Pas encore de compte ? 
                <button
                  type="button"
                  className="btn btn-link text-accent btn-accent text-sm"
                >
                  S&apos;inscrire
                </button>
              </div>
            </form>
        </div>
      
      </div>
      
    </div>
    
  )
}

export default Auth