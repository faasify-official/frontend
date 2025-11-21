import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import HomePage from '@pages/HomePage'
import LoginPage from '@pages/LoginPage'
import CreateAccountPage from '@pages/CreateAccountPage'
import CreateStorefrontPage from '@pages/CreateStorefrontPage'
import ManageStorefrontPage from '@pages/ManageStorefrontPage'
import ProductDetailPage from '@pages/ProductDetailPage'
import StorefrontPage from '@pages/StorefrontPage'
import StorefrontsPage from '@pages/StorefrontsPage'
import CartPage from '@pages/CartPage'
import CheckoutPage from '@pages/CheckoutPage'
import ProfilePage from '@pages/ProfilePage'
import BoughtItemsPage from '@pages/BoughtItemsPage'
import ReviewItemPage from '@pages/ReviewItemPage'
import SellerOrdersPage from '@pages/SellerOrdersPage'
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
      { path: 'create-storefront', element: <CreateStorefrontPage /> },
      { path: 'manage-storefront', element: <ManageStorefrontPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'product/:productId/review', element: <ReviewItemPage /> },
      { path: 'storefronts', element: <StorefrontsPage /> },
      { path: 'storefront/:storeId', element: <StorefrontPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutWithStripe /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'purchases', element: <BoughtItemsPage /> },
      { path: 'orders', element: <SellerOrdersPage /> },
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
