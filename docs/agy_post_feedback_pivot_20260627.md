# AccuWorld: Post-Feedback Pivot Strategy
> **Created:** 2026-06-27

**Session Date:** June 26, 2026  
**Practitioner:** Leonid Belenitsky, M.S., L.Ac. — Acupuncture & Karma Yoga Institute, Monroe Township, NJ  
**Current System:** WebPT (EMR, $160/mo) + CollaborateMD (integrated billing) + Paper-based patient intake packets (5 pages)  

---

## 1. Executive Summary & Strategic Reframe

Based on the direct feedback from the practitioner transcript and the analysis of their active workflow:
* **The Strategic Shift:** The initial positioning of AccuWorld was *“an insurance dashboard for tracking eligibility.”* The pivot reframes AccuWorld as **a unified clinical lifecycle manager for solo acupuncturists**.
* **The Goal:** Replace the fragmented stack of **WebPT ($160/mo) + CollaborateMD + Paper Intake + Paper Attendance Sheets** with a single, integrated, acupuncture-native tool.
* **The Core Wedge:** Elevate the **digital patient intake packet** (fully gatekeepered with electronic signatures) and a **visual, clickable pain body diagram** as the workflow entry point, while correcting the database architecture to support **Cases** and **Western ICD-10 billing code requirements** instead of TCM-only diagnostic schemas.

---

## 2. Key Insights & Ground Realities

### A. Patient Onboarding & Digital Intake
The practitioner's patient lifecycle begins with a 5-page paper packet. Every section is legally or operationally required before clinical treatment or insurance claim submissions can occur. 
* **The Portal Myth:** The practitioner does *not* want a self-service patient portal ("I don't let patients in"). Instead, the intake packet must be filled out on a clinic-owned device (e.g., an iPad) or sent via an email link *before* the first visit, flowing directly into the practitioner's EHR interface.
* **Signature Gating:** Every page of the intake requires client signature authentication. The software must enforce a strict validation path: the patient cannot submit the intake or advance without signing the HIPAA Disclosure, Consent to Treat, Arbitration Agreement, and Financial Policy.

### B. The "Case" as the Clinical Unit
In professional EHRs (like WebPT), visits are not linked directly to patients. Instead, they are organized under **Cases** (e.g., "Low Back Pain 2026").
* A patient can have multiple concurrent or historical Cases.
* Each Case is bound to specific **Western ICD-10 Diagnosis Codes** and a specific **Insurance/Self-Pay Profile**.
* All daily SOAP charts must link to an active Case so the proper diagnosis codes are automatically attached to the billing invoice.

### C. Western ICD-10 vs. TCM Diagnostics
A major gap in the initial prototype was charting primarily in Eastern medicine terminology (e.g., Qi Stagnation, Liver Yin Deficiency).
* **Insurance Reality:** Insurance clearinghouses will immediately reject any claim containing Eastern medical diagnoses. 
* **The Solution:** The app must enforce **Western ICD-10 codes** for billing and claims (e.g., `M54.5` for Low Back Pain, `M54.2` for Cervicalgia), while keeping TCM tongue/pulse assessments and acupuncture points inside an internal-only notes section labeled *"Internal clinical record — not submitted to insurance."*

### D. Acupuncture CPT Code Structure
Acupuncture procedure billing uses exactly **four active CPT codes** based on 15-minute time units (plus one unlisted code). The app's billing module must default to these rates:

