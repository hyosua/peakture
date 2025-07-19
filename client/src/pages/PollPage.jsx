import '@/App.css'
import { useAuth } from '@/context/AuthContext.jsx';
import { useState, useEffect } from "react"
import { useToast } from "@/context/ToastContext.jsx"
import PollForm from '../components/poll/PollForm';
import PollDisplay from '../components/poll/PollDisplay';
import PollResult from '../components/poll/PollResult';
import { X } from 'lucide-react';

const Poll = () => {
    const [poll,setPoll] = useState(null)
    const [pollLoading, setPollLoading] = useState(false)

    const {currentUser, currentFamily} = useAuth()
    const {showToast} = useToast()

    const familyId = currentFamily?.family?._id
    const isAdmin = currentUser?._id === currentFamily?.family?.admin
    // Fetch Poll from the server
    useEffect(() => {
        async function getPoll() {
            try {
                setPollLoading(true)
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/poll/${familyId}`, {
                    credentials: "include",
                })
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

    const handleDeletePoll = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/poll/delete/${poll._id}`, {
                method: 'DELETE',
                credentials: "include",
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json()
            if (!data.success) {
                showToast({ message: data.message, type: "error" })
                return
            }
                
            setPoll(null)
            showToast({ message: "Sondage supprimé avec succès", type: "success" })
        } catch (error) {
            showToast({ message: error, type: "error" })
            console.error('Erreur lors de la suppression du sondage:', error)
        }
    }

    const hasVoted = poll?.votes.some(vote => vote.userId === currentUser?._id)

    if(pollLoading) return (
            <div className="fixed inset-0 flex items-center justify-center scale-200 z-50">
                <span className="loading loading-infinity text-secondary loading-xl"></span>
            </div>
    )

    let pollContent
    if(poll?.status === "countdown" && !hasVoted) {
        pollContent = <PollDisplay poll={poll} onVote={handleNewPoll} />
    } else if (poll?.status === "closed" || hasVoted) {
        pollContent = <PollResult poll={poll} />
    } else {
        pollContent = (
            <div className=''>
                <p> Aucun sondage pour l&apos;instant...</p>
                {isAdmin && (
                    <PollForm 
                        currentFamilyId={familyId}
                        currentUserId={currentUser._id}
                        onPollCreated={handleNewPoll}
                    />
                )}
            </div>
        )
    }

    return (
        <div className='flex flex-col'>
            <div className="card bg-base-100 w-96 shadow-sm">
                <div className="card-body">
                    { isAdmin && poll && (
                        <div className="card-actions justify-end ">
                            <button className="btn btn-square btn-sm" onClick={ handleDeletePoll }>
                                <X />
                            </button>
                        </div>
                    )}
                    { pollContent }
                </div>
            </div>
        </div>
    )
}

export default Poll