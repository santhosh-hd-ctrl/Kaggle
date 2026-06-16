export type UserRole = "Admin" | "Doctor" | "Patient" | "Staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  symptoms: string[];
  diagnosis: string;
  prescriptions: string[];
  treatmentHistory: string[];
  avatar: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string;
  experience: number;
  availability: string[]; // e.g. ["Mon", "Wed", "Fri"]
  rating: number;
  avatar: string;
  email?: string;
  phone?: string;
  consultationFee?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: "Requested" | "Approved" | "Completed" | "Cancelled";
  symptoms: string[];
}

export interface Medicine {
  id: string;
  name: string;
  stock: number;
  expiryDate: string;
  price: number;
  supplier?: string;
  status?: "Available" | "Low" | "Critical";
}

export interface LabTest {
  id: string;
  patientName: string;
  patientId?: string;
  testType?: string;
  testName?: string;
  date?: string;
  dateOrdered?: string;
  status: "Pending" | "Completed" | "Requested";
  result?: string;
  technician?: string;
}

export interface Invoice {
  id: string;
  patientName: string;
  date: string;
  items?: { description: string; cost: number }[];
  amount: number;
  tax: number;
  total: number;
  status: "Paid" | "Unpaid" | "Overdue";
  service?: string;
  doctorName?: string;
}

export interface BloodStock {
  group: string;
  units: number;
  status: "Optimal" | "Low" | "Critical";
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  recipient: string;
  type: "Email" | "SMS" | "System Push";
  message: string;
  status: "Sent" | "Failed";
}

export interface Staff {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  attendanceStatus: "Present" | "Absent" | "On Leave";
  attendanceHistory: { date: string; status: "Present" | "Absent" | "On Leave" }[];
  avatar: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  category: "Lab Report" | "Prescription" | "Discharge Summary" | "Imaging" | "EHR Chart";
  content: string;
  uploader: string;
  timestamp: string;
  meta: any;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  verified: boolean;
  avatar: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  details: string;
}
