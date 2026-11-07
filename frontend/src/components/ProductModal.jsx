import { useState, useEffect } from 'react'
import { createProduct, updateProduct } from '../services/productService'
import getCategories from '../services/categoryService'

const ProductModal = ({ onClose, onSuccess, product }) => {
    const [name, setName] = useState(product?.name || '')
    const [reference, setReference] = useState(product?.reference || '')
    const [supplierId, setSupplierId] = useState(product?.supplier_id || '')
    const [suppliers, setSuppliers] = useState([])
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
    const [salePrice, setSalePrice] = useState(product?.sale_price ? Number(product.sale_price).toLocaleString('es-CO') : '')
    const [costPrice, setCostPrice] = useState(product?.cost_price ? Number(product.cost_price).toLocaleString('es-CO') : '')
    const [barcode, setBarcode] = useState(product?.barcode || '')
    const [qrCode, setQrCode] = useState(product?.qr_code || '')
    const [photo, setPhoto] = useState(product?.photo || '')
    const [error, setError] = useState('')

    useEffect(() => {
        getCategories('sale').then((data) => {
            setSuppliers(data)
            if (product?.supplier_id) {
                const found = data.find(s => s.id === product.supplier_id)
                if (found) setSearch(found.name)
            }
        })
    }, [])

    const formatCOP = (value) => {
        const num = value.replace(/\D/g, '')
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    const parseCOP = (value) => parseFloat(value.replace(/\./g, '')) || 0

    const profitPercent = salePrice && costPrice && parseCOP(costPrice) > 0
        ? (((parseCOP(salePrice) - parseCOP(costPrice)) / parseCOP(costPrice)) * 100).toFixed(1)
        : null

    const handleSave = async () => {
        if (!name || !reference || !supplierId || !salePrice || !costPrice) {
            setError('Debes completar nombre, referencia, proveedor, precio de venta y costo.')
            return
        }
        try {
            setError('')
            const data = {
                name,
                reference,
                supplier_id: supplierId,
                sale_price: parseCOP(salePrice),
                cost_price: parseCOP(costPrice),
                barcode: barcode || null,
                qr_code: qrCode || null,
                photo: photo || null
            }
            if (product) {
                await updateProduct(product.id, data)
            } else {
                await createProduct(data)
            }
            onSuccess()
            onClose()
        } catch (e) {
            setError('Ocurrió un error al guardar. Intenta de nuevo.')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
            <div className="bg-white p-6 rounded-lg w-[480px] shadow-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>

                <div className="relative mb-3">
                    <input type="text" placeholder="Buscar proveedor..."
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setSupplierId('') }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                    />
                    {open && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto shadow-lg">
                            {suppliers
                                .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
                                .map(s => (
                                    <li key={s.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                        onMouseDown={() => { setSupplierId(s.id); setSearch(s.name); setOpen(false) }}>
                                        {s.name}
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>

                <input type="text" placeholder="Nombre del producto *"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-3"
                    value={name} onChange={(e) => setName(e.target.value)} />

                <input type="text" placeholder="Referencia *"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-3"
                    value={reference} onChange={(e) => setReference(e.target.value)} />

                <div className="flex gap-3 mb-1">
                    <input type="text" placeholder="Precio de venta *"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={salePrice} onChange={(e) => setSalePrice(formatCOP(e.target.value))} />
                    <input type="text" placeholder="Precio de costo *"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={costPrice} onChange={(e) => setCostPrice(formatCOP(e.target.value))} />
                </div>

                {profitPercent !== null && (
                    <p className="text-green-600 text-sm font-semibold mb-3">
                        Ganancia: {profitPercent}%
                    </p>
                )}

                <input type="text" placeholder="Código de barras (opcional)"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-3"
                    value={barcode} onChange={(e) => setBarcode(e.target.value)} />

                <input type="text" placeholder="Código QR (opcional)"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-3"
                    value={qrCode} onChange={(e) => setQrCode(e.target.value)} />

                <input type="text" placeholder="URL de foto (opcional)"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-3"
                    value={photo} onChange={(e) => setPhoto(e.target.value)} />

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <div className="flex gap-3">
                    <button className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600" onClick={onClose}>Cancelar</button>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700" onClick={handleSave}>Guardar</button>
                </div>
            </div>
        </div>
    )
}

export default ProductModal
