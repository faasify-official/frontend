import { Outlet } from 'react-router-dom'
import MainLayout from '@layouts/MainLayout'
import ToastContainer from '@components/Toast'

function App() {
  return (
    <MainLayout>
      <Outlet />
      <ToastContainer />
    </MainLayout>
  )
}

export default App
