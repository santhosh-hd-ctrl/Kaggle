import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { dbService } from "../services/db";
import { Doctor, Appointment } from "../types/hospital";
import { DocumentButton } from "../components/DocumentButton";
import { 
  ArrowLeft, Stethoscope, Mail, Phone, Calendar, Star, 
  User, CheckCircle2, AlertCircle, FileText, ClipboardList, ShieldAlert
} from "lucide-react";

export const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const docObj = dbService.getDoctors().find(d => d.id === id);
    if (docObj) {
      setDoctor(docObj);
      // Filter appointments representing queues
      const list = dbService.getAppointments().filter(a => a.doctorName.toLowerCase().includes(docObj.name.toLowerCase()));
      setAppointments(list);
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs max-w-sm mx-auto animate-pulse">
        Polling clinic directory metrics...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto space-y-4 text-center p-12 bg-slate-900 border border-slate-800 rounded-2xl mt-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-extrabold text-white">Specilaist Profile Not Seeded</h3>
        <p className="text-xs text-slate-400">
          The requested clinical doctor identifier <strong className="text-indigo-400 font-mono">({id})</strong> does not reside in our HIPAA registers.
        </p>
        <Link to="/doctors" className="inline-block px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl">
          Return to Specialists Board
        </Link>
      </div>
    );
  }

  const assignedQueue = appointments.filter(a => a.status === "Approved" || a.status === "Requested");
  const pastHistory = appointments.filter(a => a.status === "Completed");

  const doctorReportData = doctor ? {
    subtitle: "Professional Medical Specialist Directory Sheet",
    sections: [
      {
        title: "Clinician Personal & Professional Demographics",
        fields: [
          { label: "Physician Core ID", value: doctor.id },
          { label: "Full Practitioner Name", value: doctor.name },
          { label: "Medical Specialization", value: doctor.specialization },
          { label: "Assigned Department", value: doctor.department },
          { label: "Clinical Years Experience", value: `${doctor.experience} Years Active` },
          { label: "Review Rating Score", value: `${doctor.rating.toFixed(2)} / 5.00` }
        ]
      },
      {
        title: "Clinic Office Schedules & Contact Details",
        fields: [
          { label: "Consul Fee / Session", value: `$${doctor.consultationFee}.00 USD` },
          { label: "Schedules Availabilities", value: Array.isArray(doctor.availability) ? doctor.availability.join(", ") : String(doctor.availability) },
          { label: "Primary Registry Email", value: doctor.email },
          { label: "Clinic Direct Telephone", value: doctor.phone }
        ]
      },
      {
        title: "Active Scheduled Patient Queue",
        fields: [],
        content: assignedQueue.length > 0
          ? assignedQueue.map((a, i) => `Seq [${i+1}]: Patient: ${a.patientName} (${a.patientId}) - Date: ${a.date} @ ${a.time}. Status: ${a.status}. Symptoms: ${a.symptoms ? a.symptoms.join(", ") : "N/A"}`).join("\n")
          : "No patients currently in the upcoming active clinical queue."
      },
      {
        title: "Consultation History Logs",
        fields: [],
        content: pastHistory.length > 0
          ? pastHistory.map((a, i) => `Case [${i+1}]: Patient: ${a.patientName} (${a.patientId}) on ${a.date}. Status: ${a.status}. Symptoms: ${a.symptoms ? a.symptoms.join(", ") : "N/A"}`).join("\n")
          : "No historic consultation cases archived for this specialist."
      }
    ],
    excelHeaders: ["Doctor ID", "Name", "Specialization", "Department", "Experience", "Consultation Fee", "Availability", "Rating", "Email", "Phone"],
    excelRows: [[
      doctor.id,
      doctor.name,
      doctor.specialization,
      doctor.department,
      `${doctor.experience} Yrs`,
      `$${doctor.consultationFee}`,
      Array.isArray(doctor.availability) ? doctor.availability.join("; ") : String(doctor.availability),
      doctor.rating.toFixed(2),
      doctor.email,
      doctor.phone
    ]]
  } : { subtitle: "", sections: [], excelHeaders: [], excelRows: [] };

  return (
    <div className="space-y-8" id="doctor-profile">
      
      {/* Title head */}
      <div className="flex items-center justify-between">
        <Link 
          to="/doctors"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          Back to Specialists Directory
        </Link>
        <div className="flex items-center gap-3">
          <DocumentButton
            title="Doctor Information Report"
            category="Doctor"
            documentId={doctor.id}
            data={doctorReportData}
            variant="outline"
            label="Download Specialist Report"
          />
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono py-1.5 px-3 rounded-xl font-bold">
            RECORD ID: {doctor.id}
          </span>
        </div>
      </div>

      {/* CORE INFO CARD */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-lg">
        <div className="flex gap-4 items-center">
          <img 
            src={doctor.avatar} 
            alt={doctor.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest">{doctor.id}</span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 leading-none">★ {doctor.rating.toFixed(2)}</span>
            </div>
            <h2 className="text-xl font-display font-extrabold text-white mt-1">{doctor.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold text-indigo-350">
              {doctor.specialization} Consulting Physician
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-mono w-full md:w-auto">
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">FEES:</span>
            <span className="text-emerald-400 font-extrabold block text-sm">${doctor.consultationFee} <span className="text-[9px] font-mono text-slate-500 font-normal">/ Session</span></span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Office contact:</span>
            <span className="text-white font-bold block">{doctor.email}</span>
            <span className="text-slate-400 block text-[10px]">{doctor.phone}</span>
          </div>
        </div>
      </div>

      {/* DETAILED WORKBENCH TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Patients Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-2">
            <h3 className="font-display font-extrabold text-sm text-slate-200">Enrolled Patients Consultations Queue</h3>
            <p className="text-xs text-slate-400">Scheduled queues mapping this consultant in SQL registers</p>
          </div>

          <div className="space-y-3">
            {assignedQueue.length > 0 ? (
              assignedQueue.map((app) => (
                <div key={app.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-900 rounded-lg text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-200 text-xs block leading-tight">{app.patientName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">{app.id} • Scheduled: {app.date} | {app.time}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded-full uppercase leading-none select-none ${
                    app.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-xl">
                Consultant appointment queue empty. No pending schedules.
              </div>
            )}
          </div>
        </div>

        {/* Previous Consultation Histories */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-2">
            <h3 className="font-display font-extrabold text-sm text-slate-200">Historical Finished Consultations</h3>
            <p className="text-xs text-slate-400">Past schedules marked completed in PostgreSQL records</p>
          </div>

          <div className="space-y-3">
            {pastHistory.length > 0 ? (
              pastHistory.map((app) => (
                <div key={app.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <strong className="text-slate-200 text-xs block">{app.patientName}</strong>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{app.date}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic bg-slate-900 p-2.5 rounded border border-slate-850">
                    "Session processed. Diagnosis logged cleanly to EMR file. e-Prescription orders dispatched to hospital pharmacy."
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-xl">
                No archived session statements found.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
