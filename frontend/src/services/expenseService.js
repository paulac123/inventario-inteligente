import api  from './api';

const createExpense = async(data) =>{
try {const response = await api.post('/expenses/' , data)
return response.data
}catch(error){
   console.error('Error creating expense:', error)
    throw error
}
}

export default createExpense;