import { EllipsisVertical } from "lucide-react"
import PropTypes from 'prop-types'
import { useState } from "react"

const EditObject = ({hovered, editing, object, deleteObject, editObject, toggleMenu, menuOpenId}) => {
    const [hoveredObjectId, setHoveredObjectId] = useState(null)


    const handleMouseEnter = (id) => {
        setHoveredObjectId(id)
    }

    return (
        <>
            {/* Album Menu (affiché sur hover si grand écran) */}
            {((hoveredObjectId === object._id || window.innerWidth < 640) && !editing) && ( 
                <div className='absolute top-2 right-2'>
                    <button
                        onClick={(e) => toggleMenu(object._id, e)}
                        className='p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none cursor-pointer'
                    >
                        <EllipsisVertical size={20} />
                    </button>
        
                    {/* Dropdown menu */}
                    {menuOpenId === object._id && (
                        <div className='absolute right-0 mt-2 w-48 bg-white/80 rounded-lg shadow-lg border border-gray-200 z-10'>
                            <button
                                onClick={(e) => editObject(object,e)}
                                className='block w-full px-4 py-2 text-left text-gray-800 hover:bg-emerald-500 rounded-t-lg cursor-pointer'
                            >
                                Changer le thème
                            </button>
                            <button 
                                onClick={(e) => deleteObject(object._id,e)}
                                className='block w-full px-4 py-2 text-left text-red-600 hover:bg-emerald-500 rounded-b-lg cursor-pointer'
                            >
                                Supprimer l&apos;album
                            </button>
                        </div>
                    )}
                    
                </div>
            )}
        </>
        
    )
}


EditObject.propTypes = {
    hovered: PropTypes.bool.isRequired,
    editing: PropTypes.bool.isRequired,
    object: PropTypes.object.isRequired,
    deleteObject: PropTypes.func.isRequired,
    editObject: PropTypes.func.isRequired,
    toggleMenu: PropTypes.func.isRequired,
    menuOpenId: PropTypes.string.isRequired,
}

export default EditObject