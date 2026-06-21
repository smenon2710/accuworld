# CLAUDE.md — Acupuncture Practice Assistant

Operating rules for every task on this repo. Read this before touching any code.

---

## What this is

A single-tenant practice management prototype for solo acupuncturists. One practitioner, one clinic, fake seed data. The goal is a working demo that wins a real commitment before any production investment.

The app's **one true differentiator**: insurance benefit verification as a first-class daily workflow. Every competitor — Jane App ($54–99/mo), Unified Practice ($49–152/mo), AcuBliss, and Carepatron (free) — buries insurance verification inside a billing module. None of them show the practitioner, on their morning dashboard, which patients need re-verification, whose visits are running low, or who is still unverified. This app does.

TCM charting (pulse, tongue, meridians, points) is required and expected — Jane App and Unified Practice both have TCM templates. Build it cleanly; do not position it as a differentiator.

Price is a supporting argument against Jane App and Unified Practice only. Carepatron is free — do not lead with price against it. Lead with TCM-specificity and the insurance workflow.

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
npm run dev      # local prototype
npm run build    # must pass before any commit
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

## Build Status (updated 2026-06-21)

`npm run build` passes. Dev server: `npm run dev` → http://localhost:5173

**Production:** https://accuworld.vercel.app (Vercel, project: sujithkumar-menons-projects/accuworld)
To redeploy: `vercel --prod --yes` from the project root.

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
| 9 | Polish pass | ⏳ Pending |

### Known gaps (to address in slice 9)

| Item | Where | Notes |
|------|-------|-------|
| Month calendar view | Schedule | Only Day/Week built; Month view deferred |
| Patient Archive action | Patient detail | ✅ Fixed — Archive / Reactivate button added to patient detail header |
| Visit decrement timing | Schedule → complete | Visits decrement on chart save, not on "Mark Complete" click — PRD implies decrement at complete; current behavior is safer (requires chart to be saved first) |
| Vercel deployment config | Root | ✅ Done — `vercel.json` added, deployed to https://accuworld.vercel.app |
| Demo walkthrough end-to-end test | All | PRD Section 14 flow: New Patient → Schedule → Complete → Chart → Treatment Plan → Superbill |
| Console warnings audit | All | ✅ Fixed — removed unused imports (useEffect, insMap, insuranceProfiles, visits) in Visits/Schedule/Billing |

### Prototype-specific decisions logged here

- **"Today" is hardcoded** as `2026-06-21` in `Dashboard.jsx` and `Schedule.jsx` so seed data flags appear correctly on every demo run.
- **State persists to localStorage** automatically; "Reset Data" button in demo banner restores seed state.
- **No month view** — calendar shows Day and Week. Sufficient for the demo; month view is post-polish if needed.
- **Visit decrement on chart save** — safer for demo than on appointment complete, as it requires the practitioner to actually open and save the chart.
