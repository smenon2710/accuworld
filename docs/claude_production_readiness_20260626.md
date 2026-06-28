# Production Readiness Guide — AccuWorld
### From Prototype to Sellable SaaS for Solo Practitioners
> **Created:** 2026-06-26

Written for a solo developer / small LLC targeting solo acupuncturists and small practices.
This document covers every dimension you need to address before charging real customers.

---

## 1. Legal & Compliance

### HIPAA (non-negotiable baseline)
HIPAA applies the moment your app stores, transmits, or processes any Protected Health Information (PHI) — patient names, dates of service, diagnosis codes, anything that can identify a patient in a clinical context.

**What you must do:**
- Conduct and document a formal **Security Risk Assessment** (SRA) annually. CMS provides a free SRA tool.
- Implement and document **HIPAA Policies & Procedures**: access control, breach response, workforce training, media disposal.
- Sign a **Business Associate Agreement (BAA)** with every vendor that touches PHI — your cloud provider, database host, email provider, SMS provider, AI API provider, analytics tools. No BAA = no PHI on that platform.
- Implement **Audit Logging**: every read and write of PHI must be logged with timestamp, user, and action. Logs must be retained for 6 years.
- Define and test a **Breach Notification Procedure**: notify affected patients within 60 days; notify HHS; notify media if >500 patients in a state.
- Patient **Right of Access**: patients can request their records within 30 days. Your app must support data export per patient.

**HIPAA technical safeguards you must implement:**
- Encryption in transit: TLS 1.2 minimum, TLS 1.3 preferred.
- Encryption at rest: AES-256 for all databases and backups.
- Automatic session timeout (typically 15 minutes of inactivity).
- Unique user IDs — no shared logins.
- Multi-Factor Authentication (MFA) — required for any remote access to PHI.

### Business Associate Agreements — vendor checklist
| Vendor type | BAA available from |
|-------------|-------------------|
| Cloud hosting | AWS, Google Cloud, Azure, Render (enterprise) |
| Database | AWS RDS, Supabase (enterprise tier), PlanetScale |
| Email (transactional) | SendGrid (enterprise), Mailgun (enterprise), AWS SES |
| SMS | Twilio (BAA available), Bandwidth |
| AI / LLM | Azure OpenAI, AWS Bedrock, Google Vertex AI — **NOT** standard OpenRouter or OpenAI consumer API |
| Video (telehealth) | Zoom for Healthcare, Doxy.me, Daily.co |
| Error tracking | Sentry Business (BAA available) |
| Analytics | Mixpanel (BAA available), Amplitude enterprise |

> **Current prototype gap:** Vercel hobby/pro does not offer a BAA. You must move to a HIPAA-eligible host or use Vercel Enterprise with a signed BAA before storing real PHI.

### State-Level Regulations
HIPAA is the federal floor. Several states have stricter rules:
- **California (CMIA):** Stricter patient consent requirements; civil liability.
- **Texas, New York:** Additional medical records retention requirements.
- **All states:** Medical records must be retained for a minimum of 7–10 years (longer for minors — typically until the patient turns 21 plus 7 years). Know the rules for every state you sell into.

### Terms of Service, Privacy Policy & BAA Template
You need three legal documents before your first paying customer:
1. **Terms of Service** — covers acceptable use, liability limits, termination.
2. **Privacy Policy** — HIPAA-compliant; describes how PHI is handled. Must link from every page.
3. **BAA Template** — you become a Business Associate of your customers (the Covered Entities). You must offer them a signed BAA. A healthcare attorney should draft this.

### Business Insurance
- **General Liability** — standard for any LLC.
- **Errors & Omissions (E&O) / Professional Liability** — covers you if a software error causes patient harm or data loss.
- **Cyber Liability Insurance** — covers breach response costs, regulatory fines, and notification costs. Increasingly required by enterprise buyers.

---

## 2. Authentication & Identity

The current login page is cosmetic. Production requires real auth.

**Minimum viable:**
- Email + password with bcrypt hashing (never store plaintext passwords).
- MFA (TOTP via Google Authenticator / Authy) — required for HIPAA.
- Secure session tokens (HttpOnly, Secure cookies or short-lived JWTs).
- Password reset via time-limited email links (not security questions).
- Account lockout after N failed attempts.
- Session timeout on inactivity.

**Recommended approach for a solo dev:**
Use a managed auth provider that offers a BAA: **AWS Cognito** or **Auth0 Healthcare** (BAA available on enterprise plans). Building auth from scratch introduces security risk and maintenance burden. Managed auth is worth the cost.

