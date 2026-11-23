import { useState, useEffect } from 'react'
import {
    getSalesByTypeAndSize,
    getManualSalesByType,
    getSalesByType,
    getSalesBySupplier
} from '../services/metricsService'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts'

const TYPES = ['Todas', 'Blusas', 'Pantalones', 'Shorts', 'Vestidos', 'Conjuntos']
const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5']

const SectionChart = ({ title, data, labelKey, loading, emptyMsg, extraInfo }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3">
        <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-gray-700">{title}</p>
            {extraInfo && <span className="text-xs text-gray-400">{extraInfo}</span>}
        </div>
        {loading ? (
            <p className="text-gray-400 text-sm py-10 text-center">Cargando...</p>
        ) : data.length === 0 ? (
            <p className="text-gray-400 text-sm py-10 text-center">{emptyMsg}</p>
        ) : (
            <>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey={labelKey} tick={{ fontSize: 12, fill: '#374151' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                        <Tooltip
                            formatter={(v) => [`${v} uds`, 'Vendidas']}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #fed7aa', fontSize: 13 }}
                        />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <table className="w-full text-sm mt-3">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-2 text-gray-500 font-medium">{labelKey === 'type' ? 'Tipo' : labelKey === 'supplier' ? 'Marca' : 'Talla'}</th>
                            <th className="text-right py-2 text-gray-500 font-medium">Uds.</th>
                            <th className="text-right py-2 text-gray-500 font-medium">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => {
                            const total = data.reduce((s, r) => s + r.total, 0)
                            return (
                                <tr key={i} className="border-b border-gray-50 hover:bg-orange-50">
                                    <td className="py-2 font-medium">{row[labelKey]}</td>
                                    <td className="py-2 text-right font-bold text-orange-600">{row.total}</td>
                                    <td className="py-2 text-right text-gray-400">
                                        {total > 0 ? Math.round(row.total / total * 100) : 0}%
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </>
        )}
    </div>
)

const Metrics = () => {
    const today = new Date().toISOString().split('T')[0]
    const firstOfYear = `${new Date().getFullYear()}-01-01`

    const [selectedType, setSelectedType] = useState('Todas')
    const [dateFrom, setDateFrom] = useState(firstOfYear)
    const [dateTo, setDateTo] = useState(today)
    const [loading, setLoading] = useState(false)

    const [sizeData, setSizeData] = useState([])
    const [manualData, setManualData] = useState([])
    const [combinedData, setCombinedData] = useState([])
    const [supplierData, setSupplierData] = useState([])

    useEffect(() => {
        setLoading(true)
        const params = { dateFrom, dateTo }
        Promise.all([
            getSalesByTypeAndSize(params),
            getManualSalesByType(params),
            getSalesByType(params),
            getSalesBySupplier(params)
        ]).then(([size, manual, combined, supplier]) => {
            setSizeData(size)
            setManualData(manual)
            setCombinedData(combined)
            setSupplierData(supplier)
        }).finally(() => setLoading(false))
    }, [dateFrom, dateTo])

    // Gráfica 1: filtrar por tipo seleccionado y mapear para el chart
    const filteredSizeData = (selectedType === 'Todas'
        ? sizeData
        : sizeData.filter(r => r.type === selectedType)
    ).map(r => ({ ...r, label: r.size, total: r.total }))

    // Gráfica 2: ventas manuales por tipo, filtradas
    const filteredManualData = (selectedType === 'Todas'
        ? manualData
        : manualData.filter(r => r.type === selectedType)
    ).map(r => ({ ...r, label: r.type }))

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Métricas de ventas</h1>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <div className="flex flex-wrap gap-1">
                    {TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                                selectedType === type
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 items-center ml-auto">
                    <input
                        type="date" value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-400 text-sm">—</span>
                    <input
                        type="date" value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                </div>
            </div>

            {/* Gráfica 1 — Por tallas (inventario) */}
            <SectionChart
                title={selectedType === 'Todas' ? 'Tallas más vendidas — inventario' : `Tallas vendidas — ${selectedType}`}
                data={filteredSizeData.map(r => ({ ...r, label: r.size }))}
                labelKey="label"
                loading={loading}
                emptyMsg="Sin ventas de inventario en este período."
                extraInfo="Solo productos con variante"
            />

            {/* Gráfica 2 — Ventas manuales por tipo */}
            <SectionChart
                title="Ventas manuales por tipo de prenda"
                data={filteredManualData}
                labelKey="label"
                loading={loading}
                emptyMsg="Sin ventas manuales clasificadas en este período."
                extraInfo="Clasificadas por descripción"
            />

            {/* Gráfica 3 — Por tipo total */}
            <SectionChart
                title="Total por tipo de prenda (inventario + manuales)"
                data={combinedData.map(r => ({ ...r, label: r.type }))}
                labelKey="label"
                loading={loading}
                emptyMsg="Sin datos en este período."
            />

            {/* Gráfica 4 — Por marca */}
            <SectionChart
                title="Ventas por marca"
                data={supplierData.map(r => ({ ...r, label: r.supplier }))}
                labelKey="label"
                loading={loading}
                emptyMsg="Sin datos de marca en este período."
                extraInfo="Inventario por proveedor + manuales por categoría"
            />
        </div>
    )
}

export default Metrics
