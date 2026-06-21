# PRD — Acupuncture Practice Assistant (Unified Prototype)

## 1. Product Vision

A lightweight, single-tenant practice management system built for solo acupuncturists. The core insight: every existing platform — Jane App ($54–99/mo), Unified Practice ($49–152/mo), AcuBliss, and even the free-tier Carepatron — treats insurance as a billing module buried behind a visit. None of them surface pre-visit benefit verification as a daily workflow. This app does. Everything else (TCM charting, scheduling, billing) is solid and expected — the insurance verification tracker is the only thing in the market that works this way.

---

## 2. Target User

**Primary:** A solo licensed acupuncturist running an independent practice.

Typical practice profile that shapes every decision:
- Treats one patient at a time, ~45-minute sessions (30 min hands-on + needles/e-stim, 15 min rest)
- Books appointments by text or phone — no dedicated online scheduler today
- Runs predominantly on insurance; in-network with a mix of regional BCBS, Aetna, UnitedHealthcare, and similar plans
- Some plans not accepted (e.g., HMO-only plans, certain state or auto-injury programs)
- Self-pay option at a flat rate (typically $60–120/session by complexity)
- Common conditions treated: lower back pain, neck/cervical tension, sciatica, plantar fasciitis, disk herniation, piriformis syndrome, tension headache, fibromyalgia
- Currently paying $150–300/month for software that doesn't fit the solo-practice workflow

**Broader market:** Independent acupuncture clinic, 50–500 active patients, 1–3 practitioners, limited technical staff, cost-conscious.

---

## 3. Problem Statement

Common frustrations with existing practice management software:
- Complex interfaces requiring significant training time
- Excessive administrative workflows unrelated to clinical care
- Insurance verification handled outside the tool entirely — spreadsheets, sticky notes, phone calls — even when the platform has a billing module
- Generic SOAP note documentation that ignores TCM (no pulse, tongue, meridian fields) — though leading competitors like Jane App and Unified Practice now include basic TCM templates
- Appointment management inefficiencies
- Poor patient follow-up and visit-count tracking
- High recurring costs for features a solo practitioner doesn't use ($49–152/month for Jane App and Unified Practice)
- Generic platforms like Carepatron are free but have zero acupuncture-specific clinical workflows

The single biggest gap across all four major competitors: **not one of them shows the practitioner, on their daily dashboard, which patients need insurance re-verification, which plans are running out of authorized visits, and which new patients are unverified.** That information exists somewhere in their systems — it's just not actionable without digging.

---

## 4. Product Goals

1. **Reduce administrative workload** — dashboard answers "who am I seeing today and what needs attention?" in under 30 seconds
2. **Surface insurance verification** as a first-class daily workflow, not an afterthought
3. **Speed up TCM charting** — native pulse/tongue/meridian/point fields cut documentation time in half vs. generic EHRs
4. **Support patient retention** through structured follow-up tracking and treatment plans
5. **Deliver a modern, minimal interface** that requires no training — simpler and faster than the multi-module tools solo practitioners are currently paying for

---

## 5. The Demo Wedge (why practitioners switch)

Three reasons, ordered by strength:

1. **Insurance verification as a daily workflow — the only true differentiator.** None of the four major competitors (Jane App, Unified Practice, AcuBliss, Carepatron) surface pre-visit benefit verification status on a dashboard. They all have claims submission buried in billing. This app shows — every morning — who needs re-verification, whose visits are running low, and who is still unverified. Competitors charge ~$3.95 per eligibility check (Unified Practice). **This is the feature the demo wins on.**

2. **Simplicity for solo practitioners.** Jane App is built for high-volume multi-location clinics. Unified Practice has 15+ modules. Both require onboarding and training. This app has one user, one workflow, and every common action completable in 3 clicks. The UI should *feel* lean — because it is.

3. **Price — against the acupuncture-specific tools.** Jane App ($54–99/mo) and Unified Practice ($49–152/mo) are expensive for a solo practitioner who needs 4 of their 15 features. Price is NOT the argument against Carepatron (which is free) — against Carepatron, TCM-specificity and the insurance workflow are the argument.

> If a screen doesn't directly serve the insurance verification workflow or make the daily clinical routine faster, it is probably out of scope for the prototype.

