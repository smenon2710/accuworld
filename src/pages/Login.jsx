import { Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck, CalendarDays, FileText, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'

const ROLES = [
  {
    role: 'admin',
    label: 'Admin',
    description: 'Full access — all features, all views',
    email: 'admin@accuworld.app',
    password: 'Demo@1234',
    Icon: ShieldCheck,
    accent: 'teal',
  },
  {
    role: 'frontdesk',
    label: 'Front Office',
    description: 'Schedule · Insurance · Billing',
    email: 'frontoffice@accuworld.app',
    password: 'Demo@1234',
    Icon: CalendarDays,
    accent: 'blue',
  },
  {
    role: 'practitioner',
    label: 'Practitioner',
    description: 'Charts · Treatment Plans · Clinical',
    email: 'drpriya@accuworld.app',
    password: 'Demo@1234',
    Icon: FileText,
    accent: 'violet',
  },
]

const ACCENT = {
  teal: {
    ring: 'ring-teal-500',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    btn: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  blue: {
    ring: 'ring-blue-400',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  violet: {
    ring: 'ring-violet-400',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    btn: 'bg-violet-600 hover:bg-violet-700 text-white',
  },
}

function RoleCard({ role, label, description, email, password, Icon, accent, onLogin }) {
  const [showPass, setShowPass] = useState(false)
  const colors = ACCENT[accent]

  return (
    <div className={`rounded-xl border bg-white p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colors.iconBg}`}>
          <Icon className={`h-5 w-5 ${colors.iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded-md border bg-zinc-50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Email</p>
          <p className="text-xs font-mono text-zinc-800">{email}</p>
        </div>
        <div className="rounded-md border bg-zinc-50 px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Password</p>
            <p className="text-xs font-mono text-zinc-800">
              {showPass ? password : '••••••••'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="text-muted-foreground hover:text-zinc-700 p-1"
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <button
        onClick={onLogin}
        className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${colors.btn}`}
      >
        Sign in as {label}
      </button>
    </div>
  )
}

export default function Login() {
  const { loggedInRole, loginAs } = useApp()
  const navigate = useNavigate()

  if (loggedInRole) return <Navigate to="/" replace />

  function handleLogin(role) {
    loginAs(role)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Branding */}
      <div className="mb-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-teal-700">AccuWorld</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acupuncture Practice Management</p>
      </div>

      {/* Demo banner */}
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-center max-w-md">
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Demo mode</span> — select a role to explore the app. No real data is stored.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-2xl sm:grid-cols-3">
        {ROLES.map(({ role, label, description, email, password, Icon, accent }) => (
          <RoleCard
            key={role}
            role={role}
            label={label}
            description={description}
            email={email}
            password={password}
            Icon={Icon}
            accent={accent}
            onLogin={() => handleLogin(role)}
          />
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        AccuWorld prototype · v0.1 · Not for clinical use
      </p>
    </div>
  )
}
