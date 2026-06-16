import React, { useState } from "react";
import { 
  Users, Stethoscope, Calendar, FileText, Package, TestTube, CreditCard, 
  Droplet, Bell, BarChart2, Plus, ArrowRight, ShieldAlert, Check, X,
  Clock, Trash2, Send, Download, TrendingUp, AlertTriangle, RefreshCw
} from "lucide-react";
import { Patient, Doctor, Appointment, Medicine, LabTest, Invoice, BloodStock, NotificationLog, UserRole } from "../types/hospital";

interface SaaSModulesProps {
  currentRole: UserRole;
  patients: Patient[];
  onAddPatient: (p: Patient) => void;
  doctors: Doctor[];
  appointments: Appointment[];
  onAddAppointment: (a: Appointment) => void;
  onUpdateAppointmentStatus: (id: string, s: Appointment["status"]) => void;
  medicines: Medicine[];
  onUpdateMedicineStock: (id: string, delta: number) => void;
  onAddMedicine: (m: Medicine) => void;
  labTests: LabTest[];
  onAddLabTest: (t: LabTest) => void;
  onCompleteLabTest: (id: string, result: string) => void;
  invoices: Invoice[];
  onAddInvoice: (inv: Invoice) => void;
  onPayInvoice: (id: string) => void;
  bloodStock: BloodStock[];
  onDonateBlood: (group: string, u: number) => void;
  onEmergencyRequest: (group: string, u: number) => void;
  notifications: NotificationLog[];
  onSendNotification: (n: NotificationLog) => void;
}

