import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import appRoutes from './Routes'
import Sidebar from './components/Sidebar'

function App() {
 

  return (
    <>
      <h1>Plataforma de ventas</h1>
      <BrowserRouter>
      <Sidebar />
        <Routes>
          {appRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
