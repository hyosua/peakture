import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import PropTypes from "prop-types";

export default function InviteCode({ onInputChange }) {
  const [inviteCode, setInviteCode] = useState("")
  const [validation, setValidation] = useState(null)
  const [showInviteCode, setShowInviteCode] = useState(false)

  const validateInviteCode = async () => {
    try {
      const result = await fetch('http://localhost:5000/api/family/validate-invite-code',{
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
    } catch (error) {
      console.error("Erreur lors de la validation du code d'invitation:", error);
    }
  }

  const handleChange = (event) => {
    setInviteCode(event.target.value)
    onInputChange(event.target.value)
    console.log("Invite code:", event.target.value)
  }
  
    return (
      <>
      { !showInviteCode ? (
            <button
                className='btn btn-dash btn-accent'
                onClick={() => setShowInviteCode(true)}
                >
                  J&apos;ai un code d&apos;invitation
                </button>
          ) : (
            <div>
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
              {validation && (
              <p className={`m-2 flex items-center gap-2 ${validation.valid ? "text-success" : "text-error"}`}>
                {validation.valid ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {validation.message}
              </p>
            )}
              {!validation?.valid &&(
                <button 
                  className='mt-4 btn btn-soft'
                  onClick={(e) => {
                    e.preventDefault()
                    validateInviteCode()
                  }}
                  >
                    Vérifier le code
              </button>
              )}
              
            </div>
          )}
      </>
      
    )
    
}

InviteCode.propTypes = {
  onInputChange: PropTypes.func.isRequired,
};


  
