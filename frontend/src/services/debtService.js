import api from './api'

export const getDebts = () => api.get('/debts/').then(r => r.data)
export const createDebt = (data) => api.post('/debts/', data).then(r => r.data)
export const addDebtPayment = (debtId, data) => api.post(`/debts/${debtId}/payments`, data).then(r => r.data)
export const deleteDebt = (id) => api.delete(`/debts/${id}`)
