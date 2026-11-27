import { Link, useLocation } from 'react-router-dom'
import { getUser, logout } from '../services/authService'

const Sidebar = ({ onClose }) => {
    const user = getUser()
    const location = useLocation()
    if (!user) return null

    const link = (to, label) => {
        const active = location.pathname === to || location.pathname.startsWith(to + '/')
        return (
            <Link
                to={to}
                onClick={onClose}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                {label}
            </Link>
        )
    }

    return (
        <div className="flex flex-col h-full gap-1 p-4">
            <p className="text-xl font-bold text-orange-600 mb-4">Mi Tienda</p>
            {link('/transactions', 'Transacciones')}
            {link('/inventory', 'Inventario')}
            {link('/summary', 'Resumen')}
            {link('/credits', 'Separados')}
            {link('/alerts', 'Alertas')}
            {user.role === 'admin' && link('/debts', 'Deudas')}
            {user.role === 'admin' && link('/metrics', 'Métricas')}
            <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1 px-3">{user.username} · {user.role}</p>
                <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                    Cerrar sesión
                </button>
            </div>
        </div>
    )
}

export default Sidebar
