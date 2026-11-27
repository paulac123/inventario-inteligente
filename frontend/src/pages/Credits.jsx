import { useState, useEffect } from 'react'
import { getCreditSales, getSalePayments, addPayment } from '../services/salePaymentService'
import getPaymentMethods from '../services/paymentMethodService'

const PaymentModal = ({ sale, paymentMethods, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('')
    const [pmId, setPmId] = useState('')
    const [pmSearch, setPmSearch] = useState('')
    const [pmOpen, setPmOpen] = useState(false)
    const [notes, setNotes] = useState('')
    const [error, setError] = useState('')

    const formatCOP = (v) => v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const parseCOP = (v) => parseFloat(v.replace(/\./g, '')) || 0

    const handleSave = async () => {
        if (!amount || parseCOP(amount) <= 0) { setError('Ingresa un monto válido.'); return }
        if (!pmId) { setError('Selecciona la forma de pago.'); return }
        try {
            await addPayment(sale.id, { amount: parseCOP(amount), payment_method_id: pmId, notes })
            onSuccess()
            onClose()
        } catch {
            setError('Error al registrar el abono.')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
                <h2 className="text-lg font-bold mb-1">Registrar abono</h2>
                <p className="text-sm text-gray-500 mb-4">
                    {sale.customer_name} — Saldo: <span className="font-bold text-orange-600">${sale.balance.toLocaleString('es-CO')}</span>
                </p>
                <input placeholder="Monto del abono *"
                    className="w-full border border-orange-300 rounded-lg p-2 text-sm mb-3"
                    value={amount} onChange={(e) => setAmount(formatCOP(e.target.value))} />
                <div className="relative mb-3">
                    <input type="text" placeholder="Forma de pago *"
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                        value={pmSearch}
                        onChange={(e) => { setPmSearch(e.target.value); setPmId('') }}
                        onFocus={() => setPmOpen(true)}
                        onBlur={() => setTimeout(() => setPmOpen(false), 150)}
                    />
                    {pmOpen && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg max-h-36 overflow-y-auto shadow-lg">
                            {paymentMethods.filter(pm => pm.name.toLowerCase().includes(pmSearch.toLowerCase())).map(pm => (
                                <li key={pm.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                    onMouseDown={() => { setPmId(pm.id); setPmSearch(pm.name); setPmOpen(false) }}>
                                    {pm.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <input placeholder="Nota (opcional)"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-3"
                    value={notes} onChange={(e) => setNotes(e.target.value)} />
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <div className="flex gap-3">
                    <button className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-500" onClick={onClose}>Cancelar</button>
                    <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600" onClick={handleSave}>Confirmar abono</button>
                </div>
            </div>
        </div>
    )
}

const HistoryModal = ({ sale, onClose }) => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getSalePayments(sale.id).then(data => { setPayments(data); setLoading(false) })
    }, [sale.id])

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto shadow-xl">
                <h2 className="text-lg font-bold mb-1">Historial de abonos</h2>
                <p className="text-sm text-gray-500 mb-4">{sale.customer_name} — Total: ${sale.amount.toLocaleString('es-CO')}</p>
                {loading ? (
                    <p className="text-gray-400 text-center py-6">Cargando...</p>
                ) : payments.length === 0 ? (
                    <p className="text-gray-400 text-center py-6">Sin abonos registrados.</p>
                ) : (
                    <table className="w-full text-sm mb-4">
                        <thead>
                            <tr className="border-b text-gray-500">
                                <th className="text-left py-2">Fecha</th>
                                <th className="text-right py-2">Monto</th>
                                <th className="text-left py-2 pl-3">Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id} className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">{new Date(p.date).toLocaleDateString('es-CO')}</td>
                                    <td className="py-2 text-right font-bold text-orange-600">${Number(p.amount).toLocaleString('es-CO')}</td>
                                    <td className="py-2 pl-3 text-gray-400 text-xs">{p.notes || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="text-right">
                    <button className="bg-gray-400 text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-500" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    )
}

const Credits = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [paymentMethods, setPaymentMethods] = useState([])
    const [paymentTarget, setPaymentTarget] = useState(null)
    const [historyTarget, setHistoryTarget] = useState(null)
    const [filter, setFilter] = useState('pending')

    const load = () => {
        setLoading(true)
        getCreditSales().then(data => { setSales(data); setLoading(false) })
    }

    useEffect(() => {
        load()
        getPaymentMethods().then(setPaymentMethods)
    }, [])

    const filtered = filter === 'all' ? sales : filter === 'pending' ? sales.filter(s => !s.is_paid) : sales.filter(s => s.is_paid)

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Separados / Créditos</h1>
                <div className="flex gap-2">
                    {['pending', 'paid', 'all'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filter === f ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>
                            {f === 'pending' ? 'Pendientes' : f === 'paid' ? 'Pagados' : 'Todos'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className="text-gray-400 text-center py-20">Cargando...</p>
            ) : filtered.length === 0 ? (
                <p className="text-gray-400 text-center py-20">No hay separados {filter === 'pending' ? 'pendientes' : filter === 'paid' ? 'pagados' : ''}.</p>
            ) : (
                <div className="space-y-3">
                    {filtered.map(sale => (
                        <div key={sale.id} className={`bg-white border rounded-xl p-4 flex flex-col gap-2 ${sale.is_paid ? 'border-green-200' : 'border-orange-200'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-800">{sale.customer_name || 'Sin nombre'}</p>
                                    {sale.customer_phone && <p className="text-sm text-gray-500">{sale.customer_phone}</p>}
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(sale.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${sale.is_paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {sale.is_paid ? 'Pagado' : 'Pendiente'}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="bg-gray-50 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="font-bold">${sale.amount.toLocaleString('es-CO')}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-400">Abonado</p>
                                    <p className="font-bold text-green-700">${sale.paid.toLocaleString('es-CO')}</p>
                                </div>
                                <div className={`rounded-lg p-2 text-center ${sale.is_paid ? 'bg-green-50' : 'bg-orange-50'}`}>
                                    <p className="text-xs text-gray-400">Saldo</p>
                                    <p className={`font-bold ${sale.is_paid ? 'text-green-700' : 'text-orange-600'}`}>${sale.balance.toLocaleString('es-CO')}</p>
                                </div>
                            </div>

                            {sale.items_summary && (
                                <p className="text-xs text-gray-400">{sale.category || ''} · {sale.items_summary}</p>
                            )}

                            <div className="flex gap-2 mt-1">
                                <button onClick={() => setHistoryTarget(sale)}
                                    className="text-sm border border-gray-200 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-50">
                                    Ver abonos
                                </button>
                                {!sale.is_paid && (
                                    <button onClick={() => setPaymentTarget(sale)}
                                        className="text-sm bg-orange-500 text-white rounded-lg px-4 py-1 font-semibold hover:bg-orange-600">
                                        + Abonar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {paymentTarget && (
                <PaymentModal sale={paymentTarget} paymentMethods={paymentMethods}
                    onClose={() => setPaymentTarget(null)} onSuccess={() => { setPaymentTarget(null); load() }} />
            )}
            {historyTarget && (
                <HistoryModal sale={historyTarget} onClose={() => setHistoryTarget(null)} />
            )}
        </div>
    )
}

export default Credits
