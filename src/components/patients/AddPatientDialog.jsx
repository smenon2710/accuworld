import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import { COVERAGE_STATUS, PAYERS } from '@/data/seed'

const EMPTY = {
  firstName: '', lastName: '', phone: '', dateOfBirth: '', primaryCondition: '', status: 'active',
  email: '', address: '', notes: '',
}

export default function AddPatientDialog({ open, onOpenChange, onCreated }) {
  const { addPatient, addInsurance } = useApp()
  const [form, setForm] = useState(EMPTY)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.phone) return

    const id = `p${Date.now()}`
    const patient = { ...form, id }
    addPatient(patient)

    // Create blank insurance profile
    addInsurance({
      id: `ins${Date.now()}`,
      patientId: id,
      payer: PAYERS.OTHER,
      planName: '',
      memberId: '',
      groupNumber: '',
      coverageStatus: COVERAGE_STATUS.UNVERIFIED,
      acupunctureBenefit: 'unknown',
      visitsAuthorized: 0,
      visitsUsed: 0,
      copay: 0,
      coinsurancePct: 0,
      deductibleMet: false,
      authReferenceNumber: '',
      lastVerifiedDate: null,
      reverifyByDate: null,
      verificationNotes: '',
    })

    setForm(EMPTY)
    onOpenChange(false)
    onCreated?.(id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name *</Label>
              <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name *</Label>
              <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Primary Condition</Label>
            <Input
              value={form.primaryCondition}
              onChange={(e) => set('primaryCondition', e.target.value)}
              placeholder="e.g. Lower back pain"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Patient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
