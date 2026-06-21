import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  FileText,
  ClipboardList,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/insurance', label: 'Insurance', icon: ShieldCheck },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/visits', label: 'Visit / Chart', icon: FileText },
  { to: '/treatment-plans', label: 'Treatment Plans', icon: ClipboardList },
  { to: '/billing', label: 'Billing', icon: Receipt },
]

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-5">
        <span className="text-lg font-semibold tracking-tight text-teal-700">AccuWorld</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-teal-50 font-medium text-teal-700'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Practitioner */}
      <div className="border-t px-5 py-3">
        <p className="text-xs font-medium text-zinc-900">Dr. Priya Sharma, L.Ac.</p>
        <p className="text-xs text-muted-foreground">Acupuncture &amp; TCM</p>
      </div>
    </aside>
  )
}
