import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Lock, Mail, User, CheckCircle2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login, signup } = useApp()
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@lexidoc.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    if (isSignUp && !name) {
      setError('Please enter your full name.')
      return
    }

    if (isSignUp) {
      signup(name, email, password)
    } else {
      login(email, password)
    }
    navigate('/chat')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl animate-fadeIn">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="LexiDoc Logo"
            className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-lg"
          />
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
            {isSignUp ? 'Create your LexiDoc Account' : 'Welcome back to LexiDoc'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isSignUp ? 'Sign up to start chatting with your PDF documents' : 'Sign in to access your documents and chat history'}
          </p>
        </div>

        {/* Demo Credentials Hint */}
        <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 rounded-2xl p-3.5 mb-6 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5">
          <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Demo Login Active:</span> You can sign in using any credentials, or click below to proceed with demo credentials (<span className="font-mono font-semibold">demo@lexidoc.com</span>).
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aayush Panchal"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus-ring font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@lexidoc.com"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus-ring font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus-ring font-medium"
              />
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all focus-ring shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {isSignUp ? 'Create Account & Continue' : 'Sign In & Access Chat'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
