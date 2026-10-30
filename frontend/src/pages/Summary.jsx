import { useState, useEffect } from 'react'
import getSummary from '../services/summaryService'

const Summary = () => {
    const [summary, setSummary] = useState(null)
    const getLocalDate = () => new Date().toLocaleDateString('en-CA')
    const [dateFrom, setDateFrom] = useState(getLocalDate)
    const [dateTo, setDateTo] = useState(getLocalDate)

    useEffect(() => {
        setSummary(null)
        let cancelled = false
        getSummary(dateFrom, dateTo).then(data => {
            if (!cancelled) setSummary(data)
        })
        return () => { cancelled = true }
    }, [dateFrom, dateTo])

    return (
        <div>
            <h1 className="text-3xl font-bold">Resumen del día</h1>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className='text-black text-lg font-bold'/>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className='text-black text-lg font-bold'/>
            {summary && (
                <div>
                    <p className="text-lg font-bold">Ventas: {summary.total_sales.toLocaleString()}</p>
                    <p className="text-lg font-bold">Gastos: {summary.total_expenses.toLocaleString()}</p>
                    <p className="text-black text-3xl font-bold">Balance: {summary.balance.toLocaleString()}</p>
                </div>
            )}
        </div>
    )
}

export default Summary
