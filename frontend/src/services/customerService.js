import api from './api'

export const searchCustomers = async (q) => {
    const response = await api.get('/customers/', { params: { q } })
    return response.data
}

export const createCustomer = async (data) => {
    const response = await api.post('/customers/', data)
    return response.data
}
