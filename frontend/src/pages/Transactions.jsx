import { useState } from 'react'
import SaleModal from '../components/SaleModal'
import ExpenseModal from '../components/ExpenseModal'

const Transactions = () => {
    const [showSaleModal, setShowSaleModal] = useState(false)
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    const handleSuccess = (msg) => {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(''), 3000)
    }

    return (
        <div>
            <h1>Transaciones</h1>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold" onClick={() => setShowSaleModal(true)}>Nueva Venta</button>
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold" onClick={() => setShowExpenseModal(true)}>Nuevo Gasto</button>
            {successMsg && (
                <p className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 text-green-600 font-bold text-3xl">
                    {successMsg}
                </p>
            )}
            {showSaleModal && <SaleModal onClose={() => setShowSaleModal(false)} onSuccess={() => handleSuccess('¡Venta guardada!')} />}
            {showExpenseModal && <ExpenseModal onClose={() => setShowExpenseModal(false)} onSuccess={() => handleSuccess('¡Gasto guardado!')} />}
        </div>
    )
}

export default Transactions
