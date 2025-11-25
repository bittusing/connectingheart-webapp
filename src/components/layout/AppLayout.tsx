import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export const AppLayout = () => (
  <div className="min-h-screen bg-slate-50/60 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
)

