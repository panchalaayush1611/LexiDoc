import { NavLink, useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Settings, User, LogIn } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const links = [
  { to: '/', label: 'Home' },
  { to: '/chat', label: 'Chat' },
  { to: '/history', label: 'History' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { user, setIsSettingsOpen } = useApp()

  const handleGetStarted = () => {
    if (user) {
      navigate('/chat')
    } else {
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-3 group focus-ring rounded-xl p-1" aria-label="LexiDoc home">
          <img
            src="/logo.png"
            alt="LexiDoc Logo"
            className="w-10 h-10 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              LexiDoc
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles size={10} /> AI Powered
            </span>
          </div>
        </NavLink>

        {/* Primary Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-full border border-slate-200 dark:border-slate-700/60" aria-label="Primary navigation">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 focus-ring ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions: User Profile / Auth & Get Started */}
        <div className="flex items-center gap-3">
          {/* User Auth Status / Buttons */}
          {user ? (
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Click to manage profile & settings"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-ring cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.avatar || 'U'
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold max-w-[120px] truncate">{user.name}</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors focus-ring"
              >
                <LogIn size={14} /> Sign In
              </button>

              {/* Get Started CTA Button (Only shown for non-logged in users) */}
              <button
                onClick={handleGetStarted}
                className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-ring"
              >
                Get Started <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>


      {/* Primary Mobile Navigation Links */}
      <nav className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#090D16]/95" aria-label="Primary mobile navigation">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex-1 text-center py-2.5 text-xs font-semibold transition-colors focus-ring ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-600 dark:text-slate-400'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}


