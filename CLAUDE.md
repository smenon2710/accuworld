# CLAUDE.md — Acupuncture Practice Assistant

Operating rules for every task on this repo. Read this before touching any code.

---

## What this is

A single-tenant practice management prototype for solo acupuncturists. One practitioner, one clinic, fake seed data. The goal is a working demo that wins a real commitment before any production investment.

The app's **one true differentiator**: insurance benefit verification as a first-class daily workflow. Every competitor — Jane App ($54–99/mo), Unified Practice ($49–152/mo), AcuBliss, and Carepatron (free) — buries insurance verification inside a billing module. None of them show the practitioner, on their morning dashboard, which patients need re-verification, whose visits are running low, or who is still unverified. This app does.

TCM charting (pulse, tongue, meridians, points) is required and expected — Jane App and Unified Practice both have TCM templates. Build it cleanly; do not position it as a differentiator.

Price is a supporting argument against Jane App and Unified Practice only. Carepatron is free — do not lead with price against it. Lead with TCM-specificity and the insurance workflow.

### Also evaluated (apps the prospect tried before acupuncture-specific tools)

| App | Primary focus | What they offer | What they lack for acupuncture |
|-----|--------------|-----------------|-------------------------------|
| **WebPT** | Physical therapy EMR | Outcomes tracking (200+ standardized measures), online patient self-scheduling, no-show alerts, 50+ productivity reports, voice-to-text charting | No TCM templates, no acupuncture-specific billing codes, PT-only workflows |
| **CollaborateMD** | Medical billing / RCM | Real-time insurance eligibility check (seconds), automated appointment reminders (SMS/email/phone), 125+ reporting dashboards, patient responsibility estimates, built-in clearinghouse | No clinical charting, no TCM support, billing-only tool |
| **DrChrono** | Multi-specialty EHR | Customizable note templates (acupuncture-aware), body diagram free-draw for needle placement, speech-to-text dictation, iPad-first mobile app, insurance eligibility verification | Generic templates need heavy customization, no dashboard-level insurance flags, patient portal adds complexity the solo practitioner doesn't need |

**Positioning note:** The prospect abandoned all three because none were built for acupuncture workflows. WebPT and CollaborateMD have no TCM charting at all. DrChrono supports acupuncture but its insurance verification is buried in the billing module — same weakness as Jane App. AccuWorld's insurance dashboard is still the wedge.

This is a demo prototype, not production. No real patient data. No real integrations. No real auth.

---

## The two rules that matter most

1. **One user.** There is exactly one user: the practitioner. No patient logins, no staff accounts, no roles, no multi-clinic.
2. **Fake data only.** Seed realistic but invented data in `src/data/seed.js`. No real PHI ever touches this codebase.

---

## Hard non-goals — do NOT build these

If a task seems to require any of the following, stop and flag it instead of building it.

- ❌ Authentication, login, sessions, password reset, or user accounts
- ❌ Roles, permissions, or RBAC of any kind
- ❌ Multi-tenant or multi-clinic concepts
- ❌ Real insurance APIs, clearinghouses, or claims submission
- ❌ Real payment processors or billing engines
- ❌ AI calls to external APIs — no OpenAI, no Anthropic, no LLM at runtime
- ❌ Conversational AI assistants or autonomous content generation
- ❌ Patient portal or any patient-facing screens
- ❌ Telehealth, messaging, inventory, payroll, or accounting
- ❌ Multiple practitioners or practitioner type/specialty management
- ❌ Supabase, Firebase, or any external database in the prototype

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Vite + React (SPA) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui — reuse from `src/components/ui`; never reinvent buttons, dialogs, tables, inputs |
| Icons | Lucide React |
| Routing | React Router |
| Dates | date-fns |
| Charts | recharts — only if a chart is actually needed on screen |
| Data | `src/data/seed.js` — in-memory JSON; no external DB |

Do NOT add any library not listed above without flagging it first.

---

## Coding patterns — optimize for debuggability, not cleverness

This is the most important section for day-to-day coding decisions.

### Prefer flat, readable code over abstractions

- Write code a developer can read top-to-bottom without jumping files to understand what it does.
- Three similar lines of code are better than a premature abstraction that obscures intent.
- If you can't explain what a function does in one sentence, split or rename it.

