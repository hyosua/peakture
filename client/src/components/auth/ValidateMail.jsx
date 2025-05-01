import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import PropTypes from "prop-types";

export default function ValidateMail({ onInputChange}) {
  const [validation, setValidation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")



  const validateMail = async () => {
    if(!email) {
      setValidation(null)
      return
    }
    setIsLoading(true)
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validate-mail`,{
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
      const isValid = result.ok
      setValidation({valid: isValid, message: data.message})
      onInputChange({email, isValid})
    } catch (error) {
      console.error("Erreur lors de la validation du mail:", error);
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
                  onFocus={() => setValidation(null)}
              />
              {isLoading && (
                <span className="absolute right-3 top-2 loading-sm loading loading-spinner text-accent "></span>
              )}
              {validation && (
              <p className={`m-1 flex items-center gap-2 ${validation.valid ? "text-success" : "text-error"}`}>
                {validation.valid ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {validation.message}
              </p>
            )}
              <button 
              className={`btn w-full btn-primary ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
              onClick={validateMail}
              >
              {isLoading ? (
                  <span className="loading-sm loading loading-spinner text-accent "></span>
              ) : "Continuer"}
              </button>
            </div>
      </>
    )
    
}

ValidateMail.propTypes = {
  onInputChange: PropTypes.func.isRequired,
};


  
