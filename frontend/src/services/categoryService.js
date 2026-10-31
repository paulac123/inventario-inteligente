import api from './api'

const getCategories = async (type) => {
    const response = await api.get('/categories/', { params: { type } })
    return response.data
}

export default getCategories
