import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import DemoBanner from './DemoBanner'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-56 pb-9">
        <div className="mx-auto max-w-screen-xl px-6 py-6">
          <Outlet />
        </div>
      </main>
      <DemoBanner />
    </div>
  )
}
