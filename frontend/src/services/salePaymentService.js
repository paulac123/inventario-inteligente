import api from './api'

export const getCreditSales = async () => {
    const response = await api.get('/sales/credit')
    return response.data
}

export const getSalePayments = async (saleId) => {
    const response = await api.get(`/sales/${saleId}/payments`)
    return response.data
}

export const addPayment = async (saleId, data) => {
    const response = await api.post(`/sales/${saleId}/payments`, data)
    return response.data
}