**Role-based access control (RBAC)** must be enforced server-side, not just in the UI. The current client-side role checks are fine for a demo but trivially bypassable in production.

---

## 3. Infrastructure

### Current state
Static SPA on Vercel, all data in browser localStorage. Zero backend, zero database.

### Production architecture (recommended for solo dev)

```
Browser (React SPA)
    ↓ HTTPS
API Server (Node.js / Next.js API routes)  ← enforce auth + RBAC here
    ↓
PostgreSQL (encrypted, on AWS RDS or Supabase)
    ↓ (async)
Object Storage (AWS S3, encrypted) ← for uploaded documents, lab results
```

**Database:** PostgreSQL is the standard for healthcare. Use AWS RDS with encryption at rest enabled, or Supabase (enterprise tier for BAA). Run automated daily backups with tested restore procedures.

**Hosting options (HIPAA-eligible):**
- **AWS** — most complete HIPAA coverage; steep learning curve solo.
- **Render** — simpler DevOps, BAA available on Business plan.
- **Railway / Fly.io** — check BAA availability before committing.
- **Vercel Enterprise** — offers BAA; suitable for the frontend layer.

**Multi-tenancy:** Each practice (customer) must be a separate tenant with strict data isolation. The simplest approach: a `practice_id` column on every table, enforced at the API layer on every query. More robust: separate database schemas per tenant.

---

## 4. Real Insurance Eligibility

The current "Check Eligibility" button is simulated. Production requires real integrations.

### Clearinghouses (the practical path for small practices)
A clearinghouse sits between your app and the hundreds of payers, handling EDI translation and payer connectivity. You connect once to the clearinghouse, not to each payer.

| Clearinghouse | Notes | Approximate cost |
|---------------|-------|-----------------|
| **Office Ally** | Free for eligibility + claims; widely used by small practices | Free (claims) / per-transaction (eligibility) |
| **Availity** | Large network, real-time eligibility | Free portal; API pricing varies |
| **Waystar** (formerly Zirmed) | Full-featured, mid-market | Monthly subscription |
| **Change Healthcare** | Large network; had major breach Feb 2024 — evaluate risk | Per-transaction |
| **Trizetto** | Enterprise-focused | Enterprise pricing |

**For a solo dev starting out:** Office Ally's API or Availity's free eligibility portal are the lowest-barrier starting points.

### EDI Standards you'll encounter
- **270/271** — Eligibility inquiry and response (real-time).
- **837P** — Professional claims submission.
- **835** — Electronic Remittance Advice (ERA) — payer sends back payment explanation.
- **276/277** — Claim status inquiry and response.

You don't need to implement raw EDI yourself. Clearinghouse APIs abstract this, but you need to understand the data model (payer IDs, NPI, taxonomy codes).

### What you need from the practitioner to check eligibility
- **NPI** — National Provider Identifier (10-digit, free from NPPES). Every practitioner billing insurance needs one.
- **Payer ID** — Each insurance company has a unique clearinghouse ID (e.g., United Healthcare = 87726).
- **Patient member ID, date of birth, name** — from the insurance card.
- **Taxonomy code** — for acupuncture: `171100000X` (Acupuncturist).

---

## 5. Billing & Claims

### CPT codes for acupuncture (already in the prototype)
| Code | Description |
|------|-------------|
| 97810 | Acupuncture, 1+ needles, 15 min (initial) |
| 97811 | Acupuncture, 1+ needles, each additional 15 min |
| 97813 | Acupuncture with electrical stimulation, 15 min (initial) |
| 97814 | Acupuncture with electrical stimulation, each additional 15 min |

### Claims submission flow (production)
1. Practitioner saves a chart note → triggers invoice creation.
2. Invoice maps to a 837P claim (patient demographics, provider NPI, payer ID, CPT codes, ICD-10 diagnosis codes, dates of service, place of service code).
3. Claim submitted to clearinghouse → clearinghouse validates and forwards to payer.
4. Payer responds with 277 (claim acknowledgement) → then later 835 (ERA with payment or denial).
5. You reconcile ERA against invoices.

### Patient billing
- Patient statements (PDF or email) for co-pays, deductibles, balances.
- Online patient payment portal (Stripe or healthcare-specific processor).
- Payment plans for large balances.

---

## 6. Payment Processing

Two separate payment concerns:

**1. Patient payments (collecting co-pays, self-pay):**
- **Stripe** — has a healthcare offering; BAA available.
- **Square for Healthcare** — simple terminal integration.
- **InstaMed** — healthcare-specific, widely used.
- Must be **PCI DSS compliant** — never store raw card numbers. Use tokenization (Stripe Elements, etc.).

