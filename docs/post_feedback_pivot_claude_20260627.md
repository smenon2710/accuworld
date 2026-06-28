# AccuWorld — Post-Feedback Pivot Document
> **Created:** 2026-06-27

**Session date:** June 26, 2026  
**Practitioner:** Leonid Belenitsky, M.S., L.Ac. — Acupuncture & Karma Yoga Institute, Monroe Township, NJ  
**Current stack:** WebPT ($160/month EMR) + CollaborateMD (billing, integrated with WebPT)  
**Intake process:** Paper forms only (two iPads have been broken by patients)

---

## 1. What We Learned — Key Revelations

### 1.1 The intake form IS the workflow entry point
The practitioner's entire patient relationship begins with a 5-page paper packet. Before any treatment, every patient must complete and sign all sections. This is not optional boilerplate — specific sections (consent to treat, arbitration agreement, assignment of benefits) are legally required before a claim can be filed. **AccuWorld has no patient intake flow at all.** This is the single largest gap.

### 1.2 Insurance rejects TCM terminology — Western diagnosis is required
This is a critical misunderstanding in the current prototype. AccuWorld's charting is built around TCM language (qi deficiency, stagnation, blockages, heat). The practitioner was explicit: **insurance will reject any claim that contains acupuncture/Eastern terms as diagnosis**. Claims must use Western ICD-10 terminology (e.g., "lumbar pain," "cervicalgia," "headache"). TCM terms belong only in the practitioner's internal clinical notes, never on the claim.

### 1.3 The CPT codes in the prototype are wrong
Acupuncture billing uses exactly **4 active CPT codes**. Everything else (the 123 PT codes in WebPT) is irrelevant. The practitioner checked the existing prototype's billing codes and they do not match what he actually uses.

