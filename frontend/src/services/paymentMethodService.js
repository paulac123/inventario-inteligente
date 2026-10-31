import api from './api'

const getPaymentMethods = async () => {
    const response = await api.get('/payment-methods/')
    return response.data
}

export default getPaymentMethods
