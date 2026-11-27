import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import appRoutes from './Routes'
import Sidebar from './components/Sidebar'
import { isAuthenticated, getUser } from './services/authService'

const ProtectedRoute = ({ element, adminOnly }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (adminOnly && getUser()?.role !== 'admin') return <Navigate to="/" replace />
  return element
}

const Layout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isLogin = location.pathname === '/login'

  // Cierra el sidebar al cambiar de ruta en móvil
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  if (isLogin) return children
  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop — siempre visible */}
      <div className="hidden md:flex w-48 shrink-0 border-r border-gray-200 bg-white">
        <Sidebar />
      </div>

      {/* Sidebar móvil — overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`fixed top-0 left-0 h-full w-56 z-50 bg-white border-r border-gray-200 transform transition-transform duration-200 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto min-w-0">
        {/* Botón hamburguesa — solo móvil */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-orange-500 p-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 font-semibold text-orange-600 text-sm">Mi Tienda</span>
        </div>
        {children}
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {appRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.public
                  ? route.element
                  : <ProtectedRoute element={route.element} adminOnly={route.adminOnly} />
              }
            />
          ))}
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
