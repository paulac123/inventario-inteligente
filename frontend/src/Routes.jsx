import Home from './pages/Home'
import Transactions from './pages/Transactions'
import Inventory from './pages/Inventory'
import Summary from './pages/Summary'
import Metrics from './pages/Metrics'
import Credits from './pages/Credits'
import Alerts from './pages/Alerts'
import Debts from './pages/Debts'
import Login from './pages/Login'

const routes = [
  { path: '/login', element: <Login />, public: true },
  { path: '/', element: <Home /> },
  { path: '/transactions/', element: <Transactions /> },
  { path: '/inventory/', element: <Inventory /> },
  { path: '/summary/', element: <Summary /> },
  { path: '/metrics/', element: <Metrics />, adminOnly: true },
  { path: '/credits/', element: <Credits /> },
  { path: '/alerts/', element: <Alerts /> },
  { path: '/debts/', element: <Debts />, adminOnly: true },
];

export default routes
