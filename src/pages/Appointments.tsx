import React, { useState, useEffect } from "react";
import { dbService } from "../services/db";
import { Appointment, Doctor, Invoice } from "../types/hospital";
import { useAuth } from "../context/AuthContext";
import { DocumentButton } from "../components/DocumentButton";
import { 
  Calendar, Plus, Clock, Search, Filter, RefreshCw, Check, X, CheckSquare, ChevronDown, 
  User, Stethoscope, Briefcase, FileText, Sparkles, CreditCard, DollarSign 
} from "lucide-react";

export const Appointments: React.FC = () => {
  const { user, addToast } = useAuth();

  // App list states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // New reservation state variables
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [patName, setPatName] = useState("");
  const [docName, setDocName] = useState("");
  const [appDate, setAppDate] = useState("");
  const [appTime, setAppTime] = useState("10:00 AM");
  const [appSymp, setAppSymp] = useState("");

  const loadAppointments = () => {
    setLoading(true);
    setTimeout(() => {
      setAppointments(dbService.getAppointments());
      setDoctors(dbService.getDoctors());
      setLoading(false);
    }, 450);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Quick reservation form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName.trim() || !docName.trim() || !appDate.trim()) {
      addToast("Patient name, clinician name and dates are required.", "warning");
      return;
    }

    const list = dbService.getAppointments();
    const generatedId = "APT-00" + (list.length + 1);

    const newApp: Appointment = {
      id: generatedId,
      patientId: "PAT-TBD",
      patientName: patName,
      doctorId: "DOC-TBD",
      doctorName: docName,
      department: "General Medicine",
      date: appDate,
      time: appTime,
      symptoms: appSymp ? appSymp.split(",").map(s => s.trim()) : ["Routine diagnostic review"],
      status: "Requested"
    };

    const updated = [newApp, ...list];
    dbService.saveAppointments(updated);
    dbService.logAction(user?.id || "System", user?.name || "Registrar", user?.role || "Staff", "APPOINTMENT_CREATE", `Simulated consultation reserved: ${patName} with doctor: ${docName}`);

    addToast(`Reservation reserved successfully. ID: ${generatedId} is pending clearance.`, "success");
    setIsFormOpen(false);
    loadAppointments();
  };

  const handleUpdateStatus = (id: string, name: string, status: "Approved" | "Cancelled") => {
    const list = dbService.getAppointments();
    const updated = list.map(app => {
      if (app.id === id) {
        return { ...app, status };
      }
      return app;
    });

    dbService.saveAppointments(updated);
    dbService.logAction(user?.id || "System", user?.name || "Operations Lead", user?.role || "Staff", `APPOINTMENT_${status.toUpperCase()}`, `${status} consultation reservation row: ${id}`);
    
    addToast(`Appointment ${id} for ${name} marked ${status}.`, "success");
    loadAppointments();
  };

  // COMPLETE consultation appointment + DYNAMIC SQL TRIGGER (Invoicing statement generation!)
  const handleCompleteAppointment = (app: Appointment) => {
    const list = dbService.getAppointments();
    const updated = list.map(a => {
      if (a.id === app.id) {
        return { ...a, status: "Completed" as any };
      }
      return a;
    });

    dbService.saveAppointments(updated);

    // Dynamic transactional trigger simulation: Generate / Publish an Invoice statement instantly!
    const doctorsList = dbService.getDoctors();
    const matchedDoc = doctorsList.find(d => d.name.toLowerCase().includes(app.doctorName.toLowerCase()));
    const consultFee = matchedDoc ? matchedDoc.consultationFee : 120; // Default fallback consult fee
    const taxes = Math.round(consultFee * 0.15); // standard hospital tax surcharge
    const totalFee = consultFee + taxes;

    const invoicesList = dbService.getInvoices();
    const generatedInvoiceId = "INV-20" + (invoicesList.length + 101);

    const newInvoice: Invoice = {
      id: generatedInvoiceId,
      patientName: app.patientName,
      doctorName: app.doctorName,
      date: new Date().toLocaleDateString(),
      service: `${matchedDoc?.specialization || "Clinical"} Consultation Services`,
      amount: consultFee,
      tax: taxes,
      total: totalFee,
      status: "Unpaid"
    };

    dbService.saveInvoices([newInvoice, ...invoicesList]);

    dbService.logAction(
      user?.id || "System", 
      user?.name || "Consultant", 
      user?.role || "Doctor", 
      "APPOINTMENT_COMPLETE", 
      `Completed appointment ${app.id}. TRIGGERED AUTOMATED BILLING INVOICER FOR: ${newInvoice.id} ($${totalFee})`
    );

    addToast(`Session marked complete. Automated invoice ${generatedInvoiceId} generated under Finances & Billing.`, "success");
    loadAppointments();
  };

  const getAppointmentReportData = (app: Appointment) => ({
    subtitle: "Inpatient Clinical Session Summary Sheet",
    sections: [
      {
        title: "Appointment Demographics",
        fields: [
          { label: "Appointment Ticket ID", value: app.id },
          { label: "Patient Full Name", value: app.patientName },
          { label: "Assigned Physician", value: app.doctorName },
          { label: "Medical Specialty Core", value: app.department || "General Consultation Office" },
          { label: "Reservation Date", value: app.date },
          { label: "Scheduled Slot", value: app.time }
        ]
      },
      {
        title: "Clinical Symptoms & Notes",
        fields: [
          { label: "Current Safety Status", value: app.status }
        ],
        content: `Presented Symptoms:\n${app.symptoms && app.symptoms.length > 0 ? app.symptoms.map(s => `• ${s}`).join("\n") : "No symptoms noted"}\n\nClinical Operational Note:\nThis session has been registered securely on our PostgreSQL servers. Practitioner will inspect diagnostics assays before final release.`
      }
    ],
    excelHeaders: ["Appointment ID", "Patient Name", "Physician", "Department", "Date", "Time", "Status", "Symptoms"],
    excelRows: [[
      app.id,
      app.patientName,
      app.doctorName,
      app.department || "General Medicine",
      app.date,
      app.time,
      app.status,
      app.symptoms ? app.symptoms.join("; ") : ""
    ]]
  });

  return (
    <div className="space-y-6" id="appointments-desk">
      
      {/* CORE CONTROL ROW */}
      <div className="flex border-b border-slate-800 pb-4 items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Appointments Dispatch Desk
          </h2>
          <p className="text-xs text-slate-400">Scheduling workspace: Triage, approve, cancel, or complete inpatient consultations online</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadAppointments}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPatName("");
              setDocName("");
              setAppDate(new Date().toISOString().split("T")[0]);
              setAppSymp("");
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Reserve Consultation
          </button>
        </div>
      </div>

      {/* DETAILED LEDGER GRID */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div key={app.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded">{app.id}</span>
                    <strong className="font-display font-extrabold text-sm text-slate-200">{app.patientName}</strong>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    Consultant Physician: <span className="text-slate-250 font-bold select-all">&nbsp;{app.doctorName}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">🗓 {app.date} | ⏰ {app.time}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full md:w-48 text-[11px] font-mono leading-snug">
                <span className="text-slate-500 font-bold block select-none">SYMPTOMS RECORDED:</span>
                <p className="text-slate-355 truncate italic">{app.symptoms.join(", ")}</p>
              </div>

              {/* Status and Actions flow */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <DocumentButton
                  title={`Appointment Summary Report: ${app.id}`}
                  category="Appointment"
                  documentId={app.id}
                  data={getAppointmentReportData(app)}
                  variant="outline"
                  label="Summary"
                />

                <span className={`px-2.5 py-0.5 text-[9px] font-bold font-mono rounded-full border uppercase leading-tight select-none ${
                  app.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15 animate-pulse" :
                  app.status === "Requested" ? "bg-amber-500/10 text-amber-400 border-amber-500/15" :
                  app.status === "Completed" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/15" :
                  "bg-slate-950 text-slate-500 border-slate-800"
                }`}>
                  {app.status}
                </span>

                {/* Queue action buttons */}
                {user?.role !== "Patient" && app.status !== "Completed" && app.status !== "Cancelled" && (
                  <div className="flex gap-1.5">
                    {app.status === "Requested" && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, app.patientName, "Approved")}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-emerald-600 text-slate-400 hover:text-white rounded border border-slate-800 hover:border-emerald-500 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, app.patientName, "Cancelled")}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-red-650 hover:bg-red-600 text-slate-400 hover:text-white rounded border border-slate-800 hover:border-red-500 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5 text-red-400" />
                          Decline
                        </button>
                      </>
                    )}

                    {app.status === "Approved" && (
                      <button 
                        onClick={() => handleCompleteAppointment(app)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-bold rounded-lg shadow cursor-pointer transition-all flex items-center gap-1"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-200" />
                        Complete Consult
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center max-w-sm mx-auto space-y-3 bg-slate-900 border border-slate-850 rounded-2xl">
          <Calendar className="w-12 h-12 text-slate-650 mx-auto opacity-35" />
          <h3 className="text-sm font-extrabold text-slate-350">Appointments Ledger Empty</h3>
          <p className="text-xs text-slate-500">No scheduled consultations saved inside PostgreSQL yet.</p>
        </div>
      )}

      {/* REGISTRATION RESERVATION POPUP FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4 animate-scale-up">
            
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display font-extrabold text-base text-white">Reserve Clinic Consultation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Schedule clinical visits and assign attending physicians</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">PATIENT RESERVID IDENTIFIER</label>
                <input 
                  type="text" 
                  placeholder="e.g. Richard Hendricks"
                  required
                  value={patName}
                  onChange={(e) => setPatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">ATTENDING CONSULTANT SPECIALIST</label>
                <select 
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Choose clinical specialist...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">RESERVATION DATE</label>
                  <input 
                    type="date" 
                    required
                    value={appDate}
                    onChange={(e) => setAppDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">RESERVATION TIME HOUR</label>
                  <select 
                    value={appTime}
                    onChange={(e) => setAppTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none"
                  >
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>12:00 PM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                    <option>04:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">PRESENTED COMPLAINTS (comma-separated)</label>
                <textarea 
                  placeholder="e.g. Constant coughing spasms, low breath aeration levels"
                  value={appSymp}
                  onChange={(e) => setAppSymp(e.target.value)}
                  className="w-full h-16 px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Commit Reservation
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
