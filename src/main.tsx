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
import ProfilePage from '@pages/ProfilePage'

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
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
