import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Sidebar from './Sidebar'
import DemoBanner from './DemoBanner'
import HelpDrawer from './HelpDrawer'

export default function Layout() {
  const { loggedInRole } = useApp()
  const [showHelp, setShowHelp] = useState(false)

  if (!loggedInRole) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onHelpOpen={() => setShowHelp(true)} />
      <main className="ml-56 pb-9">
        <div className="mx-auto max-w-screen-xl px-6 py-6">
          <Outlet />
        </div>
      </main>
      <DemoBanner />
      <HelpDrawer open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}
