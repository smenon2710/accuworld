# AccuWorld — Production Readiness Checklist
> **Created:** 2026-06-26

> **From prototype to sellable SaaS.** Every category a solo developer / small LLC must
> consider before taking the prototype to paying practitioners.

---

## 1. Regulatory & Legal

| Area | What's required | Rough cost / effort |
|------|----------------|---------------------|
| **HIPAA compliance** | Administrative safeguards (policies, risk assessment, workforce training), physical safeguards (facility access), technical safeguards (access control, audit controls, integrity controls, transmission security). Must document everything for potential audit. | $5k–15k upfront (consultant) or DIY with compliance-as-code tooling |
| **BAA (Business Associate Agreement)** | Required with every vendor touching PHI: hosting provider (AWS/GCP/Azure/Supabase), email service, SMS provider, analytics, error monitoring, support tooling. You are the Covered Entity; every subcontractor is a BA. | Zero if vendors offer BAAs on paid plans |
| **State privacy laws** | CCPA (California), CPA (Colorado), etc. If a patient in California, CCPA applies. Must support data deletion/export requests. | Legal review ~$2k |
| **Breach notification** | HIPAA requires notification within 60 days. Have an incident response plan written down before you launch. | Time investment |
| **Records retention** | HIPAA requires retaining medical records for 6 years from creation or last use. Must support data archival and eventual secure destruction. | Architectural decision at DB level |
| **ADA / WCAG accessibility** | Title III of ADA applies if offering to the public. WCAG 2.1 Level AA is the standard. Can be deferred but eventually required. | $5k–10k for audit + remediation |
| **Professional liability insurance** | Errors & omissions insurance for your software. Essential if you're handling practice operations. | ~$1k–3k/year first year |
| **Terms of Service + Privacy Policy** | Must cover: no medical advice disclaimers, data ownership (practitioner owns their data), uptime SLA (realistic), limitation of liability, dispute resolution. Have a healthcare attorney draft these. | $3k–5k |

### Key HIPAA technical safeguards checklist

- [ ] Access control — **unique user IDs**, emergency access, automatic logoff (15 min inactivity)
- [ ] Audit controls — **every PHI read/write logged** with timestamp, user ID, action, IP address
- [ ] Integrity controls — **no accidental PHI deletion or alteration** (soft deletes, versioning)
- [ ] Transmission security — **TLS 1.2+ for all data in transit**
- [ ] Encryption at rest — **AES-256 for data at rest** (database + backups + file storage)
- [ ] Backup + disaster recovery plan — **tested, documented, automated**
- [ ] Facility access controls — if hosting on your own hardware (use cloud instead)

---

## 2. Infrastructure & Hosting

The prototype uses Vite + React SPA + in-memory seed data. Production needs:

### Database
| Consideration | Details |
|---------------|---------|
| **Supabase (HIPAA plan)** | ~$99/mo for HIPAA-compliance tier with signed BAA. Includes PostgreSQL, Auth, RLS, auto-backups. Straightforward migration from seed.js. |
| **or AWS RDS PostgreSQL** | ~$50–200/mo + $15k/year for a BAA with AWS (pay for Enterprise support or use AWS Artifact). More operational overhead. |
| **Row-Level Security (RLS)** | Every query must be scoped to the tenant (clinic). With Supabase RLS, you write policies once and they're enforced at the DB level — no risk of leaking data across clinics. |
| **Migrations** | Use a migration tool (Supabase CLI, Prisma, Knex) to track schema changes. Never mutate production schemas manually. |

### Hosting
| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Vercel (current)** | Already set up, easy deploys | No HIPAA BAA available | Free–$20/mo |
| **AWS (Production)** | HIPAA-eligible (with BAA), full control | Ops overhead, complex config | ~$50–300/mo initially |
| **GCP** | HIPAA-eligible, simpler than AWS | Less practice management ecosystem | ~$50–300/mo |

You'll need to move off Vercel (no BAA) to AWS, GCP, or a HIPAA-compliant PaaS.

