import type { ReactNode } from 'react'
import Navbar from '@components/Navbar'

type Props = {
  children: ReactNode
}

const MainLayout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-10 sm:px-8 lg:px-12">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} FaaSify. Simplify your life.
      </footer>
    </div>
  )
}

export default MainLayout

