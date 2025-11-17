import { Outlet } from 'react-router-dom'
import MainLayout from '@layouts/MainLayout'
import ToastContainer from '@components/Toast'
import { SearchProvider } from '@context/SearchContext'

function App() {
  return (
    <SearchProvider>
      <MainLayout>
        <Outlet />
        <ToastContainer />
      </MainLayout>
    </SearchProvider>
  )
}

export default App