### Multi-tenancy model
| Approach | What it means |
|----------|---------------|
| **Single-tenant per customer** | Separate DB per practice. Isolated, secure. Harder to maintain at scale but easier for HIPAA. |
| **Multi-tenant with RLS** | Shared DB, RLS scopes queries to tenant. Supabase RLS makes this viable. Must be paranoid about row-leakage. **Recommended** for a small SaaS. |

### Key infrastructure checklist

- [ ] BAA signed with hosting provider before any patient data enters
- [ ] Automated daily backups with point-in-time recovery
- [ ] Disaster recovery plan with RTO (Recovery Time Objective) and RPO (Recovery Point Objective) defined
- [ ] Staging environment that mirrors production
- [ ] Infrastructure as Code (Terraform, Pulumi, or SST)
- [ ] Uptime monitoring (Better Stack, Checkly, Pingdom)
- [ ] Incident response runbook documented
- [ ] Rate limiting at the API layer

---

## 3. Authentication & Authorization

The prototype's cosmetic login (`admin@accuworld.app` / `Demo@1234`) must become real auth.

| Feature | Implementation | Notes |
|---------|---------------|-------|
| **Email/password auth** | Supabase Auth, Clerk, Auth0, or Lucia | Supabase Auth is simplest given the stack |
| **Password policies** | Min 12 chars, complexity requirements, periodic rotation | HIPAA requires "reasonable" password policies |
| **MFA** | TOTP or SMS-based 2FA | Strongly recommended for admin/practitioner accounts |
| **Session management** | Short-lived access tokens + refresh tokens. Automatic timeout after 15 min inactivity. | HIPAA technical safeguard |
| **Passwordless / magic link** | Optional convenience for practitioners | Not a HIPAA requirement but reduces password fatigue |
| **SSO / SAML** | Enterprise feature — can defer | Ask when a group practice asks for it |
| **Role-based access control** | Prototype already has Admin/Practitioner/Front Office. Needs RL enforcement server-side, not just UI hiding. | **Critical gap** — currently all guards are client-side |

### Server-side authorization
The prototype gates features by hiding buttons in JSX. A production app must enforce access at the API layer:

```
Front Office  →  read:patients, schedule:mark_complete  
Practitioner  →  all clinical:visits, plans, charting  
Admin         →  everything + billing
```

---

## 4. Insurance Integration — The Core Revenue Feature

The prototype mocks eligibility. Production needs real clearinghouse connections.

### Clearinghouse options
| Service | Eligibility (270/271) | Claims (837) | ERA (835) | Cost |
|---------|----------------------|--------------|-----------|------|
| **Change Healthcare** | ✅ | ✅ | ✅ | Per-transaction ~$0.50–2.00 |
| **Office Ally** | ✅ | ✅ | ✅ | Free claims clearinghouse (paid tiers for eligibility) |
| **ZirMed / Finvi** | ✅ | ✅ | ✅ | Per-transaction |
| **Waystar** | ✅ | ✅ | ✅ | Enterprise pricing |
| **HealthAxis** | ✅ | ✅ | ✅ | Per-transaction |
| **InstaMed** | ✅ | ❌ | ❌ | Eligibility-focused |

### Real costs to plan for
| Item | Typical cost |
|------|-------------|
| Clearinghouse setup fee | $0–$1,000 per connection |
| Eligibility check (real-time) | $0.35–$1.50 per check |
| Claim submission | $0.25–$1.00 per claim |
| ERA (electronic remittance) | Often included |
| Monthly minimum | $50–$200/month (small practices) |

### Technical integration
- **X12 270/271** — Eligibility request/response. You send patient demographics + provider NPI; get back coverage details, copay, deductible status, visits remaining.
- **X12 837** — Claims submission (professional claims). Required for insurance billing.
- **X12 835** — Payment reconciliation (ERA). Matches payments to claims.
- **Provider credentialing** — The practice must be credentialed with each payer before you can check eligibility for their patients. You don't handle this — the practice does — but you need their payer enrollments on file.

