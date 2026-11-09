import { useState, useEffect } from 'react'
import getSummary from '../services/summaryService'
import { getSales, deleteSale } from '../services/saleService'

const Summary = () => {
    const [summary, setSummary] = useState(null)
    const [sales, setSales] = useState([])
    const getLocalDate = () => new Date().toLocaleDateString('en-CA')
    const [dateFrom, setDateFrom] = useState(getLocalDate)
    const [dateTo, setDateTo] = useState(getLocalDate)

    const loadData = () => {
        setSummary(null)
        getSummary(dateFrom, dateTo).then(setSummary)
        getSales(dateFrom, dateTo).then(setSales)
    }

    useEffect(() => {
        loadData()
    }, [dateFrom, dateTo])

    const handleDeleteSale = async (saleId) => {
        await deleteSale(saleId)
        loadData()
    }

    const formatHour = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
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
                    <p className="text-lg font-bold text-green-600">Ventas: {summary.total_sales.toLocaleString('es-CO')}</p>
                    <p className="text-lg font-bold text-red-500">Gastos: {summary.total_expenses.toLocaleString('es-CO')}</p>
                    <p className="text-black text-3xl font-bold">Balance: {summary.balance.toLocaleString('es-CO')}</p>
                </div>
            )}

            {sales.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold mb-3">Ventas registradas</h2>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left p-3 border">Hora</th>
                                <th className="text-left p-3 border">Total</th>
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
                                        ${Number(sale.amount).toLocaleString('es-CO')}
                                        {sale.discount > 0 && (
                                            <span className="text-xs text-red-400 ml-1">({sale.discount}% dto)</span>
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
        </div>
    )
}

export default Summary
