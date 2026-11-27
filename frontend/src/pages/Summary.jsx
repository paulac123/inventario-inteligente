import { useState, useEffect } from 'react'
import getSummary from '../services/summaryService'
import { getSales, deleteSale } from '../services/saleService'
import { getExpenses, deleteExpense } from '../services/expenseService'

const Summary = () => {
    const [summary, setSummary] = useState(null)
    const [sales, setSales] = useState([])
    const [expenses, setExpenses] = useState([])
    const getLocalDate = () => new Date().toLocaleDateString('en-CA')
    const [dateFrom, setDateFrom] = useState(getLocalDate)
    const [dateTo, setDateTo] = useState(getLocalDate)

    const loadData = () => {
        setSummary(null)
        getSummary(dateFrom, dateTo).then(setSummary)
        getSales(dateFrom, dateTo).then(setSales)
        getExpenses(dateFrom, dateTo).then(setExpenses)
    }

    useEffect(() => {
        loadData()
    }, [dateFrom, dateTo])

    const handleDeleteSale = async (saleId) => {
        await deleteSale(saleId)
        loadData()
    }

    const handleDeleteExpense = async (expenseId) => {
        await deleteExpense(expenseId)
        loadData()
    }

    const formatHour = (dateStr) => {
        const d = new Date(dateStr)
        const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })
        const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        return `${fecha} ${hora}`
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Resumen del día</h1>
            <div className="flex gap-3 mb-4">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-black text-lg font-bold" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-black text-lg font-bold" />
            </div>
            {summary && (
                <div className="mb-6">
                    <p className="text-lg font-bold text-green-600">Ventas: ${summary.total_sales.toLocaleString('es-CO')}</p>
                    <p className="text-lg font-bold text-red-500">Gastos: ${summary.total_expenses.toLocaleString('es-CO')}</p>
                    <p className="text-black text-3xl font-bold">Balance: ${summary.balance.toLocaleString('es-CO')}</p>
                    {summary.by_payment_method?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {summary.by_payment_method.map(pm => (
                                <div key={pm.name} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                                    <p className="text-xs text-gray-500 capitalize">{pm.name}</p>
                                    <p className="text-sm font-bold text-gray-800">${Number(pm.amount).toLocaleString('es-CO')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {sales.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold mb-3">Ventas registradas</h2>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left p-3 border">Hora</th>
                                <th className="text-left p-3 border">Total / Abono</th>
                                <th className="text-left p-3 border">Ítems</th>
                                <th className="text-left p-3 border">Descripción</th>
                                <th className="text-left p-3 border"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr key={sale.id} className="hover:bg-gray-50">
                                    <td className="p-3 border">{formatHour(sale.date)}</td>
                                    <td className="p-3 border font-bold">
                                        {sale.is_credit ? (
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-orange-600">
                                                        Abono: ${Number(sale.paid_amount ?? 0).toLocaleString('es-CO')}
                                                    </span>
                                                    <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">Separado</span>
                                                </div>
                                                <span className="text-xs text-gray-400 font-normal">
                                                    Prenda: ${Number(sale.amount).toLocaleString('es-CO')}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                ${Number(sale.amount).toLocaleString('es-CO')}
                                                {sale.discount > 0 && (
                                                    <span className="text-xs text-red-400">({sale.discount}% dto)</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 border">{sale.items.reduce((sum, i) => sum + i.quantity, 0)} uds</td>
                                    <td className="p-3 border text-gray-500">{sale.description || '—'}</td>
                                    <td className="p-3 border">
                                        <button className="text-red-500 hover:underline text-sm"
                                            onClick={() => handleDeleteSale(sale.id)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        {expenses.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-bold mb-3">Gastos registrados</h2>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left p-3 border">Hora</th>
                                <th className="text-left p-3 border">Total</th>
                                <th className="text-left p-3 border">Descripción</th>
                                <th className="text-left p-3 border"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="p-3 border">{formatHour(expense.date)}</td>
                                    <td className="p-3 border font-bold">${Number(expense.amount).toLocaleString('es-CO')}</td>
                                    <td className="p-3 border text-gray-500">{expense.description || '—'}</td>
                                    <td className="p-3 border">
                                        <button className="text-red-500 hover:underline text-sm"
                                            onClick={() => handleDeleteExpense(expense.id)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default Summary
