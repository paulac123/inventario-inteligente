import { Link } from 'react-router-dom'

const Sidebar = () => {
    return (
        <div>
            <h1>Mi Tienda</h1>
            <Link to="/transactions">Transacciones</Link>
            <Link to="/inventory">Inventario</Link>
            <Link to="/summary">Resumen</Link>
        </div>
    )
}

export default Sidebar
