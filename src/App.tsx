import { Outlet } from 'react-router-dom'
import MainLayout from '@layouts/MainLayout'
import { CartProvider } from '@context/CartContext'
import { AuthProvider } from '@context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
