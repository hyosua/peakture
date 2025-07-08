import { useState } from "react";
import { useToast } from "@/context/ToastContext.jsx"
import PropTypes from "prop-types";


const PollDisplay = ({ poll, onVote}) => {
    const [selectedOption, setSelectedOption] = useState(null)
    const [loading, setLoading] = useState(false);

    const { showToast } = useToast()

    const handleVote = async () => {
        if(!selectedOption) return showToast({message: "Aucune option sélectionnée", type:"error"})

        setLoading(true)
        try{
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/poll/${poll._id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ pollId: poll._id, optionId: selectedOption })
            });

            const data = await res.json()
            if(!res.ok || !data.success){
                setLoading(false)
                return showToast({ message: data.message || "Erreur lors du vote", type: "error" })
            }
            setLoading(false)
            onVote(data.poll)
        }catch(error){
            console.log("Erreur lors du vote", error)
            showToast({ message: error, type:"error"})
        }
    }


    return (
        <div className="max-w-md mx-auto bg-base-200 mt-6 p-4 border rounded shadow-md overflow-hidden">

            <h2 className="text-primary font-bold text-5xl mb-4">
                {poll.title}
            </h2>
            <form className="space-y-4 ">
                <div>
                    {poll.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <label key={option._id} className="block">
                                <input 
                                    type="radio"
                                    name="option"
                                    value={option._id}
                                    checked={selectedOption === option._id}
                                    className="radio radio-primary mr-2"
                                    onChange={() => setSelectedOption(option._id)}
                                />
                                {option.theme}<span className="text-sm text-gray-500">({option.votes} vote{option.votes > 1 ? 's' : ''})</span>
                            </label>
                            
                            
                            {/* {(options.length > 1 || option !== '') && (
                                <button 
                                type="button"
                                onClick={handleRemoveOption(index)}
                                className="btn-xs btn-circle text-error"
                                >
                                    <X />
                                </button>
                            )} */}
                        </div>
                    ))}
                    <button
                        type="button"
                        disabled={loading || !selectedOption}
                        onClick={handleVote}
                        className="btn btn-primary mt-4 disabled:opacity-50"
                        >
                        {loading ? <span className="loading loading-spinner loading-sm"></span>  : "Voter"}
                    </button>
                </div>
            </form>
        </div>
        
    )
}

PollDisplay.propTypes = {
    poll: PropTypes.shape({
        title: PropTypes.string.isRequired,
        _id: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(
            PropTypes.shape({
                _id: PropTypes.string.isRequired,
                theme: PropTypes.string.isRequired,
                votes: PropTypes.number.isRequired,
            })
        ).isRequired,
    }).isRequired,
    onVote: PropTypes.func.isRequired,
    onPollCreated: PropTypes.func.isRequired,
    currentFamilyId: PropTypes.string.isRequired,
};

export default PollDisplay