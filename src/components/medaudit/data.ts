export type ClaimStatus = "Auditing" | "Clean" | "Action Required";

export type Claim = {
  id: string;
  provider: string;
  facility: string;
  date: string;
  savings: number;
  status: ClaimStatus;
};

export const claims: Claim[] = [
  {
    id: "CLM-88214",
    provider: "St. Anselm Regional",
    facility: "Emergency Department",
    date: "Sep 3, 2026",
    savings: 1840,
    status: "Action Required",
  },
  {
    id: "CLM-88209",
    provider: "Northgate Radiology",
    facility: "Imaging · MRI",
    date: "Sep 3, 2026",
    savings: 0,
    status: "Auditing",
  },
  {
    id: "CLM-88198",
    provider: "Verity Orthopedics",
    facility: "Outpatient Surgery",
    date: "Sep 2, 2026",
    savings: 612,
    status: "Action Required",
  },
  {
    id: "CLM-88172",
    provider: "Lakeside Family Clinic",
    facility: "Primary Care",
    date: "Sep 2, 2026",
    savings: 0,
    status: "Clean",
  },
  {
    id: "CLM-88140",
    provider: "Harbor Anesthesia Group",
    facility: "Peri-operative",
    date: "Sep 1, 2026",
    savings: 0,
    status: "Clean",
  },
  {
    id: "CLM-88121",
    provider: "Meridian Cardiology",
    facility: "Cath Lab",
    date: "Sep 1, 2026",
    savings: 3275,
    status: "Action Required",
  },
];

export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
