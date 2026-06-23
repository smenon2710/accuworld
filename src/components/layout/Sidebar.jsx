import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  FileText,
  ClipboardList,
  Receipt,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

// practitionerOnly: hidden in Front Desk mode
// emphasizeIn: which mode gives this item bolder treatment when not active
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/insurance', label: 'Insurance', icon: ShieldCheck, emphasizeIn: 'frontdesk' },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays, emphasizeIn: 'frontdesk' },
  { to: '/visits', label: 'Visit / Chart', icon: FileText, practitionerOnly: true, emphasizeIn: 'practitioner' },
  { to: '/treatment-plans', label: 'Treatment Plans', icon: ClipboardList, practitionerOnly: true },
  { to: '/billing', label: 'Billing', icon: Receipt, emphasizeIn: 'frontdesk' },
]

const MODES = [
  { value: 'frontdesk', label: 'Front Desk' },
  { value: 'practitioner', label: 'Practitioner' },
]

export default function Sidebar({ onHelpOpen }) {
  const { viewMode, setViewMode } = useApp()

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.practitionerOnly || viewMode === 'practitioner'
  )

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-5">
        <span className="text-lg font-semibold tracking-tight text-teal-700">AccuWorld</span>
      </div>

      {/* Mode toggle */}
      <div className="mx-3 mt-3 mb-1 flex rounded-md border">
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setViewMode(value)}
            className={cn(
              'flex-1 rounded-[5px] py-1 text-xs font-medium transition-colors',
              viewMode === value
                ? 'bg-teal-600 text-white'
                : 'text-zinc-500 hover:text-zinc-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-3">
          {visibleNav.map(({ to, label, icon: Icon, end, emphasizeIn }) => {
            const isEmphasized = emphasizeIn === viewMode
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-teal-50 font-medium text-teal-700'
                        : isEmphasized
                        ? 'font-medium text-zinc-800 hover:bg-zinc-50 hover:text-zinc-900'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    )
                  }
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isEmphasized ? 'text-teal-600' : ''
                    )}
                  />
                  {label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Help */}
      <button
        onClick={onHelpOpen}
        className="flex w-full items-center gap-2.5 border-t px-5 py-3 text-xs text-muted-foreground transition-colors hover:bg-zinc-50 hover:text-zinc-900"
      >
        <HelpCircle className="h-4 w-4 shrink-0" />
        Help &amp; Demo Guide
      </button>

      {/* Practitioner */}
      <div className="border-t px-5 py-3">
        <p className="text-xs font-medium text-zinc-900">Dr. Priya Sharma, L.Ac.</p>
        <p className="text-xs text-muted-foreground">Acupuncture &amp; TCM</p>
      </div>
    </aside>
  )
}
