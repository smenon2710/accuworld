import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function DemoBanner() {
  const { resetToSeedData } = useApp()

  return (
    <div className="fixed bottom-0 left-56 right-0 z-50 flex h-9 items-center justify-between border-t bg-amber-50 px-4 text-xs text-amber-700">
      <div className="flex items-center gap-1.5">
        <FlaskConical className="h-3.5 w-3.5" />
        <span className="font-medium">Demo Mode — Seed Data Only</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-amber-500">Quick jump:</span>
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/insurance" className="hover:underline">Insurance</Link>
        <Link to="/schedule" className="hover:underline">Schedule</Link>
        <Link to="/visits" className="hover:underline">Chart</Link>
        <button
          onClick={resetToSeedData}
          className="rounded border border-amber-300 bg-amber-100 px-2 py-0.5 hover:bg-amber-200"
        >
          Reset Data
        </button>
      </div>
    </div>
  )
}
