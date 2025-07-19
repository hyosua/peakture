import { useState } from "react";
import PropTypes from "prop-types";
import CountdownDisplay from "../ui/CountdownDisplay";


const PollResult = ({ poll, onPollClose }) => {

    return (
        <>
            {/* Poll Title */}
            <h2 className="text-primary font-bold text-3xl mb-4">
                {poll.title}
            </h2>
            {/* Countdown Display */}
                {poll?.status === "countdown" && (
                    <div className="scale-75">
                        <CountdownDisplay
                            item={poll}
                            onCountdownEnd={onPollClose}
                        />
                    </div>
                )}

            <form className="space-y-4 ">
                <div>
                    {poll.options.map((option) => (
                        <div key={option._id} className="flex flex-col justify-center mb-2">
                            <span className="text-xl">{option.theme}</span>
                            <div key={option._id} className="flex items-center justify-around mb-2">
                                <progress className="progress w-56" value={option.votes / poll.votes.length * 100} max="100"></progress>
                                <span className="text-sm text-gray-500">({option.votes} vote{option.votes > 1 ? 's' : ''})</span>
                            </div>
                        </div>
                    ))}
                </div>
            </form>
        </>
        
    )
}

PollResult.propTypes = {
    poll: PropTypes.shape({
        title: PropTypes.string.isRequired,
        _id: PropTypes.string.isRequired,
        votes: PropTypes.arrayOf(
            PropTypes.shape({
                optionId: PropTypes.string.isRequired,
                userId: PropTypes.string.isRequired,
            })
        ).isRequired,
        status: PropTypes.string.isRequired,
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
    onPollClose: PropTypes.func.isRequired,
    currentFamilyId: PropTypes.string.isRequired,
};

export default PollResult