export const SaaSModules: React.FC<SaaSModulesProps & { activeSubTab: string }> = ({
  currentRole,
  patients,
  onAddPatient,
  doctors,
  appointments,
  onAddAppointment,
  onUpdateAppointmentStatus,
  medicines,
  onUpdateMedicineStock,
  onAddMedicine,
  labTests,
  onAddLabTest,
  onCompleteLabTest,
  invoices,
  onAddInvoice,
  onPayInvoice,
  bloodStock,
  onDonateBlood,
  onEmergencyRequest,
  notifications,
  onSendNotification,
  activeSubTab
}) => {

  // Dynamic States for Individual Module Inputs
  // Patient Registration Form State
  const [patName, setPatName] = useState("");
  const [patAge, setPatAge] = useState(30);
  const [patGender, setPatGender] = useState("Female");
  const [patBlood, setPatBlood] = useState("O-Negative");
  const [patAllergies, setPatAllergies] = useState("");
  const [patContactName, setPatContactName] = useState("");
  const [patContactPhone, setPatContactPhone] = useState("");

  // Booking Appointment Form State
  const [bookPatId, setBookPatId] = useState("");
  const [bookDocId, setBookDocId] = useState("");
  const [bookDate, setBookDate] = useState("2026-06-17");
  const [bookTime, setBookTime] = useState("09:00 AM");
  const [bookSymptoms, setBookSymptoms] = useState("");

  // Pharmacy Medication Order Form State
  const [newMedName, setNewMedName] = useState("");
  const [newMedStock, setNewMedStock] = useState(100);
  const [newMedExpiry, setNewMedExpiry] = useState("2027-01-01");
  const [newMedPrice, setNewMedPrice] = useState(10.00);

  // Manual Invoicing State
  const [billingPatient, setBillingPatient] = useState("");
  const [billService, setBillService] = useState("");
  const [billPrice, setBillPrice] = useState(150);

  // Emergency Notification broadcast State
  const [notifTarget, setNotifTarget] = useState("");
  const [notifType, setNotifType] = useState<"Email" | "SMS" | "System Push">("Email");
  const [notifMessage, setNotifMessage] = useState("");

  // EHR diagnostic note state
  const [selectedPatEhr, setSelectedPatEhr] = useState<string>(patients[0]?.id || "");
  const [newDiaglNote, setNewDiagNote] = useState("");
  const [newPrescrNote, setNewPrescrNote] = useState("");

  // Helper selectors
  const activePatientEntity = patients.find(p => p.id === selectedPatEhr);

  return (
    <div id="saas-modular-core" className="w-[100%]">
      
      {/* 2. PATIENT MANAGEMENT SYSTEM */}
      {activeSubTab === "patients" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Patient Management Registry
              </h2>
              <p className="text-xs text-slate-500">Register new incoming patients and trace core records.</p>
            </div>
            <div className="text-xs font-mono bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md border border-indigo-100/50">
              Total Count: {patients.length} Registered
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form to Register Patient */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                Register New Patient Account
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">COMPREHENSIVE NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Richard Hendricks"
                    value={patName}
                    onChange={(e) => setPatName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">AGE</label>
                    <input 
                      type="number" 
                      value={patAge}
                      onChange={(e) => setPatAge(parseInt(e.target.value) || 0)}
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">GENDER</label>
                    <select 
                      value={patGender}
                      onChange={(e) => setPatGender(e.target.value)}
                      className="w-full text-xs border border-slate-300 bg-white rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option>Female</option>
                      <option>Male</option>
                      <option>Non-Binary</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">BLOOD GROUP</label>
                    <select 
                      value={patBlood}
                      onChange={(e) => setPatBlood(e.target.value)}
                      className="w-full text-xs border border-slate-300 bg-white rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {bloodStock.map((b) => (
                        <option key={b.group}>{b.group}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">ALLERGIES (csv)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Soy, Pollen"
                      value={patAllergies}
                      onChange={(e) => setPatAllergies(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded space-y-2 mt-4">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">EMERGENCY CONTACT INFO</span>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Contact Name"
                      value={patContactName}
                      onChange={(e) => setPatContactName(e.target.value)}
                      className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200 mb-1"
                    />
                    <input 
                      type="text" 
                      placeholder="Phone Line"
                      value={patContactPhone}
                      onChange={(e) => setPatContactPhone(e.target.value)}
                      className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if(!patName) return alert("Please specify patient description name");
                    const nextId = `PAT-00${patients.length + 1}`;
                    onAddPatient({
                      id: nextId,
                      name: patName,
                      age: patAge,
                      gender: patGender,
                      bloodGroup: patBlood,
                      allergies: patAllergies ? patAllergies.split(",").map(s => s.trim()) : [],
                      emergencyContact: {
                        name: patContactName || "N/A",
                        phone: patContactPhone || "N/A",
                        relation: "Emergency Relay"
                      },
                      symptoms: [],
                      diagnosis: "Awaiting Diagnostic Review",
                      prescriptions: [],
                      treatmentHistory: ["Registered initially - " + new Date().toLocaleDateString()],
                      avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? "1534528741775-53994a69daeb" : "1539571696357-5a69c17a67c6"}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
                    });
                    // reset inputs
                    setPatName("");
                    setPatAge(30);
                    setPatAllergies("");
                    setPatContactName("");
                    setPatContactPhone("");
                  }}
                  className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Verify &amp; Add Registry Entity
                </button>
              </div>
            </div>

            {/* List and Detailed Metrics */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                Active Hospital Inpatients
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patients.map((pat) => (
                  <div key={pat.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-all">
                    <img 
                      src={pat.avatar} 
                      alt={pat.name} 
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" }}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-slate-100"
                    />
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-800 truncate leading-none">{pat.name}</h4>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">{pat.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-none">{pat.age} yrs old • {pat.gender} • {pat.bloodGroup}</p>
                      
                      <div className="pt-2 flex flex-wrap gap-1 leading-none">
                        <span className="text-[9px] font-bold text-slate-400">Allergies: </span>
                        {pat.allergies.length > 0 ? (
                          pat.allergies.map((a, idx) => (
                            <span key={idx} className="bg-rose-50 text-rose-700 text-[9px] py-0.5 px-1.5 font-semibold rounded border border-rose-100/50">{a}</span>
                          ))
                        ) : (
                          <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">None</span>
                        )}
                      </div>

                      <div className="text-[10px] bg-slate-50 text-slate-600 p-2 rounded border border-dashed border-slate-200 mt-1.5">
                        <span className="font-bold block text-slate-700 mb-0.5">Primary Diagnosis:</span>
                        <p className="italic truncate">{pat.diagnosis}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. DOCTOR MANAGEMENT SYSTEM */}
      {activeSubTab === "doctors" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-500" />
                Medical Staff &amp; Doctors
              </h2>
              <p className="text-xs text-slate-500">Manage internal clinic schedules, expertise ratings, and status.</p>
            </div>
            <div className="text-xs font-mono bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md border border-sky-100/50">
              Department Operations: OK
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
                
                {/* Visual Header */}
                <div className="p-5 flex gap-4 items-center border-b border-slate-100 bg-slate-50/50">
                  <img 
                    src={doc.avatar} 
                    alt={doc.name} 
                    className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-indigo-200"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-800 leading-tight truncate">{doc.name}</h3>
                    <span className="inline-block mt-1 font-mono text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                      {doc.department}
                    </span>
                  </div>
                </div>

                {/* Sub Metadata Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Specialization:</span>
                      <strong className="text-slate-700 truncate max-w-[150px]">{doc.specialization}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Experience:</span>
                      <strong className="text-slate-700">{doc.experience} Years</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Patient Rating:</span>
                      <strong className="text-yellow-600">★ {doc.rating.toFixed(1)}</strong>
                    </p>
                  </div>

                  {/* Scheduled week days */}
                  <div className="pt-3 border-t border-slate-100/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Availability Shifts</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                        const active = doc.availability.includes(day);
                        return (
                          <span 
                            key={day} 
                            style={{ scale: active ? "1" : "0.95" }}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                              active 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                                : "bg-slate-50 text-slate-300 border border-slate-200/30 line-through"
                            }`}
                          >
                            {day.substring(0, 3)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. APPOINTMENT MANAGEMENT */}
      {activeSubTab === "appointments" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Appointment Booking Desktop
              </h2>
              <p className="text-xs text-slate-500">Log patient check-ins, medical scheduling and update triage statuses.</p>
            </div>
            <div className="flex gap-1.5 text-xs">
              <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded font-mono font-bold">
                Pending Requests: {appointments.filter(a => a.status === "Requested").length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Interactive Appointment Scheduler Form */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-200 pb-2">
                Simulate Consultation Reservation
              </h3>
              
              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">SELECT INPATIENT / PATIENT</label>
                  <select
                    value={bookPatId}
                    onChange={(e) => setBookPatId(e.target.value)}
                    className="w-full text-xs border border-slate-300 bg-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">-- Choose Patient profiles --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">CHOOSE STAFF SPECIALIST (DOCTOR)</label>
                  <select
                    value={bookDocId}
                    onChange={(e) => setBookDocId(e.target.value)}
                    className="w-full text-xs border border-slate-300 bg-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">-- Select Specialist --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">TARGET DATE</label>
                    <input 
                      type="date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">PREFERRED HOURS</label>
                    <select
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full text-xs border border-slate-300 bg-white rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option>09:00 AM</option>
                      <option>10:30 AM</option>
                      <option>11:45 AM</option>
                      <option>02:00 PM</option>
                      <option>03:30 PM</option>
                      <option>04:15 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">PRESENTED SYMPTOMS</label>
                  <textarea 
                    placeholder="e.g. Mild chest inflammation, continuous heavy coughing sessions since yesterday."
                    value={bookSymptoms}
                    onChange={(e) => setBookSymptoms(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 h-16 bg-white"
                  />
                </div>

                <div className="text-[10px] text-slate-400 italic">
                  *Submitting automatically sends an alert notification context trigger in the background.
                </div>

                <button
                  onClick={() => {
                    if (!bookPatId || !bookDocId || !bookSymptoms) {
                      return alert("Please pick doctor, patient, and write basic symptoms.");
                    }
                    const patObj = patients.find(p => p.id === bookPatId);
                    const docObj = doctors.find(d => d.id === bookDocId);
                    if (!patObj || !docObj) return;

                    const newAppId = `APP-${Math.floor(Math.random() * 900) + 1100}`;
                    onAddAppointment({
                      id: newAppId,
                      patientId: bookPatId,
                      patientName: patObj.name,
                      doctorId: bookDocId,
                      doctorName: docObj.name,
                      department: docObj.department,
                      date: bookDate,
                      time: bookTime,
                      status: "Requested",
                      symptoms: bookSymptoms
                    });

                    // Trigger automatic email log
                    onSendNotification({
                      id: `NTF-${Math.floor(Math.random() * 900) + 1100}`,
                      timestamp: "Just Now",
                      recipient: `${patObj.name.toLowerCase().replace(" ", ".")}@gmail.com`,
                      type: "Email",
                      message: `Notification dispatch: Registered appointment reservation ${newAppId} to see ${docObj.name} in department ${docObj.department}. Awaiting validation.`,
                      status: "Sent"
                    });

                    alert("Appointment reservation recorded! It will show up under requested.");
                    setBookSymptoms("");
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Create Appointment Reservation
                </button>
              </div>
            </div>

            {/* List of current schedules */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-sm text-slate-800">Current Booking Records</h3>
              
              <div className="space-y-3">
                {appointments.map((app) => {
                  let statusBg = "bg-amber-50 text-amber-700 border-amber-200";
                  if (app.status === "Approved") statusBg = "bg-sky-50 text-sky-700 border-sky-200";
                  if (app.status === "Completed") statusBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (app.status === "Cancelled") statusBg = "bg-rose-50 text-rose-700 border-rose-200";

                  return (
                    <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">{app.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBg}`}>
                            {app.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {app.patientName} &rarr; <span className="text-indigo-600">{app.doctorName}</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          {app.department} • Time Slot: <strong className="text-slate-600">{app.date} at {app.time}</strong>
                        </p>
                        <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                          &quot;{app.symptoms}&quot;
                        </p>
                      </div>

                      {/* Interactive Triggers (Doctor / Staff view proxy) */}
                      <div className="flex sm:flex-col gap-1.5 shrink-0 justify-end">
                        {app.status === "Requested" && (
                          <>
                            <button
                              onClick={() => {
                                onUpdateAppointmentStatus(app.id, "Approved");
                                onSendNotification({
                                  id: `NTF-${Math.floor(Math.random() * 90) + 1100}`,
                                  timestamp: "Just Now",
                                  type: "SMS",
                                  recipient: "Inpatient Network System",
                                  message: `Appointment approval notification for ${app.patientName}: Your booking slot on ${app.date} is confirmed.`,
                                  status: "Sent"
                                });
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 cursor-pointer text-left flex items-center gap-1"
                            >
                              <Check className="w-3 h-3 text-indigo-600" />
                              Approve
                            </button>
                            <button
                              onClick={() => onUpdateAppointmentStatus(app.id, "Cancelled")}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 cursor-pointer text-left flex items-center gap-1"
                            >
                              <X className="w-3 h-3 text-rose-600" />
                              Decline
                            </button>
                          </>
                        )}

                        {app.status === "Approved" && (
                          <button
                            onClick={() => {
                              onUpdateAppointmentStatus(app.id, "Completed");
                              // Auto trigger a billing receipt invoice
                              const price = 200;
                              const serviceText = `Consultation with ${app.doctorName} (${app.department})`;
                              const randomTax = 12.00;
                              onAddInvoice({
                                id: `INV-${Math.floor(Math.random() * 900) + 9000}`,
                                patientName: app.patientName,
                                date: new Date().toISOString().slice(0, 10),
                                items: [{ description: serviceText, cost: price }],
                                tax: randomTax,
                                total: price + randomTax,
                                status: "Unpaid"
                              });

                              alert(`Successfully finalized consultation appointment! An invoice for $${price + randomTax} is issued in the accounting platform.`);
                            }}
                            className="px-3 py-1 font-semibold text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark Complete &amp; Bill Patient
                          </button>
                        )}

                        {app.status === "Completed" && (
                          <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-flex items-center gap-1">
                            ✓ Session Archived
                          </span>
                        )}

                        {app.status === "Cancelled" && (
                          <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded inline-flex items-center gap-1">
                            ✗ Revoked Allocation
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. ELECTRONIC MEDICAL RECORD SYSTEM (EHR) */}
      {activeSubTab === "ehr" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Electronic Health Records (EHR) Module
              </h2>
              <p className="text-xs text-slate-500">Record diagnosis, symptomatic history logs, and write secure e-Prescriptions.</p>
            </div>
            <div className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md border border-indigo-100">
              HIPAA Compliant Protocol Enforced
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick selector sidebar */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Select Patient File</h3>
              <div className="space-y-1.5">
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatEhr(p.id)}
                    className={`w-full p-2.5 rounded-lg border text-left flex gap-3 transition-all ${
                      selectedPatEhr === p.id 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" 
                        : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden border border-slate-100 bg-slate-200">
                      <img src={p.avatar} alt="patient" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate leading-snug">{p.name}</h4>
                      <p className={`text-[10px] ${selectedPatEhr === p.id ? "text-indigo-200" : "text-slate-400"}`}>{p.bloodGroup} • Age {p.age}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* In-depth Medical Charts Card */}
            <div className="lg:col-span-2 space-y-6">
              {activePatientEntity ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                  <div className="flex gap-4 pb-4 border-b border-slate-100 items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{activePatientEntity.name} Electronic Chart</h3>
                      <p className="text-xs text-slate-400 mt-1">ID File: <span className="font-mono text-slate-700 font-bold">{activePatientEntity.id}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded">
                        Blood Class: {activePatientEntity.bloodGroup}
                      </span>
                    </div>
                  </div>

                  {/* Diagnosis overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">RECORDED DIAGNOSIS</span>
                      <p className="text-sm text-slate-800 font-semibold">{activePatientEntity.diagnosis}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1 font-mono">EMERGENCY CONTACT PHONE</span>
                      <p className="text-sm text-slate-800 font-semibold">{activePatientEntity.emergencyContact.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{activePatientEntity.emergencyContact.phone} ({activePatientEntity.emergencyContact.relation})</p>
                    </div>
                  </div>

                  {/* Active Prescriptions list */}
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 block uppercase tracking-wider mb-2">Active Pharmacotherapy Prescription</span>
                    <div className="space-y-1.5">
                      {activePatientEntity.prescriptions.length > 0 ? (
                        activePatientEntity.prescriptions.map((prs, index) => (
                          <div key={index} className="bg-teal-50/40 border border-teal-200 rounded-lg p-2.5 text-xs text-teal-900 flex items-center gap-2">
                            <span className="font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">Rx</span>
                            <span>{prs}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No medication listed. Record new Rx below.</p>
                      )}
                    </div>
                  </div>

                  {/* Historic Treatment logs */}
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 block uppercase tracking-wider mb-2">Diagnostic Clinical Treatment History</span>
                    <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
                      {activePatientEntity.treatmentHistory.map((tr, index) => (
                        <li key={index}>{tr}</li>
                      ))}
                    </ul>
                  </div>

                  {/* E-Prescriptions input tool (Authorized role required - we allow demo bypass) */}
                  <div className="pt-4 border-t border-slate-100 space-y-3 bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/50">
                    <span className="font-semibold text-xs text-slate-800 block flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-indigo-500" />
                      Add Diagnostic Note &amp; e-Prescription (Doctor Interface)
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <input 
                          type="text"
                          placeholder="Update Primary Diagnosis"
                          value={newDiaglNote}
                          onChange={(e) => setNewDiagNote(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                        />
                      </div>
                      <div>
                        <input 
                          type="text"
                          placeholder="Write new medication (e.g. Albuterol inhaler)"
                          value={newPrescrNote}
                          onChange={(e) => setNewPrescrNote(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!newDiaglNote && !newPrescrNote) {
                          return alert("Please enter either a new diagnosis statement or a medication prescription.");
                        }
                        
                        // Mutate active patient
                        if (newDiaglNote) activePatientEntity.diagnosis = newDiaglNote;
                        if (newPrescrNote) {
                          activePatientEntity.prescriptions.push(newPrescrNote);
                          activePatientEntity.treatmentHistory.push(`Added Rx: ${newPrescrNote} - ${new Date().toLocaleDateString()}`);
                        }

                        alert("EMR File Updated under HIPAA Protocol");
                        setNewDiagNote("");
                        setNewPrescrNote("");
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded shadow cursor-pointer transition-all"
                    >
                      Authenticate and Commit To EHR Record
                    </button>
                  </div>

                </div>
              ) : (
                <p className="text-slate-400 italic">No patient record selected.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 6. PHARMACY MANAGEMENT */}
      {activeSubTab === "pharmacy" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                Pharmacy &amp; Inventory Management
              </h2>
              <p className="text-xs text-slate-500">Track medication stocks, trigger supplier orders, and review expiry parameters.</p>
            </div>
            <div className="text-xs">
              <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded font-mono">
                Pharmacy Connected
              </span>
            </div>
          </div>

          {/* Low stock alerts */}
          {medicines.some(m => m.stock < 15) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex gap-3 items-start animate-pulse">
              <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Critical Action Required: Low Stock Detected.</strong>
                <p className="text-amber-700">The pharmaceutical system shows item stocks below safety thresholds. Please trigger restock operations immediately.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form to register new medicine line */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-4 h-fit">
              <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2">
                Provision New Medicine Line
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">GENERIC / BRAND NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paracetamol 500mg"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1 font-mono">STOCK UNITS</label>
                    <input 
                      type="number" 
                      value={newMedStock}
                      onChange={(e) => setNewMedStock(parseInt(e.target.value) || 0)}
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">UNIT COST ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={newMedPrice}
                      onChange={(e) => setNewMedPrice(parseFloat(e.target.value) || 10)}
                      className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">EXPIRY DATE</label>
                  <input 
                    type="date" 
                    value={newMedExpiry}
                    onChange={(e) => setNewMedExpiry(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!newMedName) return alert("Define generic brand name");
                    const nextId = `MED-00${medicines.length + 1}`;
                    onAddMedicine({
                      id: nextId,
                      name: newMedName,
                      stock: newMedStock,
                      expiryDate: newMedExpiry,
                      price: newMedPrice,
                      supplier: "Sourcing Partner Global"
                    });
                    setNewMedName("");
                    alert("Pharmacotherapy line initialized!");
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Register Inventory Line
                </button>
              </div>
            </div>

            {/* List and actions of inventory */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <th className="p-3 font-semibold font-mono">ID</th>
                      <th className="p-3 font-semibold">Medicine Description</th>
                      <th className="p-3 font-semibold">Stock</th>
                      <th className="p-3 font-semibold">Unit Price</th>
                      <th className="p-3 font-semibold">Expiry Parameter</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicines.map((m) => {
                      const isLow = m.stock < 15;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-[10px] text-slate-400 font-bold">{m.id}</td>
                          <td className="p-3 font-semibold text-slate-800">{m.name}</td>
                          <td className="p-3">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded ${isLow ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-800"}`}>
                              {m.stock} units
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-600">${m.price.toFixed(2)}</td>
                          <td className="p-3 text-[11px]">
                            <span className="text-slate-500">{m.expiryDate}</span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                onUpdateMedicineStock(m.id, 100);
                              }}
                              className="text-[10px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono border border-indigo-200 px-2 py-1 rounded cursor-pointer"
                            >
                              +100 Restock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. LABORATORY MANAGEMENT */}
      {activeSubTab === "laboratory" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <TestTube className="w-5 h-5 text-indigo-500" />
                Laboratory Test Desk
              </h2>
              <p className="text-xs text-slate-500">Review patient screening panels, upload completed lab reports and files.</p>
            </div>
            <div className="text-xs">
              <span className="bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1 rounded font-mono">
                Screening Queues Active
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="p-3 font-semibold">Test ID</th>
                  <th className="p-3 font-semibold">Patient Subject</th>
                  <th className="p-3 font-semibold">Screening Target</th>
                  <th className="p-3 font-semibold">Assigned On</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Report Results / Diagnostic Feedback</th>
                  <th className="p-3 font-semibold text-right">Trigger Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-400">{test.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{test.patientName}</td>
                    <td className="p-3 font-bold text-indigo-600">{test.testName}</td>
                    <td className="p-3 text-slate-400">{test.date}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        test.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate">
                      {test.status === "Completed" ? (
                        <span className="text-slate-600 italic text-[11px]">{test.result}</span>
                      ) : (
                        <span className="text-slate-400 italic">Pending lab work verification</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {test.status === "Pending" ? (
                        <button
                          onClick={() => {
                            const result = prompt("Enter Lab Diagnostic Results / Values:", "Total cholesterol levels: 195 mg/dL. Normal range.");
                            if (result === null) return;
                            onCompleteLabTest(test.id, result);
                          }}
                          className="px-2.5 py-1 text-[11px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded shadow cursor-pointer transition-all"
                        >
                          Submit Report File
                        </button>
                      ) : (
                        <span className="text-emerald-500 font-bold">&#10003; Uploaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. BILLING & PAYMENT SYSTEM */}
      {activeSubTab === "billing" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                Billing Center &amp; Invoices
              </h2>
              <p className="text-xs text-slate-500">Calculate treatment cost ratios, process point of sale transactions, and review outstanding cash flows.</p>
            </div>
            <div className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded font-mono font-bold border border-indigo-100">
              Receivables: ${invoices.reduce((sum, inv) => inv.status !== "Paid" ? sum + inv.total : sum, 0).toFixed(2)} Outstanding
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Direct Invoice Issue Form */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-4 h-fit">
              <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2">
                Issue Direct Billing Statement
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">PATIENT RECIPIENT</label>
                  <select
                    value={billingPatient}
                    onChange={(e) => setBillingPatient(e.target.value)}
                    className="w-full text-xs border border-slate-300 bg-white rounded px-2.5 py-1.5 focus:outline-none bg-white"
                  >
                    <option value="">-- Choose recipient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">SERVICE / INTERVENTION DETAILS</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Brain MRI screening scan"
                    value={billService}
                    onChange={(e) => setBillService(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">PRICE COST AMOUNT ($)</label>
                  <input 
                    type="number" 
                    value={billPrice}
                    onChange={(e) => setBillPrice(parseInt(e.target.value) || 0)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!billingPatient || !billService || !billPrice) {
                      return alert("Provide patient name, services, and core pricing parameters");
                    }
                    const randomId = `INV-${Math.floor(Math.random() * 900) + 9000}`;
                    onAddInvoice({
                      id: randomId,
                      patientName: billingPatient,
                      date: new Date().toISOString().slice(0, 10),
                      items: [{ description: billService, cost: billPrice }],
                      tax: parseFloat((billPrice * 0.08).toFixed(2)),
                      total: parseFloat((billPrice * 1.08).toFixed(2)),
                      status: "Unpaid"
                    });

                    setBillService("");
                    alert("Invoice generated and logged successfully!");
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Generate Statement Ledger
                </button>
              </div>
            </div>

            {/* List and actions of invoices */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-sm text-slate-800">Hospital Receivable Ledger</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoices.map((inv) => (
                  <div key={inv.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-400">{inv.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          inv.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-250 animate-pulse"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">{inv.patientName}</h4>
                      <p className="text-[11px] text-slate-400">Statement Date: {inv.date}</p>
                      
                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        {inv.items.map((it, i) => (
                          <div key={i} className="flex justify-between text-xs text-slate-600">
                            <span className="truncate max-w-[180px]">{it.description}</span>
                            <span className="font-mono font-semibold">${it.cost.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                          <span>Insurance Tax &amp; Surcharge (8%)</span>
                          <span>${inv.tax.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Total Charge: <strong className="text-sm text-slate-930 text-indigo-700">${inv.total.toFixed(2)}</strong>
                      </div>
                      {inv.status !== "Paid" ? (
                        <button
                          onClick={() => {
                            onPayInvoice(inv.id);
                            alert("Transaction Processed Successfully via Secure Gateway!");
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer shadow transition-all"
                        >
                          Clear Payment
                        </button>
                      ) : (
                        <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/50">
                          Paid Account Clear
                        </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 9. BLOOD BANK MANAGEMENT */}
      {activeSubTab === "bloodbank" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-indigo-500" />
                Blood Bank &amp; Donor Logistics
              </h2>
              <p className="text-xs text-slate-500">Track universal blood groups inventories, record volunteer donors and queue dispatch operations.</p>
            </div>
            <div className="text-xs">
              <span className="bg-rose-50 text-rose-800 border-rose-200 border font-bold px-3 py-1 rounded font-mono">
                Emergency Blood Reserve
              </span>
            </div>
          </div>

          {bloodStock.some(b => b.units < 10) && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex gap-3 items-center animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong>CRITICAL DONOR DEFICIT ALERT:</strong>
                <p className="text-rose-700">Universal donor reserves (O-Negative, B-Negative) are dangerously critical. Activate triage procedures immediately.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Emergency Reserve Manipulation card */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-4 h-fit">
              <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                Log Emergency Dispatch / Donation
              </h3>
              
              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">BLOOD GROUP CLASIFICATION</label>
                  <select
                    id="blood-group-selector"
                    className="w-full text-xs border border-slate-300 bg-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                  >
                    {bloodStock.map((b) => (
                      <option key={b.group} value={b.group}>{b.group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">VOLUME UNITS (Pints/Bags)</label>
                  <input 
                    id="blood-units-count"
                    type="number" 
                    defaultValue="5"
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  <button
                    onClick={() => {
                      const selGroup = (document.getElementById("blood-group-selector") as HTMLSelectElement).value;
                      const selUnits = parseInt((document.getElementById("blood-units-count") as HTMLInputElement).value) || 0;
                      if(selUnits <= 0) return alert("Write valid units");
                      onDonateBlood(selGroup, selUnits);
                      alert(`Successfully committed blood deposit of ${selUnits} bags for group ${selGroup}.`);
                    }}
                    className="py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded shadow cursor-pointer"
                  >
                    + Register Donation
                  </button>
                  <button
                    onClick={() => {
                      const selGroup = (document.getElementById("blood-group-selector") as HTMLSelectElement).value;
                      const selUnits = parseInt((document.getElementById("blood-units-count") as HTMLInputElement).value) || 0;
                      if(selUnits <= 0) return alert("Write valid units");
                      onEmergencyRequest(selGroup, selUnits);
                      alert(`Emergency dispatch triggered: ${selUnits} bags of ${selGroup} routed to Trauma response.`);
                    }}
                    className="py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold rounded shadow cursor-pointer"
                  >
                    - Emergency Request
                  </button>
                </div>
              </div>
            </div>

            {/* List and counts of active reserves */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bloodStock.map((b) => {
                  let indicatorBg = "bg-emerald-500";
                  if (b.status === "Low") indicatorBg = "bg-amber-500 animate-pulse";
                  if (b.status === "Critical") indicatorBg = "bg-rose-600 animate-pulse";

                  return (
                    <div key={b.group} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <span className="font-display font-medium text-slate-800 text-sm">Type {b.group}</span>
                        <span className={`w-3 h-3 rounded-full ${indicatorBg}`} />
                      </div>
                      
                      <div className="mt-4 first-letter:">
                        <span className="text-3xl font-bold text-slate-900 leading-none">{b.units}</span>
                        <span className="text-xs text-slate-400 font-mono ml-1">Bags</span>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                        Status: <strong className={b.status === "Critical" ? "text-rose-600" : "text-slate-700"}>{b.status}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 10. SYSTEM NOTIFICATION DECK */}
      {activeSubTab === "notifications" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                Notification Relay center
              </h2>
              <p className="text-xs text-slate-500">Dispatch clinical alerts, process appointment emails, and review push log registries.</p>
            </div>
            <div className="text-xs">
              <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded font-mono border border-indigo-150">
                Log Pipeline: LIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Frame to broadcast manual email alerts to patient list */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-4 h-fit">
              <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-150 pb-2">
                Transmit System Dispatch Broadcast
              </h3>
              
              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">RECIPIENT CHANNEL / ADDRESS</label>
                  <input 
                    type="text" 
                    placeholder="e.g. administrator@smarthospital.org"
                    value={notifTarget}
                    onChange={(e) => setNotifTarget(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">RELAY TYPE</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 bg-white rounded px-2.5 py-1.5 focus:outline-none bg-white"
                  >
                    <option>Email</option>
                    <option>SMS</option>
                    <option>System Push</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">ALERT CONTEXT MESSAGE</label>
                  <textarea 
                    placeholder="Type broadcast or system note details to deliver..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 h-20 bg-white"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!notifTarget || !notifMessage) return alert("Complete recipient and message fields first");
                    onSendNotification({
                      id: `NTF-${Math.floor(Math.random() * 900) + 7000}`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      recipient: notifTarget,
                      type: notifType,
                      message: notifMessage,
                      status: "Sent"
                    });

                    setNotifMessage("");
                    alert("Message relayed to distribution queue!");
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Relay Notification
                </button>
              </div>
            </div>

            {/* List and logs of notifications */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-xs text-slate-700">Relay Activity Logs</span>
                  <span className="text-[10px] text-slate-400 font-mono">Real-time update stream</span>
                </div>
                
                <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
                  {notifications.map((not) => (
                    <div key={not.id} className="p-4 flex gap-4 items-start hover:bg-slate-50/50 transition-all">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <Send className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-slate-800 truncate">{not.recipient}</strong>
                          <span className="text-[9.5px] font-mono text-slate-400 shrink-0">{not.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{not.message}</p>
                        <div className="flex gap-2 text-[10px] items-center pt-1.5 font-mono">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">{not.type}</span>
                          <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 px-1.5 py-0.2 rounded">&#10003; DISPATCHED_OK</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 11. DEEP ANALYTICS DASHBOARD */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Live Command Analytics &amp; Key Metrics
              </h2>
              <p className="text-xs text-slate-500">Monitor hospital patient inflows, consolidated revenues, and medical operational indexes.</p>
            </div>
            <div className="text-xs text-slate-400 italic font-mono">
              Live Feed • UTC Synced
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">TOTAL PATIENTS TRACKED</span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900 font-display">{patients.length}</span>
                <span className="text-xs text-emerald-600 bg-emerald-50 font-bold px-2 py-0.5 rounded">+14% MoM</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Internal ERP direct database register</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">CONSOLIDATED REVENUE</span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900 font-display">
                  ${invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
                </span>
                <span className="text-xs text-emerald-600 bg-emerald-50 font-bold px-2 py-0.5 rounded">Optimal</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Aggregated invoices and charges</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono font-mono">ACTIVE SCHEDULE COUNT</span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900 font-display">
                  {appointments.filter(a => a.status === "Approved" || a.status === "Requested").length}
                </span>
                <span className="text-xs text-indigo-600 bg-indigo-50 font-bold px-2 py-0.5 rounded">Steady</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Consultations pending &amp; active</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">BLOOD RECOVER STATUS</span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900 font-display">
                  {bloodStock.reduce((sum, b) => sum + b.units, 0)}
                </span>
                <span className="text-xs text-amber-600 bg-amber-50 font-bold px-2 py-0.5 rounded">Shortage Warning</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Total pints/bags available</p>
            </div>

          </div>

          {/* Graphical Analytics Charts (Modern Tailored SVGs) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily Operational Inflow Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Operational Daily Patient Admissions</h3>
                  <p className="text-xs text-slate-400 leading-none mt-1">Simulated statistical variance last 7 days</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded" />
                  <span>Admissions</span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full h-44 bg-slate-50/50 rounded-lg border border-slate-100 flex items-end p-4 relative pt-10">
                
                {/* Horizontal scale markers */}
                <div className="absolute left-4 top-2 text-[10px] text-slate-400 font-mono">Admissions Peak: 50</div>

                <div className="flex-1 h-full flex items-end justify-between px-4 z-10">
                  {[
                    { day: "Jun 10", val: 12, height: "h-[24%]" },
                    { day: "Jun 11", val: 24, height: "h-[48%]" },
                    { day: "Jun 12", val: 18, height: "h-[36%]" },
                    { day: "Jun 13", val: 35, height: "h-[70%]" },
                    { day: "Jun 14", val: 42, height: "h-[84%]" },
                    { day: "Jun 15", val: 29, height: "h-[58%]" },
                    { day: "Jun 16", val: 50, height: "h-[100%]" }
                  ].map((x, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="text-[9px] text-indigo-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">{x.val}</div>
                      <div className={`w-8 bg-gradient-to-t from-indigo-500 to-sky-400 rounded-t hover:brightness-105 transition-all ${x.height}`}></div>
                      <span className="text-[10px] text-slate-400 font-mono leading-none">{x.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Revenue Ratio and utilization */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Department Operational Activity &amp; Load</h3>
                  <p className="text-xs text-slate-400 leading-none mt-1">Consultation load ratio per specialty department</p>
                </div>
                <span className="text-indigo-600 font-mono text-xs font-bold bg-indigo-50 py-0.5 px-2 rounded">Active Capacity</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { dept: "Urgency &amp; Trauma Responding", count: doctors.filter(d=>d.department==="Emergency").length * 8 + 4, color: "bg-rose-500", fraction: "w-[78%]" },
                  { dept: "Cardiology &amp; Vascular Care", count: doctors.filter(d=>d.department==="Cardiology").length * 12, color: "bg-indigo-600", fraction: "w-[62%]" },
                  { dept: "Pediatrics &amp; Adolescent Health", count: doctors.filter(d=>d.department==="Pediatrics").length * 6, color: "bg-amber-500", fraction: "w-[38%]" },
                  { dept: "Neurological Clinical Service", count: doctors.filter(d=>d.department==="Neurology").length * 15, color: "bg-teal-500", fraction: "w-[85%]" }
                ].map((dep, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-650">
                      <span className="font-semibold text-slate-700" dangerouslySetInnerHTML={{ __html: dep.dept}} />
                      <span className="font-mono text-slate-500">{dep.count}% utilization load</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${dep.color} ${dep.fraction}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