---

## 6. Competitive Landscape

| | Jane App | Unified Practice | AcuBliss | Carepatron | **This App** |
|---|---|---|---|---|---|
| **Price** | $54–99/mo | $49–152/mo | Undisclosed | Free–$19.50/mo | ~$0 prototype |
| **Acupuncture-specific** | Yes | Yes | Yes | No — generic | Yes |
| **TCM charting (pulse/tongue)** | Yes | Yes (iPad) | Generic SOAP | No | Yes |
| **Insurance verification dashboard** | No — claims only | No — claims only | No — claims only | No | **Yes — unique** |
| **AI Scribe** | Yes (acupuncture-trained) | No | Yes | Yes (free tier) | No — template scaffold |
| **Patient portal / online booking** | Yes | Yes | Yes | Yes | No — post-prototype |
| **Insurance clearinghouse** | Yes | Yes | Yes | Yes | No |
| **Automated SMS reminders** | Yes | Yes | Unknown | Yes | No |
| **Telehealth** | Yes | Yes | No | Yes | No |
| **Solo-practitioner simplicity** | No (multi-location focus) | No (enterprise) | Partial | Partial | **Yes** |

**How to position in the demo:**

- vs. **Jane App / Unified Practice:** "You're paying $50–100/month for software built for multi-location clinics. You use 4 of their 15 features. We give you those 4 — plus the one thing neither of them has: an insurance tracker that tells you every morning whose benefits need attention."
- vs. **AcuBliss:** "Similar focus, similar audience — but insurance verification is still buried in billing. Ours is the first thing you see every day."
- vs. **Carepatron:** "Carepatron is free and great for generic health practices. It has no TCM charting, no insurance verification workflow, and no understanding of how acupuncture billing actually works. Free isn't cheaper if you're still doing benefit verification on a spreadsheet."

---

## 7. Non-Goals (Prototype)

The prototype must NOT include:
- Login/accounts, authentication, roles, or multi-user support
- Multi-clinic or multi-tenant infrastructure
- Real insurance/clearinghouse integrations or claims processing
- Real PHI or HIPAA-compliant storage
- Telehealth, messaging system, inventory management, payroll, or accounting
- Complex role management or patient portal (deferred to post-prototype)
- Enterprise reporting

> These are deferred to a paid production phase, not built now. The commitment to build pays for them.

---

## 8. Data Model (6 Entities)

> **Prototype data layer:** All data lives in `src/data/seed.js` as seeded in-memory JSON — no real database in the prototype. `InsuranceProfile` is a nested object inside each Patient record (not a separate DB table). `TreatmentPlan` is a flat object linked by patientId. The entity shapes below describe the data structure, not database tables. Production will normalize these into proper PostgreSQL tables (Supabase).

### Patient
**Required for demo:** `id`, `firstName`, `lastName`, `phone`, `dateOfBirth`, `primaryCondition`, `status` (`active | inactive`)

**Optional / Phase 2** (present in form UI but collapsed under "Additional Info"): `email`, `address`, `emergencyContact` (name + phone), `allergies`, `medications`, `medicalHistory`, `notes`

