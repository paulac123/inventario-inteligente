import api from './api'

const getLocalOffset = () => {
    const offset = new Date().getTimezoneOffset()
    const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0')
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0')
    const sign = offset > 0 ? '-' : '+'
    return `${sign}${hours}:${minutes}`
}

const createSale = async (saleData) => {
    const response = await api.post('/sales/', saleData)
    return response.data
}

const getSales = async (dateFrom, dateTo) => {
    const offset = getLocalOffset()
    const date_from = `${dateFrom}T00:00:00${offset}`
    const date_to = `${dateTo}T23:59:59${offset}`
    const response = await api.get('/sales/', { params: { date_from, date_to } })
    return response.data
}

const deleteSale = async (saleId) => {
    const response = await api.delete(`/sales/${saleId}`)
    return response.data
}

export { createSale, getSales, deleteSale }