| CPT Code | Description | Default Rate |
|----------|-------------|--------------|
| **97810** | Initial Acupuncture without E-Stim (first 15 min) | $75 |
| **97811** | Acupuncture Additional without E-Stim (each add'l 15 min) | $70 |
| **97813** | Initial Acupuncture with E-Stim (first 15 min) | $90 |
| **97814** | Acupuncture with E-Stim (each add'l 15 min) | $80 |
| **20999** | Unlisted musculoskeletal procedure | Manual entry |

* **Billing Math:** A standard 45-minute treatment counts as 3 units (e.g., 1 unit of `97810` + 2 units of `97811`). The app must calculate total charges based on units.

### E. Note Signing as the Billing Trigger
In a compliant EHR, a note starts as a `Draft`. Editing is allowed until the practitioner signs the note.
* **Sign & Lock:** Clicking "Sign Note" locks the SOAP chart (rendering it read-only) and automatically transmits the procedure/diagnosis codes to the billing ledger to create the invoice.
* **Unsigned Notes Dashboard:** Unsigned notes represent unsubmitted claims. The dashboard must flag these to protect the clinic's cash flow.

### F. Physical Attendance Verification
Medicare and other commercial auditors require proof of physical attendance. Acupuncturists carry paper logs signed by patients at each visit.
* **The Digital Attendance Sheet:** The app must display an attendance log where patients check in at each visit and provide a quick signature verifying they received treatment on that date.

---

## 3. Database Schema Modifications (Pivot Ready)

To support the pivot, we must transition from the flat entities of the prototype to a relational model structured around **Cases**, **Signatures**, and **Time-based CPT units**.

```
+----------------+      +-------------------+      +----------------------+
|    Patient     | ---> |       Case        | ---> |        Visit         |
| (Demographics) |      | (ICD-10, Payer)   |      | (SOAP Notes, Status) |
+----------------+      +-------------------+      +----------------------+
        |                         ^                            |
        v                         |                            v
+----------------+                |                  +----------------------+
| PatientIntake  | ---------------+                  |   BillingInvoice     |
| (Signed Forms) |                                   | (CPT codes & Units)  |
+----------------+                                   +----------------------+
```

### A. Case Schema (`aw_cases`)
```json
{
  "id": "case_01",
  "patientId": "pat_01",
  "title": "Lumbar Sciatica 2026",
  "status": "active", // active | closed
  "primaryIcd10": "M54.31", // Sciatica, right side
  "secondaryIcd10": ["M54.50"], // Low back pain, unspecified
  "insuranceProfileId": "ins_01", // Links to payer details
  "injuryType": "none", // none | auto_accident | work_injury | surgical_related
  "dateOpened": "2026-06-28",
  "dateClosed": null
}
```

### B. Patient Intake Packet Schema (`aw_intake_packets`)
```json
{
  "id": "intake_01",
  "patientId": "pat_01",
  "completedAt": "2026-06-28T09:15:00Z",
  "demographics": {
    "title": "Mr.",
    "firstName": "Maria",
    "lastName": "Rodriguez",
    "middleName": "L.",
    "dob": "1980-05-12",
    "phone": "555-0199",
    "address": "123 Elm St, Monroe Township, NJ 08831",
    "emergencyContactName": "Jose Rodriguez",
    "emergencyContactPhone": "555-0198"
  },
  "medicalHistory": {
    "chiefComplaint": "Severe lower back pain radiating to the right leg.",
    "complaintOnset": "2026-05-10",
    "surgeries": [{ "description": "Gallbladder removal", "date": "2018" }],
    "medications": ["Ibuprofen 400mg as needed"],
    "familyHistory": ["Diabetes", "High Blood Pressure"],
    "temperatureSensations": ["Hot Flashes"]
  },
  "painDrawing": {
    "bodyMarkers": [
      { "x": 142, "y": 420, "region": "lower_back", "side": "right", "type": "radiating" }
    ],
    "patientSignature": "data:image/png;base64,..."
  },
  "consents": {
    "hipaaSigned": true,
    "consentToTreatSigned": true,
    "arbitrationSigned": true,
    "financialPolicySigned": true,
    "assignmentOfBenefitsSigned": true,
    "patientSignature": "data:image/png;base64,...",
    "dateSigned": "2026-06-28"
  }
}
```

### C. Visit / Soap Chart Schema (Modified `aw_visits`)
```json
{
  "id": "visit_01",
  "caseId": "case_01", // Linked to Case, not directly to Patient
  "appointmentId": "appt_01",
  "date": "2026-06-28",
  "status": "draft", // draft | signed
  "signedAt": null,
  "signedBy": null,
  "tcmNotes": {
    "pulse": { "rate": "Normal", "quality": "Wiry" },
    "tongue": { "body": "Pink", "coating": "Thin White" },
    "acupoints": ["LI4", "LV3", "GB34", "BL23"],
    "modalities": ["Acupuncture", "E-Stim"]
  },
  "billingCodes": [
    { "cptCode": "97813", "units": 1, "charge": 90.00 }, // E-Stim Initial 15m
    { "cptCode": "97814", "units": 2, "charge": 160.00 } // E-Stim Add'l 30m
  ],
  "attendanceSignature": "data:image/png;base64,..." // Per-visit check-in verification
}
```

---

## 4. Priority Implementation Roadmaps

### Milestone 1: Clinical Core & Correct Billing (Sprint 1)
* **Goal:** Correct acupuncture fee coding, separate clinical from billing fields.
* **Tasks:**
  * Implement the 4 standard CPT codes (`97810`, `97811`, `97813`, `97814`) with unit-based calculations.
  * Restructure Add Patient demographics to include Title, Middle Name, Referral Source, and Subscriber/Group numbers.
  * Add the "Sign & Lock" button on SOAP charts. Draft notes show a warning badge, signed notes lock clinical text inputs.

### Milestone 2: Case Management & ICD-10 (Sprint 2)
* **Goal:** Align app workflow with the practitioner's Case-based organization.
* **Tasks:**
  * Add the `Case` UI component on the Patient Profile page.
  * Implement a searchable ICD-10 database (using the acupuncture-relevant subset: back pain, neck pain, sciatica, migraine, etc.).
  * Route visit creation so that a visit belongs to a specific Case, auto-populating the Western Diagnosis.
  * Add a warning banner to the SOAP note page if Eastern terminology is input into the billing/diagnosis fields.

### Milestone 3: Interactive Patient Intake (Sprint 3)
* **Goal:** Digitalize the 5-page paper packet.
* **Tasks:**
  * Build a clinic-device layout mode ("iPad Intake Mode") accessible via the dashboard.
  * Create the 5-screen intake flow: HIPAA → Medical History → Interactive Pain Drawing → Informed Consent → Financial Agreement.
  * Integrate a canvas-based drawing interface for the interactive pain markers and digital signatures.
  * Restructure the patient detail page to view signed consents and the medical history data.

### Milestone 4: Compliance Auditing & Dashboard Metrics (Sprint 4)
* **Goal:** Eliminate paper compliance liabilities.
* **Tasks:**
  * Build a digital attendance sheet check-in screen for incoming patients to sign off on the visit date.
  * Update the dashboard to include:
    * Count of unsigned SOAP notes (Draft status).
    * Pending intakes queue (patients added but forms not signed).
    * Coverage check alert based on subscriber/group numbers.