### InsuranceProfile _(one per patient — the centerpiece)_
- `id`, `patientId`
- `payer` (enum: `Horizon | Aetna | UnitedHealthcare | Empire_Anthem | Self_Pay | Other`) + `planName` (free text: "SEHBP", "Choice Plus", "OMNIA", etc.)
- `memberId`, `groupNumber`
- `coverageStatus`: `unverified | covered | not_covered | self_pay`
- `acupunctureBenefit`: `yes | no | unknown`
- `visitsAuthorized` (int), `visitsUsed` (int) → `visitsRemaining = authorized − used`
- `copay` (number), `coinsurancePct` (number), `deductibleMet` (boolean)
- `authReferenceNumber` (free text)
- `lastVerifiedDate` (date), `reverifyByDate` (date — default: +90 days OR Jan 1 next year, whichever sooner)
- `verificationNotes` (free text — what the rep said, call reference #)

### Appointment
- `id`, `patientId`, `datetime`, `durationMin` (options: 30/45/60/90; default 45)
- `type`: `initial_consultation | followup | wellness`
- `status`: `requested | confirmed | completed | no_show | cancelled`
- `source`: `text | phone | walk_in` (default `text`, reflecting how most solo practitioners receive booking requests)
- `note`

### Visit _(created from a completed appointment)_
- `id`, `appointmentId`, `patientId`, `date`
- `chiefComplaint` (free text), `painLevel` (1–10 slider)
- **TCM Assessment:**
  - `pulseRate` (dropdown: Normal, Rapid, Slow)
  - `pulseQuality` (dropdown: Floating, Deep, Wiry, Slippery, Thin, Choppy)
  - `tongueBody` (dropdown: Pale, Pink, Red, Purple, Dusky)
  - `tongueCoating` (dropdown: None, Thin White, Thick White, Yellow, Dry, Wet)
- `meridians` (free text or multi-select)
- `pointsUsed` (searchable badge input — e.g., LI4, LV3, ST36, GB34)
- `modalities` (multi-select: Acupuncture, E-Stim, Deep Tissue Massage, Tsubo/Vibration, Cupping, Moxibustion)
- `treatmentStrategy` (free text)
- `herbalFormula` (free text)
- `homeCareRecommendations` (free text)
- `soapNote` (free text — full SOAP write-up; AI can pre-populate a draft)

### TreatmentPlan
- `id`, `patientId`
- `primaryComplaint` (free text)
- `treatmentGoals` (free text)
- `frequencyRecommendation` (e.g., "2x/week for 4 weeks")
- `expectedSessions` (int)
- `progressNotes` (free text)
- `createdAt`, `updatedAt`

### Invoice / Superbill
- `id`, `patientId`, `visitId`, `date`
- `lineItems`: [{ description, cptCode, units, amount }]
- `defaultSelfPay`: $80
- `total`, `paid` (boolean), `paymentMethod`
- `isSuperbill` (boolean) — when true, render with CPT codes for patient to submit

> CPT scaffold (editable, not hardcoded — these are defaults only, not billing advice): 97810/97811 acupuncture, 97813/97814 electroacupuncture, 97140 manual therapy, 99202–99215 E/M.

---

## 9. Feature Requirements

> **Build philosophy:** Features are labeled below as **[Differentiator]**, **[Table Stakes]**, or **[Prototype-specific]**.
> - **Differentiator** — unique to this app; no competitor does this. Build deep, polish hard, linger here in the demo.
> - **Table Stakes** — every serious competitor has this. Build it correctly and quickly; do not gold-plate it. Its absence would disqualify the product; its presence does not win the demo.
> - **Prototype-specific** — exists only to make the demo flow cleanly; not a production feature.

---

### A. Dashboard `[Differentiator]`

The insurance flags panel is what makes this screen unique — no competitor dashboard shows this. Build it as the hero element. The rest (today's appointments, quick stats) is standard scaffolding.

Answers in one glance: *who am I seeing today, and what needs my attention?*

Display:
- Today's confirmed appointments (time, patient name, condition, insurance status badge)
- "Insurance Needs Attention" panel — stale-verification and low-visit patients
- Text booking inbox — `requested` appointments waiting for confirmation
- Patients needing follow-up (not seen in 30/60/90 days)
- Monthly revenue summary (total billed, paid vs. unpaid)
- Quick action buttons: New Patient, New Appointment, Mark Verified

**Success criteria:** Practitioner understands today's full workload within 30 seconds.

---

### B. Patient Management `[Table Stakes]`

All 4 competitors have this. Build it correctly; do not over-engineer it. The demo does not win here — it just cannot lose here either.

**Patient Profile fields (required for demo):** first name, last name, phone, date of birth, primary condition, status. Additional fields (email, address, emergency contact, allergies, medications, medical history, notes) appear in an "Additional Info" collapsible section — present but not required to complete the demo flow.

**Actions:** Create, Edit, Archive, Search (by name, phone, or condition).

**Patient detail view shows:**
- Insurance profile front and center (coverage status badge, visits remaining, next reverify date)
- Treatment plan summary
- Visit history (chronological)
- Upcoming appointments

**Success criteria:** Patient record found in under 10 seconds.

---

### C. Insurance Benefits Tracker `[Differentiator]` _(The Wedge)_

> **Scope boundary:** This is a MANUAL verification tracking workflow. The practitioner calls the insurance company and records the results here. No real insurance API, clearinghouse, or claims submission is connected. This feature is explicitly in scope; automated insurance processing is not.

State machine for `coverageStatus`:

| Status | Meaning | UI Behavior |
|--------|---------|-------------|
| `unverified` | New patient, benefits not checked | Prominent "Needs Verification" badge; surfaced on dashboard |
| `covered` | Acupuncture is a benefit | Shows visits remaining, copay, reverify date |
| `not_covered` | Plan excludes acupuncture (e.g., OMNIA, HMO) | Nudges toward $80 self-pay path |
| `self_pay` | No insurance or patient chose self-pay | Defaults to $80 |

**"Mark Verified" form** captures in <30 seconds:
- Acupuncture benefit (yes/no), visits authorized, visits used, copay, coinsurance %, deductible met, auth reference number, notes from the call, auto-sets reverify date (+90 days or Jan 1, whichever sooner)

**Automatic attention flags (surfaced on dashboard):**
1. **Stale verification** — `reverifyByDate` has passed, or status is still `unverified`
2. **Visits running low** — `visitsRemaining ≤ 2`

**Visit decrement:** Each completed appointment automatically decrements `visitsUsed` by 1.

**Dedicated Insurance view:** Filterable table showing every patient's coverage status — the "verification cockpit." Filter by: status, payer, flag type.

This feature is what makes the tool worth more than a spreadsheet. The demo should linger here.

---

### D. Appointment Scheduling `[Table Stakes]`

All 4 competitors have scheduling. The **text/phone booking inbox** is the one angle that is unique here — competitors push online portals; this app acknowledges how solo practitioners actually receive bookings. Keep the calendar simple; make the booking inbox work well.

**Views:** Day, Week, Month calendar.

**Actions:** Schedule, Reschedule, Cancel, Mark Complete, Mark No-Show.

**Appointment types:** Initial Consultation, Follow-up Treatment, Wellness Session.

**Duration options:** 30, 45, 60, 90 minutes (default 45).

**Rules:** Prevent double booking. Prevent appointments outside business hours.

**Text Booking Inbox:** `requested` appointments (source: text or phone) queue here for the practitioner to confirm or reschedule — reflecting how solo acupuncturists typically receive new booking requests.

**On "Mark Complete":** Prompts to open Visit/Chart form and decrements insurance visits remaining.

---

### E. Clinical Notes — TCM Charting `[Table Stakes]`

Native TCM charting (pulse, tongue, meridians, points) is now expected by practitioners — Jane App and Unified Practice both offer basic TCM templates. We must match this baseline and do it cleanly. It is not a differentiator on its own, but its absence would disqualify the product. Build it well; don't oversell it as unique.

**TCM Clinical Note Form:**

**Subjective:**
- Chief complaint (free text)
- Pain level slider (1–10)

**Objective — TCM Assessment Grids:**
- Pulse: Rate dropdown (Normal, Rapid, Slow) + Quality dropdown (Floating, Deep, Wiry, Slippery, Thin, Choppy)
- Tongue: Body color dropdown (Pale, Pink, Red, Purple, Dusky) + Coating dropdown (None, Thin White, Thick White, Yellow, Dry, Wet)

**Plan / Treatment:**
- Meridians (free text or tagged input)
- Acupuncture points — searchable dynamic badge input (e.g., type "LI" → shows LI4, LI11; type "ST" → shows ST36, ST40)
- Modalities — multi-select checkboxes (Acupuncture, E-Stim, Deep Tissue Massage, Tsubo/Vibration, Cupping, Moxibustion)
- Treatment strategy (free text)
- Herbal formula / prescriptions (free text)
- Home care recommendations (free text)

**Point Reference Lookup (frontend only — not AI):**
A "Suggest Points" button reads the chief complaint field and pre-populates standard acupuncture points using a local frontend mapping array (e.g., "lower back pain" → KD3, BL23, GV4, BL40). Suggestions appear as removable badge chips the practitioner accepts or edits. No external API, no AI model — implemented entirely as a static JS mapping object in the codebase.

> **AI scope rule (prototype):** No AI calls to external APIs. No conversational AI assistants. No autonomous generation. The SOAP note field may show a pre-structured template/draft, but the practitioner must review and explicitly save it — the system never saves AI-generated content automatically.

**Full SOAP note field** accepts free-text narrative; a lightweight template scaffold (S/O/A/P headers) may be pre-populated as a starting point. Practitioner edits and saves manually.

---

### F. Treatment Plans `[Table Stakes]`

All 4 competitors have treatment plans. Build it simply — a form with 5 fields, linked from the patient profile. Do not over-build this for the prototype.

Fields:
- Primary complaint
- Treatment goals
- Frequency recommendation (e.g., "2x/week for 4 weeks, then 1x/week")
- Expected number of sessions
- Progress tracking notes

Visible from patient detail view; tracks against completed visits automatically.

---

### G. Follow-Up Tracking `[Table Stakes]`

Jane App and Unified Practice have automated reminders. Our version is a manual queue on the dashboard (no automation in prototype). Build it as a lightweight panel — last-seen dates and a count. Do not build automated messaging.

Track and surface patients who may be falling through the cracks:
- Missed appointments (no-show)
- Patients not seen in 30 days
- Patients not seen in 60 days
- Patients not seen in 90 days

Dashboard shows a "Needs Follow-up" queue. Clicking a patient goes to their profile.

---

### H. Billing & Superbill `[Table Stakes]`

All 4 competitors have billing. Ours is intentionally simpler — no real payment processing, no clearinghouse. A printable superbill and a manual paid/unpaid toggle are sufficient for the prototype. Do not build beyond this.

**Invoice list** — all invoices with paid/unpaid status, total amounts, monthly revenue summary.

**Generate Invoice:** line items with CPT codes (editable defaults), amounts, payment method.

**Self-pay default:** $80; applied automatically when `coverageStatus` is `self_pay` or `not_covered`.

**"Generate Superbill"** — renders a printable/PDF-friendly view with:
- Patient name, DOB, date of service
- CPT codes + descriptions + amounts
- Diagnosis codes (editable)
- Provider NPI field
- Suitable for patient to submit to their own insurance

**Payment status:** Mark paid (with payment method: cash, check, card, Zelle).

---

### I. Demo Mode Banner `[Prototype-specific]`

A non-interactive banner or footer fixed at the bottom of the layout during the prototype indicates "Demo Mode — Seed Data Only." There is exactly one user in this app (the practitioner) — no patient-facing screens, no login, no roles. The banner can include quick-jump links to key demo screens (Dashboard → Insurance → Schedule → Chart) to support a smooth walkthrough during the client pitch.

---

## 10. Screens

| # | Screen | Purpose |
|---|--------|---------|
| 1 | **Dashboard** | Today's appointments, insurance flags, text booking inbox, follow-up queue, revenue summary |
| 2 | **Patients** | List (searchable/filterable) + Patient Detail (insurance, visits, treatment plan, appointments) |
| 3 | **Insurance** | Verification cockpit — all patients' coverage status in one filterable table |
| 4 | **Schedule** | Day/week/month calendar + text booking request inbox |
| 5 | **Visit / Chart** | TCM note form (opens from completed appointment) |
| 6 | **Treatment Plans** | Create and track treatment plans per patient |
| 7 | **Billing** | Invoice list + superbill generator |

---

## 11. Seed Data (Make It Feel Real)

Seed 8–10 fake patients spanning the typical situations a solo acupuncturist faces:

| Patient | Insurance | Status | Detail |
|---------|-----------|--------|--------|
| Maria R. | Horizon SEHBP | `covered` | 12 visits authorized, 10 used → **low-visit flag** |
| James T. | Aetna Choice POS | `covered` | $20 copay, 8 visits remaining |
| Sandra K. | UnitedHealthcare Choice Plus | `unverified` | → **needs-verification flag** |
| Robert M. | Horizon OMNIA | `not_covered` | → self-pay $80 nudge |
| Patricia L. | Self-pay | `self_pay` | $80 flat, no insurance |
| David C. | Horizon BCBS NJ Direct | `covered` | `reverifyByDate` is in the past → **stale flag** |
| Angela W. | Self-pay | `self_pay` | $80 flat |
| Kevin B. | Empire Blue Cross | `covered` | 6 visits authorized, 2 used, $30 copay |

Seed 3–4 `requested` text-booking appointments (status: `requested`) sitting in the inbox.

Conditions used: lower back pain, sciatica, neck/cervical tension, plantar fasciitis, tension headache, piriformis syndrome — representative of a typical solo acupuncture practice.

---

## 12. Build Order (Vertical Slices)

> **Why this order differs from AcuFlow's generic sequence:** AcuFlow CLAUDE.md suggests: Patient Management → Scheduling → SOAP Notes → Treatment Plans → Dashboard. This prototype departs intentionally — Insurance Benefits Tracker is at slot 3 because it is the demo's primary hook (the feature that wins the practitioner's commitment), and Dashboard follows immediately to surface insurance flags. Scheduling is deprioritized because most solo practitioners manage new bookings by text or phone — the booking inbox is sufficient for the demo without a full calendar.

1. **Scaffold** — routing + layout + seed data module. `npm run dev` passes, nav works.
2. **Patients** — list + detail CRUD with full profile fields.
3. **Insurance Benefits Tracker** — profile UI, state machine, "Mark Verified" form. *(Do this early — it's the wedge.)*
4. **Dashboard** — insurance flags panel + appointment list + follow-up queue, all driven by seed data.
5. **Schedule** — day/week view + text booking request inbox; completing an appointment decrements visits.
6. **Visit Charting** — TCM note form with pulse/tongue grids, badge point input, AI mock assistant.
7. **Treatment Plans** — create/edit/view linked to patient profile.
8. **Billing** — invoice list + superbill generation.
9. **Polish pass** — empty states, role-switcher toolbar, demo walkthrough flows cleanly end to end.

---

## 13. Tech Stack

### Prototype

| Layer | Choice |
|-------|--------|
| Frontend | Vite + React (SPA) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui — reuse from `src/components/ui`; do NOT reinvent buttons, dialogs, tables |
| Icons | Lucide React |
| Routing | React Router |
| Dates | date-fns |
| Charts | recharts — only if a chart is actually needed |
| Data layer | `src/data/seed.js` — seeded in-memory JSON; no external database, no Supabase |
| Deployment | Vercel (free tier) |

Do NOT add: Supabase, Firebase, any auth library, any state-management library beyond React built-ins + React Query (if data-fetching warrants it).

### Production (post-prototype only — not built now)

Next.js App Router, TypeScript (strict), shadcn/ui, Supabase (Auth + PostgreSQL + Row-Level Security) on a HIPAA-eligible paid plan with signed BAA, OpenAI API for approved AI features.

### UI Design Principles (from CLAUDE.md files)

- Color palette: soft greens, teals, and neutrals — clinical, trustworthy, clean (not sterile)
- Every common action completable within 3 clicks from the Dashboard
- Plain language labels; avoid healthcare jargon where possible
- Fast load — no heavy animations or large dependency bundles
- Minimize clicks; dense-but-readable information density over spacious empty screens

---

## 14. Success Metrics

**Demo success:**
The demo is considered successful if all 6 workflows run without friction:
1. Add patient → 2. Schedule appointment → 3. Complete appointment → 4. Open TCM chart → 5. Create treatment plan → 6. Generate superbill

**Post-launch targets (within 90 days):**
- Reduce SOAP/TCM documentation time by 50%
- Reduce scheduling effort by 30%
- Reduce missed follow-ups by 25%
- Reduce time-per-insurance-verification to under 60 seconds (vs. ~5–10 min today)
- Achieve daily active usage by practitioner

---

## 15. After the Demo (Not Now)

Once the practitioner commits, the production phase adds as paid work:
- Single-user email/password auth (Supabase Auth)
- HIPAA-eligible hosting with signed BAA (Supabase paid tier)
- Encrypted PHI storage, audit logging (patient creation, updates, note modifications, appointment changes)
- Row-level security
- Real data migration from current tool
- Patient portal (digital intake forms, appointment view, treatment plan view)

Do not build any of this during the prototype — it is what the commitment pays for.
