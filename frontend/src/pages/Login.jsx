import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username || !password) { setError('Ingresa usuario y contraseña.'); return }
        try {
            setError('')
            setLoading(true)
            await login(username, password)
            navigate('/')
        } catch {
            setError('Usuario o contraseña incorrectos.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-1 text-center">Inventario</h1>
                <p className="text-sm text-gray-400 text-center mb-6">Inicia sesión para continuar</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Usuario"
                        className="border border-gray-300 rounded-lg p-3"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="border border-gray-300 rounded-lg p-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
