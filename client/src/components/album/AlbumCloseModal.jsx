import { createPortal } from 'react-dom'
import { useState } from 'react'
import PropTypes from 'prop-types'

const AlbumCloseModal = ({ isOpen, albumId, onCancel, onConfirm, title = "Clôturer l'album", message = "Choisissez une méthode de clôture." }) => {
  const [option, setOption] = useState('timer')
  const [days, setDays] = useState(3)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (option === 'now') {
      onConfirm({ albumId, mode: 'now' })
    } else {
      onConfirm({ albumId, mode: 'timer', days })
    }
  }

  return createPortal(
    <div className='fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4'>
      <div className='text-white font-semibold p-6 rounded-lg shadow-lg max-w-md w-full backdrop-blur-sm bg-neutral/60 text-center'>
        <h2 className='text-xl text-warning font-bold mb-4'>{title}</h2>
        <p className='mb-6'>{message}</p>

        <div className='flex flex-col gap-4 items-start text-left'>

          {/* Option 1: Clôturer maintenant */}
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='closeOption'
              value='now'
              className='radio radio-warning'
              checked={option === 'now'}
              onChange={() => setOption('now')}
            />
            <span>Clôturer maintenant</span>
          </label>

          {/* Option 2: Planifier clôture */}
          <label className='flex items-start gap-2 cursor-pointer'>
            <input
              type='radio'
              name='closeOption'
              value='timer'
              className='radio radio-warning mt-1'
              checked={option === 'timer'}
              onChange={() => setOption('timer')}
            />
            <div>
              <span>Planifier la clôture dans :</span>
              {option === 'timer' && (
                <select
                  className='select select-sm select-bordered mt-2 ml-2'
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 7].map(d => (
                    <option key={d} value={d}>{d} jour{d > 1 ? 's' : ''}</option>
                  ))}
                </select>
              )}
            </div>
          </label>
        </div>

        <div className='flex justify-end gap-4 mt-8'>
          <button onClick={onCancel} className='btn btn-outline btn-secondary'>
            Annuler
          </button>
          <button onClick={handleConfirm} className='btn btn-primary'>
            Confirmer
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
AlbumCloseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  albumId: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
}

export default AlbumCloseModal
