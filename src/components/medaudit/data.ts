export type ClaimStatus =
  | "PENDING"
  | "SCANNING"
  | "CLEARED"
  | "DISPUTED"
  | "ERROR"
  | "Parsing"
  | "Cross-Referencing"
  | "Action Required"
  | "Clean";

export interface DisputedCodeItem {
  cpt_code: string;
  billed_description: string;
  standard_description: string;
  billed_amount: number;
  medicare_baseline: number;
  issue: "UPCODING" | "UNBUNDLING" | "PRICE_DISPARITY" | "OUT_OF_NETWORK" | string;
}

export interface PatientInfo {
  name?: string;
  dob?: string;
  policy_id?: string;
}

export interface ProviderInfo {
  name?: string;
  npi?: string;
}

export interface BilledItem {
  code: string;
  label: string;
  amount: number;
  disputed?: boolean;
}

export interface ReasoningStep {
  number: number;
  title: string;
  detail: string;
  citation: string;
}

export type Claim = {
  id: string;
  provider: string;
  facility: string;
  date: string;
  savings: number;
  status: ClaimStatus;
  filename?: string;
  npi?: string;
  taxId?: string;
  patientId?: string;
  issueTitle?: string;
  recommendedCode?: string;
  billedAmount?: number;
  benchmarkRate?: number;
  ncciModifierIndicator?: 0 | 1;
  confidenceScore?: number;
  evidenceJustification?: string;
  billedItems?: BilledItem[];
  reasoningSteps?: ReasoningStep[];
  // Backend & LLM integration fields
  disputed_codes?: DisputedCodeItem[];
  agent_reasoning?: string;
  dispute_letter_markdown?: string;
  patient_info?: PatientInfo;
  provider_info?: ProviderInfo;
};

