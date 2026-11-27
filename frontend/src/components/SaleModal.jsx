import { useState, useEffect } from 'react'
import { createSale } from '../services/saleService'
import getCategories from '../services/categoryService'
import getPaymentMethods from '../services/paymentMethodService'
import { getProducts } from '../services/productService'
import { getVariantsByProduct } from '../services/productVariantsService'
import { searchCustomers, createCustomer } from '../services/customerService'

const SaleModal = ({ onClose, onSuccess }) => {
    const [categories, setCategories] = useState([])
    const [paymentMethodId, setPaymentMethodId] = useState('')
    const [paymentMethods, setPaymentMethods] = useState([])
    const [pmSearch, setPmSearch] = useState('')
    const [pmOpen, setPmOpen] = useState(false)
    const [error, setError] = useState('')

    const [items, setItems] = useState([])
    const [products, setProducts] = useState([])
    const [productSearch, setProductSearch] = useState('')
    const [productOpen, setProductOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [variants, setVariants] = useState([])
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [quantity, setQuantity] = useState('')

    const [discount, setDiscount] = useState('')
    const [discountType, setDiscountType] = useState('percent')
    const [recibido, setRecibido] = useState('')

    const [isCredit, setIsCredit] = useState(false)
    const [customerSearch, setCustomerSearch] = useState('')
    const [customerOpen, setCustomerOpen] = useState(false)
    const [customerId, setCustomerId] = useState(null)
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [customerResults, setCustomerResults] = useState([])
    const [initialPayment, setInitialPayment] = useState('')

    const [manualSupplierSearch, setManualSupplierSearch] = useState('')
    const [manualSupplierOpen, setManualSupplierOpen] = useState(false)
    const [manualSupplierName, setManualSupplierName] = useState('')
    const [manualCategoryId, setManualCategoryId] = useState(null)
    const [manualClothingType, setManualClothingType] = useState('')
    const [manualPrice, setManualPrice] = useState('')
    const [manualQty, setManualQty] = useState('')
    const [manualSize, setManualSize] = useState('')

    useEffect(() => {
        getCategories('sale').then(setCategories)
        getPaymentMethods().then(setPaymentMethods)
        getProducts().then(setProducts)
    }, [])

    useEffect(() => {
        if (customerSearch.length < 2) { setCustomerResults([]); return }
        searchCustomers(customerSearch).then(setCustomerResults)
    }, [customerSearch])

    const formatCOP = (value) => {
        const num = value.replace(/\D/g, '')
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    const parseCOP = (value) => parseFloat(value.replace(/\./g, '')) || 0

    const handleSelectProduct = async (product) => {
        setSelectedProduct(product)
        setProductSearch(product.name)
        setProductOpen(false)
        setSelectedVariant(null)
        setQuantity('')
        const data = await getVariantsByProduct(product.id)
        setVariants(data)
    }

    const handleAddItem = () => {
        if (!selectedVariant || !quantity || parseInt(quantity) <= 0) return
        const existing = items.find(i => i.variant_id === selectedVariant.id)
        if (existing) {
            setItems(items.map(i => i.variant_id === selectedVariant.id
                ? { ...i, quantity: i.quantity + parseInt(quantity) }
                : i
            ))
        } else {
            setItems([...items, {
                key: `inv-${selectedVariant.id}`,
                variant_id: selectedVariant.id,
                supplier: selectedProduct.supplier_name || '—',
                size: selectedVariant.size,
                color: selectedVariant.color,
                quantity: parseInt(quantity),
                unit_price: Number(selectedProduct.sale_price)
            }])
        }
        setSelectedVariant(null)
        setQuantity('')
        setProductSearch('')
        setSelectedProduct(null)
        setVariants([])
    }

    const handleAddManual = () => {
        if (!manualCategoryId || !manualClothingType || !manualSize || !manualPrice || !manualQty) return
        setItems([...items, {
            key: `manual-${Date.now()}`,
            variant_id: null,
            category_id: manualCategoryId,
            supplier: manualSupplierName || '—',
            size: manualSize,
            description: manualClothingType,
            quantity: parseInt(manualQty),
            unit_price: parseCOP(manualPrice)
        }])
        setManualCategoryId(null)
        setManualSupplierSearch('')
        setManualSupplierName('')
        setManualClothingType('')
        setManualSize('')
        setManualPrice('')
        setManualQty('')
    }

    const handleRemoveItem = (key) => {
        setItems(items.filter(i => i.key !== key))
    }

    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
    const discountAmt = discountType === 'percent'
        ? subtotal * (parseFloat(discount) || 0) / 100
        : parseCOP(discount)
    const total = subtotal - discountAmt

    const handleSave = async () => {
        if (items.length === 0) { setError('Agrega al menos un producto.'); return }
        if (!isCredit && total > 0 && parseCOP(recibido) < total) { setError('El valor recibido no cubre el total.'); return }
        if (!paymentMethodId) { setError('Debes seleccionar una forma de pago.'); return }
        if (isCredit && !customerName.trim()) { setError('Ingresa el nombre del cliente para el separado.'); return }
        try {
            setError('')
            let resolvedCustomerId = customerId
            if (isCredit && !customerId && customerName.trim()) {
                const newCustomer = await createCustomer({ name: customerName.trim(), phone: customerPhone.trim() || null })
                resolvedCustomerId = newCustomer.id
            }
            await createSale({
                items: items.map(i => ({
                    product_variant_id: i.variant_id,
                    quantity: i.quantity,
                    unit_price: i.unit_price
                })),
                description: items.find(i => i.variant_id === null)?.description ?? null,
                discount: discountType === 'percent'
                                ? parseFloat(discount) || 0
                                : (subtotal > 0 ? (parseCOP(discount) / subtotal) * 100 : 0),
                category_id: items.find(i => i.variant_id === null && i.category_id)?.category_id ?? null,
                payment_method_id: paymentMethodId,
                is_credit: isCredit,
                customer_id: resolvedCustomerId || null,
                initial_payment: isCredit && initialPayment ? parseCOP(initialPayment) : null
            })
            onSuccess()
            onClose()
        } catch (e) {
            setError('Ocurrió un error al guardar. Intenta de nuevo.')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
            <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto shadow-lg">
                <h1 className="text-xl font-bold mb-4">Nueva Venta</h1>

                {/* Buscador de producto del inventario */}
                <div className="relative mb-3">
                    <input type="text" placeholder="Buscar producto del inventario..."
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={productSearch}
                        onChange={(e) => { setProductSearch(e.target.value); setSelectedProduct(null) }}
                        onFocus={() => setProductOpen(true)}
                        onBlur={() => setTimeout(() => setProductOpen(false), 150)}
                    />
                    {productOpen && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto shadow-lg">
                            {products
                                .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.reference.toLowerCase().includes(productSearch.toLowerCase()) || (p.supplier_name && p.supplier_name.toLowerCase().includes(productSearch.toLowerCase())))
                                .map(p => (
                                    <li key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                        onMouseDown={() => handleSelectProduct(p)}>
                                        {p.photo
                                            ? <img src={p.photo} className="w-10 h-10 object-cover rounded" />
                                            : <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                                        }
                                        <div>
                                            <p className="font-medium text-sm">{p.name}</p>
                                            <p className="text-xs text-gray-500">Ref: {p.reference} — ${Number(p.sale_price).toLocaleString('es-CO')}</p>
                                            {p.supplier_name && <p className="text-xs text-gray-400">{p.supplier_name}</p>}
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>

                {/* Selector de variante */}
                {variants.length > 0 && (
                    <div className="flex gap-3 mb-3">
                        <select className="w-full border border-gray-300 rounded-lg p-2"
                            value={selectedVariant?.id || ''}
                            onChange={(e) => setSelectedVariant(variants.find(v => v.id === parseInt(e.target.value)))}>
                            <option value="">Talla / Color</option>
                            {variants.map(v => (
                                <option key={v.id} value={v.id}>{v.size} — {v.color} ({v.quantity} disponibles)</option>
                            ))}
                        </select>
                        <input type="number" placeholder="Cant." min="1"
                            className="w-24 border border-gray-300 rounded-lg p-2"
                            value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
                            onClick={handleAddItem}>+</button>
                    </div>
                )}

                {/* Agregar manual */}
                <p className="text-xs text-gray-400 text-center my-3">— o agregar manualmente —</p>
                <div className="flex gap-2 mb-3">
                    <select
                        className={`flex-1 border rounded-lg p-2 text-sm text-gray-700 ${manualClothingType ? 'border-gray-300' : 'border-orange-300'}`}
                        value={manualClothingType}
                        onChange={(e) => setManualClothingType(e.target.value)}
                    >
                        <option value="">Tipo de prenda *</option>
                        <option value="Blusa">Blusa</option>
                        <option value="Pantalón">Pantalón</option>
                        <option value="Jeans">Jeans</option>
                        <option value="Capri">Capri</option>
                        <option value="Short">Short</option>
                        <option value="Falda">Falda</option>
                        <option value="Vestido">Vestido</option>
                        <option value="Conjunto">Conjunto</option>
                        <option value="Torero">Torero</option>
                        <option value="Chaqueta">Chaqueta</option>
                        <option value="Cinturón">Cinturón</option>
                    </select>
                </div>
                <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                        <input type="text" placeholder="Proveedor *"
                            className={`w-full border rounded-lg p-2 text-sm ${manualCategoryId ? 'border-gray-300' : 'border-orange-300'}`}
                            value={manualSupplierSearch}
                            onChange={(e) => { setManualSupplierSearch(e.target.value); setManualSupplierName(''); setManualCategoryId(null) }}
                            onFocus={() => setManualSupplierOpen(true)}
                            onBlur={() => setTimeout(() => setManualSupplierOpen(false), 150)}
                        />
                        {manualSupplierOpen && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                                {categories
                                    .filter(c => c.name.toLowerCase().includes(manualSupplierSearch.toLowerCase()))
                                    .map(c => (
                                        <li key={c.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                            onMouseDown={() => { setManualCategoryId(c.id); setManualSupplierName(c.name); setManualSupplierSearch(c.name); setManualSupplierOpen(false) }}>
                                            {c.name}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 mb-4">
                    <input placeholder="Talla *"
                        className={`w-20 border rounded-lg p-2 text-sm ${manualSize ? 'border-gray-300' : 'border-orange-300'}`}
                        value={manualSize} onChange={(e) => setManualSize(e.target.value)} />
                    <input placeholder="Precio *" className={`flex-1 border rounded-lg p-2 text-sm ${manualPrice ? 'border-gray-300' : 'border-orange-300'}`}
                        value={manualPrice} onChange={(e) => setManualPrice(formatCOP(e.target.value))} />
                    <input type="number" placeholder="Cant. *" min="1" className={`w-20 border rounded-lg p-2 text-sm ${manualQty ? 'border-gray-300' : 'border-orange-300'}`}
                        value={manualQty} onChange={(e) => setManualQty(e.target.value)} />
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700"
                        onClick={handleAddManual}>+</button>
                </div>

                {/* Carrito */}
                {items.length > 0 && (
                    <div className="mb-4">
                        <table className="w-full text-sm mb-2">
                            <thead>
                                <tr className="text-gray-500 border-b">
                                    <th className="text-left py-1 pr-2">Proveedor</th>
                                    <th className="text-left py-1 pr-2">Talla</th>
                                    <th className="text-left py-1 pr-2">Descripción</th>
                                    <th className="text-left py-1 pr-2">Cant.</th>
                                    <th className="text-left py-1 pr-2">Subtotal</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(i => (
                                    <tr key={i.key} className="border-b border-gray-100">
                                        <td className="py-1 pr-2 text-xs">{i.supplier}</td>
                                        <td className="py-1 pr-2">{i.size}</td>
                                        <td className="py-1 pr-2">{i.color}</td>
                                        <td className="py-1 pr-2">{i.quantity}</td>
                                        <td className="py-1 pr-2">${Number(i.quantity * i.unit_price).toLocaleString('es-CO')}</td>
                                        <td className="py-1"><button className="text-red-500 hover:underline text-xs" onClick={() => handleRemoveItem(i.key)}>Quitar</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-right text-sm text-gray-500">{items.reduce((sum, i) => sum + i.quantity, 0)} unidades</p>
                        <p className="text-right text-sm text-gray-500">Subtotal: ${subtotal.toLocaleString('es-CO')}</p>
                        {discountAmt > 0 && (
                            <p className="text-right text-sm text-red-500">
                                Descuento {discountType === 'percent' ? `${discount}%` : `$${discountAmt.toLocaleString('es-CO')}`}: −${discountAmt.toLocaleString('es-CO')}
                            </p>
                        )}
                        <p className="text-right font-bold">Total: ${total.toLocaleString('es-CO')}</p>
                        <div className="flex items-center justify-end gap-3 mt-2">
                            <span className="text-sm text-gray-500">Recibido:</span>
                            <input
                                placeholder="$0"
                                className="w-32 border border-gray-300 rounded-lg p-2 text-sm text-right"
                                value={recibido}
                                onChange={(e) => setRecibido(formatCOP(e.target.value))}
                            />
                            {total > 0 && parseCOP(recibido) > 0 && (
                                parseCOP(recibido) >= total
                                    ? <span className="text-sm font-bold text-green-600">
                                        Vuelto: ${(parseCOP(recibido) - total).toLocaleString('es-CO')}
                                      </span>
                                    : <span className="text-sm font-bold text-red-500">
                                        Falta: ${(total - parseCOP(recibido)).toLocaleString('es-CO')}
                                      </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Descuento */}
                <div className="flex items-center gap-2 mb-3">
                    <button
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold hover:bg-gray-100"
                        onClick={() => { setDiscountType(t => t === 'percent' ? 'value' : 'percent'); setDiscount('') }}>
                        {discountType === 'percent' ? '%' : '$'}
                    </button>
                    <input
                        placeholder={discountType === 'percent' ? 'Descuento %' : 'Valor descuento'}
                        className="w-36 border border-gray-300 rounded-lg p-2 text-sm"
                        value={discount}
                        onChange={(e) => setDiscount(discountType === 'percent' ? e.target.value : formatCOP(e.target.value))} />
                    <span className="text-sm text-gray-400">
                        {discountType === 'percent' ? 'sobre el total' : 'valor fijo'}
                    </span>
                </div>

                {/* Forma de pago */}
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

                {/* Toggle crédito / separado */}
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => setIsCredit(false)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${!isCredit ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-300 hover:border-green-400'}`}>
                        Pago completo
                    </button>
                    <button
                        onClick={() => setIsCredit(true)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${isCredit ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-300 hover:border-orange-400'}`}>
                        Separado / Crédito
                    </button>
                </div>

                {/* Datos del cliente (solo si es crédito) */}
                {isCredit && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-orange-700 mb-2">Datos del cliente</p>
                        <div className="relative mb-2">
                            <input type="text" placeholder="Nombre del cliente *"
                                className={`w-full border rounded-lg p-2 text-sm ${customerName ? 'border-gray-300' : 'border-orange-300'}`}
                                value={customerSearch}
                                onChange={(e) => { setCustomerSearch(e.target.value); setCustomerName(e.target.value); setCustomerId(null) }}
                                onFocus={() => setCustomerOpen(true)}
                                onBlur={() => setTimeout(() => setCustomerOpen(false), 150)}
                            />
                            {customerOpen && customerResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-36 overflow-y-auto shadow-lg">
                                    {customerResults.map(c => (
                                        <li key={c.id} className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                                            onMouseDown={() => {
                                                setCustomerId(c.id)
                                                setCustomerName(c.name)
                                                setCustomerPhone(c.phone || '')
                                                setCustomerSearch(c.name)
                                                setCustomerOpen(false)
                                            }}>
                                            <span className="font-medium">{c.name}</span>
                                            {c.phone && <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <input type="tel" placeholder="Teléfono"
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-2"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                        <input placeholder="Abono inicial (opcional)"
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            value={initialPayment}
                            onChange={(e) => setInitialPayment(formatCOP(e.target.value))}
                        />
                        {initialPayment && (
                            <p className="text-xs text-orange-600 mt-1">
                                Saldo pendiente: ${(total - parseCOP(initialPayment)).toLocaleString('es-CO')}
                            </p>
                        )}
                    </div>
                )}

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <div className="flex gap-3">
                    <button className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600" onClick={onClose}>Cancelar</button>
                    <button
                        className={`flex-1 text-white px-6 py-3 rounded-lg font-bold ${isCredit ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}
                        onClick={handleSave}>
                        {isCredit ? 'Registrar separado' : 'Confirmar venta'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SaleModal
