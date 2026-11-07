import { useState } from 'react'
import { createVariant, updateVariant } from '../services/productVariantsService'

const VariantModal = ({ productId, productName, variant, onClose, onSuccess }) => {
    const [size, setSize] = useState(variant?.size || '')
    const [color, setColor] = useState(variant?.color || '')
    const [quantity, setQuantity] = useState(variant?.quantity?.toString() || '')
    const [minStock, setMinStock] = useState(variant?.min_stock?.toString() || '')
    const [maxStock, setMaxStock] = useState(variant?.max_stock?.toString() || '')
    const [error, setError] = useState('')

    const handleSave = async () => {
        if (!size || !color || !quantity) {
            setError('Debes completar talla, color y cantidad.')
            return
        }
        try {
            setError('')
            const data = {
                product_id: productId,
                size,
                color,
                quantity: parseInt(quantity),
                min_stock: minStock ? parseInt(minStock) : null,
                max_stock: maxStock ? parseInt(maxStock) : null
            }
            if (variant) {
                await updateVariant(variant.id, data)
            } else {
                await createVariant(data)
            }
            onSuccess()
            onClose()
        } catch (e) {
            setError('Ocurrió un error al guardar. Intenta de nuevo.')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
            <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                <h2 className="text-xl font-bold mb-1">{variant ? 'Editar Variante' : 'Nueva Variante'}</h2>
                <p className="text-gray-500 text-sm mb-4">{productName}</p>

                <input type="text" placeholder="Talla *"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-3"
                    value={size} onChange={(e) => setSize(e.target.value)} />

                <input type="text" placeholder="Color *"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-3"
                    value={color} onChange={(e) => setColor(e.target.value)} />

                <input type="number" placeholder="Cantidad *"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-3"
                    value={quantity} onChange={(e) => setQuantity(e.target.value)} />

                <div className="flex gap-3 mb-3">
                    <input type="number" placeholder="Stock mínimo"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={minStock} onChange={(e) => setMinStock(e.target.value)} />
                    <input type="number" placeholder="Stock máximo"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={maxStock} onChange={(e) => setMaxStock(e.target.value)} />
                </div>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <div className="flex gap-3">
                    <button className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600" onClick={onClose}>Cancelar</button>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700" onClick={handleSave}>Guardar</button>
                </div>
            </div>
        </div>
    )
}

export default VariantModal
