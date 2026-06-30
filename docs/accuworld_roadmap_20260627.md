# AccuWorld — Concrete Build Roadmap
> **Created:** 2026-06-27 · **Last updated:** 2026-06-29

**Synthesized from:** Post-feedback pivot (practitioner session, June 26 2026) + Production transition blueprint  
**Practitioner:** Leonid Belenitsky, M.S., L.Ac. — Acupuncture & Karma Yoga Institute, Monroe TWP, NJ  
**Goal:** Win commitment from Leonid → convert prototype to a shippable, HIPAA-compliant SaaS product

---

## Strategic Position (Post-Feedback)

**Old pitch:** AccuWorld wins on the insurance dashboard.

**New pitch:** AccuWorld is the only acupuncture-native system that replaces WebPT ($160/mo EMR) + CollaborateMD (billing) + paper intake — in one purpose-built tool, built specifically for how acupuncturists actually work.

**What this means in practice:** Leonid currently runs his entire practice across 3 systems and a paper packet. AccuWorld collapses all of that into one. The insurance dashboard is still the daily-use differentiator, but the full patient lifecycle — from the first form a patient signs to the claim that gets paid — must live in AccuWorld.

---

## The Four Phases

```
Phase 0          Phase 1             Phase 2                 Phase 3
(1–2 weeks)      (4–6 weeks)         (3–4 months)            (2–3 months)
Prototype Fix → Workflow Complete → Production-Ready EMR → Billing & Insurance Live

   ↑                  ↑                    ↑                      ↑
Next demo      Commitment demo        Beta launch            General availability
```

---

## Phase 0 — Prototype Fixes ✅ COMPLETE (2026-06-28)
**Duration:** 1–2 weeks  
**Goal:** Eliminate the credibility gaps that a practitioner will immediately spot. These are quick, high-signal fixes.

### 0.1 Fix CPT Codes in Billing ✅
The current billing module has wrong or placeholder procedure codes. Replace with the 5 codes Leonid actually uses:

