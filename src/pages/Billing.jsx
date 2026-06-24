import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, Printer, DollarSign, Plus, X } from 'lucide-react'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { PAYMENT_METHOD, SELF_PAY_RATE, COVERAGE_STATUS } from '@/data/seed'

// Which payment methods show a transaction reference field, and what to label it
const REF_LABEL = {
  zelle: 'Confirmation #',
  card: 'Last 4 / Transaction ID',
  check: 'Check #',
}

const CPT_DEFAULTS = [
  { description: 'Acupuncture — 1st 15 min', cptCode: '97810', units: 1, amount: 80 },
  { description: 'Acupuncture — ea addl 15 min', cptCode: '97811', units: 1, amount: 20 },
  { description: 'Electroacupuncture — 1st 15 min', cptCode: '97813', units: 1, amount: 80 },
  { description: 'Electroacupuncture — ea addl 15 min', cptCode: '97814', units: 1, amount: 20 },
  { description: 'Manual Therapy / Cupping', cptCode: '97140', units: 1, amount: 30 },
]

function formatDate(d) {
  if (!d) return '—'
  try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d }
}

function SuperbillView({ invoice, patient, onClose }) {
  return (
    <div className="p-6 space-y-5 text-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Superbill</h2>
          <p className="text-muted-foreground">For patient-submitted insurance claims</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Patient</p>
          <p className="font-medium">{patient?.firstName} {patient?.lastName}</p>
          <p className="text-xs text-muted-foreground mt-1">DOB: {patient?.dateOfBirth ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Date of Service</p>
          <p className="font-medium">{formatDate(invoice.date)}</p>
          <p className="text-xs text-muted-foreground mt-1">NPI: ________________</p>
        </div>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
            <th className="py-2 text-left text-xs font-medium text-muted-foreground">CPT</th>
            <th className="py-2 text-left text-xs font-medium text-muted-foreground">Units</th>
            <th className="py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((li, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{li.description}</td>
              <td className="py-2">{li.cptCode}</td>
              <td className="py-2">{li.units}</td>
              <td className="py-2 text-right">${li.amount}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="py-2 text-right font-semibold">Total</td>
            <td className="py-2 text-right font-semibold">${invoice.total}</td>
          </tr>
        </tfoot>
      </table>
      <div>
        <p className="text-xs text-muted-foreground">Diagnosis Codes (ICD-10)</p>
        <Input placeholder="e.g. M54.5 (low back pain), M54.3 (sciatica)…" className="mt-1" />
      </div>
      <Button onClick={onClose} variant="outline" className="w-full">Close</Button>
    </div>
  )
}

export default function Billing() {
  const { patients, invoices, addInvoice, updateInvoice } = useApp()
  const [monthFilter, setMonthFilter] = useState('2026-06')
  const [showNew, setShowNew] = useState(false)
  const [showSuperbill, setShowSuperbill] = useState(null)
  const [markPaidTarget, setMarkPaidTarget] = useState(null)
  const [payMethod, setPayMethod] = useState(PAYMENT_METHOD.CASH)
  const [transactionRef, setTransactionRef] = useState('')
  const [paymentNote, setPaymentNote] = useState('')

  const [newForm, setNewForm] = useState({
    patientId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    lineItems: [{ description: '', cptCode: '', units: 1, amount: 0 }],
    isSuperbill: false,
  })

  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]))

  const filtered = invoices.filter((inv) => {
    if (!monthFilter) return true
    return inv.date?.startsWith(monthFilter)
  })

  const totalBilled = filtered.reduce((s, inv) => s + (inv.total ?? 0), 0)
  const totalPaid = filtered.filter((inv) => inv.paid).reduce((s, inv) => s + (inv.total ?? 0), 0)

  function setNewField(field, value) {
    setNewForm((f) => ({ ...f, [field]: value }))
  }

  function setLineItem(i, field, value) {
    setNewForm((f) => {
      const items = f.lineItems.map((li, idx) => idx === i ? { ...li, [field]: value } : li)
      return { ...f, lineItems: items }
    })
  }

  function addLineItem() {
    setNewForm((f) => ({ ...f, lineItems: [...f.lineItems, { description: '', cptCode: '', units: 1, amount: 0 }] }))
  }

  function removeLineItem(i) {
    setNewForm((f) => ({ ...f, lineItems: f.lineItems.filter((_, idx) => idx !== i) }))
  }

  function applyDefaultLineItem(cpt) {
    const def = CPT_DEFAULTS.find((d) => d.cptCode === cpt)
    if (!def) return
    setNewForm((f) => ({
      ...f,
      lineItems: [...f.lineItems.filter((li) => li.cptCode), { ...def }],
    }))
  }

  function handleCreateInvoice(e) {
    e.preventDefault()
    const total = newForm.lineItems.reduce((s, li) => s + Number(li.amount) * Number(li.units), 0)
    addInvoice({
      id: `inv${Date.now()}`,
      patientId: newForm.patientId,
      visitId: null,
      date: newForm.date,
      lineItems: newForm.lineItems.map((li) => ({ ...li, amount: Number(li.amount), units: Number(li.units) })),
      total,
      paid: false,
      paymentMethod: null,
      isSuperbill: newForm.isSuperbill,
    })
    setShowNew(false)
    setNewForm({ patientId: '', date: format(new Date(), 'yyyy-MM-dd'), lineItems: [{ description: '', cptCode: '', units: 1, amount: 0 }], isSuperbill: false })
  }

  function handleMarkPaid() {
    updateInvoice(markPaidTarget, {
      paid: true,
      paymentMethod: payMethod,
      ...(transactionRef.trim() ? { transactionRef: transactionRef.trim() } : {}),
      ...(paymentNote.trim() ? { paymentNote: paymentNote.trim() } : {}),
    })
    setMarkPaidTarget(null)
    setTransactionRef('')
    setPaymentNote('')
  }

  function openMarkPaid(invoiceId) {
    setMarkPaidTarget(invoiceId)
    setTransactionRef('')
    setPaymentNote('')
  }

  const superbillInvoice = showSuperbill ? invoices.find((inv) => inv.id === showSuperbill) : null
  const superbillPatient = superbillInvoice ? patientMap[superbillInvoice.patientId] : null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Billing</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} invoices</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Receipt className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total Billed</p>
          <p className="text-2xl font-semibold mt-1">${totalBilled}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-muted-foreground">Collected</p>
          <p className="text-2xl font-semibold mt-1 text-teal-700">${totalPaid}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className={`text-2xl font-semibold mt-1 ${totalBilled - totalPaid > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>
            ${totalBilled - totalPaid}
          </p>
        </div>
      </div>

      {/* Month filter */}
      <div className="flex items-center gap-3">
        <Label className="text-xs">Month</Label>
        <Input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-40"
        />
        <button onClick={() => setMonthFilter('')} className="text-xs text-muted-foreground hover:underline">Clear</button>
      </div>

      {/* Invoice table */}
      <div className="rounded-lg border bg-white">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No invoices for this period.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50/60">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const patient = patientMap[inv.patientId]
                return (
                  <tr key={inv.id} className="border-b last:border-0 hover:bg-zinc-50/40">
                    <td className="px-4 py-3">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3">
                      {patient ? (
                        <Link
                          to={`/patients/${patient.id}`}
                          className="font-medium text-zinc-900 hover:text-teal-700 hover:underline"
                        >
                          {patient.firstName} {patient.lastName}
                        </Link>
                      ) : inv.patientId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {inv.lineItems.map((li) => li.cptCode).join(', ')}
                    </td>
                    <td className="px-4 py-3 font-medium">${inv.total}</td>
                    <td className="px-4 py-3">
                      {inv.paid ? (
                        <div>
                          <Badge variant="success">Paid</Badge>
                          {inv.paymentMethod && (
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{inv.paymentMethod}</p>
                          )}
                          {inv.transactionRef && (
                            <p className="text-xs text-muted-foreground">{inv.transactionRef}</p>
                          )}
                          {inv.paymentNote && (
                            <p className="text-xs text-muted-foreground italic">{inv.paymentNote}</p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="warning">Unpaid</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!inv.paid && (
                          <Button size="sm" variant="outline" onClick={() => openMarkPaid(inv.id)}>
                            <DollarSign className="h-3.5 w-3.5" /> Mark Paid
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowSuperbill(inv.id)}
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Invoice Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4 p-6 pt-3 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Patient *</Label>
                <Select value={newForm.patientId} onChange={(e) => setNewField('patientId', e.target.value)} required>
                  <option value="">Select patient…</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={newForm.date} onChange={(e) => setNewField('date', e.target.value)} />
              </div>
            </div>

            {/* Quick CPT defaults */}
            <div className="space-y-1.5">
              <Label className="text-xs">Quick add CPT</Label>
              <div className="flex flex-wrap gap-1.5">
                {CPT_DEFAULTS.map((d) => (
                  <button
                    key={d.cptCode}
                    type="button"
                    onClick={() => applyDefaultLineItem(d.cptCode)}
                    className="rounded-full border px-2.5 py-1 text-xs hover:bg-zinc-50"
                  >
                    {d.cptCode} — {d.description.split('—')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              {newForm.lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5 space-y-1">
                    {i === 0 && <Label className="text-xs">Description</Label>}
                    <Input value={li.description} onChange={(e) => setLineItem(i, 'description', e.target.value)} placeholder="Description" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    {i === 0 && <Label className="text-xs">CPT</Label>}
                    <Input value={li.cptCode} onChange={(e) => setLineItem(i, 'cptCode', e.target.value)} placeholder="97810" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    {i === 0 && <Label className="text-xs">Units</Label>}
                    <Input type="number" min="1" value={li.units} onChange={(e) => setLineItem(i, 'units', e.target.value)} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    {i === 0 && <Label className="text-xs">Amount ($)</Label>}
                    <Input type="number" min="0" value={li.amount} onChange={(e) => setLineItem(i, 'amount', e.target.value)} />
                  </div>
                  <div className="col-span-1 flex items-end justify-end pb-0.5">
                    {newForm.lineItems.length > 1 && (
                      <button type="button" onClick={() => removeLineItem(i)} className="text-muted-foreground hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-3.5 w-3.5" /> Add Line Item
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="superbill"
                checked={newForm.isSuperbill}
                onChange={(e) => setNewField('isSuperbill', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="superbill">Generate as superbill (for patient to submit to insurance)</Label>
            </div>

            <div className="flex justify-between text-sm font-semibold pt-2">
              <span>Total</span>
              <span>${newForm.lineItems.reduce((s, li) => s + Number(li.amount) * Number(li.units), 0)}</span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button type="submit">Create Invoice</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mark Paid Dialog */}
      <Dialog open={!!markPaidTarget} onOpenChange={(o) => { if (!o) { setMarkPaidTarget(null); setTransactionRef(''); setPaymentNote('') } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Mark as Paid</DialogTitle></DialogHeader>
          <div className="space-y-4 p-6 pt-3">
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                {Object.values(PAYMENT_METHOD).map((m) => (
                  <option key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </Select>
            </div>
            {REF_LABEL[payMethod] && (
              <div className="space-y-1.5">
                <Label>{REF_LABEL[payMethod]} <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="e.g. paid before visit, split payment…"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setMarkPaidTarget(null); setTransactionRef(''); setPaymentNote('') }}>Cancel</Button>
              <Button onClick={handleMarkPaid}>Confirm</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Superbill View */}
      <Dialog open={!!showSuperbill} onOpenChange={(o) => !o && setShowSuperbill(null)}>
        <DialogContent className="max-w-2xl">
          {superbillInvoice && (
            <SuperbillView
              invoice={superbillInvoice}
              patient={superbillPatient}
              onClose={() => setShowSuperbill(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
