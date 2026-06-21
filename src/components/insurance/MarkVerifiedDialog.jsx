import { useState } from 'react'
import { addDays, addYears, startOfYear, min, format } from 'date-fns'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useApp } from '@/context/AppContext'
import { COVERAGE_STATUS, PAYERS } from '@/data/seed'

function computeReverifyDate() {
  const today = new Date()
  const plus90 = addDays(today, 90)
  const jan1 = startOfYear(addYears(today, 1))
  return format(min([plus90, jan1]), 'yyyy-MM-dd')
}

const EMPTY = {
  payer: PAYERS.HORIZON,
  planName: '',
  memberId: '',
  groupNumber: '',
  acupunctureBenefit: 'yes',
  visitsAuthorized: '',
  visitsUsed: '',
  copay: '',
  coinsurancePct: '',
  deductibleMet: false,
  authReferenceNumber: '',
  verificationNotes: '',
}

export default function MarkVerifiedDialog({ open, onOpenChange, patientId, patientName, currentIns }) {
  const { updateInsurance } = useApp()
  const [form, setForm] = useState(() => ({ ...EMPTY, ...currentIns }))

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const benefit = form.acupunctureBenefit
    const coverageStatus =
      benefit === 'yes'
        ? COVERAGE_STATUS.COVERED
        : benefit === 'no'
        ? COVERAGE_STATUS.NOT_COVERED
        : COVERAGE_STATUS.UNVERIFIED

    updateInsurance(patientId, {
      ...form,
      coverageStatus,
      visitsAuthorized: Number(form.visitsAuthorized) || 0,
      visitsUsed: Number(form.visitsUsed) || 0,
      copay: Number(form.copay) || 0,
      coinsurancePct: Number(form.coinsurancePct) || 0,
      lastVerifiedDate: format(new Date(), 'yyyy-MM-dd'),
      reverifyByDate: computeReverifyDate(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark Verified — {patientName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-3 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Payer</Label>
              <Select value={form.payer} onChange={(e) => set('payer', e.target.value)}>
                {Object.values(PAYERS).map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Plan Name</Label>
              <Input value={form.planName ?? ''} onChange={(e) => set('planName', e.target.value)} placeholder="e.g. SEHBP, Choice Plus" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Member ID</Label>
              <Input value={form.memberId ?? ''} onChange={(e) => set('memberId', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Group #</Label>
              <Input value={form.groupNumber ?? ''} onChange={(e) => set('groupNumber', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Acupuncture Benefit?</Label>
            <Select value={form.acupunctureBenefit} onChange={(e) => set('acupunctureBenefit', e.target.value)}>
              <option value="yes">Yes — covered</option>
              <option value="no">No — not covered</option>
              <option value="unknown">Unknown / pending</option>
            </Select>
          </div>
          {form.acupunctureBenefit === 'yes' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Visits Authorized</Label>
                  <Input type="number" min="0" value={form.visitsAuthorized} onChange={(e) => set('visitsAuthorized', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Visits Already Used</Label>
                  <Input type="number" min="0" value={form.visitsUsed} onChange={(e) => set('visitsUsed', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Copay ($)</Label>
                  <Input type="number" min="0" value={form.copay} onChange={(e) => set('copay', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Coinsurance (%)</Label>
                  <Input type="number" min="0" max="100" value={form.coinsurancePct} onChange={(e) => set('coinsurancePct', e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deductible"
                  checked={!!form.deductibleMet}
                  onChange={(e) => set('deductibleMet', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="deductible">Deductible met for this plan year</Label>
              </div>
              <div className="space-y-1.5">
                <Label>Auth Reference #</Label>
                <Input value={form.authReferenceNumber ?? ''} onChange={(e) => set('authReferenceNumber', e.target.value)} />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label>Notes from the call</Label>
            <Textarea
              value={form.verificationNotes ?? ''}
              onChange={(e) => set('verificationNotes', e.target.value)}
              rows={3}
              placeholder="Rep name, reference #, what was said…"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Re-verify date will be set to {computeReverifyDate()} (+90 days or Jan 1, whichever is sooner).
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Verification</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
