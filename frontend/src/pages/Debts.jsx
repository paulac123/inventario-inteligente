import { useState, useEffect } from 'react'
import { getDebts, createDebt, addDebtPayment, deleteDebt } from '../services/debtService'

const formatCOP = (v) => `$${Math.round(v).toLocaleString('es-CO')}`

const CATEGORIES = ['Nómina', 'Mercancía', 'Préstamo']

const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const Debts = () => {
    const [debts, setDebts] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState({})

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [totalAmount, setTotalAmount] = useState('')
    const [formError, setFormError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')


    const [payDebtId, setPayDebtId] = useState(null)
    const [payAmount, setPayAmount] = useState('')
    const [payNotes, setPayNotes] = useState('')
    const [payError, setPayError] = useState('')

    const formatInput = (v) => {
        const num = v.replace(/\D/g, '')
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    const parseInput = (v) => parseFloat(v.replace(/\./g, '')) || 0

    const load = async () => {
        setLoading(true)
        const data = await getDebts()
        setDebts(data)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const handleCreate = async () => {
        setFormError('')
        if (!name.trim()) { setFormError('Ingresa el nombre.'); return }
        if (!totalAmount) { setFormError('Ingresa el monto total.'); return }
        try {
            await createDebt({ name: name.trim(), description: description.trim() || null, category: category || null, total_amount: parseInput(totalAmount) })
            setName(''); setDescription(''); setCategory(''); setTotalAmount('')
            setSuccessMsg('Deuda agregada')
            setTimeout(() => setSuccessMsg(''), 2000)
            load()
        } catch { setFormError('Error al guardar.') }
    }

    const handlePay = async () => {
        setPayError('')
        if (!payAmount) { setPayError('Ingresa el monto.'); return }
        try {
            await addDebtPayment(payDebtId, { amount: parseInput(payAmount), notes: payNotes.trim() || null })
            setPayDebtId(null); setPayAmount(''); setPayNotes('')
            load()
        } catch { setPayError('Error al registrar abono.') }
    }

    const handleDelete = async (id) => {
        await deleteDebt(id)
        load()
    }

    const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

    return (
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Deudas</h1>

            {/* Resumen por categoría */}
            {!loading && debts.length > 0 && (() => {
                const totalPendiente = debts.reduce((s, d) => s + d.remaining, 0)
                const porCategoria = CATEGORIES.map(cat => ({
                    cat,
                    pendiente: debts.filter(d => d.category === cat).reduce((s, d) => s + d.remaining, 0)
                })).filter(x => x.pendiente > 0)
                return (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Resumen de deudas</h2>
                        <div className="flex flex-wrap gap-4 items-end">
                            {porCategoria.map(({ cat, pendiente }) => (
                                <div key={cat} className="text-center">
                                    <p className="text-xs text-gray-400 mb-0.5">{cat}</p>
                                    <p className="text-lg font-bold text-orange-600">{formatCOP(pendiente)}</p>
                                </div>
                            ))}
                            <div className="text-center border-l border-gray-200 pl-4 ml-2">
                                <p className="text-xs text-gray-400 mb-0.5">Total adeudado</p>
                                <p className="text-xl font-bold text-gray-800">{formatCOP(totalPendiente)}</p>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* Formulario nueva deuda */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Agregar deuda</h2>
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Categoría *</label>
                        <select
                            className="border border-gray-300 rounded-lg p-2 text-sm w-36"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Nombre *</label>
                        <input
                            placeholder="ej: Valentina"
                            className="border border-gray-300 rounded-lg p-2 text-sm w-36"
                            value={name}
                            onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Descripción</label>
                        <input
                            placeholder="opcional"
                            className="border border-gray-300 rounded-lg p-2 text-sm w-40"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Monto total *</label>
                        <input
                            placeholder="ej: 500.000"
                            className="border border-gray-300 rounded-lg p-2 text-sm w-36"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(formatInput(e.target.value))} />
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

            {/* Lista de deudas */}
            {loading ? (
                <p className="text-gray-400 text-sm">Cargando...</p>
            ) : debts.length === 0 ? (
                <p className="text-gray-400 text-sm">No hay deudas registradas.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {debts.map(debt => {
                        const pct = debt.total_amount > 0 ? Math.min(100, Math.round(debt.paid_amount / debt.total_amount * 100)) : 0
                        const done = debt.remaining === 0
                        return (
                            <div key={debt.id} className={`bg-white border rounded-xl p-5 ${done ? 'border-green-200' : 'border-gray-200'}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-semibold text-gray-800">{debt.name}</p>
                                            {debt.category && (
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{debt.category}</span>
                                            )}
                                            {done && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Pagada</span>}
                                        </div>
                                        {debt.description && <p className="text-xs text-gray-400 mb-2">{debt.description}</p>}
                                        {/* Barra de progreso */}
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${done ? 'bg-green-500' : 'bg-orange-400'}`}
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span>Total: <span className="font-semibold text-gray-700">{formatCOP(debt.total_amount)}</span></span>
                                            <span>Abonado: <span className="font-semibold text-green-600">{formatCOP(debt.paid_amount)}</span></span>
                                            <span>Pendiente: <span className={`font-semibold ${done ? 'text-green-600' : 'text-orange-600'}`}>{formatCOP(debt.remaining)}</span></span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {!done && (
                                            <button
                                                onClick={() => { setPayDebtId(debt.id); setPayAmount(''); setPayNotes(''); setPayError('') }}
                                                className="text-sm text-orange-500 font-medium hover:text-orange-700 border border-orange-200 rounded-lg px-3 py-1">
                                                Abonar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => toggleExpand(debt.id)}
                                            className="text-xs text-gray-400 hover:text-gray-600">
                                            {expanded[debt.id] ? 'Ocultar ▲' : `Historial (${debt.payments.length}) ▼`}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(debt.id)}
                                            className="text-red-400 hover:text-red-600 text-xs">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>

                                {/* Modal de abono inline */}
                                {payDebtId === debt.id && (
                                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <p className="text-xs font-semibold text-orange-700 mb-3">Registrar abono a {debt.name}</p>
                                        <div className="flex gap-3 flex-wrap items-end">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-500">Monto *</label>
                                                <input
                                                    placeholder="ej: 100.000"
                                                    className="border border-gray-300 rounded-lg p-2 text-sm w-32"
                                                    value={payAmount}
                                                    onChange={(e) => setPayAmount(formatInput(e.target.value))} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-500">Nota</label>
                                                <input
                                                    placeholder="opcional"
                                                    className="border border-gray-300 rounded-lg p-2 text-sm w-40"
                                                    value={payNotes}
                                                    onChange={(e) => setPayNotes(e.target.value)} />
                                            </div>
                                            <button
                                                onClick={handlePay}
                                                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600">
                                                Confirmar
                                            </button>
                                            <button
                                                onClick={() => setPayDebtId(null)}
                                                className="text-gray-400 text-sm hover:text-gray-600">
                                                Cancelar
                                            </button>
                                        </div>
                                        {payError && <p className="text-red-500 text-xs mt-2">{payError}</p>}
                                    </div>
                                )}

                                {/* Historial de abonos */}
                                {expanded[debt.id] && debt.payments.length > 0 && (
                                    <div className="mt-4 border-t border-gray-100 pt-3">
                                        <table className="w-full text-xs text-gray-500">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-1">Fecha</th>
                                                    <th className="text-right py-1">Monto</th>
                                                    <th className="text-left py-1 pl-4">Nota</th>
                                                    <th className="text-left py-1 pl-4">Origen</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {debt.payments.map(p => (
                                                    <tr key={p.id} className="border-b border-gray-50">
                                                        <td className="py-1.5">{formatDate(p.date)}</td>
                                                        <td className="py-1.5 text-right font-semibold text-gray-700">{formatCOP(p.amount)}</td>
                                                        <td className="py-1.5 pl-4">{p.notes || '—'}</td>
                                                        <td className="py-1.5 pl-4">
                                                            {p.expense_id
                                                                ? <span className="text-blue-500">Gasto #{p.expense_id}</span>
                                                                : <span className="text-gray-400">Manual</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {expanded[debt.id] && debt.payments.length === 0 && (
                                    <p className="mt-3 text-xs text-gray-400">Sin abonos registrados aún.</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Debts
