import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function EditPatientDialog({ open, onOpenChange, patient, onSave }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    if (patient) setForm({ ...patient, emergencyContact: patient.emergencyContact ?? { name: '', relation: '', phone: '' } })
  }, [patient])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function setEC(field, value) {
    setForm((f) => ({ ...f, emergencyContact: { ...f.emergencyContact, [field]: value } }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 p-6 pt-4 max-h-[78vh] overflow-y-auto">

          {/* Name */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Name</p>
            <div className="grid grid-cols-6 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Select value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}>
                  <option value="">—</option>
                  {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'].map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">First Name</Label>
                <Input value={form.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Middle</Label>
                <Input value={form.middleName ?? ''} onChange={(e) => set('middleName', e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Last Name</Label>
                <Input value={form.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Suffix</Label>
                <Input value={form.suffix ?? ''} onChange={(e) => set('suffix', e.target.value)} placeholder="Jr., Sr., II…" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Preferred Name</Label>
                <Input value={form.preferredName ?? ''} onChange={(e) => set('preferredName', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Contact & Demographics */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Contact & Demographics</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date of Birth</Label>
                <Input type="date" value={form.dateOfBirth ?? ''} onChange={(e) => set('dateOfBirth', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sex</Label>
                <Select value={form.sex ?? ''} onChange={(e) => set('sex', e.target.value)}>
                  <option value="">—</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Marital Status</Label>
                <Select value={form.maritalStatus ?? ''} onChange={(e) => set('maritalStatus', e.target.value)}>
                  <option value="">—</option>
                  {['Single', 'Married', 'Divorced', 'Widowed'].map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Language</Label>
                <Input value={form.languagePreference ?? ''} onChange={(e) => set('languagePreference', e.target.value)} placeholder="English" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <Label className="text-xs">Address</Label>
              <Input value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>

          {/* Clinical */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Clinical</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Primary Condition</Label>
                <Input value={form.primaryCondition ?? ''} onChange={(e) => set('primaryCondition', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={form.status ?? 'active'} onChange={(e) => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Allergies</Label>
                <Input value={form.allergies ?? ''} onChange={(e) => set('allergies', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Medications</Label>
                <Input value={form.medications ?? ''} onChange={(e) => set('medications', e.target.value)} />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <Label className="text-xs">Medical History</Label>
              <Textarea value={form.medicalHistory ?? ''} onChange={(e) => set('medicalHistory', e.target.value)} rows={3} />
            </div>
          </div>

          {/* Practice Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Practice Info</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Referral Source</Label>
                <Input value={form.referralSource ?? ''} onChange={(e) => set('referralSource', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Occupation</Label>
                <Input value={form.occupation ?? ''} onChange={(e) => set('occupation', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Employer</Label>
                <Input value={form.employer ?? ''} onChange={(e) => set('employer', e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="inCollections"
                  checked={!!form.inCollections}
                  onChange={(e) => set('inCollections', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="inCollections" className="text-xs">In collections</Label>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Emergency Contact</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={form.emergencyContact?.name ?? ''} onChange={(e) => setEC('name', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Relation</Label>
                <Input value={form.emergencyContact?.relation ?? ''} onChange={(e) => setEC('relation', e.target.value)} placeholder="Spouse, Parent…" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input value={form.emergencyContact?.phone ?? ''} onChange={(e) => setEC('phone', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</Label>
            <Textarea value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
