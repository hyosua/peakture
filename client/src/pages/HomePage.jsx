import '@/App.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import Auth from '@/components/auth/Auth.jsx'
import { CheckCircle, HelpCircle, Camera, Users, Trophy, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.jsx';
import ConfirmMessage from '@/components/ui/ConfirmMessage.jsx';
import { useToast } from "@/context/ToastContext.jsx"
import { motion } from 'motion/react'

// Étoiles fixes pour éviter le recalcul à chaque rendu
const STARS = [
  { id:0,  top:'4%',  left:'12%', s:1.5, o:0.8 }, { id:1,  top:'8%',  left:'67%', s:1,   o:0.5 },
  { id:2,  top:'3%',  left:'34%', s:2,   o:0.9 }, { id:3,  top:'15%', left:'82%', s:1,   o:0.6 },
  { id:4,  top:'6%',  left:'55%', s:1.5, o:0.7 }, { id:5,  top:'20%', left:'5%',  s:1,   o:0.5 },
  { id:6,  top:'11%', left:'90%', s:2,   o:0.8 }, { id:7,  top:'2%',  left:'76%', s:1,   o:0.6 },
  { id:8,  top:'18%', left:'44%', s:1.5, o:0.4 }, { id:9,  top:'25%', left:'23%', s:1,   o:0.7 },
  { id:10, top:'7%',  left:'18%', s:1,   o:0.5 }, { id:11, top:'13%', left:'61%', s:2,   o:0.9 },
  { id:12, top:'30%', left:'88%', s:1,   o:0.4 }, { id:13, top:'5%',  left:'48%', s:1.5, o:0.6 },
  { id:14, top:'22%', left:'72%', s:1,   o:0.8 }, { id:15, top:'9%',  left:'3%',  s:2,   o:0.5 },
  { id:16, top:'35%', left:'15%', s:1,   o:0.3 }, { id:17, top:'28%', left:'38%', s:1.5, o:0.7 },
  { id:18, top:'16%', left:'95%', s:1,   o:0.6 }, { id:19, top:'40%', left:'52%', s:1,   o:0.4 },
  { id:20, top:'1%',  left:'88%', s:2,   o:0.9 }, { id:21, top:'45%', left:'7%',  s:1,   o:0.3 },
  { id:22, top:'33%', left:'29%', s:1.5, o:0.5 }, { id:23, top:'19%', left:'57%', s:1,   o:0.7 },
  { id:24, top:'10%', left:'40%', s:1,   o:0.6 }, { id:25, top:'50%', left:'78%', s:1.5, o:0.4 },
  { id:26, top:'38%', left:'65%', s:1,   o:0.5 }, { id:27, top:'26%', left:'10%', s:2,   o:0.8 },
  { id:28, top:'14%', left:'99%', s:1,   o:0.4 }, { id:29, top:'42%', left:'33%', s:1,   o:0.6 },
]

const Step = ({ icon: Icon, number, title, desc, color }) => (
  <motion.div
    className="flex flex-col items-center text-center gap-4 p-6"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: number * 0.15 }}
  >
    <div className="relative">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#1e1a4a', border: '2px solid rgba(139,92,246,0.4)' }}>
        {number}
      </span>
    </div>
    <div>
      <h3 className="font-bold text-lg mb-1 text-white">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
)