### Important note
You're building a **clearinghouse integration**, not becoming a clearinghouse. The practice needs their own clearinghouse account. Your app connects to it via API. Some clearinghouses (Office Ally) offer a "free" tier to attract practices; others charge per transaction and you can choose to absorb or pass through the cost.

---

## 5. Payment Processing (Patient-Facing)

| Need | Solution | Cost |
|------|----------|------|
| Credit/debit card payments | Stripe Connect (platform model) or Square | 2.9% + $0.30 per transaction |
| ACH / bank transfer | Stripe ACH or Plaid + Dwolla | ~0.8% or flat fee |
| HSA / FSA cards | Automatically accepted if card-present; online needs extra verification | Same as card fees |
| PCI-DSS compliance | Stripe handles this (PCI SAE-A). Never store raw card numbers. | $0 if using Stripe Elements |

### Billing complexity
- Payments are collected at time of service, but insurance reimbursements come later
- Copays are collected upfront; deductibles may need to be billed after insurance processes the claim
- You need a **patient responsibility estimator** (the prototype has this as "Est. Patient Owes") that accounts for:
  - Copay (fixed)
  - Coinsurance (% of allowed amount)
  - Deductible remaining (must apply before coinsurance)
  - Visit type (initial vs follow-up often billed at different rates)

---

## 6. Patient Portal & Engagement

| Feature | Why needed | Implementation |
|---------|------------|---------------|
| **Secure patient login** | HIPAA requirement for any patient-facing access (even appointment viewing) | Supabase Auth with patient role |
| **Appointment reminders** | Reduce no-shows. Competitors all have this. | Twilio (SMS) + SendGrid (email) |
| **Online booking** | Competitors have it; practitioners increasingly expect it | Cal.com (open-source) or custom |
| **Digital intake forms** | Reduce front-desk paperwork | Custom form builder in-app |
| **Secure messaging** | Follow-up instructions, questions | In-app messaging, NOT SMS (unencrypted) |
| **View/pay bills online** | Patient convenience, reduces AR days | Stripe Customer Portal or custom |

### Cost per month (patient engagement alone)
| Service | Purpose | Cost |
|---------|---------|------|
| Twilio | SMS reminders + booking SMS | ~$0.0079/SMS → $20–50/mo for small practice |
| SendGrid | Email reminders + invoices | Free tier (100/day) → $20/mo Essentials |
| Cal.com (self-host) | Online booking infrastructure | Free (self-host) or $0/mo |
| Patient portal hosting | Separate subdomain or SPA | ~$10/mo (included in infra) |

---

## 7. Architecture & Code Quality

### Migration from prototype patterns
| Prototype | Production |
|-----------|-----------|
| Vite + React SPA | **Next.js** (App Router) — SSR for SEO, API routes, middleware for auth. PRD already specifies this. |
| JavaScript | **TypeScript (strict)** — PRD already specifies this. Essential for safety with PHI-related data transformations. |
| React Context + localStorage | **Supabase (real DB)** + React Query or SWR for data fetching. No localStorage for any PHI. |
| shadcn/ui + Tailwind | Keep both. Mature, maintainable. |
| No tests | **Jest + React Testing Library** (unit), **Playwright** (E2E). PRD says no testing yet. Production needs: unit tests on every data flow, E2E on every critical patient workflow. |
| Manual linting | ESLint + Prettier in CI; Husky + lint-staged on commit |

### API layer
```
Prototype: seed.js → React component (direct import)
Production: Next.js API routes or tRPC → Supabase → React component
```

tRPC is particularly strong here: end-to-end type safety from DB query to React component, eliminating an entire class of bugs.

