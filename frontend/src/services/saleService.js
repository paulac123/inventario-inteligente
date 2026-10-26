import api from './api'

const createSale = async (data) => {
try {
const response = await api.post ('/sales/', data    )
return response.data
} catch (error) {  
    console.error('Error creating sale:', error)
    throw error

}}

export default createSale;