const HomePage = () => {
  const [joinCode, setJoinCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [serverResponse, setServerResponse] = useState(null)
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [joiningFamily, setJoiningFamily] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [successLogin, setSuccessLogin] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [signupForm, setSignupForm] = useState(false)
  const [loading, setLoading] = useState(true);
  const [successSignup, setSuccessSignup] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { currentUser, logout, fetchCurrentUser, error } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const inviteCode = params.get('inviteCode');
    if (inviteCode) {
      setJoinCode(inviteCode);
      setShowLoginForm(true);
      setSignupForm(true);
    }
    if (params.get('showLoginForm') === 'true') {
      setShowLoginForm(true)
    }
  }, [location]);

  useEffect(() => {
    if (errorMessage) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    try {
      setJoiningFamily(true)
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/family/join`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode })
      })
      if (result.status === 400) { setIsConfirmOpen(true); return }
      const familyData = await result.json()
      setServerResponse(familyData)
      if (familyData.family) setJoiningFamily(false);
    } catch (error) {
      setServerResponse({ message: "Une erreur est survenue lors du fetching des données", error })
    } finally {
      if (isConfirmOpen || (serverResponse && serverResponse.family)) setJoiningFamily(false);
    }
  };

  const handleChangeFamily = async () => {
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/family/change`, {
        method: "PATCH",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode })
      })
      if (!result.ok) throw new Error(`Erreur ${result.status}: ${result.statusText}`);
      const familyData = await result.json()
      setServerResponse(familyData)
      setIsConfirmOpen(false)
    } catch (error) {
      console.error("Erreur lors du changement de famille: ", error)
    } finally {
      setJoiningFamily(false);
    }
  }

  useEffect(() => {
    if (!serverResponse) return;
    if (serverResponse.family && serverResponse.family._id) {
      const handleFamilyJoin = async () => {
        await fetchCurrentUser();
        navigate(`/family/${serverResponse.family._id}`);
        setServerResponse(null);
      };
      handleFamilyJoin();
    }
  }, [serverResponse, navigate, fetchCurrentUser]);

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    setCreatingFamily(true)
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/family/create`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: familyName })
      })
      const familyData = await result.json()
      setServerResponse(familyData)
    } catch (error) {
      setServerResponse({ message: "Une erreur est survenue lors du fetching des données", error })
      showToast({ message: error, type: "error" })
    }
  };

  useEffect(() => {
    let timer
    if (successLogin) {
      timer = setTimeout(() => setSuccessLogin(false), 2000)
    }
    return () => clearTimeout(timer)
  }, [successLogin])

  const handleLogout = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    try {
      await logout()
      navigate('/')
    } catch (error) {
      setErrorMessage("Une erreur lors de la déconnexion s'est produite.");
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── TOASTS ── */}
      {successLogin && (
        <div className='fixed top-4 inset-x-0 flex justify-center items-center z-50'>
          <div role="alert" className="alert alert-success alert-soft shadow-lg">
            <CheckCircle />
            <span>Bienvenue à la maison {currentUser?.username}</span>
          </div>
        </div>
      )}
      {successSignup && (
        <div role="alert" className="fixed top-4 inset-x-0 flex justify-center z-50">
          <div className="alert alert-success"><span>Inscription réussie !</span></div>
        </div>
      )}
      {(showError || (!showError && error)) && (
        <div className='fixed top-4 inset-x-0 flex justify-center items-center z-50'>
          <div role="alert" className="alert alert-error alert-soft shadow-lg max-w-sm">
            <span>{errorMessage || error}</span>
          </div>
        </div>
      )}

      <ConfirmMessage
        isOpen={isConfirmOpen}
        onCancel={() => { setIsConfirmOpen(false); setJoiningFamily(false) }}
        title={"Changement de Family"}
        message="Hey ! Tu fais déjà partie d'une famille sur Peakture. Si tu rejoins celle-ci, tu perdras l'accès à l'ancienne. Es-tu sûr de vouloir continuer ?"
        onConfirm={handleChangeFamily}
      />

      {/* ══════════════════════════════════════════
          HERO — Ciel nocturne + montagne
      ══════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #07071a 0%, #12103a 40%, #1e1250 70%, #2a1060 100%)' }}
      >
        {/* Étoiles */}
        {STARS.map(s => (
          <span
            key={s.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{ top: s.top, left: s.left, width: s.s, height: s.s, opacity: s.o, animationDuration: `${2 + s.id % 3}s` }}
          />
        ))}

        {/* Halo doré au sommet */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full blur-3xl pointer-events-none"
          style={{ bottom: '28%', width: '40vw', height: '20vw', background: 'radial-gradient(ellipse, rgba(251,191,36,0.25) 0%, transparent 70%)' }}
        />

        {/* ── Header ── */}
        <header className="relative z-10 flex items-center justify-between px-6 py-5">
          <img
            src="https://res.cloudinary.com/djsj0pfm3/image/upload/c_thumb,w_200,g_face/v1740580694/logo_white_ocjjvc.png"
            className="w-12 h-auto"
            alt="Peakture"
          />
          <div className="flex gap-2">
            {currentUser && !currentUser.sessionId ? (
              <button className="btn btn-sm btn-outline btn-accent" onClick={handleLogout}>
                Se Déconnecter
              </button>
            ) : (
              <>
                <button
                  className="btn btn-sm btn-ghost text-white/80 hover:text-white"
                  onClick={() => setShowLoginForm(true)}
                >
                  Se Connecter
                </button>
                <button
                  className="btn btn-sm btn-accent"
                  onClick={() => { setSignupForm(true); setShowLoginForm(true) }}
                >
                  S&apos;inscrire
                </button>
              </>
            )}
          </div>
        </header>

        {/* ── Contenu héro ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pb-40">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-white leading-none mb-6"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3.5rem, 9vw, 7rem)', letterSpacing: '0.02em' }}
          >
            La meilleure photo<br />
            <span style={{ color: '#fbbf24', WebkitTextStroke: '1px rgba(251,191,36,0.3)' }}>
              atteindra le sommet
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white/60 text-lg max-w-md mb-10"
          >
            Soumets ta photo, laisse ta famille voter.<br />
            Chaque mois, un seul cliché conquiert le pic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              className="btn btn-lg px-8 font-bold"
              style={{ background: '#fbbf24', color: '#07071a', border: 'none' }}
              onClick={() => document.getElementById('action').scrollIntoView({ behavior: 'smooth' })}
            >
              Rejoindre une Family
            </button>
            <button
              className="btn btn-lg btn-outline px-8 text-white border-white/30 hover:bg-white/10 hover:border-white/50"
              onClick={() => { setSignupForm(true); setShowLoginForm(true) }}
            >
              Créer ma Family
            </button>
          </motion.div>
        </div>

        {/* Montagne SVG */}
        <div className="absolute bottom-0 w-full pointer-events-none" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 380" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '380px', display: 'block' }}>
            <defs>
              <radialGradient id="peakGlow" cx="50%" cy="100%" r="60%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Montagnes arrière */}
            <path d="M0,380 L0,280 L120,200 L280,310 L440,220 L560,270 L680,160 L800,250 L960,190 L1100,280 L1260,210 L1380,260 L1440,230 L1440,380Z" fill="#1a1060" opacity="0.6" />
            {/* Halo sur le pic */}
            <ellipse cx="720" cy="55" rx="260" ry="90" fill="url(#peakGlow)" />
            {/* Montagnes principales */}
            <path d="M0,380 L0,310 L150,270 L320,340 L480,260 L580,310 L680,200 L720,40 L760,200 L860,290 L1000,240 L1150,320 L1300,275 L1440,300 L1440,380Z" fill="#0f0c2e" />
            {/* Premier plan */}
            <path d="M0,380 L0,360 L100,340 L250,360 L380,330 L500,360 L620,345 L720,330 L820,345 L940,355 L1060,335 L1200,355 L1340,340 L1440,350 L1440,380Z" fill="#0a0818" />
          </svg>
        </div>

        {/* Flèche scroll */}
        <motion.button
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 z-10 cursor-pointer hover:text-white/70 transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.button>
      </section>

      {/* ══════════════════════════════════════════
          COMMENT ÇA MARCHE
      ══════════════════════════════════════════ */}
      <section id="how-it-works" style={{ background: '#100d30' }} className="py-20 px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-3 text-white">Comment ça marche ?</h2>
          <p className="text-white/40 max-w-md mx-auto">
            Trois étapes pour conquérir le sommet
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <Step
            number={1}
            icon={Camera}
            title="Soumets ta photo"
            desc="Chaque mois, un thème. Partage ton meilleur cliché avec ta famille."
            color="bg-violet-600"
          />
          <Step
            number={2}
            icon={Users}
            title="Ta famille vote"
            desc="Chaque membre vote pour sa photo préférée. Un vote par album, tu peux changer d'avis."
            color="bg-violet-400"
          />
          <Step
            number={3}
            icon={Trophy}
            title="Le sommet est conquis"
            desc="La photo avec le plus de votes remporte la Peakture du mois et grimpe au classement."
            color="bg-amber-500"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          REJOINDRE / CRÉER
      ══════════════════════════════════════════ */}
      <section id="action" style={{ background: '#0a0818' }} className="py-20 px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-3 text-white">Prêt à grimper ?</h2>
          <p className="text-white/40">Rejoins une famille existante ou crée la tienne</p>
        </motion.div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Rejoindre ── */}
          <motion.div
            className="rounded-3xl p-8 border"
            style={{ background: 'rgba(109,40,217,0.12)', borderColor: 'rgba(139,92,246,0.3)' }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-violet-300">Rejoins une Family</h3>
                <p className="text-xs text-white/40">Tu as un code d'invitation ?</p>
              </div>
              <div className="tooltip tooltip-right ml-auto" data-tip="Rejoins une communauté pour partager tes photos et participer aux concours.">
                <HelpCircle className="w-4 h-4 text-white/20 hover:text-white/50 cursor-pointer" />
              </div>
            </div>
            <form onSubmit={handleJoinFamily} className="space-y-4">
              <div className="form-control">
                <label className="label pb-1"><span className="label-text text-white/60 text-sm">Code d'invitation</span></label>
                <input
                  type="text"
                  placeholder="ABC123"
                  className="input w-full tracking-widest font-mono text-lg uppercase text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.4)' }}
                  pattern="[A-F0-9]{6}"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  title="Code hexadécimal (6 caractères, A-F, 0-9)"
                  required
                  onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                />
                <p className="text-xs text-white/25 mt-1">6 caractères · A-F, 0-9</p>
              </div>
              {serverResponse && !serverResponse?.family && joiningFamily && (
                <div role="alert" className="alert alert-error alert-soft">
                  <span>{serverResponse.message}</span>
                </div>
              )}
              <button
                type="submit"
                className="btn w-full font-bold"
                style={{ background: '#7c3aed', color: 'white', border: 'none' }}
                disabled={joiningFamily}
              >
                {joiningFamily ? <span className="loading loading-spinner loading-sm" /> : 'Rejoindre →'}
              </button>
            </form>
          </motion.div>

          {/* ── Créer ── */}
          <motion.div
            className="rounded-3xl p-8 border"
            style={{ background: 'rgba(180,130,0,0.1)', borderColor: 'rgba(251,191,36,0.3)' }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.15)' }}>
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-amber-300">Crée ta Family</h3>
                <p className="text-xs text-white/40">Lance ton propre concours</p>
              </div>
              <div className="tooltip tooltip-left ml-auto" data-tip="Deviens admin d'une communauté et invite tes proches.">
                <HelpCircle className="w-4 h-4 text-white/20 hover:text-white/50 cursor-pointer" />
              </div>
            </div>
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div className="form-control">
                <label className="label pb-1"><span className="label-text text-white/60 text-sm">Nom de la Family</span></label>
                <input
                  type="text"
                  placeholder="Les Duponts"
                  className="input w-full text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,191,36,0.35)' }}
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                />
                <p className="text-xs text-white/25 mt-1">Un code d'invitation sera généré automatiquement</p>
              </div>
              {serverResponse?.message && creatingFamily && (
                <div role="alert" className="alert alert-error alert-soft">
                  <span>{serverResponse.message}</span>
                </div>
              )}
              <button
                type="submit"
                className="btn w-full font-bold"
                style={{ background: '#fbbf24', color: '#07071a', border: 'none' }}
                disabled={creatingFamily}
              >
                {creatingFamily ? <span className="loading loading-spinner loading-sm" /> : 'Créer ma Family →'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ── Auth modal ── */}
      {showLoginForm && (
        <Auth
          signUp={signupForm}
          isOpen={showLoginForm}
          preFilledInviteCode={joinCode}
          onClose={() => { setShowLoginForm(false); setSignupForm(false) }}
          onLoginSuccess={() => { setSuccessLogin(true); setShowLoginForm(false) }}
          onSignupSuccess={() => {
            setSuccessSignup(true); setSuccessLogin(true);
            setTimeout(() => setSuccessSignup(false), 3000);
            setShowLoginForm(false)
          }}
        />
      )}

      {/* ── Footer ── */}
      <footer className="py-8 text-center text-sm border-t" style={{ background: '#07071a', color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(139,92,246,0.15)' }}>
        <p className="font-medium mb-1">🏔 Chaque photo nous rapproche du sommet</p>
        <p>© 2025 Peakture · <a href="https://storyset.com/worker" className="hover:text-white/60 transition-colors">illustrations by Storyset</a></p>
      </footer>
    </div>
  );
};

export default HomePage;
