import { Check, X } from 'lucide-react'
import { useState } from "react"
import PropTypes from 'prop-types'


const NameEditor = ({ text, onSave, isAdmin, as: Tag = 'p'}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(text)
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = async () => {
        setIsLoading(true);
        await onSave(editedName)
        setIsLoading(false)
        setIsEditing(false)
    }

    const tagStyles = {
        h1: 'text-4xl mt-4 lg:text-5xl text-primary font-extrabold',
        h2: 'text-3xl lg:text-4xl font-bold',
        h3: 'text-2xl lg:text-3xl font-semibold',
        p: 'text-base  font-normal text-gray-300',
        default: 'text-base  font-normal text-gray-500',
    }

    const appliedStyle = tagStyles[Tag] || tagStyles.default;
    
    return (
        <>
        {isEditing ? (
            
            <div className='flex items-center gap-2'>
                <input className={`input input-bordered border-success ${appliedStyle}}`}
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
                    setEditedName(text);
                }}> 
                 <X className="text-error cursor-pointer" size={20} />
                </button>
            </div>
                
        ) : (
            <div className={`flex text-center items-center gap-2 ${isAdmin ? 'cursor-pointer' : ''}`}
                onClick={() => {
                    if (!isAdmin) return;
                    setEditedName(text);
                    setIsEditing(true);
                }}
            >
                <Tag className={`${appliedStyle} ${isAdmin ? 'cursor-pointer' : ''}`}>
                <span className={appliedStyle}>{text}</span>    
                </Tag>
            </div>
        )}
        </>
    )
}
NameEditor.propTypes = {
    as: PropTypes.string,
    text: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool.isRequired,
}

export default NameEditor
