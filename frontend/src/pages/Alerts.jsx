import { useState, useEffect } from 'react'
import { getAllStatus, createAlertConfig, deleteAlertConfig } from '../services/alertService'

const CLOTHING_TYPES = ['Blusa', 'Pantalón', 'Jeans', 'Capri', 'Short', 'Falda', 'Vestido', 'Conjunto', 'Torero', 'Chaqueta', 'Cinturón']

const Alerts = () => {
    const [allStatus, setAllStatus] = useState([])
    const [loading, setLoading] = useState(true)
    const [successMsg, setSuccessMsg] = useState('')

    const [clothingType, setClothingType] = useState('')
    const [size, setSize] = useState('')
    const [minModels, setMinModels] = useState('')
    const [minUnits, setMinUnits] = useState('')
    const [formError, setFormError] = useState('')

    const load = async () => {
        setLoading(true)
        const status = await getAllStatus()
        setAllStatus(status)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const activeAlerts = allStatus.filter(s => s.is_alert)

    const handleCreate = async () => {
        setFormError('')
        if (!clothingType) { setFormError('Selecciona el tipo de prenda.'); return }
        if (!size.trim()) { setFormError('Ingresa una talla.'); return }
        if (!minModels && !minUnits) { setFormError('Ingresa al menos un mínimo (modelos o unidades).'); return }
        if (minModels && parseInt(minModels) <= 0) { setFormError('El mínimo de modelos debe ser mayor a 0.'); return }
        if (minUnits && parseInt(minUnits) <= 0) { setFormError('El mínimo de unidades debe ser mayor a 0.'); return }

        try {
            await createAlertConfig({
                clothing_type: clothingType,
                size: size.trim(),
                min_models: minModels ? parseInt(minModels) : null,
                min_units: minUnits ? parseInt(minUnits) : null,
            })
            setClothingType('')
            setSize('')
            setMinModels('')
            setMinUnits('')
            setSuccessMsg('Regla creada')
            setTimeout(() => setSuccessMsg(''), 2500)
            load()
        } catch {
            setFormError('Error al crear la regla.')
        }
    }

    const handleDelete = async (id) => {
        await deleteAlertConfig(id)
        load()
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Alertas de stock</h1>

            {/* Estado actual — solo alertas activas */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Estado actual</h2>
                {loading ? (
                    <p className="text-gray-400">Cargando...</p>
                ) : activeAlerts.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-green-700 font-medium">
                        ✓ Todo el stock está por encima de los mínimos configurados
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {activeAlerts.map(alert => (
                            <div key={alert.id}
                                className={`rounded-xl px-5 py-4 border ${alert.is_critical ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'}`}>
                                <p className={`font-bold text-sm mb-3 ${alert.is_critical ? 'text-red-700' : 'text-orange-700'}`}>
                                    {alert.is_critical ? '🔴' : '⚠️'} {alert.clothing_type} — Talla {alert.size}
                                </p>
                                <div className="flex gap-4 flex-wrap">
                                    {alert.min_models != null && (
                                        <div className={`rounded-lg px-4 py-2 text-center min-w-[100px] ${!alert.models_ok ? 'bg-red-100' : 'bg-green-100'}`}>
                                            <p className="text-xs text-gray-500 mb-0.5">Modelos</p>
                                            <p className={`text-2xl font-bold ${!alert.models_ok ? 'text-red-600' : 'text-green-600'}`}>
                                                {alert.current_models}
                                            </p>
                                            <p className="text-xs text-gray-400">mín. {alert.min_models}</p>
                                        </div>
                                    )}
                                    {alert.min_units != null && (
                                        <div className={`rounded-lg px-4 py-2 text-center min-w-[100px] ${!alert.units_ok ? 'bg-red-100' : 'bg-green-100'}`}>
                                            <p className="text-xs text-gray-500 mb-0.5">Unidades</p>
                                            <p className={`text-2xl font-bold ${!alert.units_ok ? 'text-red-600' : 'text-green-600'}`}>
                                                {alert.current_units}
                                            </p>
                                            <p className="text-xs text-gray-400">mín. {alert.min_units}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Agregar nueva regla */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Agregar regla</h2>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-xs text-gray-400 mb-4">
                        Define el tipo de prenda, la talla y los mínimos. Puedes dejar en blanco el campo que no quieras controlar.
                    </p>
                    <div className="flex gap-3 flex-wrap items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Tipo de prenda *</label>
                            <select
                                className="border border-gray-300 rounded-lg p-2 text-sm"
                                value={clothingType}
                                onChange={(e) => setClothingType(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {CLOTHING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Talla *</label>
                            <input
                                placeholder="ej: 16, S, 36"
                                className="border border-gray-300 rounded-lg p-2 text-sm w-24"
                                value={size}
                                onChange={(e) => setSize(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Mín. modelos</label>
                            <input
                                type="number" min="1" placeholder="ej: 4"
                                className="border border-gray-300 rounded-lg p-2 text-sm w-28"
                                value={minModels}
                                onChange={(e) => setMinModels(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Mín. unidades</label>
                            <input
                                type="number" min="1" placeholder="ej: 12"
                                className="border border-gray-300 rounded-lg p-2 text-sm w-28"
                                value={minUnits}
                                onChange={(e) => setMinUnits(e.target.value)} />
                        </div>
                        <button
                            onClick={handleCreate}
                            className="bg-orange-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-orange-600 text-sm">
                            Agregar
                        </button>
                    </div>
                    {formError && <p className="text-red-500 text-xs mt-3">{formError}</p>}
                    {successMsg && <p className="text-green-600 text-xs mt-3">{successMsg}</p>}
                </div>
            </section>

            {/* Lista de configuraciones con valores actuales siempre visibles */}
            <section>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Reglas configuradas</h2>
                {allStatus.length === 0 ? (
                    <p className="text-gray-400 text-sm">No hay reglas configuradas aún.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {allStatus.map(cfg => (
                            <div key={cfg.id}
                                className={`bg-white border rounded-xl px-5 py-3 flex items-center justify-between gap-4 ${cfg.is_alert ? (cfg.is_critical ? 'border-red-200' : 'border-orange-200') : 'border-gray-200'}`}>
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-800 mb-1">
                                        {cfg.clothing_type} — Talla {cfg.size}
                                    </p>
                                    <div className="flex gap-4 flex-wrap">
                                        {cfg.min_models != null && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-gray-400">Modelos:</span>
                                                <span className={`text-sm font-bold ${!cfg.models_ok ? 'text-red-500' : 'text-green-600'}`}>
                                                    {cfg.current_models}
                                                </span>
                                                <span className="text-xs text-gray-300">/ mín. {cfg.min_models}</span>
                                            </div>
                                        )}
                                        {cfg.min_units != null && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-gray-400">Unidades:</span>
                                                <span className={`text-sm font-bold ${!cfg.units_ok ? 'text-red-500' : 'text-green-600'}`}>
                                                    {cfg.current_units}
                                                </span>
                                                <span className="text-xs text-gray-300">/ mín. {cfg.min_units}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(cfg.id)}
                                    className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors shrink-0">
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default Alerts
