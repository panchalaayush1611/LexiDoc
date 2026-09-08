import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Chat from './pages/Chat.jsx'
import History from './pages/History.jsx'
import About from './pages/About.jsx'
import Login from './pages/Login.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import { useApp } from './context/AppContext.jsx'

function ProtectedRoute({ children }) {
  const { user } = useApp()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-300">
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <SettingsModal />
    </div>
  )
}