**2. SaaS subscription billing (collecting from your customers):**
- **Stripe Billing** — subscriptions, invoices, dunning.
- **Paddle** — handles sales tax globally; good for solo devs who don't want to deal with tax nexus.
- You need to register for sales tax in states where you have nexus. SaaS is taxable in most US states.

---

## 7. AI Integration (Production-Grade)

The current prototype uses OpenRouter with free models. This cannot touch real PHI in production.

**HIPAA-compliant AI options with BAA:**
| Provider | BAA | Notes |
|----------|-----|-------|
| **Azure OpenAI** | ✅ | GPT-4o available; requires Azure subscription |
| **AWS Bedrock** | ✅ | Claude, Llama, Titan models; HIPAA eligible |
| **Google Vertex AI** | ✅ | Gemini models; BAA via Google Cloud agreement |
| **OpenAI** | Enterprise only | BAA on ChatGPT Enterprise / API enterprise agreements |
| **Anthropic API** (direct) | ❌ as of 2025 | No BAA available; cannot use with PHI |
| **OpenRouter** | ❌ | No BAA; demo/prototype only |

**Critical AI rule for HIPAA:** You cannot use patient PHI to train or fine-tune models without explicit patient consent and a data use agreement. Always use inference-only endpoints, and confirm the provider's data retention policy.

**Liability disclaimer for AI suggestions:** All AI-generated SOAP notes, diagnoses, formulas, and home care suggestions must display a clear disclaimer that they are drafts requiring clinical review and are not a substitute for professional judgment. This matters for E&O insurance.

---

## 8. Data Architecture (Moving off localStorage)

### What needs to change
- Replace in-memory `seed.js` + localStorage with a real relational database.
- Every entity (patients, appointments, visits, insurance profiles, invoices, treatment plans) becomes a database table.
- Add `practice_id` on every table for multi-tenancy.
- Add `created_at`, `updated_at`, `deleted_at` (soft deletes — you cannot hard-delete medical records).
- Add a separate `audit_log` table: `user_id`, `action`, `resource_type`, `resource_id`, `timestamp`, `ip_address`.

### Recommended stack for solo dev
- **Database:** PostgreSQL (AWS RDS or Supabase)
- **ORM:** Prisma (excellent DX, type-safe, migration tooling)
- **Backend:** Next.js API routes (if staying in the JS ecosystem) or Fastify/Express
- **File storage:** AWS S3 (for uploaded documents, X-rays, signed consent forms)

### Data you'll add in production that the prototype doesn't have
- Patient consent forms (signed, timestamped)
- Insurance card images
- Referral letters / outside records
- Lab results
- HIPAA acknowledgement receipts
- Signed treatment plan agreements

---

## 9. Patient Communication

### What the prototype doesn't have (but production needs)
- **Appointment reminders** (SMS + email) — reduces no-shows by 30–40%.
  - SMS: Twilio (BAA available). Must comply with TCPA — get explicit opt-in consent before texting patients.
  - Email: SendGrid or AWS SES (enterprise BAA).
- **Secure patient messaging** — standard email is not HIPAA-compliant for clinical messages. Options: Klara, OhMD, or build a secure in-app message thread.
- **Patient portal** (optional for solo acupuncturist, but expected by some patients): intake forms, appointment requests, payment receipts.
- **Online booking** — patients self-schedule from your website. Integrate with your schedule, not a separate tool.

---

## 10. Acupuncture-Specific Requirements

### Licensing
- Acupuncture is licensed in 47 states + DC. License number and expiration must be stored and surfaced on superbills and claims.
- NCCAOM (National Certification Commission for Acupuncture and Oriental Medicine) — many states require NCCAOM certification. Your app should store certification number and renewal date.
- Some states require Continuing Education Unit (CEU) tracking — a future feature worth noting.

### Billing nuances
- Some payers require a **prior authorization** or **referral** before acupuncture is covered. Your insurance tracker should flag this.
- Medicare covers acupuncture for chronic low back pain (up to 12 visits / 90 days; 8 additional if documented improvement). Different rules than commercial payers.
- **Modifier codes** matter: `-KX` (documentation supports medical necessity), `-59` (distinct procedural service). Your superbill must support modifiers.
- **Place of Service code:** 11 (office) is standard for private practice.

### ICD-10 codes you'll use most
| Code | Condition |
|------|-----------|
| M54.5 | Low back pain |
| G43.909 | Migraine |
| M54.2 | Cervicalgia (neck pain) |
| F41.1 | Generalized Anxiety |
| G47.00 | Insomnia |
| M79.3 | Panniculitis (fibromyalgia-adjacent) |

---

## 11. Go-to-Market Considerations