### One responsibility per file

- Pages in `src/pages/` — one file per route, no business logic.
- Feature components in `src/components/<feature>/` — one component per file, named after what it renders.
- `src/components/ui/` — shadcn primitives only; never modify these.
- `src/data/seed.js` — all seed data in one obvious place.
- No file over ~250 lines without a clear reason.

### State: local first, lift only when needed

- Default to `useState` inside the component that owns the data.
- Lift state to the nearest common ancestor only when two components genuinely share it.
- Do NOT reach for a global store (Redux, Zustand, Jotai) — React context is the ceiling for this prototype.

### No magic, no indirection

- No dynamic imports or lazy-loaded route chunks — keep the bundle simple and traceable.
- No factory functions, no higher-order components, no render props unless there is an unavoidable reason.
- Avoid clever one-liners. Verbose and obvious beats terse and tricky.

### Error surfaces must be visible during development

- Every `catch` block must `console.error` the full error — no silent failures.
- Every data mutation (add, update, delete) logs to the console in dev mode so you can see what changed.
- Empty states must render something explicit — never a blank screen.
- If a seed data lookup returns `undefined`, fail loudly with a message that names the missing ID.

### Constants over magic values

- Pull any string used in more than one place into a named constant in the same file or a shared `src/constants.js`.
- Insurance payer names, coverage status values, CPT code defaults — all named constants, never raw strings scattered in JSX.

### Comments: only the why, never the what

- Do not comment what the code does — name your variables and functions so they explain themselves.
- Do comment non-obvious constraints: a business rule, a gotcha, a workaround.
- No block comments, no TODO lists in code — keep the codebase clean.

---

## UI principles — minimalistic, aesthetic, professional

### Visual style

- **Color palette:** soft teals and greens as primary accent, warm neutrals (slate/zinc) for backgrounds and text. Clinical but not cold. Professional but not corporate.
- **Typography:** one font family, two weights (regular + medium). No decorative fonts.
- **Spacing:** generous whitespace. Dense information panels only where the workflow demands it (the insurance verification cockpit, the dashboard flags panel).
- **No gradients, no shadows on shadows, no glassmorphism.** Flat surfaces with subtle border or elevation.

### Interaction

- Every common action completable within **3 clicks** from the Dashboard.
- Every form completable in **under 30 seconds** for the core path (e.g., "Mark Verified" form).
- No confirmation modals for low-stakes actions. Use inline undo or optimistic updates instead.
- Loading states on any async-feeling action, even if local — a spinner or skeleton for 300ms feels more trustworthy than an instant jump.

### Language

- Plain English everywhere. Avoid clinical jargon in UI labels unless the practitioner uses the exact term themselves (e.g., "SOAP Note," "CPT Code," "Copay" are fine — practitioners say these daily).
- Error messages must say what to do next, not just what went wrong.
- Empty states must explain why the screen is empty and offer a next action.

### Layout

- Sidebar navigation, fixed. No hamburger menus on desktop.
- Content area is the only scrolling region — the sidebar and top bar stay fixed.
- Maximum content width: ~1200px centered. No full-bleed layouts on wide screens.
- Mobile responsiveness is a nice-to-have, not a prototype requirement.

---

## What's unique vs. commodity

Most features in PRD.md also exist in competing products. That's fine — you need them to be credible. But they are not why the demo wins.

