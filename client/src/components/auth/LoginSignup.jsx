import '../../App.css'

import { useState } from 'react'


const LoginSignup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // "login" ou "register"

  // Ouvrir la modal
  const openModal = () => setIsModalOpen(true);

  // Fermer la modal
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Bouton d'inscription/connexion discret */}
      <button
        onClick={openModal}
        className="btn btn-outline btn-primary rounded-full text-sm px-6 py-3"
      >
        Se connecter / S'inscrire
      </button>

      {/* Affichage conditionnel de la modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="modal modal-open w-full max-w-md bg-white p-6 rounded-lg"
            onClick={(e) => e.stopPropagation()} // Empêche de fermer la modal lorsqu'on clique à l'intérieur
          >
            <h2 className="text-xl font-semibold mb-4 text-center">
              {activeTab === 'login' ? 'Se connecter' : 'S\'inscrire'}
            </h2>

            {/* Formulaires de connexion / inscription */}
            {activeTab === 'login' ? (
              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="input input-bordered w-full"
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="input input-bordered w-full"
                />
                <button type="submit" className="btn btn-primary w-full">
                  Se connecter
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-sm text-blue-500"
                  >
                    Pas encore de compte ? S'inscrire
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom"
                  className="input input-bordered w-full"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="input input-bordered w-full"
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="input input-bordered w-full"
                />
                <button type="submit" className="btn btn-primary w-full">
                  S'inscrire
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-sm text-blue-500"
                  >
                    Déjà un compte ? Se connecter
                  </button>
                </div>
              </form>
            )}

            {/* Bouton de fermeture */}
            <div className="text-center mt-4">
              <button
                onClick={closeModal}
                className="btn btn-outline btn-error text-sm px-4 py-2"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginSignup;