### Pricing model
- **Monthly subscription per practice** is standard (Jane App: $54–99/mo, Unified Practice: $49–152/mo).
- Recommended starting price for a solo dev with fewer features: **$39–59/mo** — below Jane App, above Carepatron (free).
- Consider a **free trial** (14–30 days, no credit card) to reduce friction.
- **Annual plan discount** (2 months free) improves cash flow and reduces churn.

### Onboarding
- Guided setup wizard: practice name, NPI, state license, payer list, first patient.
- Data import: CSV import for patient roster from prior systems.
- Pre-built payer library (common payers with their clearinghouse IDs pre-filled).

### Customer support
- In-app live chat (Intercom, Crisp) is expected by solo practitioners.
- Email support with < 24-hour SLA.
- Knowledge base / help articles.
- HIPAA note: support chat tools that handle PHI need a BAA too.

### Differentiator to maintain
The insurance benefits dashboard remains the wedge. In production, make it even more powerful:
- Proactive alerts when a patient's authorized visits are about to run out — before the appointment, not after.
- One-click real eligibility check with results stored and timestamped (audit trail for payer disputes).
- Renewal workflow: remind practitioner 30 days before re-authorization is needed.

---

## 12. DevOps & Reliability

### What a solo dev needs at minimum
- **CI/CD:** GitHub Actions (already using GitHub) → automated tests → deploy on merge to main.
- **Automated tests:** At minimum, integration tests for the billing and insurance eligibility flows. A bug there costs real money.
- **Error tracking:** Sentry (BAA available on Business plan). Configure it to scrub PHI from error payloads.
- **Uptime monitoring:** Better Uptime, Pagerduty, or Datadog. You need to know before your customers do.
- **Database backups:** Daily automated backups, retained for 30 days. Test restore quarterly.
- **Staging environment:** A separate environment with synthetic (fake) patient data for testing before production deploys.

### Logging rules under HIPAA
- Application logs must **not** contain PHI (no patient names, DOBs, MRNs in log lines).
- Audit logs (who accessed what) must be separate, tamper-evident, retained 6 years.
- Log aggregation: AWS CloudWatch, Datadog, or Papertrail — check BAA availability.

---

## 13. Rough Cost Model (Monthly, Early Stage)

| Item | Estimated monthly cost |
|------|----------------------|
| AWS / cloud infrastructure (small) | $50–150 |
| PostgreSQL (RDS small instance) | $30–80 |
| Auth provider (Auth0 / Cognito) | $0–50 |
| Clearinghouse (eligibility checks) | $50–200 (volume-dependent) |
| HIPAA-compliant AI API (Azure OpenAI) | $20–100 (usage-dependent) |
| SMS provider (Twilio) | $20–50 |
| Email provider (SendGrid) | $15–30 |
| Error tracking (Sentry) | $26 |
| Uptime monitoring | $20 |
| Legal (amortized) | $100–200 |
| Cyber liability insurance | $100–200 |
| **Total** | **~$450–1,100/mo** |

Break-even at $49/mo per practice: **~10–22 practices.**
Target 50 practices to reach comfortable solo-developer profitability.

---

## 14. What to Build First (Prioritized Roadmap)

If starting production development today, in this order:

1. **Real auth + MFA** — nothing ships without this.
2. **HIPAA-compliant infrastructure** — move off Vercel hobby, get BAAs signed with all vendors.
3. **PostgreSQL data layer** — replace localStorage with a real database; implement audit log.
4. **Multi-tenancy** — practice_id isolation on every table.
5. **Real eligibility check** — Office Ally or Availity integration; this is the demo wedge made real.
6. **Appointment reminders** (SMS/email) — highest-value feature for reducing no-shows.
7. **Real claims submission** — 837P via clearinghouse.
8. **Patient portal (lightweight)** — intake forms + appointment requests.
9. **Native mobile / PWA** — practitioners use iPads; responsive web is table stakes.
10. **Stripe billing** for your own subscription management.

---

## 15. What You Can Keep from the Prototype

- The React + Vite + Tailwind + shadcn/ui stack — production-ready, just add a backend.
- The TCM charting data model (SOAP, pulse, tongue, points, modalities) — well-structured.
- The insurance cockpit UI — the core differentiator; refine, don't rebuild.
- The seed data patterns — useful for staging environment synthetic data.
- The AI suggestion features — move to Azure OpenAI or AWS Bedrock with a BAA.
- The Help drawer concept — evolve into a full in-app knowledge base.

---

*Document created: 2026-06-26. Review annually or whenever regulations change. Not legal advice — consult a healthcare attorney before launching.*
