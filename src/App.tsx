import { Outlet } from 'react-router-dom'
import MainLayout from '@layouts/MainLayout'
import { CartProvider } from '@context/CartContext'

function App() {
  return (
    <CartProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </CartProvider>
  )
}

export default App
