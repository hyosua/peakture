import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import PropTypes from "prop-types";

export default function InviteCode({ onInputChange, initialCode = "" }) {
  const [inviteCode, setInviteCode] = useState("")
  const [validation, setValidation] = useState(null)
  const [showInviteCode, setShowInviteCode] = useState(initialCode !== "")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialCode) {
      setInviteCode(initialCode);
      setShowInviteCode(true);
      onInputChange(initialCode);
    }
  }, [initialCode]);

  const validateInviteCode = async () => {
    setIsLoading(true)
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/family/validate-invite-code`,{
        method : "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inviteCode
        })
      }) 
      
      const data = await result.json()
      if (result.ok) {
        setValidation({valid: true, message:  data.message})
      } else {
          setValidation({valid: false, message: data.message})
      }
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error("Erreur lors de la validation du code d'invitation:", error);
    }
  }

  useEffect(() => {
    if (inviteCode.length >= 6) {
      validateInviteCode()
    } else {
      setValidation(null)
    }
  },[inviteCode])

  const handleChange = (event) => {
    setInviteCode(event.target.value)
    onInputChange(event.target.value)
    console.log("Invite code:", event.target.value)
  }
  
    return (
      <>
      { !showInviteCode ? (
          <div className="tooltip tooltip-secondary tooltip-right" data-tip="Permet de rejoindre une famille existante">
            <button
                className='btn btn-dash btn-accent'
                onClick={() => setShowInviteCode(true)}
                >
                  J&apos;ai un code d&apos;invitation
                </button>
          </div>
          ) : (
            <div className="relative">
              <input 
                  type="text" 
                  placeholder="ABC123" 
                  className="input input-bordered w-full validator" 
                  pattern="[A-F0-9]{6}" 
                  value={inviteCode}
                  onChange={(e) => handleChange(e)}
                  title="Code hexadécimal (6 caractères, A-F, 0-9)" 
                  onInput={(e) => e.target.value = e.target.value.toUpperCase()}
              />
              {isLoading && (
                <span className="absolute right-3 top-2 loading-sm loading loading-spinner text-accent "></span>
              )}
              {validation && (
              <p className={`m-2 flex items-center gap-2 ${validation.valid ? "text-success" : "text-error"}`}>
                {validation.valid ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {validation.message}
              </p>
            )}

              
            </div>
          )}
      </>
      
    )
    
}

InviteCode.propTypes = {
  onInputChange: PropTypes.func.isRequired,
  initialCode: PropTypes.string,
};


  
