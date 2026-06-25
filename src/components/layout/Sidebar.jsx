import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  FileText,
  ClipboardList,
  Receipt,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

// practitionerOnly: hidden for Front Office role
// emphasizeIn: which role gives this item bolder treatment when not active
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/insurance', label: 'Insurance', icon: ShieldCheck, emphasizeIn: 'frontdesk' },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays, emphasizeIn: 'frontdesk' },
  { to: '/visits', label: 'Visit / Chart', icon: FileText, practitionerOnly: true, emphasizeIn: 'practitioner' },
  { to: '/treatment-plans', label: 'Treatment Plans', icon: ClipboardList, practitionerOnly: true },
  { to: '/billing', label: 'Billing', icon: Receipt, emphasizeIn: 'frontdesk' },
]

const ROLE_BADGE = {
  admin: { label: 'Admin · Full Access', className: 'bg-teal-50 text-teal-700' },
  frontdesk: { label: 'Front Office', className: 'bg-blue-50 text-blue-700' },
  practitioner: { label: 'Practitioner', className: 'bg-violet-50 text-violet-700' },
}

const ROLE_FOOTER = {
  admin: { name: 'Admin Account', sub: 'Full Access' },
  frontdesk: { name: 'Front Office', sub: 'AccuWorld Clinic' },
  practitioner: { name: 'Dr. Priya Sharma, L.Ac.', sub: 'Acupuncture & TCM' },
}

export default function Sidebar({ onHelpOpen }) {
  const { loggedInRole, logout } = useApp()
  const navigate = useNavigate()
  const isAdmin = loggedInRole === 'admin'
  const isFrontdesk = loggedInRole === 'frontdesk'

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.practitionerOnly || !isFrontdesk
  )

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const badge = ROLE_BADGE[loggedInRole] ?? ROLE_BADGE.practitioner
  const footer = ROLE_FOOTER[loggedInRole] ?? ROLE_FOOTER.practitioner

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-5">
        <span className="text-lg font-semibold tracking-tight text-teal-700">AccuWorld</span>
      </div>

      {/* Role badge — fixed, not a toggle */}
      <div className={`mx-3 mt-3 mb-1 rounded-md border px-3 py-1.5 text-center ${badge.className}`}>
        <p className="text-xs font-medium">{badge.label}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-3">
          {visibleNav.map(({ to, label, icon: Icon, end, emphasizeIn }) => {
            const isEmphasized = !isAdmin && emphasizeIn === loggedInRole
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

      {/* Footer — role info + logout */}
      <div className="border-t px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-900">{footer.name}</p>
          <p className="text-xs text-muted-foreground">{footer.sub}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  )
}
