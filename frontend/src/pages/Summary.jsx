import { useState, useEffect } from 'react'
import getSummary from '../services/summaryService'

const Summary = () => {
    const [summary, setSummary] = useState(null)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        setSummary(null)
        let cancelled = false
        getSummary(date).then(data => {
            console.log(data)
            if (!cancelled) setSummary(data)
        })
        return () => { cancelled = true }
    }, [date])

    return (
        <div>
            <h1>Resumen del día</h1>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className='text-black text-lg font-bold'/>
            {summary && (
                <div>
                    <p className="text-lg font-bold">Ventas: {summary.total_sales}</p>
                    <p className="text-lg font-bold">Gastos: {summary.total_expenses}</p>
                    <p className=" text-black text-3xl font-bold">Balance: {summary.balance}</p>
                </div>
            )}
        </div>
    )
}

export default Summary