| CPT Code | Description | Default Rate |
|----------|-------------|--------------|
| 97810 | Initial acupuncture without E-Stim (first 15 min) | $75 |
| 97811 | Acupuncture additional without E-Stim (each add'l 15 min) | $70 |
| 97813 | Initial acupuncture with E-Stim (first 15 min) | $90 |
| 97814 | Acupuncture with E-Stim (each add'l 15 min) | $80 |
| 20999 | Unlisted musculoskeletal procedure | Manual entry |

Add a **Units** field to each billing line (1 unit = 15 min). Typical visit = 3 units (45 min). Total charge auto-calculates. Remove all PT-specific codes from defaults.

### 0.2 Add Missing Patient Demographic Fields ✅
Fields the practitioner considers essential that are currently missing from Add Patient:

- Title (Mr. / Mrs. / Ms. / Dr.)
- Middle name, Suffix, Preferred name
- Referral source (how they found the clinic)
- Occupation + Employer
- Emergency contact + Relation + Phone
- Language preference
- "In collections" flag (boolean)

On the patient insurance section, promote **Subscriber ID** and **Group Number** to be the two most prominent fields — these are what the practitioner checks first when a patient presents their card.

### 0.3 Update Seed Data to Match Reality ✅
- Replace generic payer names with NJ-relevant insurers: Horizon BCBS, Aetna, United, Cigna
- Update billing seed invoices to use CPT codes 97810/97811/97813/97814
- Update visit rates to match actual rates ($75–$90 initial, $70–$80 additional)
- Medicare patients: flag as "acupuncture covered for chronic low back pain only, 12 sessions/year"
- Medicaid patients: flag as "never covers acupuncture — self-pay"

### 0.4 Add Note Draft / Signed State ✅
Daily notes need a two-state lifecycle that mirrors how WebPT works:

- **Draft** (default): Note is editable. No billing entry generated.
- **Signed**: Practitioner clicks "Sign Note." Note locks (no further edits). Billing entry created. Signed badge appears in visit list.
- **Dashboard flag:** Count of unsigned notes with amber badge ("3 notes unsigned — claims pending")
- In the prototype, "Signed" does not need to transmit to a real clearinghouse — it just marks the billing entry as ready.

### 0.5 Separate TCM Terms from Insurance-Facing Fields ✅
Add a clear visual separator in the chart form:

- **Insurance-facing section** (top): Chief Complaint (Western language), ICD-10 Diagnosis (new field — see Phase 1), CPT codes, Units. Label this: *"Submitted to insurance — use Western medical terms only."*
- **Clinical notes section** (below): Pulse, tongue, acupoints, TCM pattern, treatment strategy. Label this: *"Internal clinical record — not submitted to insurance."*
- Add an inline warning if a practitioner types known TCM terms (qi, yin, yang, stagnation, deficiency) in the insurance-facing Chief Complaint field.

**Phase 0 done when:** `npm run build` passes, demo walkthrough takes under 5 minutes, no CPT code or terminology errors visible.

> ✅ **Phase 0 completed 2026-06-28.** All 5 tasks shipped. `npm run build` passes.

---

## Phase 1 — Workflow Completeness (Commitment Demo) 🔄 IN PROGRESS
**Duration:** 4–6 weeks  
**Goal:** Build the features that make AccuWorld a complete clinical workflow, not just a dashboard. This is the demo that gets Leonid to sign.

### 1.1 Patient Intake Form (Digital 5-Page Packet) ✅
This is the single most important missing feature. Leonid's entire patient onboarding starts here. Without it, he cannot replace paper.

Build a multi-step intake flow launched from "Add Patient." Runs on a clinic device. Five screens:

**Screen 1 — HIPAA Notice + Patient Confidential Information**
- Display HIPAA compliance notice (use text from his actual form)
- Fields: Full name (print), address, city, state, zip, primary phone, email, date of birth, age, sex (M/F), marital status (S/M/D/W), referral source, occupation, employer, emergency contact + relation + phone
- Patient must sign (typed name accepted) before advancing — enforce in UI, cannot skip

**Screen 2 — Medical History**
- Chief complaint (plain text, Western language) + date of onset
- Surgeries table: procedure name + approximate date (add-row)
- Traumatic injuries: car accident / sporting / other + dates (add-row)
- Serious illnesses + dates including childhood illnesses (free text)
- Current prescription medications (add-row)
- Family history checkboxes (15 conditions): Asthma, Heart Disease, Diabetes, Allergies, Epilepsy, Kidney Disease, Bleeding Disorders, Hepatitis, Cancer, Autoimmune Disease, High Blood Pressure, Migraine, Arthritis, Stroke, Mental Illness
- Body temp/perspiration multi-select: Hot / Cold / Chills / Sense of Heat / Hot Flashes / Night Sweats / Spontaneous Sweating
- Emotions: Mood swings, Anxiety, Depression, Irritability, History of abuse, Stress level (0–10 slider)

**Screen 3 — Pain Body Diagram**
- Interactive SVG silhouette (front view + back view side by side)
- Patient clicks/taps to drop pain markers (filled red circle)
- Second mode: "radiating pain" (dashed circle, different color)
- Clear LEFT / RIGHT labels on each view — many patients (elderly, non-English speakers) get confused without this
- Clean, uncluttered rendering — no anatomical labels required; outline silhouette only
- Patient signature + date at bottom

**Screen 4 — Acupuncture Informed Consent to Treat**
- Display full consent text (from his paper form: treatment methods, known risks, herbs disclosure, results not guaranteed, confidentiality)
- Practitioner countersignature stored once at clinic setup (not re-entered each time)
- Patient signature + date — required, cannot skip

**Screen 5 — Legal Agreements + Financial Policy + Assignment of Benefits**
- Financial Policy Agreement: display key clauses (patient responsibility to verify coverage, copay due before treatment, one body area per in-network session, Medicare/Medicaid policies)
- Arbitration Agreement: display full text (6 articles from his form)
- Assignment of Benefits: display and collect signature
- All require patient signature + date + initials where specified

**After completion:** All intake data flows into the patient record. Practitioner reviews before finalizing. Signatures stored as timestamped records. Chief complaint from Screen 2 pre-fills the chart form's chief complaint field.

> ✅ **1.1 completed 2026-06-28.** Route `/intake/:patientId` ships with all 5 screens and signature gates. Pain diagram uses interactive SVG. Demographics sync to patient record on completion. Entry points: PatientDetail header button + AddPatientDialog "Add & Start Intake →". Typed-name signatures (production will use HelloSign — Phase 2).

### 1.2 Case Management + ICD-10 Western Diagnosis ✅
Leonid organizes all treatment around Cases (e.g., "Neck Pain 2026"). This is how claims are filed. AccuWorld must adopt this model.

**Case data structure:**
- Case title (e.g., "Low Back Pain 2026")
- Primary ICD-10 code(s) — searchable from curated acupuncture list (below)
- Date opened
- Status: Active / Closed
- Linked insurance (which plan covers this case)
- Cause of injury: None (default) / Car accident at fault / Car accident no-fault / Work injury / Surgical related. Must default to None — clicking any injury-related option affects claim processing.

**Patient detail view:** Show Cases as the primary organizing structure. Each case expands to show its linked daily notes/visits. "Add Visit" always requires selecting or creating a Case first.

**ICD-10 curated list for acupuncture (searchable dropdown):**
- M54.50 — Low back pain, unspecified
- M54.51 — Vertebrogenic low back pain
- M54.2 — Cervicalgia (neck pain)
- M54.3 — Sciatica
- M54.4 — Lumbago with sciatica
- M25.511 / M25.512 — Pain in shoulder (right/left)
- M25.561 / M25.562 — Pain in knee (right/left)
- M79.1 — Myalgia
- G43.909 — Migraine, unspecified
- R51.9 — Headache, unspecified
- G89.29 — Other chronic pain
- G47.00 — Insomnia, unspecified
- F41.1 — Generalized anxiety disorder
- N94.6 — Dysmenorrhea, unspecified
- M79.3 — Panniculitis
- Free-text + manual code entry as fallback

**Chart form update:** Add "ICD-10 Diagnosis" field at the top of the chart (pulls from the linked Case, editable). This is the Western diagnosis that goes on the claim.

> ✅ **1.2 completed 2026-06-29.** `ICD10_CODES` (17 codes) and `CAUSE_OF_INJURY` constants in `seed.js`. `seedCases` (8 cases) with `caseId` on all 14 seed visits. `cases` state + `addCase`/`updateCase` in AppContext (persisted to `aw_cases`). `CaseDialog` component with ICD-10 picker and cause-of-injury warning. PatientDetail Cases card between Insurance and Treatment Plan. Visits chart form: case selector auto-fills Western Diagnosis from linked ICD-10. Demo walkthrough in Help drawer updated to 7 steps.

### 1.3 Attendance Sheet (Per-Visit Patient Sign-Off)
Insurance auditors (especially Medicare) require a per-visit attendance record proving the patient was physically present. Leonid carries a paper sheet.

- Each appointment check-in captures: date + patient typed name (acknowledgment)
- Visit list shows signed / unsigned indicator per visit
- "Print Attendance Sheet" button on patient detail: generates a dated table of all visits with sign-off status — PDF-ready layout

### 1.4 Demo Walkthrough (New Version)
The commitment demo must follow Leonid's actual patient journey, start to finish, in under 5 minutes:

1. New patient calls → "Add Patient" → launch intake form → patient fills 5 screens on clinic device → signs all sections
2. Practitioner opens dashboard → sees today's schedule, insurance flags, unsigned notes count
3. Patient arrives → run simulated eligibility check → open or create Case (select ICD-10 code)
4. Treatment session → open chart → chief complaint auto-filled from intake → TCM notes (internal) → Western diagnosis from Case → acupoints
5. Click "Sign Note" → note locks → billing entry created with CPT codes + units
6. Mark copay collected → invoice closed
7. Attendance sheet signed → visit complete

**Phase 1 done when:** Full walkthrough above runs without dead ends, all features have seed data, `npm run build` passes.

---

## Phase 2 — Production-Ready EMR
**Duration:** 3–4 months  
**Goal:** Convert the SPA prototype into a HIPAA-compliant, multi-tenant backend. This is what makes AccuWorld legally operable as a commercial product.

### 2.1 HIPAA Compliance & BAA Execution
Every vendor that touches PHI must sign a Business Associate Agreement (BAA).

**Required BAAs and minimum tiers:**
| Vendor | Use | BAA Tier |
|--------|-----|----------|
| Supabase | Database + Auth | Team Plan ($25/mo/project minimum) |
| AWS (alternative) | RDS + S3 + Cognito | Standard AWS — BAA available via console |
| Vercel | Frontend hosting only — no PHI in transit here | Not required if frontend is stateless |
| SendGrid | Appointment reminders (non-PHI text only) | HIPAA Silver/Gold ($90+/mo) |
| Twilio | SMS reminders (non-PHI text only) | Enterprise BAA required |
| E-signature provider | DocuSign HIPAA tier or HelloSign with BAA | See 2.5 |

**Rule for SMS/email reminders:** Never include condition, treatment type, or clinical details. Only operational info (date, time, clinic name). Example: *"Hi Maria — appointment at AccuWorld Monday June 30 at 2pm. Reply C to confirm."*

### 2.2 Multi-Tenant Database Architecture
AccuWorld will serve multiple independent clinics. Clinic A must never see Clinic B's data.

**Schema rule:** Every table that contains PHI gets a `clinic_id` (UUID) column.

**PostgreSQL Row-Level Security (RLS):**
```sql
-- Enable RLS on every PHI table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy: user can only see rows for their clinic
CREATE POLICY clinic_isolation ON patients
  FOR ALL
  USING (clinic_id = auth.jwt() ->> 'clinic_id');
```

Apply the same pattern to: patients, appointments, visits, cases, invoices, insurance_profiles, intake_forms, audit_logs.

**Database migrations:** Use a migration tool (Supabase migrations or Flyway). Every schema change is a versioned migration file, never a manual ALTER run in production.

**Backups:** Point-in-Time Recovery (PITR) with minimum 35 days retention. Encrypted at rest (AES-256). Test restore quarterly.

### 2.3 Authentication & Session Security
- **MFA required:** TOTP (Google Authenticator / Authy) enforced for all accounts. SMS 2FA as fallback.
- **Session timeout:** Auto-logout after 15 minutes of inactivity. HIPAA hard requirement.
- **Role enforcement at database level:** Front Office role must not be able to query SOAP note content. Enforce via RLS, not just UI guards.
- **Password policy:** Minimum 12 characters, bcrypt hashing, breach detection (Have I Been Pwned API check on registration).

### 2.4 Immutable Audit Logging
Required by HIPAA. Every access to PHI must be logged and the log must be tamper-proof.

**`system_audit_logs` table:**
```
id              UUID
clinic_id       UUID
user_id         UUID
action          TEXT   -- 'view_patient', 'edit_chart', 'export_record', etc.
resource_type   TEXT   -- 'patient', 'visit', 'invoice'
resource_id     UUID
ip_address      INET
performed_at    TIMESTAMPTZ
```

**Permissions:** INSERT only. No UPDATE, no DELETE — even for admins. Write via DB trigger or API middleware, never from client code.

**What to log:** patient record views, chart opens, chart edits, note sign-offs, invoice access, any data export.

### 2.5 Immutable SOAP Notes + Addenda System
Signed clinical charts are legal documents. Once signed, the original must never be altered.

**`visits` table:** Add `status` column: `draft | locked`. Add `locked_at` timestamp and `locked_hash` (SHA-256 of note content at time of signing).

**Addenda table (`visit_addenda`):** If a locked note requires a correction, an addendum is created as a separate linked record — never editing the original row. Addendum displays below the original note with its own signature and timestamp.

**UI behavior on locked note:** Fields become read-only. "Add Addendum" button appears. Addendum text area opens below; saving it creates the addendum record and re-locks.

### 2.6 Electronic Signature (Production Grade)
The intake form signatures captured in Phase 1 need to be legally defensible in production.

**Options (ranked by ease for solo dev):**
1. **HelloSign API (Dropbox Sign) with BAA** — straightforward REST API, per-signature pricing (~$0.10–$0.30 each), BAA available
2. **DocuSign HIPAA tier** — more expensive but highest legal recognition
3. **Custom canvas signature stored as encrypted blob** — feasible but increases your compliance burden

For the prototype → beta transition, HelloSign is the practical choice. Store the signed document as a PDF attachment on the patient record (encrypted at rest in S3/Supabase Storage).

### 2.7 Data Portability
Practitioners have a legal right to their patient data. If they leave AccuWorld, data export is mandatory.

**Build a "Export All Data" function** that produces:
- One PDF per patient containing: demographics, intake form, all signed documents, all SOAP notes (locked + addenda), all invoices
- One CSV: patient list with contact info and insurance summary
- Timeline: must be deliverable within 30 days of request (aim for instant)

**Phase 2 done when:** App runs on Supabase Team with RLS enforced, MFA works, audit log captures all actions, signed notes are locked, BAAs signed with all PHI-touching vendors.

---

## Phase 3 — Billing & Insurance Live
**Duration:** 2–3 months  
**Goal:** Replace the mock billing with real claim submission and real eligibility checking. This is when AccuWorld becomes operationally complete.

### 3.1 Clearinghouse Integration
**Recommended: Claim.MD** — developer-friendly, cost-effective, solid support, popular with solo medical developers. Avoid Change Healthcare (complex onboarding) and Waystar (enterprise pricing) at this stage.

**Three EDI flows to implement:**

**Flow 1 — Real-Time Eligibility Check (EDI 270/271)**
- User enters patient insurance (payer, subscriber ID, group number, DOB)
- App calls Claim.MD eligibility API
- Claim.MD queries the payer (Horizon, Aetna, United, etc.) in real time
- Response parsed into: coverage status, acupuncture visits allowed, visits used, copay, deductible met/unmet
- Result populates the insurance dashboard — replaces the current mock `mockEligibilityResult()` with a real API call

**Flow 2 — Claim Submission (EDI 837P)**
- Triggered when a note is signed
- App compiles: patient demographics, provider NPI, ICD-10 diagnosis (from Case), CPT codes + units (from note), date of service, payer info
- Submits EDI 837P file to Claim.MD
- Claim.MD validates and routes to payer
- Claim status tracked: Submitted → Accepted / Rejected

**Flow 3 — Electronic Remittance Advice (EDI 835 / ERA)**
- When payer sends payment to Claim.MD, ERA is transmitted back
- App receives: amount paid, adjustment codes, denial reasons
- Invoice auto-updated: "Paid by Insurance" with ERA amount, remaining patient responsibility calculated

**NJ Payer IDs to pre-configure:**
| Payer | Payer ID |
|-------|----------|
| Horizon BCBS NJ | 22099 |
| Aetna | 60054 |
| United Healthcare | 87726 |
| Cigna | 62308 |
| Medicare Part B (NJ) | 12501 |

### 3.2 Stripe Integration for Patient Payments
Stripe does not sign BAAs. **Do not pass PHI to Stripe.** The safe pattern:

- In Stripe: create a Customer with an anonymous ID only (e.g., `cus_abc123`)
- In AccuWorld database: map `patient_id → stripe_customer_id`
- Invoice metadata passed to Stripe: invoice number + amount only. No patient name, no diagnosis, no treatment type
- **Stripe Terminal:** Support physical card reader for in-office copay collection
- **Manual methods:** Cash, check, Zelle, Venmo — record in AccuWorld, no Stripe transaction needed

### 3.3 Subscription & SaaS Billing
AccuWorld sells subscriptions to clinics, not to patients.

**Pricing model (suggested, based on competitive landscape):**
- Solo practitioner: $79/month (vs. WebPT $160 + CollaborateMD separate)
- Introductory: $49/month for first 12 months for early adopters

**Stripe Billing for subscriptions:** Use Stripe's subscription product — it handles metering, invoicing, failed payments, and cancellation without custom code. Do not build your own subscription engine.

**Subscription metadata in Stripe:** Clinic name + plan tier only. No patient counts or clinical data.

**Phase 3 done when:** Leonid can run a real eligibility check on a real patient card, submit a real claim through Claim.MD, and receive an ERA back — all from within AccuWorld. Patient copay collected via Stripe Terminal or manual recording.

---

## Decision Points

These are the key decisions to resolve before starting each phase.

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Backend hosting | Supabase Team vs. AWS | Supabase Team — faster to set up, BAA available, RLS built-in |
| Clearinghouse | Claim.MD vs. Eligible vs. Waystar | Claim.MD — solo-dev friendly, lower volume fees |
| E-signature | HelloSign vs. DocuSign vs. custom canvas | HelloSign (Dropbox Sign) — BAA available, REST API |
| SMS reminders | Twilio vs. no SMS | Twilio — but only operational messages, never clinical content |
| Stripe | Standard Stripe account | Yes — with tokenization pattern (no PHI in Stripe) |
| NPI validation | Manual vs. NPPES API | NPPES API is free and public — validate on patient add |

---

## What to Build vs. What to Skip

### Build
- Patient intake (5-screen digital packet with e-signatures)
- Case management + ICD-10 diagnosis
- Note sign/lock lifecycle
- Correct CPT codes (97810/11/13/14)
- Attendance sheet
- Real eligibility check (Phase 3)
- Real claim submission (Phase 3)
- Immutable audit log (Phase 2)
- Data export / portability (Phase 2)

### Skip (not needed for solo acupuncturist)
- Physician/referral manager — acupuncture is direct access, no referral required
- Contact manager — for large multi-provider offices
- Gender identity / pronouns fields — keep Sex (M/F) for insurance compliance only
- Supply CPT codes (A4xxx, 99070) — PT wound-care codes, irrelevant for acupuncture
- Outcomes tracking / productivity reports — build after Phase 3
- Patient portal / patient logins — confirmed by practitioner: "I don't let patients in"
- Telehealth — out of scope
- Inventory / supplies management — out of scope

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| HIPAA audit before BAA signed | Low (prototype phase) | Very high | Sign BAAs before any real patient data enters the system |
| Clearinghouse onboarding delay (Claim.MD) | Medium | High | Start onboarding in Phase 1 — it takes 4–6 weeks |
| Patient drops/breaks clinic device during intake | Medium | Low | Use a ruggedized stand or wall-mount. Consider stylus-optional UX |
| Insurance rejects claim due to TCM terms | High (if not fixed) | High | Phase 0 fix — separate TCM from insurance-facing fields immediately |
| Stripe BAA gap | Certain — Stripe won't sign | Medium | Tokenization pattern — no PHI in Stripe metadata |
| Data breach before cyber insurance | Low (small user base) | Very high | Get cyber liability insurance before Phase 2 goes live |

---

## Insurance Requirements (Cyber Liability & E&O)
Get both policies before Phase 2 goes live. Do not wait until launch.

1. **Cyber Liability Insurance** — Covers breach notification costs, regulatory fines, ransom. ~$500–$1,500/year for a solo developer / small LLC.
2. **Technology Errors & Omissions (E&O)** — Covers software failures that cause billing errors or lost charts. ~$800–$2,000/year.

---

## Summary: What Gets Built, When, and Why

| Phase | Status | What | Why It Matters |
|-------|--------|------|----------------|
| 0 | ✅ Done (2026-06-28) | Fix CPT codes, demographics, note state, terminology separation | Credibility for next practitioner meeting |
| 1 | 🔄 In progress | Intake form ✅, case management + ICD-10 ✅, attendance sheet, demo walkthrough | Complete the workflow; earn the commitment |
| 2 | ⏳ Not started | HIPAA backend, RLS, MFA, audit log, immutable notes, e-signature | Legal to hold real patient data |
| 3 | ⏳ Not started | Real eligibility (Claim.MD), real claims (837P), Stripe, subscriptions | Revenue-generating product |

**The commitment from Leonid comes at end of Phase 1.** Phases 2 and 3 are the production build that follows that commitment.

---

*Document created: 2026-06-27 · Last updated: 2026-06-29*

---

*Document created: 2026-06-28 | Synthesized from post_feedback_pivot_claude.md (practitioner session) + agy_production_blueprint.md (production architecture)*
