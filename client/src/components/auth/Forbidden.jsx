import forbiddenGif from "@/assets/svg/Forbidden.svg"
const Forbidden = () => {

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-5xl text-secondary font-bold mb-4">STOP</h1>
            <img src={forbiddenGif} alt="Forbidden Access" className="w-80 lg:w-96" />
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