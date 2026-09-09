import { useState, useEffect, useRef } from 'react'
import { X, Sun, Moon, LogOut, ShieldCheck, Check, Edit2, Save, User, Camera, Upload, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useNavigate } from 'react-router-dom'

function getInitials(name, email) {
  const cleanName = (name || '').trim()
  if (cleanName) {
    return cleanName[0].toUpperCase()
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return 'U'
}

export default function SettingsModal({ isOpen: propIsOpen, onClose: propOnClose }) {
  const { theme, setTheme, user, updateUser, logout, isSettingsOpen, setIsSettingsOpen } = useApp()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const isOpen = propIsOpen !== undefined ? propIsOpen : isSettingsOpen
  const handleClose = propOnClose || (() => { setIsSettingsOpen(false); setIsEditing(false); setAvatarError('') })

  if (!isOpen) return null

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    updateUser({ name: name.trim(), email: email.trim() })
    setIsEditing(false)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarError('')
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WebP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Image is too large. Please select an image under 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const size = 256
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')

          // Center crop calculation
          const minDim = Math.min(img.width, img.height)
          const sx = (img.width - minDim) / 2
          const sy = (img.height - minDim) / 2

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
          const compressed = canvas.toDataURL('image/jpeg', 0.88)
          updateUser({ profilePicture: compressed })
        } catch (err) {
          console.error('Failed to process avatar image:', err)
          setAvatarError('Failed to process image. Please try another.')
        }
      }
      img.onerror = () => {
        setAvatarError('Failed to load image.')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveProfilePicture = () => {
    setAvatarError('')
    updateUser({ profilePicture: null })
  }

  const handleLogout = () => {
    logout()
    handleClose()
    navigate('/login')
  }

  const currentAvatar = getInitials(name, email)

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        {/* Hidden File Input for Avatar Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleImageUpload}
          className="hidden"
          aria-label="Upload profile picture"
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close settings"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          Settings & Profile
        </h2>

        {/* Profile Card Section */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3.5">
              {/* Profile Avatar with Hover Camera Overlay */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload custom profile picture"
                  className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-sm shrink-0 overflow-hidden relative transition-transform duration-200 group-hover:scale-105 focus-ring cursor-pointer"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'User Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentAvatar
                  )}
                  {/* Hover Camera Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera size={18} />
                  </div>
                </button>

                {/* Camera Badge Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload new photo"
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 transition-transform active:scale-90"
                >
                  <Camera size={10} />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {user?.name || name || 'Aayush Panchal'}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck size={10} /> Active Member
                  </span>
                  {user?.profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="text-[10px] font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-0.5 transition-colors cursor-pointer"
                      title="Reset to default initials avatar"
                    >
                      <Trash2 size={10} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-ring"
              >
                <Edit2 size={13} /> Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            )}
          </div>

          {avatarError && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-950/30 p-2 rounded-xl border border-red-200 dark:border-red-900/50">
              {avatarError}
            </p>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
              {/* Photo Upload Row in Edit Mode */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Profile Picture
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors focus-ring cursor-pointer"
                  >
                    <Upload size={13} /> {user?.profilePicture ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {user?.profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} /> Remove Photo
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus-ring"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus-ring"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors focus-ring mt-2"
              >
                <Save size={14} /> Save Profile Changes
              </button>
            </form>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Name</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'Aayush Panchal'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Email</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{user?.email || 'aayush@lexidoc.com'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Appearance & Theme Section */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Theme Preference
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Light Mode Selection Card */}
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left focus-ring ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl grid place-items-center ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <Sun size={16} />
                </div>
                <span className="text-xs">Light Mode</span>
              </div>
              {theme === 'light' && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
            </button>

            {/* Dark Mode Selection Card */}
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left focus-ring ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-950/30 text-indigo-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl grid place-items-center ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <Moon size={16} />
                </div>
                <span className="text-xs">Dark Mode</span>
              </div>
              {theme === 'dark' && <Check size={16} className="text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors focus-ring"
          >
            <LogOut size={16} /> Log Out of LexiDoc
          </button>
        </div>
      </div>
    </div>
  )
}


