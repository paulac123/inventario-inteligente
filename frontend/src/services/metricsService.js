import api from './api'

const getLocalOffset = () => {
    const offset = new Date().getTimezoneOffset()
    const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0')
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0')
    const sign = offset > 0 ? '-' : '+'
    return `${sign}${hours}:${minutes}`
}

const buildParams = (dateFrom, dateTo) => {
    if (!dateFrom || !dateTo) return {}
    const offset = getLocalOffset()
    return {
        date_from: `${dateFrom}T00:00:00${offset}`,
        date_to: `${dateTo}T23:59:59${offset}`
    }
}

const getSalesByTypeAndSize = async ({ dateFrom, dateTo } = {}) => {
    const response = await api.get('/metrics/sales-by-type-size', { params: buildParams(dateFrom, dateTo) })
    return response.data
}

const getManualSalesByType = async ({ dateFrom, dateTo } = {}) => {
    const response = await api.get('/metrics/manual-sales-by-type', { params: buildParams(dateFrom, dateTo) })
    return response.data
}

const getSalesByType = async ({ dateFrom, dateTo } = {}) => {
    const response = await api.get('/metrics/sales-by-type', { params: buildParams(dateFrom, dateTo) })
    return response.data
}

const getSalesBySupplier = async ({ dateFrom, dateTo } = {}) => {
    const response = await api.get('/metrics/sales-by-supplier', { params: buildParams(dateFrom, dateTo) })
    return response.data
}

export { getSalesByTypeAndSize, getManualSalesByType, getSalesByType, getSalesBySupplier }
