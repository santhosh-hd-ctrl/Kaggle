import { 
  Patient, Doctor, Staff, Appointment, Medicine, LabTest, Invoice, BloodStock, 
  NotificationLog, MedicalDocument, AuthUser, AuditLog, UserRole 
} from "../types/hospital";
import { 
  INITIAL_PATIENTS, INITIAL_DOCTORS, INITIAL_APPOINTMENTS, INITIAL_MEDICINES, 
  INITIAL_LABTESTS, INITIAL_INVOICES, INITIAL_BLOODSTOCK, INITIAL_NOTIFICATIONS 
} from "../data/mockHospitalData";

// --- Encryption Simulator ---
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return "hash_" + Math.abs(hash).toString(16);
};

// --- Initial Mock Data for Staff ---
const INITIAL_STAFF: Staff[] = [
  {
    id: "STF-201",
    name: "Arthur Dent",
    department: "Logistics",
    role: "Front Desk Administrator",
    email: "arthur.dent@smarthospital.com",
    phone: "+1-555-8910",
    attendanceStatus: "Present",
    attendanceHistory: [
      { date: "2026-06-15", status: "Present" },
      { date: "2026-06-16", status: "Present" }
    ],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "STF-202",
    name: "Sarah Connor",
    department: "Laboratory Operations",
    role: "Lead Lab Technician",
    email: "sarah.connor@smarthospital.com",
    phone: "+1-555-4820",
    attendanceStatus: "Present",
    attendanceHistory: [
      { date: "2026-06-15", status: "Present" },
      { date: "2026-06-16", status: "Present" }
    ],
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "STF-203",
    name: "Roger Waters",
    department: "Emergency Triage",
    role: "Senior Charge Nurse",
    email: "roger.waters@smarthospital.com",
    phone: "+1-555-9921",
    attendanceStatus: "On Leave",
    attendanceHistory: [
      { date: "2026-06-15", status: "Present" },
      { date: "2026-06-16", status: "On Leave" }
    ],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

// --- Initial Mock Data for MongoDB Medical Documents ---
const INITIAL_DOCUMENTS: MedicalDocument[] = [
  {
    id: "DOC-MDB-801",
    patientId: "PAT-001",
    patientName: "Eleanor Vance",
    title: "Arterial Blood Gas Lab Sheet",
    category: "Lab Report",
    content: "Arterial Blood Gas sample processed securely. O2 partial pressure recorded at 82 mmHg representing stable pulmonic aeration. Hypercapnic indications are negative.",
    uploader: "Sarah Connor",
    timestamp: "2026-06-16T10:12:00Z",
    meta: {
      collection: "ehr_diagnostics",
      verified: true,
      equipmentUsed: "Siemens ABG-903 Analyzer",
      pO2_mmHg: 82,
      pCO2_mmHg: 44,
      pH: 7.38
    }
  },
  {
    id: "DOC-MDB-802",
    patientId: "PAT-001",
    patientName: "Eleanor Vance",
    title: "Pulmonary Bronchial Care Plan",
    category: "Prescription",
    content: "Administer Albuterol HFA as detailed. Instruct patient on spacer application for optimized aerosol inhalation. Advise strict allergen isolation protocols.",
    uploader: "Dr. Julian Vance",
    timestamp: "2026-06-16T09:30:00Z",
    meta: {
      collection: "clinical_prescriptions",
      medications: ["Albuterol HFA 90mcg", "Fluticasone Propionate"],
      refills_remaining: 3
    }
  },
  {
    id: "DOC-MDB-803",
    patientId: "PAT-003",
    patientName: "Sophia Chen",
    title: "HbA1c Blood Panel Document",
    category: "Lab Report",
    content: "Glucose metrics check completed. HbA1c value evaluated at 6.4%. Baseline diabetes type 1 management shows high patient compliance.",
    uploader: "Sarah Connor",
    timestamp: "2026-06-15T14:45:00Z",
    meta: {
      collection: "ehr_diagnostics",
      hba1c_pct: 6.4,
      glucose_fasting_mgdl: 118,
      ketones: "Negative"
    }
  },
  {
    id: "DOC-MDB-804",
    patientId: "PAT-002",
    patientName: "Marcus Aurelius",
    title: "Cardiology Stress Test Summary",
    category: "Discharge Summary",
    content: "Grade II Essential Hypertension under progressive therapy. Stress echocardiogram demonstrates mild left ventricular hypertrophy, but robust coronary reserve.",
    uploader: "Dr. Sarah Jenkins",
    timestamp: "2026-06-14T11:20:00Z",
    meta: {
      collection: "clinical_summaries",
      systolic_bp: 138,
      diastolic_bp: 88,
      hr_max_bpm: 142
    }
  }
];

// --- Initial Baseline SaaS Users ---
const INITIAL_USERS: AuthUser[] = [
  {
    id: "USR-001",
    name: "Clinical Admin",
    email: "admin@smarthospital.com",
    passwordHash: simpleHash("Password123"),
    role: "Admin",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    createdAt: "2026-01-01"
  },
  {
    id: "USR-002",
    name: "Dr. Jenkins",
    email: "doctor@smarthospital.com",
    passwordHash: simpleHash("Password123"),
    role: "Doctor",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    createdAt: "2026-01-02"
  },
  {
    id: "USR-003",
    name: "Staff Connor",
    email: "staff@smarthospital.com",
    passwordHash: simpleHash("Password123"),
    role: "Staff",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    createdAt: "2026-01-03"
  },
  {
    id: "USR-004",
    name: "Patient Vance",
    email: "patient@smarthospital.com",
    passwordHash: simpleHash("Password123"),
    role: "Patient",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    createdAt: "2026-01-04"
  }
];

// --- Database Engine Class (LocalStorage Orchestrator) ---
class SaasDatabase {
  private getStorageItem<T>(key: string, backup: T): T {
    const val = localStorage.getItem(`smarthosp_${key}`);
    if (!val) {
      localStorage.setItem(`smarthosp_${key}`, JSON.stringify(backup));
      return backup;
    }
    try {
      return JSON.parse(val) as T;
    } catch {
      return backup;
    }
  }

  private setStorageItem<T>(key: string, data: T): void {
    localStorage.setItem(`smarthosp_${key}`, JSON.stringify(data));
  }

  // Tables
  public getUsers(): AuthUser[] { return this.getStorageItem<AuthUser[]>("users", INITIAL_USERS); }
  public saveUsers(users: AuthUser[]): void { this.setStorageItem("users", users); }

  public getPatients(): Patient[] { return this.getStorageItem<Patient[]>("patients", INITIAL_PATIENTS); }
  public savePatients(patients: Patient[]): void { this.setStorageItem("patients", patients); }

  public getDoctors(): Doctor[] { return this.getStorageItem<Doctor[]>("doctors", INITIAL_DOCTORS); }
  public saveDoctors(doctors: Doctor[]): void { this.setStorageItem("doctors", doctors); }

  public getStaff(): Staff[] { return this.getStorageItem<Staff[]>("staff", INITIAL_STAFF); }
  public saveStaff(staff: Staff[]): void { this.setStorageItem("staff", staff); }

  public getAppointments(): Appointment[] { return this.getStorageItem<Appointment[]>("appointments", INITIAL_APPOINTMENTS); }
  public saveAppointments(appointments: Appointment[]): void { this.setStorageItem("appointments", appointments); }

  public getMedicines(): Medicine[] { return this.getStorageItem<Medicine[]>("medicines", INITIAL_MEDICINES); }
  public saveMedicines(medicines: Medicine[]): void { this.setStorageItem("medicines", medicines); }

  public getLabTests(): LabTest[] { return this.getStorageItem<LabTest[]>("labtests", INITIAL_LABTESTS); }
  public saveLabTests(tests: LabTest[]): void { this.setStorageItem("labtests", tests); }

  public getInvoices(): Invoice[] { return this.getStorageItem<Invoice[]>("invoices", INITIAL_INVOICES); }
  public saveInvoices(invoices: Invoice[]): void { this.setStorageItem("invoices", invoices); }

  public getBloodStock(): BloodStock[] { return this.getStorageItem<BloodStock[]>("bloodstock", INITIAL_BLOODSTOCK); }
  public saveBloodStock(blood: BloodStock[]): void { this.setStorageItem("bloodstock", blood); }

  public getNotifications(): NotificationLog[] { return this.getStorageItem<NotificationLog[]>("notifications", INITIAL_NOTIFICATIONS); }
  public saveNotifications(notif: NotificationLog[]): void { this.setStorageItem("notifications", notif); }

  public getDocuments(): MedicalDocument[] { return this.getStorageItem<MedicalDocument[]>("documents", INITIAL_DOCUMENTS); }
  public saveDocuments(docs: MedicalDocument[]): void { this.setStorageItem("documents", docs); }

  public getAuditLogs(): AuditLog[] { return this.getStorageItem<AuditLog[]>("logs", []); }
  public saveAuditLogs(logs: AuditLog[]): void { this.setStorageItem("logs", logs); }

  // Unified logger
  public logAction(userId: string, userName: string, role: string, action: string, details: string) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: "LOG-" + Math.floor(Math.random() * 900000 + 100000),
      timestamp: new Date().toISOString(),
      userId,
      userName,
      role,
      action,
      details
    };
    this.saveAuditLogs([newLog, ...logs]);
  }

  // Reset database completely
  public factoryReset(): void {
    localStorage.removeItem("smarthosp_users");
    localStorage.removeItem("smarthosp_patients");
    localStorage.removeItem("smarthosp_doctors");
    localStorage.removeItem("smarthosp_staff");
    localStorage.removeItem("smarthosp_appointments");
    localStorage.removeItem("smarthosp_medicines");
    localStorage.removeItem("smarthosp_labtests");
    localStorage.removeItem("smarthosp_invoices");
    localStorage.removeItem("smarthosp_bloodstock");
    localStorage.removeItem("smarthosp_notifications");
    localStorage.removeItem("smarthosp_documents");
    localStorage.removeItem("smarthosp_logs");
    
    // Trigger window reload
    window.location.reload();
  }
}

export const dbService = new SaasDatabase();
