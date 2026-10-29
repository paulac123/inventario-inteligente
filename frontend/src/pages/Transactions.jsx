//import createSale from '../services/saleService'
//import createExpense from '../services/expenseService'
import {useState} from 'react'
import SaleModal from '../components/SaleModal'
import ExpenseModal from '../components/ExpenseModal'

const Transactions = () => {
    const [showSaleModal, setShowSaleModal] = useState(false)
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    return (
        <div>
            <h1>Transaciones</h1>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold" onClick={() => setShowSaleModal(true)}>Nueva Venta</button>
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold" onClick={() => setShowExpenseModal(true)}>Nuevo Gasto</button>   
            {showSaleModal && <SaleModal onClose={() => setShowSaleModal(false)} />}
             {showExpenseModal && <ExpenseModal onClose={() => setShowExpenseModal(false)} />}  
        </div>
    )
}

export default Transactions