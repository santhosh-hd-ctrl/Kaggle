import { Patient, Doctor, Appointment, Medicine, LabTest, Invoice, BloodStock, NotificationLog } from "../types/hospital";

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "PAT-001",
    name: "Eleanor Vance",
    age: 34,
    gender: "Female",
    bloodGroup: "O-Negative",
    allergies: ["Penicillin", "Peanuts"],
    emergencyContact: {
      name: "Thomas Vance",
      phone: "+1-555-0192",
      relation: "Spouse"
    },
    symptoms: ["Chronic Asthma", "Shortness of breath"],
    diagnosis: "Moderate Bronchial Asthma with persistent bronchial spasms",
    prescriptions: ["Albuterol HFA 90 mcg (2 puffs), QID", "Fluticasone Propionate (50 mcg), Daily"],
    treatmentHistory: ["Pulmonary Function Test (PFT) - Jan 2026", "Subcutaneous Immunotherapy - Ongoing"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "PAT-002",
    name: "Marcus Aurelius",
    age: 58,
    gender: "Male",
    bloodGroup: "A-Positive",
    allergies: ["Sulfa Drugs"],
    emergencyContact: {
      name: "Lucilla Aurelius",
      phone: "+1-555-0143",
      relation: "Daughter"
    },
    symptoms: ["Hypertension", "Occasional Chest Tightness"],
    diagnosis: "Grade II Essential Hypertension",
    prescriptions: ["Lisinopril 10mg, Daily AM", "Amlodipine Besylate 5mg, Daily PM"],
    treatmentHistory: ["Electrocardiogram (ECG) - Mar 2026", "Stress Echocardiogram - Apr 2026"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "PAT-003",
    name: "Sophia Chen",
    age: 27,
    gender: "Female",
    bloodGroup: "B-Positive",
    allergies: ["None Reported"],
    emergencyContact: {
      name: "David Chen",
      phone: "+1-555-7834",
      relation: "Father"
    },
    symptoms: ["Type I Diabetes monitoring", "Fatigue"],
    diagnosis: "Type 1 Diabetes Mellitus, well controlled",
    prescriptions: ["Insulin Glargine (Basal) - 18 Units Qd", "Insulin Aspart (Bolus) - Sliding scale with meals"],
    treatmentHistory: ["Continuous Glucose Monitoring (CGM) Sync - May 2026", "Diabetic Retinopathy Screen - Annual"],
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: "DOC-001",
    name: "Dr. Sarah Jenkins",
    department: "Cardiology",
    specialization: "Interventional Cardiology",
    experience: 14,
    availability: ["Monday", "Wednesday", "Thursday"],
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    email: "sarah.jenkins@smarthosp.com",
    phone: "+1-555-0101",
    consultationFee: 150
  },
  {
    id: "DOC-002",
    name: "Dr. Arvind Mehta",
    department: "Neurology",
    specialization: "Clinical Neurophysiology",
    experience: 18,
    availability: ["Monday", "Tuesday", "Friday"],
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    email: "arvind.mehta@smarthosp.com",
    phone: "+1-555-0102",
    consultationFee: 175
  },
  {
    id: "DOC-003",
    name: "Dr. Elena Rostova",
    department: "Pediatrics",
    specialization: "Pediatric Endocrinology",
    experience: 9,
    availability: ["Tuesday", "Wednesday", "Friday"],
    rating: 5.0,
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    email: "elena.rostova@smarthosp.com",
    phone: "+1-555-0103",
    consultationFee: 130
  },
  {
    id: "DOC-004",
    name: "Dr. Julian Vance",
    department: "Emergency",
    specialization: "Trauma & Acute Medicine",
    experience: 11,
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    rating: 4.7,
    avatar: "https://images.unsplash.com/photo-1605684954278-9f17d26cd66b?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    email: "julian.vance@smarthosp.com",
    phone: "+1-555-0104",
    consultationFee: 140
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "APP-1021",
    patientId: "PAT-001",
    patientName: "Eleanor Vance",
    doctorId: "DOC-004",
    doctorName: "Dr. Julian Vance",
    department: "Emergency",
    date: "2026-06-16",
    time: "09:30 AM",
    status: "Completed",
    symptoms: ["Severe breathing spasms", "asthma onset"]
  },
  {
    id: "APP-1022",
    patientId: "PAT-002",
    patientName: "Marcus Aurelius",
    doctorId: "DOC-001",
    doctorName: "Dr. Sarah Jenkins",
    department: "Cardiology",
    date: "2026-06-17",
    time: "10:30 AM",
    status: "Approved",
    symptoms: ["High Blood pressure follow up", "ECG log check"]
  },
  {
    id: "APP-1023",
    patientId: "PAT-003",
    patientName: "Sophia Chen",
    doctorId: "DOC-003",
    doctorName: "Dr. Elena Rostova",
    department: "Pediatrics",
    date: "2026-06-18",
    time: "02:00 PM",
    status: "Requested",
    symptoms: ["Baseline insulin resistance check-in"]
  }
];

