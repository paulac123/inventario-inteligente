import Home from './pages/Home'
import Transactions from './pages/Transactions'
//import Inventory from 'pages/inventory'
import Summary from './pages/Summary'

const routes = [
  { path: '/', element: <Home /> },
  { path : '/transactions/' ,element : <Transactions /> },
  //{ path: '/inventory/', element: <Inventory /> },
  {path: '/summary/', element: <Summary /> }
];

export default routes