export const claims: Claim[] = [
  {
    id: "CLM-88214",
    provider: "St. Anselm Regional",
    facility: "Emergency Department",
    date: "Sep 3, 2026",
    savings: 640,
    status: "DISPUTED",
    filename: "emergency_invoice_st_anselm.pdf",
    npi: "1092837482",
    taxId: "94-2849102",
    patientId: "PT-9938102",
    issueTitle: "⚠️ Potential Upcoding / Documentation Review Warranted",
    recommendedCode: "CPT 99283 · $610.00",
    billedAmount: 1250,
    benchmarkRate: 610,
    ncciModifierIndicator: 0,
    confidenceScore: 89.4,
    evidenceJustification:
      "CPT 99285 represents High-Complexity Medical Decision Making (MDM). Itemized billing lacks corresponding high-acuity diagnostics. Recommend verifying complete physician documentation for CPT 99283/99284 equivalence.",
    disputed_codes: [
      {
        cpt_code: "99285",
        billed_description: "Emergency Dept Visit, high severity",
        standard_description: "Emergency Dept Visit, moderate severity (CPT 99283)",
        billed_amount: 1250,
        medicare_baseline: 610,
        issue: "UPCODING",
      },
    ],
    agent_reasoning:
      "Encounter documentation supports moderate complexity Medical Decision Making (MDM), not high severity with immediate threat to life or organ function. Zero critical care physician time recorded. Patient vital signs remained within baseline thresholds throughout the entire emergency department encounter.",
    dispute_letter_markdown: `RE: Documentation Substantiation Request & Coding Inquiry — Claim CLM-88214
To: Adjudication Dept, St. Anselm Regional (NPI: 1092837482)
Date: Sep 3, 2026

We are writing to request clinical documentation substantiation for line item CPT 99285 (Billed Amount: $1,250.00) on statement dated Sep 3, 2026.

AUDIT FINDING:
CPT 99285 represents High-Complexity Medical Decision Making (MDM). Itemized billing lacks corresponding high-acuity diagnostics. Recommend verifying complete physician documentation for CPT 99283/99284 equivalence.

CMS NCCI MODIFIER COMPLIANCE ANALYSIS:
CMS NCCI Modifier Indicator 0: Unbundling is prohibited under CMS NCCI Chapter 1 rules and Modifier 59 cannot bypass the edit.

DOCUMENTATION INQUIRY REQUEST:
Please provide complete medical chart records to substantiate CPT 99285 MDM criteria, or re-adjudicate at CPT 99283 ($610.00) with dynamic recoverable savings adjustment of $640.00.

Respectfully Submitted,
MedAudit Clinical Documentation Inquiry Agent`,
    billedItems: [
      { code: "CPT 80053", label: "Comprehensive Metabolic Panel", amount: 92 },
      { code: "CPT 93010", label: "Electrocardiogram, report only", amount: 118 },
      {
        code: "CPT 99285",
        label: "Emergency Dept Visit, high severity",
        amount: 1250,
        disputed: true,
      },
      { code: "CPT 36415", label: "Venipuncture, routine", amount: 28 },
      { code: "CPT 71046", label: "Chest X-ray, 2 views", amount: 204 },
    ],
    reasoningSteps: [
      {
        number: 1,
        title: "Documentation Deficit Analysis",
        detail:
          "Encounter documentation supports moderate complexity Medical Decision Making (MDM), not high severity with immediate threat to life or organ function.",
        citation: "CMS Evaluation & Management Guidelines (2026)",
      },
      {
        number: 2,
        title: "Critical Care & Vitals Validation",
        detail:
          "Zero critical care physician time recorded. Patient vital signs remained within baseline thresholds throughout the entire emergency department encounter.",
        citation: "CPT 99291 / 99285 MDM Criteria",
      },
      {
        number: 3,
        title: "NCCI Modifier Indicator 0 Inspection",
        detail:
          "Service is prohibited from unbundling under CMS NCCI Chapter 1 rules. Modifier 59 cannot be used to bypass automated bundling edits for this procedure pair.",
        citation: "CMS NCCI Policy Manual v30.1, Chap 1, Sec E",
      },
    ],
  },
  {
    id: "CLM-88209",
    provider: "Northgate Radiology",
    facility: "Imaging · MRI Contrast",
    date: "Sep 3, 2026",
    savings: 0,
    status: "SCANNING",
    npi: "1847392019",
    taxId: "82-1928472",
    patientId: "PT-4428190",
  },
  {
    id: "CLM-88204",
    provider: "Apex Neurological",
    facility: "Inpatient Electro-Physiology",
    date: "Sep 3, 2026",
    savings: 1240,
    status: "PENDING",
    npi: "1639201928",
    taxId: "54-9382104",
    patientId: "PT-8821903",
  },
  {
    id: "CLM-88198",
    provider: "Verity Orthopedics",
    facility: "Outpatient Surgery",
    date: "Sep 2, 2026",
    savings: 612,
    status: "DISPUTED",
    npi: "1425364758",
    taxId: "33-1029384",
    patientId: "PT-7719283",
    issueTitle: "⚠️ Potential Upcoding / Documentation Review Warranted",
    recommendedCode: "CPT 29881 · $1,420.00",
    billedAmount: 2032,
    benchmarkRate: 1420,
    ncciModifierIndicator: 1,
    confidenceScore: 92.1,
    evidenceJustification:
      "Modifier 59 is only valid if clinical documentation confirms a distinct procedural service, separate site, or independent encounter.",
    disputed_codes: [
      {
        cpt_code: "29881",
        billed_description: "Arthroscopy knee surgical with meniscectomy",
        standard_description: "Arthroscopy knee diagnostic (CPT 29870)",
        billed_amount: 2032,
        medicare_baseline: 1420,
        issue: "UNBUNDLING",
      },
    ],
  },
  {
    id: "CLM-88172",
    provider: "Lakeside Family Clinic",
    facility: "Primary Care",
    date: "Sep 2, 2026",
    savings: 0,
    status: "CLEARED",
    npi: "1928374650",
    taxId: "12-3456789",
    patientId: "PT-5528190",
  },
];

export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
