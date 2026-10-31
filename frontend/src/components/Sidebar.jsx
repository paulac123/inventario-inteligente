import { Link } from 'react-router-dom'

const Sidebar = () => {
    return (
        <div className="flex flex-col gap-2 p-4">
            <Link to="/" className="text-xl font-bold hover:text-blue-600">Mi Tienda</Link>
            <Link to="/transactions" className="px-3 py-1 rounded hover:bg-blue-100 hover:text-blue-700">Transacciones</Link>
            {/* <Link to="/inventory" className="px-3 py-1 rounded hover:bg-blue-100 hover:text-blue-700">Inventario</Link> */}
            <Link to="/summary" className="px-3 py-1 rounded hover:bg-blue-100 hover:text-blue-700">Resumen</Link>
        </div>
    )
}

export default Sidebar
