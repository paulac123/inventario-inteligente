import { useState, useEffect } from 'react'
import createExpense from '../services/expenseService'
import getCategories from '../services/categoryService'
import getPaymentMethods from '../services/paymentMethodService'

const ExpenseModal = ({ onClose, onSuccess }) => {
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
    const [paymentMethodId, setPaymentMethodId] = useState('')
    const [paymentMethods, setPaymentMethods] = useState([])
    const [pmSearch, setPmSearch] = useState('')
    const [pmOpen, setPmOpen] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        getCategories('expense').then(setCategories)
        getPaymentMethods().then(setPaymentMethods)
    }, [])

    const handleSave = async () => {
        if (!categoryId || !paymentMethodId || !amount) {
            setError('Debes completar categoría, forma de pago y valor.')
            return
        }
        try {
            setError('')
            await createExpense({ amount, description, category_id: categoryId, payment_method_id: paymentMethodId })
            onSuccess()
            onClose()
        } catch (e) {
            setError('Ocurrió un error al guardar. Intenta de nuevo.')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                <h1>Nuevo Gasto</h1>
                <div className="relative mb-3">
                    <input type="text" placeholder="Buscar categoría..."
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCategoryId('') }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                    />
                    {open && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto shadow-lg">
                            {categories
                                .filter(cat => cat.name.toLowerCase().includes(search.toLowerCase()))
                                .map(cat => (
                                    <li key={cat.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                        onMouseDown={() => { setCategoryId(cat.id); setSearch(cat.name); setOpen(false) }}>
                                        {cat.name}
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
                <div className="relative mb-3">
                    <input type="text" placeholder="Forma de pago..."
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={pmSearch}
                        onChange={(e) => { setPmSearch(e.target.value); setPaymentMethodId('') }}
                        onFocus={() => setPmOpen(true)}
                        onBlur={() => setTimeout(() => setPmOpen(false), 150)}
                    />
                    {pmOpen && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto shadow-lg">
                            {paymentMethods
                                .filter(pm => pm.name.toLowerCase().includes(pmSearch.toLowerCase()))
                                .map(pm => (
                                    <li key={pm.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                        onMouseDown={() => { setPaymentMethodId(pm.id); setPmSearch(pm.name); setPmOpen(false) }}>
                                        {pm.name}
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
                <input type="number" placeholder="Valor" className="w-full border border-gray-300 rounded-lg p-2 mb-3" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <input type="text" placeholder="Descripción (opcional)" className="w-full border border-gray-300 rounded-lg p-2 mb-3" value={description} onChange={(e) => setDescription(e.target.value)} />
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <button className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600" onClick={onClose}>Cancelar</button>
                <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600" onClick={handleSave}>Guardar</button>
            </div>
        </div>
    )
}

export default ExpenseModal
