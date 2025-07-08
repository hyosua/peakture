import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useToast } from "@/context/ToastContext.jsx"
import PropTypes from "prop-types";
import CallyDatePicker from "../ui/CallyDatePicker";


const PollForm = ({ onPollCreated, currentFamilyId, currentUserId }) => {
    const [showPollForm, setShowPollForm] = useState(false)
    const [options, setOptions] = useState([''])
    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
    const currentMonthIndex = new Date().getMonth();
    const nextMonth = months[currentMonthIndex + 1];
    const [month, setMonth] = useState(nextMonth);
    const [expiresAt, setExpiresAt] = useState(null)

    const {showToast} = useToast()
    

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            console.log('Submitting poll with data:', {
                month,
                options: options.filter(option => option.trim() !== '').map(option => ({ theme: option.trim()})), // Remove empty options
                expiresAt,
                admin: currentUserId,
                family: currentFamilyId,
            })

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/poll/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                        month, 
                        options: options
                        .filter(option => option.trim() !== '') // Remove empty options
                        .map(option => ({ theme: option.trim()})),
                        expiresAt, 
                        admin: currentUserId, 
                        family: currentFamilyId,})
            })
            const serverResponse = await response.json()
            if(serverResponse.success){
                setShowPollForm(false)
                onPollCreated(serverResponse.poll)
                showToast({ message: serverResponse.message, type: "success"})
            }
        } catch (error) {
            showToast({ message: error, type: "error"})
            console.error('Erreur lors de la création du sondage: ', error)
        }
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...options]
        newOptions[index] = value
        if(index === newOptions.length - 1 && value.trim() !== ''){
            newOptions.push('')
        }
        setOptions(newOptions)
    }

    const handleRemoveOption = async (index) =>{
        if(options.length === 1){
            options[0] = '';
            return;
        }

        const newOptions = options.filter((_,i) => i !== index)

        setOptions(newOptions)
    }

    const handleExpiresAt = (date) => {
        console.log("Selected expiration date:", date);
        setExpiresAt(date)
    }

    return (
        <div className="max-w-md mx-auto bg-base-200 mt-6 p-4 border rounded shadow-md overflow-hidden">
            {!showPollForm ? (
                <button 
                    className={`btn btn-xs btn-circle m-2 hover:bg-base-100 hover:text-primary btn-soft transition duration-200`}
                    title="Ajouter un sondage"
                    onClick={() => setShowPollForm(true)}
                >
                    <Plus size={14} />
                </button>
            ) : (
                <>
                    <h2 className="text-primary font-bold text-5xl mb-4">
                        Créer un sondage
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4 ">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">
                                Mois
                            </label>
                            <select
                                id="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="select select-secondary"
                                required
                            >
                                {months.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option> 
                                ))}
                            </select>

                            {options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input 
                                        type="text"
                                        value={option}
                                        placeholder={`option ${index + 1}`}
                                        className="input input-primary"
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                    />
                                    {(options.length > 1 || option !== '') && (
                                        <button 
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        className="btn-xs btn-circle text-error"
                                        >
                                            <X />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <CallyDatePicker onDateChange={handleExpiresAt} placeholder={"Date de fin du sondage"} />
                        </div>
                        <button type="submit" className="btn btn-primary hover:text-secondary w-full mt-6 text-lg">
                            Créer 
                        </button>
                    </form>
                </>
            )}
        </div>
        
    )
}

PollForm.propTypes = {
    onPollCreated: PropTypes.func.isRequired,
    currentFamilyId: PropTypes.string.isRequired,
    currentUserId: PropTypes.string.isRequired,
};

export default PollForm