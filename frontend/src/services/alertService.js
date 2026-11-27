import api from './api'

export const getAlertConfigs = () => api.get('/alerts/configs').then(r => r.data)
export const getAllStatus = () => api.get('/alerts/status').then(r => r.data)
export const createAlertConfig = (data) => api.post('/alerts/configs', data).then(r => r.data)
export const deleteAlertConfig = (id) => api.delete(`/alerts/configs/${id}`)
export const getActiveAlerts = () => api.get('/alerts/active').then(r => r.data)
