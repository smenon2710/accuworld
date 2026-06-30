import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { ICD10_CODES, CAUSE_OF_INJURY_LABELS } from '@/data/seed'

const EMPTY = {
  title: '',
  icd10Code: '',
  icd10Label: '',
  manualIcd10: '',
  dateOpened: new Date().toISOString().slice(0, 10),
  status: 'active',
  insuranceId: '',
  causeOfInjury: 'none',
}

export default function CaseDialog({ open, onOpenChange, patientId, insuranceProfiles, existingCase, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const patientIns = (insuranceProfiles ?? []).filter((i) => i.patientId === patientId)

  useEffect(() => {
    if (!open) return
    if (existingCase) {
      const isManual = !ICD10_CODES.find((c) => c.code === existingCase.icd10Code)
      setForm({
        title: existingCase.title ?? '',
        icd10Code: isManual ? '__manual__' : (existingCase.icd10Code ?? ''),
        icd10Label: existingCase.icd10Label ?? '',
        manualIcd10: isManual ? `${existingCase.icd10Code} — ${existingCase.icd10Label}` : '',
        dateOpened: existingCase.dateOpened ?? new Date().toISOString().slice(0, 10),
        status: existingCase.status ?? 'active',
        insuranceId: existingCase.insuranceId ?? '',
        causeOfInjury: existingCase.causeOfInjury ?? 'none',
      })
    } else {
      setForm({ ...EMPTY, dateOpened: new Date().toISOString().slice(0, 10) })
    }
  }, [open, existingCase])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleIcd10Change(code) {
    set('icd10Code', code)
    if (code !== '__manual__') {
      const entry = ICD10_CODES.find((c) => c.code === code)
      set('icd10Label', entry?.label ?? '')
    }
  }

  function handleSave() {
    if (!form.title.trim()) return
    let finalCode, finalLabel
    if (form.icd10Code === '__manual__') {
      const parts = form.manualIcd10.split('—')
      finalCode = parts[0]?.trim() ?? ''
      finalLabel = parts[1]?.trim() ?? form.manualIcd10.trim()
    } else {
      finalCode = form.icd10Code
      finalLabel = form.icd10Label
    }
    onSave({
      ...(existingCase ?? {}),
      id: existingCase?.id ?? `c${Date.now()}`,
      patientId,
      title: form.title.trim(),
      icd10Code: finalCode,
      icd10Label: finalLabel,
      dateOpened: form.dateOpened,
      status: form.status,
      insuranceId: form.insuranceId,
      causeOfInjury: form.causeOfInjury,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{existingCase ? 'Edit Case' : 'New Case'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">

          <div className="space-y-1.5">
            <Label>Case Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Low Back Pain 2026"
            />
          </div>

          <div className="space-y-1.5">
            <Label>ICD-10 Diagnosis</Label>
            <Select value={form.icd10Code} onChange={(e) => handleIcd10Change(e.target.value)}>
              <option value="">— Select a code —</option>
              {ICD10_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
              ))}
              <option value="__manual__">Other / Manual entry</option>
            </Select>
            {form.icd10Code === '__manual__' && (
              <Input
                value={form.manualIcd10}
                onChange={(e) => set('manualIcd10', e.target.value)}
                placeholder="e.g. M54.31 — Sciatica, right side"
                className="mt-1.5"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date Opened</Label>
              <Input type="date" value={form.dateOpened} onChange={(e) => set('dateOpened', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Cause of Injury</Label>
            <Select value={form.causeOfInjury} onChange={(e) => set('causeOfInjury', e.target.value)}>
              {Object.entries(CAUSE_OF_INJURY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
            {form.causeOfInjury !== 'none' && (
              <p className="text-xs text-amber-600 mt-1">
                Injury-related cases affect claim processing — confirm with your billing specialist.
              </p>
            )}
          </div>

          {patientIns.length > 0 && (
            <div className="space-y-1.5">
              <Label>Linked Insurance</Label>
              <Select value={form.insuranceId} onChange={(e) => set('insuranceId', e.target.value)}>
                <option value="">— None / Self-pay —</option>
                {patientIns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.payer}{i.planName ? ` — ${i.planName}` : ''}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.title.trim()}>
            {existingCase ? 'Save Changes' : 'Create Case'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
