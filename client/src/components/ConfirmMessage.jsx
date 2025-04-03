import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const ConfirmMessage = ({ message, onConfirm, onCancel, isOpen, title }) => {
    if(!isOpen) return null;

    return createPortal(
        <div className='fixed p-2 inset-0 flex items-center justify-center bg-black/60 z-50'>
            <div className='text-white font-semibold p-4 rounded-lg shadow-lg max-w-sm  backdrop-blur-sm bg-neutral/60 text-center'>
                <h2 className='text-xl text-warning font-bold mb-2 '>{title}</h2>
                <p className='mb-4'>{message}</p>
                <div className='flex justify-around'>
                    <button
                        onClick={onConfirm}
                        className='btn btn-outline  btn-primary'
                    >
                        Oui
                    </button>
                    <button
                        onClick={onCancel}
                        className=' btn btn-secondary'
                    >
                        Non
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

ConfirmMessage.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
};

export default ConfirmMessage;