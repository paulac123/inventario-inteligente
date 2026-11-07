import { useState, useEffect } from 'react'
import { getProducts, deleteProduct } from '../services/productService'
import { getVariantsByProduct, deleteVariant } from '../services/productVariantsService'
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

    useEffect(() => {
        getProducts().then(setProducts)
    }, [])

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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Inventario</h1>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700" onClick={() => setShowModal(true)}>
                    Nuevo Producto
                </button>
            </div>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="text-left p-3 border">Foto</th>
                        <th className="text-left p-3 border">Nombre</th>
                        <th className="text-left p-3 border">Referencia</th>
                        <th className="text-left p-3 border">Proveedor</th>
                        <th className="text-left p-3 border">Precio venta</th>
                        <th className="text-left p-3 border">Costo</th>
                        <th className="text-left p-3 border">Unidades</th>
                        <th className="text-left p-3 border">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <>
                            <tr key={product.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(product.id)}>
                                <td className="p-3 border">
                                    {product.photo
                                        ? <img src={product.photo} className="w-12 h-12 object-cover rounded" />
                                        : <span className="text-gray-400 text-sm">Sin foto</span>
                                    }
                                </td>
                                <td className="p-3 border font-medium">
                                    <span className="mr-2 text-gray-400 text-xs">{expandedId === product.id ? '▼' : '▶'}</span>
                                    {product.name}
                                </td>
                                <td className="p-3 border">{product.reference}</td>
                                <td className="p-3 border">{product.supplier_name || '—'}</td>
                                <td className="p-3 border">${Number(product.sale_price).toLocaleString('es-CO')}</td>
                                <td className="p-3 border">${Number(product.cost_price).toLocaleString('es-CO')}</td>
                                <td className="p-3 border">{product.total_quantity}</td>
                                <td className="p-3 border" onClick={(e) => e.stopPropagation()}>
                                    <button className="text-blue-600 hover:underline text-sm mr-3" onClick={() => setEditProduct(product)}>Editar</button>
                                    <button className="text-blue-600 hover:underline text-sm mr-3" onClick={() => setSelectedProduct(product)}>+ Variante</button>
                                    <button className="text-red-500 hover:underline text-sm" onClick={() => deleteProduct(product.id).then(() => { getProducts().then(setProducts); setSuccessMsg('¡Producto eliminado!'); setTimeout(() => setSuccessMsg(''), 3000) })}>Eliminar</button>
                                </td>
                            </tr>
                            {expandedId === product.id && (
                                <tr key={`variants-${product.id}`}>
                                    <td colSpan={7} className="bg-gray-50 px-8 py-3 border">
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