| Feature | Status | Implication |
|---|---|---|
| Insurance Benefits Tracker + Dashboard flags | **Unique** | Build deep, polish hard |
| Simulated real-time eligibility check | **Unique angle** (competitors hide it) | Fake spinner → result on the insurance cockpit; no real API needed |
| Pain level trend chart per patient | **Differentiator add** (WebPT has outcomes tracking; AccuWorld doesn't) | recharts LineChart in PatientDetail — data already exists in visits |
| Expected patient responsibility on schedule | **Differentiator add** (CollaborateMD has this; AccuWorld doesn't surface it) | Derive from copay + deductibleMet already in seed |
| Text/phone booking inbox | **Unique angle** | Build it; don't over-engineer it |
| Patient management, scheduling, TCM charting, treatment plans, billing, follow-up | **Commodity** | Build correctly and quickly; no gold-plating |

The rule: commodity features get 20% of the effort; the insurance tracker gets 80%.

---

## Feature scope guard

Before building any screen or component, ask:

> "Does this make the insurance verification workflow faster or more visible — OR does it make TCM charting faster for the practitioner?"

If the answer is unclear, re-read `PRD.md` sections 5 and 6 (Demo Wedge and Competitive Landscape) before writing any code.

The insurance verification dashboard is the only feature that no competitor currently offers. Every hour spent on features that exist in Jane App or Carepatron is an hour not spent on the thing that wins the demo.

---

## How to work

- Build **one vertical slice at a time** per the build order in `PRD.md`. Get the slice running and seeded before starting the next.
- After each slice: `npm run build` must pass. Commit with a clear message.
- Commit style: `feat: insurance benefit tracker`, `fix: appointment date filter`, `chore: seed data patients`.
- When unsure about scope, re-read `PRD.md` before coding.

## Run

```bash
npm install
npm run dev      # local prototype → http://localhost:5173
npm run build    # must pass before any commit
git push         # triggers Vercel auto-deploy to https://accuworld.vercel.app
```

---

## Definition of done (per slice)

A slice is complete only when:
- [ ] It renders correctly with seed data
- [ ] Empty states are handled (no blank screens)
- [ ] Console has no errors or warnings
- [ ] `npm run build` passes
- [ ] The demo walkthrough through this slice takes under 60 seconds

---

## Backlog — all items shipped (2026-06-25)

All backlog items have been implemented. No open backlog items remain.

---

## Build Status (updated 2026-06-26 — Front Office role gating complete)

`npm run build` passes. Dev server: `npm run dev` → http://localhost:5173

**Production:** https://accuworld.vercel.app (Vercel project: `prj_hMbcqaGsegGqIxS7oeJznJpN90YF`)
**GitHub:** https://github.com/smenon2710/accuworld (branch: `main`)
**CI/CD:** Push to `main` → Vercel auto-builds and deploys. No manual deploy step needed.

### Completed slices

| Slice | Screen / Feature | Status |
|-------|-----------------|--------|
| 1 | Scaffold — routing, layout, sidebar, demo banner, AppContext + localStorage | ✅ Done |
| 2 | Patients — list (search/filter), detail view, add/edit dialogs | ✅ Done |
| 3 | Insurance Benefits Tracker — cockpit table, 3-flag summary, Mark Verified form | ✅ Done |
| 4 | Dashboard — insurance flags hero, today's schedule, booking inbox, follow-up queue, revenue | ✅ Done |
| 5 | Schedule — week/day calendar grid, booking inbox, complete+chart action, guards | ✅ Done |
| 6 | Visit/Chart — TCM note form, point badge autocomplete, Suggest Points, SOAP scaffold | ✅ Done |
| 7 | Treatment Plans — create/edit, progress bar vs completed visits | ✅ Done |
| 8 | Billing — invoice list, mark-paid, superbill print view, new invoice with CPT defaults | ✅ Done |
| 9 | Polish pass — competitor gap features, month calendar, help drawer | ✅ Done |

### Slice 9 items — all resolved

| Item | Where | Notes |
|------|-------|-------|
| Month calendar view | Schedule | ✅ Done — `MonthGrid` component in `Schedule.jsx`. Day cells show appointment pills; clicking a day switches to day view. |
| Patient Archive action | Patient detail | ✅ Fixed — Archive / Reactivate button added to patient detail header |
| Visit decrement timing | Schedule → complete | Visits decrement on chart save, not on "Mark Complete" click — PRD implies decrement at complete; current behavior is safer (requires chart to be saved first) |
| Vercel deployment config | Root | ✅ Done — `vercel.json` added, deployed to https://accuworld.vercel.app |
| Demo walkthrough / in-app help | All | ✅ Done — "Help & Demo Guide" drawer in sidebar footer. Contains 5-step demo checklist, insurance flag color guide, and pages-at-a-glance reference. |
| Console warnings audit | All | ✅ Fixed — removed unused imports (useEffect, insMap, insuranceProfiles, visits) in Visits/Schedule/Billing |
| **Simulated eligibility check** | Insurance cockpit | ✅ Done — "Check Eligibility" button per row. 1.2s spinner → inline result (teal/red/grey). Logic in `Insurance.jsx:mockEligibilityResult()`. |
| **Pain level trend chart** | PatientDetail | ✅ Done — recharts `LineChart` in `PatientDetail.jsx`, shown when patient has ≥2 visits. Historical seed visits added for p1 (v8–v11) and p2 (v12–v14). |
| **Expected patient responsibility** | PatientDetail | ✅ Done — "Est. Patient Owes" field in insurance card. Logic in `PatientDetail.jsx:estPatientOwes()`. Amber for deductible-pending, teal for confirmed, grey for unverified. |

### Post-slice enhancements

| Feature | Where | Notes |
|---------|-------|-------|
| Login / welcome page | `/login` (new) | Three role cards (Admin, Front Office, Practitioner) with test credentials displayed. Clicking "Sign in as [Role]" sets `loggedInRole` in AppContext and navigates to Dashboard. No real auth — cosmetic only. Layout redirects to `/login` when `loggedInRole` is null. |
| Role-based nav + fixed role badge | Sidebar | Role is fixed for the session — no toggle. Sidebar shows a static colour-coded badge: teal (Admin), blue (Front Office), violet (Practitioner). Admin sees all 7 nav items. Front Office hides Visit/Chart and Treatment Plans. Practitioner sees all items. All roles show role-appropriate footer + logout button (↪) that returns to `/login`. |
| Role-gated chart access | Dashboard + Schedule | `canChart = loggedInRole !== 'frontdesk'`. Dashboard "Chart" button hidden for Front Office. Schedule: Practitioner sees "Chart" (opens chart; saving auto-completes the appointment), Front Office sees "Mark Complete" (admin checkout only). "Open Chart" on completed appointments is Practitioner/Admin only. |
| Standalone visit notes | Patient detail → Visit History | "New Note" button on each patient's Visit History card. Creates a visit not tied to an appointment (`/visits?patient=<id>`). Date picker defaults to prototype today. No appointment status change or insurance decrement. |
| AI SOAP note drafting | Visit / Chart | "Draft with AI" button in the SOAP Note card header. Streams a TCM-accurate SOAP note via OpenRouter (`openrouter/free` — free models only). Requires `VITE_OPENROUTER_API_KEY` in `.env` (local) and Vercel environment variables (production). Graceful fallback: restores the SOAP template with an amber error banner if the key is missing or the call fails. Tagged with `HTTP-Referer: https://accuworld.vercel.app` and `X-Title: AccuWorld - SOAP Note Drafting` for OpenRouter activity dashboard. |
| Suggest Points feedback | Visit / Chart | "Suggest Points" button now shows an amber hint when the complaint field is empty or contains no recognizable keyword, guiding the practitioner toward supported terms. Previously silent on no-match. |
| Auto-fill O: section | Visit / Chart | "Auto-fill O:" button (Wand2 icon) in the Objective card header. Composes a one-line objective string from the pulse and tongue dropdowns and injects it into the O: line of the SOAP note. No AI call — instant local logic. |
| Suggest Diagnosis | Visit / Chart → Treatment Strategy | "Suggest Diagnosis" button (Sparkles icon). Streams 1–3 TCM pattern diagnoses via OpenRouter based on chief complaint, pulse, and tongue. Result appears in a teal suggestion box below the field; practitioner can edit before saving. |
| Suggest Home Care | Visit / Chart → Home Care | "Suggest" button on the Home Care field. Checks `src/data/homeCareSuggestions.js` local keyword map first (15 categories); falls back to OpenRouter if no match. Shows amber hint when complaint is empty or unrecognized. |
| Suggest Formula | Visit / Chart → Herbal Formula | "Suggest Formula" button. Streams a classical formula name + one-sentence rationale from OpenRouter using the complaint and treatment strategy fields. |
| Billing payment method + transaction ref | Billing → Mark Paid dialog | Mark Paid dialog extended with payment method dropdown (cash/card/zelle/check/insurance). Conditional reference field appears for zelle/card/check. Optional note field always visible. Invoice table shows method and ref as secondary lines for cash reconciliation. Data model: `paymentMethod`, `transactionRef`, `paymentNote` on invoice. |
| Missing treatment plan callout | Patient detail | When a patient has no treatment plan, an amber callout is now shown in the main column right after the Insurance card (previously invisible). Includes a "Create Plan" button linking to `/treatment-plans`. |
| Suggest from last visit in new plan form | Treatment Plans → New Plan dialog | When creating a new plan, a teal suggestion box appears (once a patient is selected) showing their most recent visit's chief complaint and treatment strategy. "Use suggestions →" fills Primary Complaint and Treatment Goals fields. Dismissible with ✕. |
| Chief complaint hint from treatment plan | Visit / Chart → Subjective | When opening a new chart note for a patient who already has a treatment plan, a teal hint appears below the Chief Complaint field showing the plan's primary complaint. "Use this" fills the field; ✕ dismisses. Only shown while the field is empty. |
| Dashboard metric cards | Dashboard | Three stat cards at top of Dashboard: "Scheduled Today" (teal, links to /schedule), "Insurance Attention" (amber when >0, links to /insurance), "Pending Confirmations" (blue when >0, links to /schedule). Replace the subtitle appointment/insurance counts. |
| Dynamic dates in seed data | `seed.js`, `Dashboard.jsx`, `Schedule.jsx` | All appointment datetimes, visit dates, invoice dates, and treatment plan dates now derive from the real current date using `offsetDate()`/`offsetDatetime()` helpers. "Today" is no longer hardcoded. **IMPORTANT: Click "Reset Data" in the demo banner before each demo run** to flush cached localStorage dates. |
| Schedule status color legend | Schedule page + Help drawer | Compact inline legend row added below the Schedule header (Confirmed/Requested/Completed/No-show with color swatches). Matching "Schedule Appointment Colors" section added to the Help drawer between Demo Walkthrough and Insurance Flag Colors. |
| Chart page suggestion guide | Visit / Chart | Dismissible teal info strip at the top of the chart form explaining all suggestion buttons in plain English (no jargon). Dismissed per session via `useState`. |
| AI Stop button + save-anytime note | Visit / Chart → SOAP Note | "Draft with AI" button replaced by a red "Stop" button while streaming (uses `AbortController` — keeps whatever was generated). A "AI is thinking — you can save at any time" note appears near the Save button whenever any AI call is in progress. |

### Bug fixes (2026-06-25)

| Bug | Fix |
|-----|-----|
| Front Office could access chart via Schedule "Complete + Chart" button | `canChart = loggedInRole !== 'frontdesk'` added to Dashboard and Schedule; button hidden for Front Office |
| Front Office / Practitioner toggle allowed role escalation after login | Toggle removed entirely. Role is now fixed at login. `viewMode` state and `setViewMode` removed from AppContext. Sidebar reads `loggedInRole` directly for nav filtering and emphasis. |
| Practitioner had explicit "Mark Complete" action — should be Front Office only | Schedule: Practitioner sees "Chart" on confirmed appointments (save auto-completes). Front Office sees "Mark Complete". Appointment completion is now strictly an admin-checkout action. |
| Front Office could create visit notes via Patient → Visit History → "New Note" | `canChart = loggedInRole !== 'frontdesk'` added to `PatientDetail.jsx`. "New Note" button hidden for Front Office. |
| Front Office saw "Create Plan" button linking to inaccessible Treatment Plans page | Same `canChart` guard hides the "Create Plan" button in the no-treatment-plan callout for Front Office. The amber callout message still shows so Front Office knows the practitioner needs to create one. |
| Front Office saw "View all" link in Treatment Plan card → `/treatment-plans` | Hidden for Front Office via `canChart` guard in `PatientDetail.jsx`. |
| Front Office saw "All visits" link in Visit History → `/visits` (nav-hidden page) | Hidden for Front Office via `canChart` guard in `PatientDetail.jsx`. |

### Bug fixes (2026-06-24)

| Bug | Fix |
|-----|-----|
| Visit chart form empty when reopening from Visit/Chart list | Added `useEffect` watching `existingVisit?.id` to reinitialize all form fields — React Router same-route navigation kept the component mounted so `useState` initializers didn't re-run |
| Historical visits (v8–v14) showed "Appointment not found" | Added `ahist1`–`ahist7` as completed historical appointments to `seedAppointments` in `seed.js` — they were referenced in visits but missing from the appointments array |
| Standalone notes (appointmentId: null) showed "Appointment null not found" | List click handler now navigates to `/patients/${v.patientId}` when `appointmentId` is null, instead of `/visits?appt=null` |
| Visit list dates showed one day early (Jun 20 instead of Jun 21) | Replaced `new Date(v.date)` with `parseISO(v.date)` — date-only strings parsed as UTC midnight, shifted back one day in US timezones |

### Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_OPENROUTER_API_KEY` | `.env` (local), Vercel project settings (production) | OpenRouter API key for AI SOAP note drafting. Get a free key at https://openrouter.ai/keys. Must be set before `npm run dev` or Vercel build — Vite bakes it in at build time. |

### Prototype-specific decisions logged here

- **"Today" is dynamic** — `Dashboard.jsx` uses `format(new Date(), 'yyyy-MM-dd')` and `Schedule.jsx` uses `new Date()`. Seed data uses `offsetDate()`/`offsetDatetime()` helpers so all appointments, visits, invoices, and treatment plans are relative to real-world today. **CRITICAL for demos: click "Reset Data" in the demo banner before each demo** so stale localStorage dates are replaced with fresh seed offsets.
- **State persists to localStorage** automatically; "Reset Data" button in demo banner restores seed state.
- **Visit decrement on chart save** — safer for demo than on appointment complete, as it requires the practitioner to actually open and save the chart.
- **Eligibility check is fully simulated** — `mockEligibilityResult()` in `Insurance.jsx` derives its response from the existing seed insurance profile (coverage status, visits remaining, copay). No real API call. The 1.2s delay is intentional to make the interaction feel authentic.
- **Pain Trend chart threshold is ≥2 visits** — chart is hidden for patients with only one visit (Sandra Kim, Robert Mitchell, Patricia Lane, Angela Washington) rather than showing a meaningless single-point graph.
- **Historical seed visits added** — v8–v11 for Maria Rodriguez (Jan–May 2026, pain 8→5) and v12–v14 for James Thompson (Dec 2025–Mar 2026, pain 8→5) to populate the pain trend chart. `visitsUsed` in their insurance profiles was not changed — seed visit count and insurance counters are intentionally decoupled in the prototype.
- **Est. Patient Owes logic** — deductible-met patients show copay only; deductible-pending adds a note ("$30 copay · deductible not yet met"); self-pay and not-covered show $80/visit; unverified shows "Verify to calculate".
- **Month calendar** — `MonthGrid` is a standalone function component in `Schedule.jsx` (not a separate file) because it shares `STATUS_COLOR` and `TODAY` constants with no other consumers. Clicking any day cell switches view to 'day' for that date.
- **Help drawer state lives in Layout.jsx** — `showHelp` is passed down as `onHelpOpen` prop to Sidebar. The drawer itself renders at the Layout level so its fixed overlay covers the full viewport. Demo step checkboxes reset when the drawer is closed (local state in HelpDrawer).
- **Standalone visit notes** — `Visits.jsx` handles both `?appt=<id>` (appointment-linked) and `?patient=<id>` (standalone) flows. Standalone notes skip appointment status change and insurance decrement. Date defaults to prototype today but is editable via a date input.
- **Login / welcome page** — `src/pages/Login.jsx`. Three role cards with test credentials (all use `Demo@1234`): Admin (`admin@accuworld.app`), Front Office (`frontoffice@accuworld.app`), Practitioner (`drpriya@accuworld.app`). `loginAs(role)` in AppContext sets `loggedInRole` (persisted to `aw_role`). `logout()` clears `loggedInRole`. Layout redirects unauthenticated requests to `/login`. `resetToSeedData()` also clears the role.
- **Role-based nav** — `Sidebar.jsx` reads `loggedInRole` directly. Front Office hides `practitionerOnly` nav items (Visit/Chart, Treatment Plans). Admin and Practitioner see all 7 items. A static colour-coded role badge replaces the old Front Desk/Practitioner toggle — the role is fixed for the session. `viewMode` and `setViewMode` have been fully removed from AppContext.
- **Role-gated chart actions** — `canChart = loggedInRole !== 'frontdesk'`. Dashboard "Chart" button and Schedule "Open Chart" are hidden for Front Office. Schedule confirmed appointments: Practitioner sees "Chart" (navigates to Visit/Chart; saving the chart marks the appointment complete). Front Office sees "Mark Complete" (admin checkout — marks appointment complete with no chart navigation).
- **Admin role** — sees all nav items, all chart actions. Static "Admin · Full Access" teal badge in sidebar. Footer shows "Admin Account / Full Access".
- **AI charting suggest buttons** — all four suggestion features in `Visits.jsx` use a shared `streamOpenRouter()` module-level helper. Auto-fill O: is pure local logic (no API). Suggest Home Care checks `src/data/homeCareSuggestions.js` (15 keyword categories) before falling back to OpenRouter. Suggest Diagnosis and Suggest Formula always call OpenRouter. All AI buttons are gracefully degraded — show a static hint if the API key is missing.
- **homeCareSuggestions.js** — new file at `src/data/homeCareSuggestions.js`, 15 complaint categories (back pain, sciatica, headache, neck, shoulder, knee, plantar fasciitis, insomnia, anxiety, digestion, fatigue, fibromyalgia, menstrual, fertility, skin). Each entry has a `keywords` array and 3 `suggestions` strings. `suggestHomeCareForComplaint(complaint)` returns an array of suggestions or `[]` on no match.
- **Billing payment tracking** — invoice data model extended on save with optional `paymentMethod`, `transactionRef`, `paymentNote` fields. `REF_LABEL` constant in `Billing.jsx` maps method → label text. Reference field is only rendered for zelle/card/check; hidden for cash and insurance.
- **Historical appointment IDs** — `ahist1`–`ahist7` in `seedAppointments` are stub completed appointments that exist solely to back the pain-trend seed visits (v8–v14). They have no `note` text and do not appear on the Schedule (no datetime in the visible prototype window for most of them).
- **Visit form reinitialization** — `useEffect([existingVisit?.id])` in `Visits.jsx` syncs form state when the loaded visit changes. Safe to depend only on the ID string: changing from undefined → 'v1' fires the effect; re-renders within the same visit do not.
- **Missing treatment plan callout** — `PatientDetail.jsx` renders an amber callout in place of the silent absence when `plan` is null. Positioned right after the Insurance card so it's the second thing the practitioner sees. Links to `/treatment-plans` where the patient's chip appears in the "patients without a plan" section.
- **Visit-to-plan suggestions** — `TreatmentPlans.jsx` computes `dialogLatestVisit` (most recent visit for the selected patient) on every render. Suggestion box shown when `!editing && form.patientId && dialogLatestVisit && !suggestionDismissed`. Reset on `openNew()` and on chip-button clicks. Fills `primaryComplaint` from `chiefComplaint` and `treatmentGoals` from `treatmentStrategy`.
- **Plan-to-visit chief complaint hint** — `Visits.jsx` looks up `treatmentPlans` (added to `useApp()` destructuring) for the current patient. Hint shown when `!existingVisit && plan?.primaryComplaint && !planComplaintDismissed && !form.chiefComplaint.trim()`. Disappears naturally once the practitioner starts typing.
- **AI Stop button** — `draftAbortRef` (useRef) holds the active `AbortController` for the SOAP draft stream. `handleStopDraft()` calls `abort()`, the fetch catch block checks `err.name === 'AbortError'` and suppresses the error, keeping whatever text was streamed. The Draft with AI button is replaced by a red Stop button while `draftingNote` is true.
- **Chart suggestion guide** — `showSuggestionGuide` useState (default true) controls a dismissible teal info strip at the top of the chart form. Resets each time the page is mounted (session-scoped, not persisted to localStorage) so new users always see it first visit.
- **Save-anytime note** — a small text note "AI is thinking — you can save at any time" appears near the Save button whenever `draftingNote || diagnosisLoading || homeCareLoading || formulaLoading` is true, making it clear the save button is never blocked.