### Testing targets
| Layer | Tool | Coverage target |
|-------|------|----------------|
| Unit (data transforms, business logic) | Vitest / Jest | 90%+ |
| Component rendering | React Testing Library | Every UI state (loading, empty, error, populated) |
| Integration (API + DB) | Vitest + Supabase local | All CRUD flows for every entity |
| E2E (critical user flows) | Playwright | Login → Schedule → Chart → Billing flow |
| Security | Manual + automated scanning | OWASP Top 10 |

---

## 8. Monitoring, Observability & Support

| Category | Tool | Cost |
|----------|------|------|
| **Error tracking** | Sentry | Free tier → $26/mo Team |
| **Server monitoring** | Better Stack, Datadog | Free → ~$100/mo |
| **Database monitoring** | Supabase built-in + pganalyze | Free → ~$50/mo |
| **Performance monitoring** | Web Vitals (built-in) + Sentry Performance | Included in Sentry |
| **User analytics** | PostHog (self-host or cloud) | Free tier generous; self-host free |
| **Customer support** | Intercom, Crisp, or HelpScout | Free → $25–60/mo |
| **Status page** | Better Stack Statuspage | Free |

### Audit logging (HIPAA requirement)
Every access to PHI must be logged:
- Who accessed what record, when, from what IP
- Any modification to clinical data
- Any export or download
- Logs must be retained for 6 years
- Logs must be tamper-proof (append-only DB table or external log service)

---

## 9. Business Operations

### Pricing model
| Model | Pros | Cons |
|-------|------|------|
| **Flat monthly** ($49–99/mo) | Simple, predictable | Undervalue for high-volume practices |
| **Per-patient** (~$1–3/patient/mo) | Scales with practice | Unpredictable cost for practitioner |
| **Tiered** (Starter / Professional / Enterprise) | Captures different segments | More complex to communicate |

**Competitor pricing for reference:**
- Jane App: $54–99/mo
- Unified Practice: $49–152/mo
- Carepatron: Free–$19.50/mo (generic, no TCM)
- AcuBliss: Undisclosed (~$50–100/mo estimated)

**Recommended:** Start at **$49/mo (solo)** / **$99/mo (group up to 3 practitioners)**. Insurance clearinghouse costs can be bundled or passed through.

### GTM and sales
| Channel | Approach | Cost |
|---------|----------|------|
| **Direct outreach** | Contact the prospect who triggered this prototype | Low |
| **Acupuncture trade shows** | NCCAOM, American Acupuncture Council events | $2k–5k per show |
| **Partner with acupuncture schools** | Graduating students are pre-motivated to find software | Low |
| **Facebook groups / professional forums** | Acupuncture-specific groups | Free (time) |
| **Content marketing** | Blog: "How to verify insurance benefits in 60 seconds" | Time investment |

### Customer onboarding
- **Import tool** from Jane App, Unified Practice, Carepatron (CSV import at minimum)
- **Setup wizard** — first login walks through: practice info → provider NPI → insurance payers → invite team members
- **Knowledge base** — Notion or Helpjuice for documentation
- **Demo video** — 5-minute walkthrough of every feature; posted on landing page

---

## 10. Must-Have vs Later

### Launch-blocking (must ship before first paying customer)
- [ ] HIPAA compliance program documented
- [ ] BAA signed with all vendors
- [ ] Real authentication (not cosmetic)
- [ ] Server-side authorization (not just UI hiding)
- [ ] Audit logging for all PHI access
- [ ] Database (Supabase with RLS) — replace seed.js
- [ ] Payment processing (Stripe)
- [ ] Terms of Service + Privacy Policy
- [ ] Professional liability insurance
- [ ] Error monitoring (Sentry)
- [ ] Automated backups with tested restore
- [ ] TLS everywhere
- [ ] At least one real clearinghouse integration (eligibility check)

### Launch-critical (ship within 90 days of first customer)
- [ ] Appointment reminders (SMS/email)
- [ ] Patient portal (basic: view appointments, billing)
- [ ] Offline workout for charting (Progressive Web App)
- [ ] Claim submission (837) to clearinghouse
- [ ] CSV import from Jane App / Unified Practice
- [ ] Knowledge base / help center
- [ ] E2E test suite covering critical flows
- [ ] Performance monitoring

