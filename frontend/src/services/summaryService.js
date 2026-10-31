import api from './api'

const getLocalOffset = () => {
    const offset = new Date().getTimezoneOffset()
    const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0')
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0')
    const sign = offset > 0 ? '-' : '+'
    return `${sign}${hours}:${minutes}`
}

const getSummary = async (dateFrom, dateTo) => {
    try {
        const offset = getLocalOffset()
        const date_from = `${dateFrom}T00:00:00${offset}`
        const date_to = `${dateTo}T23:59:59${offset}`
        const response = await api.get('/summary/', { params: { date_from, date_to } })
        return response.data
    } catch (error) {
        console.error('Error fetching summary:', error)
        throw error
    }
}

export default getSummary
