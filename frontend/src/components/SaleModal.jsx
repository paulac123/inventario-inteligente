import { useState } from 'react'
import createSale from '../services/saleService'

const SaleModal = ({ onClose }) => {
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')

    const handleSave = async () => {
        await createSale({ amount, description })
        onClose()
    }

    return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h1>Venta</h1>
            <input  type="number" placeholder="Valor" className="w-full border border-gray-300 rounded-lg p-2 mb-3" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input  type="text" placeholder="Descripción (opcional)" className="w-full border border-gray-300 rounded-lg p-2 mb-3" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600" onClick={onClose}>
                Cancelar
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700" onClick={handleSave}>
                Guardar
            </button>
        </div>
    </div>

)
}

export default SaleModal