export const INITIAL_MEDICINES: Medicine[] = [
  { id: "MED-001", name: "Lisinopril 10mg", stock: 1250, expiryDate: "2027-12-01", price: 12.50, supplier: "Apex Pharmaceuticals" },
  { id: "MED-002", name: "Albuterol HFA inhaler", stock: 35, expiryDate: "2026-08-15", price: 45.00, supplier: "AstraZeneca Distribution" },
  { id: "MED-003", name: "Insulin Glargine 100 U/mL", stock: 8, expiryDate: "2026-07-20", price: 120.00, supplier: "Eli Lilly Co." }, // Low stock & soon to expire
  { id: "MED-004", name: "Atorvastatin 20mg", stock: 3400, expiryDate: "2028-03-10", price: 18.00, supplier: "Pfizer Global Care" },
  { id: "MED-005", name: "Amoxicillin 500mg capsules", stock: 780, expiryDate: "2026-11-30", price: 21.20, supplier: "Sandoz Laboratories" }
];

export const INITIAL_LABTESTS: LabTest[] = [
  { id: "LAB-401", patientName: "Eleanor Vance", status: "Completed", result: "pO2: 82 mmHg, pCO2: 44 mmHg, pH: 7.38. Well within safe ranges.", testType: "Arterial Blood Gas Panel", dateOrdered: "2026-06-16" },
  { id: "LAB-402", patientName: "Marcus Aurelius", status: "Requested", result: "Awaiting sample drawing", testType: "Serum Lipid & Cholesterols Profile", dateOrdered: "2026-06-16" },
  { id: "LAB-403", patientName: "Sophia Chen", status: "Completed", result: "HbA1c: 6.4% (Pre-diabetic to controlled diabetic threshold)", testType: "Comprehensive HbA1c Panel", dateOrdered: "2026-06-15" }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-9001",
    patientName: "Eleanor Vance",
    date: "2026-06-16",
    items: [
      { description: "Emergency Consultation Fee", cost: 120.00 },
      { description: "Arterial Blood Gas (ABG) Lab Test", cost: 85.00 },
      { description: "Oxygen Administration Therapy (1 hr)", cost: 45.00 }
    ],
    amount: 250.00,
    tax: 16.20,
    total: 266.20,
    status: "Paid",
    doctorName: "Dr. Julian Vance",
    service: "Emergency Consultation"
  },
  {
    id: "INV-9002",
    patientName: "Marcus Aurelius",
    date: "2026-06-15",
    items: [
      { description: "Senior Cardiologist Comprehensive Consultation", cost: 250.00 },
      { description: "Digital Chest Electrocardiography (ECG)", cost: 180.00 }
    ],
    amount: 430.00,
    tax: 34.40,
    total: 464.40,
    status: "Unpaid",
    doctorName: "Dr. Sarah Jenkins",
    service: "Cardiology Consultation"
  }
];

export const INITIAL_BLOODSTOCK: BloodStock[] = [
  { group: "A-Positive", units: 48, status: "Optimal" },
  { group: "A-Negative", units: 14, status: "Low" },
  { group: "B-Positive", units: 35, status: "Optimal" },
  { group: "B-Negative", units: 9, status: "Low" },
  { group: "O-Positive", units: 82, status: "Optimal" },
  { group: "O-Negative", units: 3, status: "Critical" }, // universal donor shortage!
  { group: "AB-Positive", units: 18, status: "Optimal" },
  { group: "AB-Negative", units: 5, status: "Low" }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  { id: "NTF-881", timestamp: "10:15 AM", recipient: "eleanor.vance@gmail.com", type: "Email", message: "EHR Alert: Dr. Julian Vance registered new Albuterol inhaler prescription.", status: "Sent" },
  { id: "NTF-882", timestamp: "09:30 AM", recipient: "marcus.aurelius@rome.net", type: "Email", message: "Appointment Reminder: Your session tomorrow with Dr. Sarah Jenkins is approved.", status: "Sent" },
  { id: "NTF-883", timestamp: "08:45 AM", recipient: "sophia.chen@gmail.com", type: "SMS", message: "Smart Hospital: Lab result HbA1c is now ready for download in your patient section.", status: "Sent" }
];
