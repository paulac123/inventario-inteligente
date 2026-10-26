import api from './api';

const getSummary = async (date) =>{
try{
    const response = await api.get('/summary/', { params: { date } })
        return response.data
} catch(error){
console.error('Error creating summary:', error)
    throw error
}
}
export default getSummary;