import { Pencil, Check, X } from 'lucide-react'
import { useState } from "react"
import PropTypes from 'prop-types'


const NameEditor = ({ familyName, onSave, isAdmin }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(familyName)
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = async () => {
        setIsLoading(true);
        await onSave(editedName)
        setIsLoading(false)
        setIsEditing(false)
    }

    
    return (
        <>
        {isEditing ? (
            
            <div className='flex items-center gap-2 mt-4'>
                <input className='input input-bordered border-success text-4xl font-bold'
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                />
                <button onClick={handleClick} disabled={isLoading}> 
                    {isLoading ? (
                         <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                        <Check className="text-success cursor-pointer" size={20}/> 
                    )}
                </button>
                <button onClick={() => {
                    setIsEditing(false);
                    setEditedName(familyName);
                }}> 
                 <X className="text-error cursor-pointer" size={20} />
                </button>
            </div>
                
        ) : (
            <div className='flex items-center gap-2'>
                <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold">
                <span className="text-primary">{familyName}</span>    
                </h1>
                { isAdmin &&(
                    <button onClick={() => {
                        setEditedName(familyName);
                        setIsEditing(true);
                    }}>
                        <Pencil className="cursor-pointer" size={15}/>
                    </button>
                )}
            </div>
        )}
        </>
    )
}
NameEditor.propTypes = {
    familyName: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool.isRequired,
}

export default NameEditor