### Phase 2 (3–12 months)
- [ ] Online booking (patient-facing)
- [ ] Secure patient messaging
- [ ] Telehealth integration
- [ ] ERA (835) auto-reconciliation of payments
- [ ] Mobile app (React Native)
- [ ] Multi-clinic support for group practices
- [ ] White-label option
- [ ] FHIR / interoperability API

---

## 11. Estimated Initial Runway

A realistic minimum to get from prototype → first paying customer:

| Category | One-time | Monthly |
|----------|----------|---------|
| Legal (TOS, Privacy, HIPAA review) | $5k–8k | — |
| HIPAA compliance setup | $5k–10k (DIY + tools) or $15k (consultant) | $0 if self-managed |
| Infrastructure (Supabase HIPAA + AWS/GCP) | $0 | $150–400/mo |
| Clearinghouse integration | $0–1k setup | $50–200/mo minimum |
| Stripe (payment processing) | $0 | 2.9% + $0.30/txn |
| Error monitoring (Sentry) | $0 | $26/mo |
| SMS (Twilio) | $0 | $20–50/mo |
| Email (SendGrid) | $0 | $0–20/mo |
| Domain + email (Google Workspace) | $0 | $12/mo |
| Support tooling (Crisp) | $0 | $0–15/mo |
| Professional liability insurance | ~$1k–3k/year | ~$100–250/mo |

**Total initial investment: ~$12k–25k one-time + ~$400–800/mo ongoing**

### Path to breakeven
- **1 practice at $49/mo** → lose money
- **10 practices at $49/mo** → covers infrastructure
- **50 practices at $49/mo** → $2,450/mo → sustainable solo business
- **200 practices at $49/mo** → ~$120k/year → full-time business

---

## 12. Risks & Unknowns

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| **HIPAA audit / breach** before revenue justifies it | Low if careful | Don't rush to production. Validate with the committed prospect first. Consider a "pre-HIPAA beta" with synthetic data only, then flip the switch after compliance is solid. |
| **Clearinghouse integration complexity** — X12 270/271 is finicky | Medium | Use a clearinghouse that offers a REST API wrapper (most do now). Start with Office Ally (free, widely used by acupuncturists). |
| **Practitioner price sensitivity** — Carepatron is free | Medium | Lead with insurance workflow + TCM charting (Carepatron has neither). Price at $49/mo — cheaper than Jane App ($54–99) when the practice only needs 4 features. |
| **Solo developer burnout** — building + sales + support alone | High | Limit feature scope ruthlessly. Price to afford a contractor for support. Use the committed prospect as a design partner — they help prioritize. |
| **Patient data migration** — practitioners won't switch if import is painful | Medium | Build a Jane App → CSV → AccuWorld importer early. Manual data entry kills conversions. |

---

## 13. Recommended First Steps

1. **Get the committed prospect on a paid beta** ($19/mo, no HIPAA yet) using only synthetic data — validate the workflow is actually what they need before spending on compliance
2. **Sign a BAA with Supabase** (on their HIPAA plan) and migrate seed data to Supabase
3. **Build real auth with Supabase Auth** — replace the cosmetic login page
4. **Enforce authorization server-side** (every API route checks the user's role)
5. **Add audit logging** — a simple `audit_log` table with RLS is enough initially
6. **Integrate with Office Ally** (or similar) for real eligibility checks — this is the core feature
7. **Ship the paid beta to 1–3 practices** — collect feedback, fix pain points
8. **Invest in HIPAA documentation** — once you have paying customers, formalize it
9. **Build patient reminders + simple patient portal** — necessary for retention
10. **Raise prices** after 6 months of proven value

The prototype already has the hardest part figured out — the insurance-first workflow and TCM charting. Production is bridging from `seed.js` to a real database and layering in security, compliance, and reliability around the existing feature set.
