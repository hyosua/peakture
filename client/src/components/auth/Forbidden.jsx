const Forbidden = () => {

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-5xl text-secondary font-bold mb-4">STOP</h1>
            <img src="https://res.cloudinary.com/djsj0pfm3/image/upload/v1746890682/forbidden_holfpg.png" 
                alt="Forbidden Access" 
                className="w-60 lg:w-96" />
            <p className="mt-4 font-semibold text-error">Cette famille est protégée</p>
            <button 
                className="btn btn-error mt-4"
                >
                    <a href="https://www.peakture.fr/?showLoginForm=true">
                      Se connecter
                    </a>
                </button>
        </div>
    )
}

export default Forbidden