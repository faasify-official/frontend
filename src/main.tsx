import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import HomePage from '@pages/HomePage'
import LoginPage from '@pages/LoginPage'
import CreateAccountPage from '@pages/CreateAccountPage'
import ProductDetailPage from '@pages/ProductDetailPage'
import StorefrontPage from '@pages/StorefrontPage'
import CartPage from '@pages/CartPage'
import CheckoutPage from '@pages/CheckoutPage'
import ProfilePage from '@pages/ProfilePage'
import { AuthProvider } from '@context/AuthContext'
import { ToastProvider } from '@context/ToastContext'
import { CartProvider } from '@context/CartContext'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!)

const CheckoutWithStripe = () => (
  <Elements stripe={stripePromise}>
    <CheckoutPage />
  </Elements>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'create-account', element: <CreateAccountPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'storefront/:storeId', element: <StorefrontPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutWithStripe /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>,
)
