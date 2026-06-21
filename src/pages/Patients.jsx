import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, ChevronRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import InsuranceBadge from '@/components/patients/InsuranceBadge'
import AddPatientDialog from '@/components/patients/AddPatientDialog'

export default function Patients() {
  const { patients, insuranceProfiles } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)

  const insMap = Object.fromEntries(insuranceProfiles.map((ins) => [ins.patientId, ins]))

  const filtered = patients.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.primaryCondition?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Patients</h1>
          <p className="text-sm text-muted-foreground">{patients.filter(p => p.status === 'active').length} active patients</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <UserPlus className="h-4 w-4" />
          New Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, phone, or condition…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? `No patients match "${search}".` : 'No patients yet. Add your first patient above.'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50/60">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Insurance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Coverage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const ins = insMap[p.id]
                return (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-zinc-50/60 cursor-pointer"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.primaryCondition}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ins ? (
                        <span>{ins.payer}{ins.planName ? ` — ${ins.planName}` : ''}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {ins && <InsuranceBadge status={ins.coverageStatus} />}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'active' ? 'success' : 'neutral'} className="capitalize">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="pr-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddPatientDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        onCreated={(id) => navigate(`/patients/${id}`)}
      />
    </div>
  )
}
