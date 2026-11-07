import api from './api'

const getVariantsByProduct = async (productId) => {
    const response = await api.get(`/product-variants/${productId}`)
    return response.data
}

const createVariant = async (variantData) => {
    const response = await api.post('/product-variants/', variantData)
    return response.data
}

const updateVariant = async (variantId, variantData) => {
    const response = await api.put(`/product-variants/${variantId}`, variantData)
    return response.data
}

const deleteVariant = async (variantId) => {
    const response = await api.delete(`/product-variants/${variantId}`)
    return response.data
}

export { getVariantsByProduct, createVariant, updateVariant, deleteVariant }
