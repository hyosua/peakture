import '@/App.css'
import { useAuth } from '@/context/AuthContext.jsx';
import { useState, useEffect } from "react"
import { useToast } from "@/context/ToastContext.jsx"
import PollForm from '../components/poll/PollForm';
import PollDisplay from '../components/poll/PollDisplay';

const Poll = () => {
    const [poll,setPoll] = useState(null)
    const [pollLoading, setPollLoading] = useState(false)

    const {currentUser, currentFamily} = useAuth()
    const {showToast} = useToast()

    const familyId = currentFamily?.family?._id
    const isAdmin = currentUser?._id === currentFamily?.family?.admin
    console.log("Current Family", currentFamily)

    // Fetch Poll from the server
    useEffect(() => {
        async function getPoll() {
            try {
                setPollLoading(true)
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/poll/${familyId}`, {
                    credentials: "include",
                })
                console.log("Response", response)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                const pollData = await response.json()
                setPoll(pollData)
            } catch (error){
                showToast({ message: error, type: "error"})
                console.error('Erreur lors du chargement du sondage:', error)
            } finally{
                setPollLoading(false)
            }
        }
        getPoll()
    }, [familyId])

    const handleNewPoll = (newPoll) => {
        setPoll(newPoll)
    }

    if(pollLoading) return (
            <div className="fixed inset-0 flex items-center justify-center scale-200 z-50">
                <span className="loading loading-infinity text-secondary loading-xl"></span>
            </div>
    )
    return (
        <div>
            { poll ? (
                <PollDisplay poll={poll} onVote={handleNewPoll}/>
            ) : (
                <div className=''>
                    <p> Aucun sondage pour l&apos;instant...</p>
                    {isAdmin && (
                        <>
                            <PollForm 
                                currentFamilyId={familyId}
                                currentUser={currentUser._id}
                                onPollCreated={handleNewPoll}
                            />
                        </>
                    )}
                </div>
            )}
            
        </div>
    )
}

export default Poll