**The 4 acupuncture CPT codes:**
| Code | Description | His rate |
|------|-------------|----------|
| 97810 | Initial Acupuncture without E-Stim (first 15 min) | $75 |
| 97811 | Acupuncture Additional without E-Stim (each add'l 15 min) | $70 |
| 97813 | Initial Acupuncture with E-Stim (first 15 min) | $90 |
| 97814 | Acupuncture with E-Stim (each add'l 15 min) | $80 |

One visit = typically 3 units (45 minutes). Each unit = 15 minutes = one code entry on the claim.

### 1.4 "Case" is the clinical unit — not visit, not patient
WebPT organizes treatment around **Cases**: one case per condition episode (e.g., "Neck Pain 2026," "Lower Back Pain 2026"). Each case has its own ICD codes, insurance linkage, and series of daily notes. Multiple cases can exist for one patient simultaneously or over time. AccuWorld has no concept of a case — it links visits directly to patients, which is how a consumer app works, not how a clinical EMR works.

### 1.5 The attendance sheet is an insurance audit requirement
Some insurers (particularly Medicare auditors) require proof that the patient was physically present for each billed session — a per-visit attendance sheet with the patient's signature and date. If the practitioner cannot produce this on audit, they may be required to return all money collected for that period. AccuWorld has no mechanism for this.

### 1.6 The practitioner does NOT want a patient portal
He was explicit: "I don't let patients in." Patients should not have any login or self-service view. However, he does want patients to fill out the intake form digitally (on a clinic device) before being entered into the system — replacing the paper packet, not creating a portal.

### 1.7 Pain diagram needs to be visual and clickable
The current prototype's chief complaint is a text field. The practitioner pointed out that many patients (elderly, non-English speakers, low-literacy) cannot accurately describe their pain in text. He specifically wants a **body diagram where the patient clicks/marks the area of pain** — front and back views, clearly labeled Left/Right. This is also how his current paper form works (the anatomical dermatome diagram on page 3 of the intake packet).

### 1.8 Chief complaint flows directly to insurance — it is not just a clinical note
The chief complaint captured at intake is the same text that appears on the insurance claim. It must be in plain Western medical language (not TCM terms) and must be accurate. The practitioner currently reviews and corrects patient-entered complaints before submission.

### 1.9 Electronic signature is a hard requirement
Every page of the intake packet requires a patient signature. The consent to treat and arbitration agreement also require the practitioner's countersignature. Electronic signature (typed name or finger/stylus draw) is acceptable legally. Without it, the digital form has no legal standing.

### 1.10 Insurance key fields: Subscriber ID + Group Number
When a patient presents their insurance card, the practitioner needs Subscriber ID and Group Number above all else. Group number indicates whether acupuncture is covered at all under that plan. This lookup is currently manual (calling the insurer or checking their portal). AccuWorld's insurance cockpit should prominently display these two fields and make them editable at intake.

### 1.11 The "sign" action on notes triggers the billing claim
In WebPT, the practitioner reviews the daily note, adds procedure codes and units, and clicks "Sign." That sign action transmits the claim to CollaborateMD. Until a note is signed, no claim is sent. AccuWorld should model this: notes have a "Draft → Signed" state, and only signed notes generate billable entries.

### 1.12 Western NJ insurance landscape (relevant for demo)
Primary payers that cover acupuncture in NJ: Horizon BCBS, Aetna, United, Cigna (rarely), some small commercial plans. Medicare covers acupuncture but only for chronic low back pain, only 12 sessions/year, and only 1 set of needles per session. Medicaid never covers acupuncture. The demo seed data should reflect this reality.

---

## 2. Current State vs. WebPT — Gap Analysis

| Capability | WebPT (what he has) | AccuWorld (what we built) | Gap |
|---|---|---|---|
| Patient intake (HIPAA, consent, financial policy) | Paper forms only | None | **Critical missing** |
| Electronic signature | Not in WebPT either | None | **Critical missing** |
| Pain body diagram | Paper diagram | None | **High priority** |
| Patient demographic entry | Full form (Add Patient) | Basic add dialog | Partial — missing key fields |
| Case management (per-condition episode) | Yes, with ICD codes | None — visits tied directly to patient | **Critical missing** |
| Western/ICD diagnosis on notes | Yes (required by insurance) | No — TCM-only charting | **Critical gap** |
| Correct CPT codes for acupuncture | 97810/11/13/14 (checked) | Unknown/incorrect | **Must fix** |
| Note sign-off → claim trigger | Yes (Sign button) | No signed/draft state | Important |
| Attendance sheet (per-visit patient signature) | Paper | None | Important for compliance story |
| Acupuncture-specific fee schedule | Buried inside PT-first system | Partially built | Needs correction |
| Insurance payer management (Subscriber ID, Group #) | Yes (Insurance Manager) | Partial (benefits tracker) | Needs fields |
| Physician/referral manager | Yes (not needed for acupuncture) | Not built | Skip — irrelevant |
| Billing claim transmission | Via CollaborateMD integration | Mock invoices only | Prototype scope — keep mock |
| Reports (billing, payment log, missed notes) | Extensive | None | Lower priority for demo |

---

## 3. Priority Pivots

### Priority 1 — Patient Intake Form (Digital Packet)
**Why #1:** The practitioner's entire onboarding workflow is blocked without this. He said explicitly: "Patient comes, fill out this form, after I ask some questions, after I do treatment." The form precedes everything else. No digital intake = he can't switch from paper.

**What to build:**
A multi-step digital intake flow accessible from the "Add Patient" button, designed to run on a clinic device (not a patient portal). Five screens corresponding to his 5-page paper packet:

**Screen 1 — HIPAA + Patient Confidential Information**
- Display the HIPAA notice text (copy from his form verbatim)
- Fields: Full name (print), address, city, state, zip, primary phone, email, age, date of birth, sex (M/F — keep simple), marital status (S/M/D/W), referral source, occupation, employer, emergency contact + relation + phone
- Patient signature (drawn or typed) + date required to proceed
- Cannot advance without signature — enforce this in UI

**Screen 2 — Medical History**
- Chief complaint (text) + date of onset
- List all surgeries and approximate dates (free text or add-row table)
- Traumatic injuries (car accident, sporting, other) + dates
- Serious illnesses + dates including childhood
- All current prescription medications (add-row)
- Family history checkboxes: Asthma, Heart Disease, Diabetes, Allergies, Epilepsy, Kidney Disease, Bleeding Disorders, Hepatitis, Cancer, Autoimmune Disease, High Blood Pressure, Migraine, Arthritis, Stroke, Mental Illness
- Body temp/perspiration: Hot / Cold / Chills / Sense of Heat / Hot Flashes / Night Sweats / Spontaneous Sweating (multi-select)
- Emotions: Mood swings, Anxiety, Depression, Irritability, History of abuse, Attempted suicide, Stress level (0–10)

**Screen 3 — Pain Drawing**
- Interactive body diagram (front + back silhouettes)
- Patient clicks/taps to place pain markers on the body
- Clear Left / Right labels on each view
- "Mark radiating pain" mode (different color or dashed circle)
- Clean, high-quality rendering — practitioner specifically said the current paper diagram is "not good quality" and wanted something better, possibly AI-generated anatomical reference with no labels
- Patient signature + date

**Screen 4 — Acupuncture Informed Consent to Treat**
- Display full consent text (copy from his form)
- Practitioner pre-signs (their signature stored once at clinic setup)
- Patient signature + date required
- Cannot proceed without both signatures

**Screen 5 — Financial Policy + Arbitration Agreement + Assignment of Benefits**
- Display financial policy text (his form mentions: insurance coverage check is patient responsibility, copay due before treatment, one area per session rule, Medicare/Medicaid policy)
- Display arbitration agreement full text
- Assignment of Benefits section
- Attendance sheet: table with Date + Patient Signature columns (printed/shown per visit, or captured digitally at each visit check-in)
- Patient signature + date + initials where required

**After completion:** All data flows into the patient record. The practitioner can review and edit before finalizing. Signatures are stored as images or typed-name confirmation on the record.

---

### Priority 2 — ICD-10 Western Diagnosis + Case Management
**Why #2:** Without Western diagnosis and the case concept, the clinical notes are not insurance-billable and do not match the workflow the practitioner actually follows.

**What to build:**

**Case concept on patient record:**
- Each patient can have one or more Cases
- Case fields: Case Title (e.g., "Low Back Pain 2026"), Primary ICD-10 code(s), Date opened, Status (active/closed), Linked insurance, Cause (None / Car accident at fault / Car accident no-fault / Work injury / Surgical related — must default to None)
- All visits/daily notes attach to a Case, not directly to the patient
- Patient detail view shows Cases as the primary organizing structure

**ICD-10 code support (acupuncture-relevant subset):**
The practitioner only needs a small set. Pre-populate a searchable list with the most common acupuncture diagnoses:
- M54.5 / M54.50 / M54.51 — Low back pain
- M54.2 — Cervicalgia (neck pain)
- M54.3 — Sciatica
- G43.x — Migraine
- M25.5x — Joint pain (shoulder, knee, etc.)
- M79.3 — Panniculitis
- G89.29 — Other chronic pain
- R51 — Headache
- M79.1 — Myalgia
- G47.00 — Insomnia
- F41.1 — Generalized anxiety
- N94.x — Menstrual disorders
- G54.4 — Lumbosacral plexus disorders

Full free-text search + code entry as fallback.

**Modify the charting/daily note form:**
- Add "Western Diagnosis" field at the top (pulls from or links to the Case ICD code)
- Add explicit warning if practitioner tries to enter TCM terminology in diagnosis fields that will go to insurance ("Insurance claims require Western/ICD terms — TCM terms belong in your clinical notes only")
- Keep TCM fields (pulse, tongue, acupoints, treatment strategy) as internal clinical notes — clearly labeled "Internal clinical record — not submitted to insurance"

---

### Priority 3 — Correct CPT Codes + Note Sign-Off State
**Why #3:** The billing module is broken for this practitioner because it has the wrong procedure codes. Quick fix, high credibility impact.

**What to fix:**

**Default acupuncture CPT codes in billing:**
Replace current defaults with:
- 97810 — Initial acupuncture w/o E-Stim (first 15 min) — $75
- 97811 — Acupuncture additional w/o E-Stim (ea. add'l 15 min) — $70
- 97813 — Initial acupuncture w/ E-Stim (first 15 min) — $90
- 97814 — Acupuncture w/ E-Stim (ea. add'l 15 min) — $80
- 20999 — Unlisted procedure, musculoskeletal (no default rate — manual entry)

**Unit-based billing:**
- Each CPT line has a "Units" field (1 unit = 15 min)
- Total time auto-calculated (units × 15 min)
- Typical visit = 3 units (45 min) — show this as the default
- Total charge auto-sums

**Note sign-off state:**
- Daily notes have status: Draft → Signed
- "Sign Note" button locks the note (no further edits) and marks it as ready for claim
- Unsigned notes show an amber badge in the visit list ("Unsigned — claim not submitted")
- Dashboard flag: count of unsigned notes

---

### Priority 4 — Patient Demographic Fields (Align with WebPT Add Patient)
**Why #4:** Several fields the practitioner considers essential are missing from AccuWorld's Add Patient form.

**Fields to add/fix:**
- Title (Mr./Mrs./Ms./Dr.)
- Middle name
- Suffix
- Preferred name
- Referral source (how they found the clinic)
- Occupation + Employer
- Emergency contact + relation + phone
- "In collections" flag
- Language preference
- Marital status (already partially exists — verify it's on the form)
- Subscriber ID (insurance) — prominently displayed and editable from patient detail
- Group number — prominently displayed (this is the key field for coverage verification)

**Insurance card fields to surface clearly:**
The practitioner said: "Subscriber ID and Group number — those are the key important fields." Make these two fields the most prominent in the insurance section of patient detail, not buried in a form.

---

### Priority 5 — Attendance Sheet (Per-Visit Patient Sign-Off)
**Why #5:** Insurance audits require it. The practitioner carries paper attendance sheets that patients sign each visit. This is a liability item.

**What to build:**
- Each appointment/visit has a "Patient Checked In" action that captures: date + patient acknowledgment (typed name or signature)
- Visible in the visit history as a signed/unsigned indicator
- Printable attendance sheet per patient showing all visit dates and sign-off status
- This replaces his current paper attendance sheet entirely

---

## 4. What Does NOT Change

These AccuWorld strengths were validated and should stay:

- **Insurance dashboard as the morning workflow** — Practitioner did not contradict this. He confirmed insurance coverage tracking is a daily concern.
- **No patient portal** — Confirmed explicitly. Patients never log in.
- **TCM charting fields (pulse, tongue, acupoints)** — Keep as internal clinical notes. Just separate them clearly from insurance-facing fields.
- **Single practitioner, no roles beyond front desk / practitioner** — Confirmed. His clinic is solo.
- **Simulated eligibility check** — Validated as the right concept. He checks eligibility manually or via a separate tool. An integrated check is the improvement.
- **Seed data pricing** — Actual rates confirmed: $75–$90 per initial unit, $70–$80 per additional unit. Update seed data to match.

---

## 5. What to Deprioritize

- **Physician/referral manager** — He said it's not needed for acupuncture (direct access). Skip entirely.
- **Gender identity / pronouns** — He noted these are politically contingent and most of his patients don't need them. Keep sex (M/F) for insurance compliance; skip gender identity fields.
- **Contact Manager** — WebPT has this for large multi-provider offices. Solo practice doesn't need it.
- **Reports module** — WebPT has extensive reporting (Billing Report, Payment Log, Lost Patient Log, Productivity Report, Claims Feed, Outcomes Reports). These are real needs but secondary for a solo practitioner demo. Keep the existing basic billing view; don't expand reporting yet.
- **Supply CPT codes** — The 47 supply codes in WebPT are for PT/wound care. Irrelevant for acupuncture.

---

## 6. Recommended Build Sequence

| Sprint | Feature | Effort | Demo Impact |
|--------|---------|--------|-------------|
| 1 | Fix CPT codes to 97810/11/13/14 in billing | 1 day | Immediate credibility |
| 1 | Add missing patient demographic fields | 1 day | Immediate credibility |
| 2 | Case management (per-condition episode with ICD codes) | 3 days | High — matches his actual workflow |
| 2 | ICD-10 Western diagnosis on chart notes | 2 days | High — required for insurance |
| 2 | Note sign/draft state | 1 day | Medium |
| 3 | Patient intake form — Screens 1 & 2 (HIPAA + medical history) | 3 days | Very high — this is the entry point |
| 3 | Patient intake form — Screen 3 (pain body diagram) | 3 days | Very high — visual differentiator |
| 4 | Patient intake form — Screens 4 & 5 (consent + financial/legal) | 3 days | Required for compliance story |
| 4 | Electronic signature capture | 2 days | Required for intake to be real |
| 5 | Attendance sheet per visit | 2 days | Insurance audit differentiator |
| 5 | Insurance subscriber ID / group # prominent display | 1 day | Quick UX win |

---

## 7. Strategic Reframe

The pre-feedback positioning was: **AccuWorld wins on the insurance dashboard.**

The post-feedback positioning should be: **AccuWorld is the only acupuncture-native system that handles the full patient lifecycle — from digital intake and legal compliance through TCM charting (internal) and insurance-ready billing (Western).**

WebPT costs $160/month, was built for physical therapy, and the acupuncturist is hacking it to work. CollaborateMD costs additional on top. He uses paper for intake. That's 3 separate systems and paper — for one solo practitioner.

AccuWorld's new wedge is **replacing all three with one purpose-built tool** at a fraction of the cost. The insurance dashboard is now a feature of a complete system, not the sole differentiator.

The demo walkthrough should now follow the actual patient journey:
1. New patient calls → add patient + launch intake form
2. Patient fills intake on clinic device → signs all 5 sections
3. Practitioner opens the dashboard → sees today's schedule + insurance flags
4. Patient arrives → check eligibility → open case (condition + ICD code)
5. Practitioner charts (TCM internal notes + Western diagnosis)
6. Sign the note → billing entry created with correct CPT codes + units
7. Mark copay collected → invoice closed

This is the story WebPT + CollaborateMD + paper cannot tell in under 60 seconds. AccuWorld can.

---

*Document created: 2026-06-28 | Based on recorded session transcript + WebPT portal photos + paper intake form (5 pages)*
