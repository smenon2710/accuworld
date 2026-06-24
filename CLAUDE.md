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

## Backlog — discussed, not yet built (2026-06-23)

Prioritized order. Implement one at a time; get it running before starting the next.

### Visit / Chart — additional AI features

| # | Feature | Where | Approach | Priority |
|---|---------|-------|----------|----------|
| 1 | Auto-fill O: section from dropdowns | Visit form → SOAP Note | Local logic — compose "Pulse: Normal, Wiry. Tongue: Pink body, Thin White coating." from the existing dropdown values. No AI call. Instant. | High |
| 3 | TCM Pattern Diagnosis suggestion | Visit form → Treatment Strategy | "Suggest Diagnosis" button. AI call via OpenRouter — send pulse + tongue + chief complaint, return 1–3 TCM pattern options (e.g. "Liver Qi Stagnation with Blood Deficiency"). Practitioner selects or edits. Most cognitively demanding part of charting; biggest time saver. | High |
| 4 | Home Care recommendations | Visit form → Home Care field | "Suggest Home Care" button. Start with local keyword logic matching on chief complaint (same pattern as Suggest Points). Upgrade to AI if the complaint doesn't match. Returns 2–3 actionable items (e.g. "ice 15 min post-treatment, gentle cat-cow stretches"). | Medium |
| 5 | Herbal Formula suggestion | Visit form → Herbal Formula field | "Suggest Formula" button. Needs AI — too broad for a lookup table. Send TCM pattern + complaint, return a classical formula name with brief rationale. | Low |

> Note: item 2 (SOAP note drafting) is already built. Auto-fill O: (#1) should be implemented as local logic first — it removes the most mechanical writing without adding API cost or latency.

### Billing — payment method and transaction tracking

| # | Feature | Where | Approach | Priority |
|---|---------|-------|----------|----------|
| 2 | Payment method + transaction reference on Mark Paid | Billing → Mark Paid dialog | Extend invoice data model with `paymentMethod`, `transactionRef`, `paymentNote`. Add payment method dropdown (reuse existing `PAYMENT_METHOD` constants from `seed.js`). Show conditional reference field: Zelle → "Confirmation number"; Card → "Last 4 / Transaction ID"; Check → "Check number"; Cash / Insurance → field hidden. | High |

**Data model change** (no migration needed — just extend the object on save):
```js
// Add to invoice on mark-paid:
paymentMethod: 'zelle' | 'card' | 'check' | 'cash' | 'insurance'
transactionRef: string   // optional
paymentNote: string      // optional free-text
```

**Billing list view change**: add a Payment Method column; show transaction ref as a tooltip or secondary line. Useful for end-of-month cash reconciliation and matches CollaborateMD's patient responsibility tracking feature.

---

## Build Status (updated 2026-06-23 — all slices complete + AI SOAP note drafting)

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
| Standalone visit notes | Patient detail → Visit History | "New Note" button on each patient's Visit History card. Creates a visit not tied to an appointment (`/visits?patient=<id>`). Date picker defaults to prototype today. No appointment status change or insurance decrement. |
| View mode toggle (Front Desk / Practitioner) | Sidebar | Segmented pill below the logo. Stored in AppContext + `aw_viewMode` localStorage key. Front Desk hides Visit/Chart and Treatment Plans; emphasizes Schedule, Insurance, Billing with teal icon + bold text. Practitioner restores all items with emphasis on Visit/Chart. Cosmetic only — no auth, no roles. |
| AI SOAP note drafting | Visit / Chart | "Draft with AI" button in the SOAP Note card header. Streams a TCM-accurate SOAP note via OpenRouter (`openrouter/free` — free models only). Requires `VITE_OPENROUTER_API_KEY` in `.env` (local) and Vercel environment variables (production). Graceful fallback: restores the SOAP template with an amber error banner if the key is missing or the call fails. Tagged with `HTTP-Referer: https://accuworld.vercel.app` and `X-Title: AccuWorld - SOAP Note Drafting` for OpenRouter activity dashboard. |
| Suggest Points feedback | Visit / Chart | "Suggest Points" button now shows an amber hint when the complaint field is empty or contains no recognizable keyword, guiding the practitioner toward supported terms. Previously silent on no-match. |

### Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_OPENROUTER_API_KEY` | `.env` (local), Vercel project settings (production) | OpenRouter API key for AI SOAP note drafting. Get a free key at https://openrouter.ai/keys. Must be set before `npm run dev` or Vercel build — Vite bakes it in at build time. |

### Prototype-specific decisions logged here

- **"Today" is hardcoded** as `2026-06-21` in `Dashboard.jsx` and `Schedule.jsx` so seed data flags appear correctly on every demo run.
- **State persists to localStorage** automatically; "Reset Data" button in demo banner restores seed state.
- **Visit decrement on chart save** — safer for demo than on appointment complete, as it requires the practitioner to actually open and save the chart.
- **Eligibility check is fully simulated** — `mockEligibilityResult()` in `Insurance.jsx` derives its response from the existing seed insurance profile (coverage status, visits remaining, copay). No real API call. The 1.2s delay is intentional to make the interaction feel authentic.
- **Pain Trend chart threshold is ≥2 visits** — chart is hidden for patients with only one visit (Sandra Kim, Robert Mitchell, Patricia Lane, Angela Washington) rather than showing a meaningless single-point graph.
- **Historical seed visits added** — v8–v11 for Maria Rodriguez (Jan–May 2026, pain 8→5) and v12–v14 for James Thompson (Dec 2025–Mar 2026, pain 8→5) to populate the pain trend chart. `visitsUsed` in their insurance profiles was not changed — seed visit count and insurance counters are intentionally decoupled in the prototype.
- **Est. Patient Owes logic** — deductible-met patients show copay only; deductible-pending adds a note ("$30 copay · deductible not yet met"); self-pay and not-covered show $80/visit; unverified shows "Verify to calculate".
- **Month calendar** — `MonthGrid` is a standalone function component in `Schedule.jsx` (not a separate file) because it shares `STATUS_COLOR` and `TODAY` constants with no other consumers. Clicking any day cell switches view to 'day' for that date.
- **Help drawer state lives in Layout.jsx** — `showHelp` is passed down as `onHelpOpen` prop to Sidebar. The drawer itself renders at the Layout level so its fixed overlay covers the full viewport. Demo step checkboxes reset when the drawer is closed (local state in HelpDrawer).
- **Standalone visit notes** — `Visits.jsx` handles both `?appt=<id>` (appointment-linked) and `?patient=<id>` (standalone) flows. Standalone notes skip appointment status change and insurance decrement. Date defaults to prototype today but is editable via a date input.
- **View mode toggle** — `viewMode` ('practitioner' | 'frontdesk') lives in AppContext, persisted to `aw_viewMode`. `Sidebar.jsx` reads it to filter nav items (`practitionerOnly` items hidden in Front Desk) and apply emphasis (`emphasizeIn` items get teal icon + bold weight when that mode is active). No auth or real roles — cosmetic only.
