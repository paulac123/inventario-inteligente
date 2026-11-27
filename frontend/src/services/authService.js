import api from './api'

export const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role }))
    return data
}

export const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
}

export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'))
    } catch {
        return null
    }
}

export const isAuthenticated = () => !!localStorage.getItem('token')
