export type ClaimStatus = "Parsing" | "Cross-Referencing" | "Action Required" | "Clean";

export type Claim = {
  id: string;
  provider: string;
  facility: string;
  date: string;
  savings: number;
  status: ClaimStatus;
  npi?: string;
  taxId?: string;
  patientId?: string;
  issueTitle?: string;
  recommendedCode?: string;
};

export const claims: Claim[] = [
  {
    id: "CLM-88214",
    provider: "St. Anselm Regional",
    facility: "Emergency Department",
    date: "Sep 3, 2026",
    savings: 1840,
    status: "Action Required",
    npi: "1092837482",
    taxId: "94-2849102",
    patientId: "PT-9938102",
    issueTitle: "Upcoding / Level 5",
    recommendedCode: "CPT 99283 · $610.00",
  },
  {
    id: "CLM-88209",
    provider: "Northgate Radiology",
    facility: "Imaging · MRI Contrast",
    date: "Sep 3, 2026",
    savings: 0,
    status: "Parsing",
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
    status: "Cross-Referencing",
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
    status: "Action Required",
    npi: "1425364758",
    taxId: "33-1029384",
    patientId: "PT-7719283",
    issueTitle: "Improper Surgical Modifier 59",
    recommendedCode: "CPT 29881 · $1,420.00",
  },
  {
    id: "CLM-88172",
    provider: "Lakeside Family Clinic",
    facility: "Primary Care",
    date: "Sep 2, 2026",
    savings: 0,
    status: "Clean",
    npi: "1928374650",
    taxId: "12-3456789",
    patientId: "PT-5528190",
  },
  {
    id: "CLM-88140",
    provider: "Harbor Anesthesia Group",
    facility: "Peri-operative Care",
    date: "Sep 1, 2026",
    savings: 0,
    status: "Clean",
    npi: "1122334455",
    taxId: "99-8877665",
    patientId: "PT-1192837",
  },
  {
    id: "CLM-88121",
    provider: "Meridian Cardiology",
    facility: "Cath Lab Diagnostic",
    date: "Sep 1, 2026",
    savings: 3275,
    status: "Action Required",
    npi: "1592837461",
    taxId: "77-6655443",
    patientId: "PT-3382910",
    issueTitle: "Unbundled Coronary Angioplasty",
    recommendedCode: "CPT 92920 · $4,100.00",
  },
];

export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
