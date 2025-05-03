import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function RequestPasswordReset() {
  const [message, setMessage] = useState({isSent: false, message: ""})
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")



  const requestPasswordReset = async () => {
    if(!email) {
      setMessage(null)
      return
    }
    setIsLoading(true)
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/request-password-reset`,{
        method : "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email
        })
      }) 
      
      const data = await result.json()
      const isSent = result.ok
      setMessage({isSent, message: data.message})
    } catch (error) {
      console.error("Erreur lors de l'envoi du mail:", error);
    }finally {
      setIsLoading(false)
    }
  }

  
    return (
      <>
            <div className="relative flex flex-col gap-4 justify-center items-center"> 
              <input 
                  type="email" 
                  placeholder="batboy@gmail.com" 
                  className="input input-bordered w-full validator" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                                />

              {message && (
              <p className={`m-1 flex items-center gap-2 ${message.isSent ? "text-success" : "hidden"}`}>
                {message.isSent && <CheckCircle className="w-5 h-5" />}
                {message.message}
              </p>
            )}
            
              <button 
              className={`btn w-full btn-primary`}
              disabled={isLoading}
              onClick={requestPasswordReset}
              >
              {isLoading ? (
                  <span className="loading-sm loading loading-spinner text-primary "></span>
              ) : message?.isSent ? "Renvoyer" : "Continuer"}
              </button>
            
          </div>

      </>
    )
    
}



  
