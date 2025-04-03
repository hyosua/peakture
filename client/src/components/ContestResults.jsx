import PropTypes from 'prop-types';

const ContestResults = ( {results} ) => {

    return (
        <ul className="list bg-base-100 rounded-box shadow-md mb-4">
  
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Classement</li>
            
            {results.map((result, index) => (
                <li key={index} 
                     className={`list-row flex items-center p-4 border-b border-base-200 ${
                     index === 0 ? " border border-yellow-200 font-extrabold scale-105" : ""
                }`}>
                    <div className={`text-4xl text-secondary font-thin opacity-60 tabular-nums ${
                        index === 0 ? "text-yellow-200" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-500" : "text-secondary"
                    }`}>{index+1}</div>
                    <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp"/></div>
                    <div className='list-grow'>
                         <div className="text-xs uppercase font-semibold opacity-60">{result.name}</div> 
                    </div>
                    <div className="text-2xl text-primary text-right ml-auto font-bold ">
                        {result.votes}
                    </div>
                </li>
            ))}
            
            
        </ul>
    )
    
};

ContestResults.propTypes = {
    results: PropTypes.arrayOf(
        PropTypes.shape({
            votes: PropTypes.number.isRequired,
        })
    ).isRequired,
}

export default ContestResults;
