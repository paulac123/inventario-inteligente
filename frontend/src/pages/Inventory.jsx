import { useState, useEffect } from 'react'
import { Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { getProducts, deleteProduct } from '../services/productService'
import { getVariantsByProduct, deleteVariant } from '../services/productVariantsService'
import api from '../services/api'
import ProductModal from '../components/ProductModal'
import VariantModal from '../components/VariantModal'

const Inventory = () => {
    const [products, setProducts] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editProduct, setEditProduct] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [editVariant, setEditVariant] = useState(null)
    const [expandedId, setExpandedId] = useState(null)
    const [variants, setVariants] = useState({})
    const [successMsg, setSuccessMsg] = useState('')
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [sizeSummary, setSizeSummary] = useState([])
    const [typeSummary, setTypeSummary] = useState([])

    useEffect(() => {
        getProducts().then(setProducts)
    }, [])

    useEffect(() => {
        const supplierId = selectedCategory
            ? products.find(p => p.supplier_name === selectedCategory)?.supplier_id
            : null
        const params = supplierId ? { supplier_id: supplierId } : {}
        api.get('/product-variants/summary', { params }).then(r => setSizeSummary(r.data))
        api.get('/product-variants/summary-by-type', { params }).then(r => setTypeSummary(r.data))
    }, [selectedCategory, products])

    const handleSuccess = () => {
        getProducts().then(setProducts)
        setSuccessMsg('¡Producto guardado!')
        setTimeout(() => setSuccessMsg(''), 3000)
    }

    const toggleExpand = async (productId) => {
        if (expandedId === productId) {
            setExpandedId(null)
            return
        }
        setExpandedId(productId)
        if (!variants[productId]) {
            const data = await getVariantsByProduct(productId)
            setVariants(prev => ({ ...prev, [productId]: data }))
        }
    }

    const refreshVariants = async (productId) => {
        const data = await getVariantsByProduct(productId)
        setVariants(prev => ({ ...prev, [productId]: data }))
        getProducts().then(setProducts)
    }

    const handleDeleteVariant = async (variantId, productId) => {
        await deleteVariant(variantId)
        refreshVariants(productId)
        setSuccessMsg('¡Variante eliminada!')
        setTimeout(() => setSuccessMsg(''), 3000)
    }

    const categories = [...new Set(products.map(p => p.supplier_name).filter(Boolean))]

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            p.reference.toLowerCase().includes(search.toLowerCase())
        const matchCategory = !selectedCategory || p.supplier_name === selectedCategory
        return matchSearch && matchCategory
    })

    const totalUnits = filteredProducts.reduce((sum, p) => sum + p.total_quantity, 0)

    const totalsByCategory = categories.map(cat => ({
        name: cat,
        total: filteredProducts
            .filter(p => p.supplier_name === cat)
            .reduce((sum, p) => sum + p.total_quantity, 0)
    }))

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Inventario</h1>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700" onClick={() => setShowModal(true)}>
                    Nuevo Producto
                </button>
            </div>

            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o referencia..."
                    className="border border-gray-300 rounded-lg p-2 w-72"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="border border-gray-300 rounded-lg p-2"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-orange-50 border border-orange-200 text-orange-700 rounded-full px-3 py-1 text-xs font-semibold">
                    Total: {totalUnits} uds
                </span>
                <span className="bg-orange-50 border border-orange-200 text-orange-700 rounded-full px-3 py-1 text-xs font-semibold">
                    Costo: ${filteredProducts.reduce((sum, p) => sum + p.cost_price * p.total_quantity, 0).toLocaleString('es-CO')}
                </span>
                <span className="bg-orange-50 border border-orange-200 text-orange-700 rounded-full px-3 py-1 text-xs font-semibold">
                    Venta: ${filteredProducts.reduce((sum, p) => sum + p.sale_price * p.total_quantity, 0).toLocaleString('es-CO')}
                </span>
                {totalsByCategory.map(cat => (
                    <span key={cat.name} className="bg-orange-50 border border-orange-200 text-orange-700 rounded-full px-3 py-1 text-xs font-semibold">
                        {cat.name}: {cat.total} uds
                    </span>
                ))}
            </div>

            {sizeSummary.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {sizeSummary.map(s => (
                        <div key={s.size} className="bg-orange-50 border border-orange-200 rounded px-2 py-1 flex flex-col items-center min-w-[36px]">
                            <span className="font-bold text-sm text-orange-600 leading-tight">{s.size}</span>
                            <span className="text-xs text-gray-500 leading-tight">{s.total} uds</span>
                        </div>
                    ))}
                </div>
            )}

            {typeSummary.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {Object.entries(
                        typeSummary.reduce((acc, row) => {
                            if (!acc[row.type]) acc[row.type] = []
                            acc[row.type].push(row)
                            return acc
                        }, {})
                    ).map(([type, rows]) => (
                        <div key={type} className="bg-white border border-gray-200 border-l-4 border-l-orange-500 rounded px-3 py-2 min-w-[150px]">
                            <div className="font-semibold text-sm text-gray-800 mb-2">{type}</div>
                            <div className="flex flex-wrap gap-1">
                                {rows.map(r => (
                                    <div key={r.size} className="bg-orange-50 border border-orange-200 rounded px-2 py-1 flex flex-col items-center min-w-[36px]">
                                        <span className="font-bold text-sm text-orange-600 leading-tight">{r.size}</span>
                                        <span className="text-xs text-gray-500 leading-tight">{r.total} uds</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[860px]">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="text-left p-2 border w-16">Foto</th>
                            <th className="text-left p-2 border">Nombre</th>
                            <th className="text-left p-2 border">Referencia</th>
                            <th className="text-left p-2 border">Proveedor</th>
                            <th className="text-left p-2 border">Tipo</th>
                            <th className="text-left p-2 border">Precio venta</th>
                            <th className="text-left p-2 border">Costo</th>
                            <th className="text-left p-2 border w-16 text-center">Uds</th>
                            <th className="text-left p-2 border w-28">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <>
                                <tr key={product.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(product.id)}>
                                    <td className="p-2 border">
                                        {product.photo
                                            ? <img src={product.photo} className="w-10 h-10 object-cover rounded" />
                                            : <span className="text-gray-400 text-xs">Sin foto</span>
                                        }
                                    </td>
                                    <td className="p-2 border font-medium text-sm">
                                        <span className="mr-1 text-gray-400 text-xs">{expandedId === product.id ? '▼' : '▶'}</span>
                                        {product.name}
                                    </td>
                                    <td className="p-2 border text-sm">{product.reference}</td>
                                    <td className="p-2 border text-sm">{product.supplier_name || '—'}</td>
                                    <td className="p-2 border">
                                        {product.clothing_type
                                            ? <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">{product.clothing_type}</span>
                                            : <span className="text-xs text-red-400">Sin tipo</span>
                                        }
                                    </td>
                                    <td className="p-2 border text-sm">${Number(product.sale_price).toLocaleString('es-CO')}</td>
                                    <td className="p-2 border text-sm">${Number(product.cost_price).toLocaleString('es-CO')}</td>
                                    <td className="p-2 border text-sm text-center">{product.total_quantity}</td>
                                    <td className="p-2 border" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex gap-1 items-center">
                                            <button title="Editar producto" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => setEditProduct(product)}>
                                                <Pencil size={13} />
                                            </button>
                                            <button title="Agregar variante" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-green-600 hover:bg-green-50 hover:border-green-200 transition-colors" onClick={() => setSelectedProduct(product)}>
                                                <PlusCircle size={13} />
                                            </button>
                                            <button title="Eliminar producto" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors" onClick={() => deleteProduct(product.id).then(() => { getProducts().then(setProducts); setSuccessMsg('¡Producto eliminado!'); setTimeout(() => setSuccessMsg(''), 3000) })}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === product.id && (
                                    <tr key={`variants-${product.id}`}>
                                        <td colSpan={9} className="bg-gray-50 px-8 py-3 border">
                                            {variants[product.id]?.length > 0 ? (
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-gray-500">
                                                            <th className="text-left py-1 pr-6">Talla</th>
                                                            <th className="text-left py-1 pr-6">Color</th>
                                                            <th className="text-left py-1 pr-6">Cantidad</th>
                                                            <th className="text-left py-1 pr-6">Stock mín.</th>
                                                            <th className="text-left py-1 pr-6">Stock máx.</th>
                                                            <th className="text-left py-1"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {variants[product.id].map(v => (
                                                            <tr key={v.id} className="border-t border-gray-200">
                                                                <td className="py-2 pr-6">{v.size}</td>
                                                                <td className="py-2 pr-6">{v.color}</td>
                                                                <td className="py-2 pr-6">{v.quantity}</td>
                                                                <td className="py-2 pr-6">{v.min_stock ?? '—'}</td>
                                                                <td className="py-2 pr-6">{v.max_stock ?? '—'}</td>
                                                                <td className="py-2">
                                                                    <button className="text-blue-600 hover:underline mr-3" onClick={() => setEditVariant({ ...v, productId: product.id, productName: product.name })}>Editar</button>
                                                                    <button className="text-red-500 hover:underline" onClick={() => handleDeleteVariant(v.id, product.id)}>Eliminar</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-gray-400 text-sm">Sin variantes registradas.</p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && <ProductModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
            {editProduct && <ProductModal product={editProduct} onClose={() => setEditProduct(null)} onSuccess={() => { handleSuccess(); setEditProduct(null) }} />}
            {selectedProduct && <VariantModal
                productId={selectedProduct.id}
                productName={selectedProduct.name}
                onClose={() => setSelectedProduct(null)}
                onSuccess={() => { refreshVariants(selectedProduct.id); setSelectedProduct(null); setSuccessMsg('¡Variante guardada!'); setTimeout(() => setSuccessMsg(''), 3000) }}
            />}
            {editVariant && <VariantModal
                productId={editVariant.productId}
                productName={editVariant.productName}
                variant={editVariant}
                onClose={() => setEditVariant(null)}
                onSuccess={() => { refreshVariants(editVariant.productId); setEditVariant(null); setSuccessMsg('¡Variante actualizada!'); setTimeout(() => setSuccessMsg(''), 3000) }}
            />}
            {successMsg && (
                <p className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 text-green-600 font-bold text-3xl">
                    {successMsg}
                </p>
            )}
        </div>
    )
}

export default Inventory
