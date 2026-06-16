import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { dbService } from "../services/db";
import { Patient, MedicalDocument, Medicine } from "../types/hospital";
import { useAuth } from "../context/AuthContext";
import { DocumentButton } from "../components/DocumentButton";
import { 
  ArrowLeft, Heart, User, ShieldAlert, FileText, ClipboardList, 
  Clock, Plus, Trash, Check, FolderOpen, Calendar, HelpCircle, 
  Terminal, ArrowRight, Pill, ShieldCheck, FileSpreadsheet
} from "lucide-react";

export const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, addToast } = useAuth();
  const navigate = useNavigate();

  // State managers
  const [patient, setPatient] = useState<Patient | null>(null);
  const [docs, setDocs] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);

  // New Consultation Timeline interaction state
  const [newSymptom, setNewSymptom] = useState("");
  const [newDiagnosis, setNewDiagnosis] = useState("");
  
  // New e-Prescription inline state
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState("Once Daily");

  // Document uploader simulation state
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState<any>("Lab Report");
  const [docContent, setDocContent] = useState("");

  const refreshProfileData = () => {
    setIsLoading(true);
    const patObj = dbService.getPatients().find(p => p.id === id);
    if (patObj) {
      setPatient(patObj);
      // Filter related clinical documents from medical documents table matching patientId
      const connectedDocs = dbService.getDocuments().filter(d => d.patientId === id);
      setDocs(connectedDocs);
    }
    setAvailableMedicines(dbService.getMedicines());
    setIsLoading(false);
  };

  useEffect(() => {
    refreshProfileData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs max-w-sm mx-auto animate-pulse">
        Fetching patient clinical EMR charts from medical cores...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-md mx-auto space-y-4 text-center p-12 bg-slate-900 border border-slate-800 rounded-2xl mt-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-extrabold text-white">EMR Chart File Not Seeded</h3>
        <p className="text-xs text-slate-400">
          The requested clinical patient identifier <strong className="text-indigo-400 font-mono">({id})</strong> does not reside in our HIPAA SQL directory.
        </p>
        <Link to="/patients" className="inline-block px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl">
          Return to Patients Registry
        </Link>
      </div>
    );
  }

  // Handle clinical consultation diagnosis pipeline submission
  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagnosis.trim()) {
      addToast("Primary clinical diagnosis update can not be left blank.", "warning");
      return;
    }

    const currentPatients = dbService.getPatients();
    const updated = currentPatients.map((p) => {
      if (p.id === patient.id) {
        const symptomsArray = newSymptom ? [newSymptom, ...p.symptoms] : p.symptoms;
        const treatmentHistory = [
          `Consultation logged by ${user?.name || "MD"} - Diagnosis: ${newDiagnosis} (${new Date().toLocaleDateString()})`,
          ...p.treatmentHistory
        ];
        return {
          ...p,
          diagnosis: newDiagnosis,
          symptoms: symptomsArray,
          treatmentHistory
        };
      }
      return p;
    });

    dbService.savePatients(updated);
    dbService.logAction(user?.id || "System", user?.name || "Consultant", "Doctor", "PATIENT_CONSULT", `Logged clinical diagnostic update on ${patient.name}`);
    
    addToast("Diagnostic timeline updated successfully.", "success");
    setNewSymptom("");
    setNewDiagnosis("");
    refreshProfileData();
  };

  // Add prescription
  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !medDose.trim()) {
      addToast("Prescription drug name and precise doses are required.", "warning");
      return;
    }

    const prescriptionString = `${medName} (${medDose}) - Directives: ${medFreq}`;
    const currentPatients = dbService.getPatients();
    
    const updated = currentPatients.map((p) => {
      if (p.id === patient.id) {
        return {
          ...p,
          prescriptions: [prescriptionString, ...p.prescriptions]
        };
      }
      return p;
    });

    dbService.savePatients(updated);

    // Also simulate creating a clinical prescription document inside our MongoDB database instantly!
    const allDocuments = dbService.getDocuments();
    const newDocId = "DOC-MDB-" + (800 + allDocuments.length + 1);
    const newDoc: MedicalDocument = {
      id: newDocId,
      patientId: patient.id,
      patientName: patient.name,
      title: `E-Prescription Order: ${medName}`,
      category: "Prescription",
      content: `Authorized e-Prescription line issued by ${user?.name || "Clinic Specialist"}. Medication: ${medName}, Dose: ${medDose}, Protocol: ${medFreq}. Refills authorized: 3. Dispensing guidelines: Check patient allergies before administration.`,
      uploader: user?.name || "Specialist MD",
      timestamp: new Date().toISOString(),
      meta: {
        collection: "clinical_prescriptions",
        drug: medName,
        dosing: medDose,
        scheduling: medFreq,
        signed_by: user?.name || "Specialist MD",
        licenseNumber: "MD-CA-904812"
      }
    };

    dbService.saveDocuments([newDoc, ...allDocuments]);
    dbService.logAction(user?.id || "System", user?.name || "Dr. Jenkins", "Doctor", "RX_AUTHORIZATION", `Issued digital Rx for ${prescriptionString} to ${patient.name}`);

    addToast(`e-Prescription issued for ${medName}. Connected to MongoDB collections.`, "success");
    setMedName("");
    setMedDose("");
    refreshProfileData();
  };

  // Add mock clinical document uploader
  const handleDocSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) {
      addToast("Document name and textual diagnostics report content are mandatory.", "warning");
      return;
    }

    const allDocuments = dbService.getDocuments();
    const newDocId = "DOC-MDB-" + (800 + allDocuments.length + 1);
    const newDoc: MedicalDocument = {
      id: newDocId,
      patientId: patient.id,
      patientName: patient.name,
      title: docTitle,
      category: docCategory,
      content: docContent,
      uploader: user?.name || "Admin Assistant",
      timestamp: new Date().toISOString(),
      meta: {
        collection: "uploaded_reports",
        securityChecksum: "md5_" + Math.floor(Math.random() * 900000 + 100000),
        rawStoragePath: `/usr/share/mongodb/patients/${patient.id}/reports/${newDocId}.bin`,
        fileSizeBytes: docContent.length * 2
      }
    };

    dbService.saveDocuments([newDoc, ...allDocuments]);
    dbService.logAction(user?.id || "System", user?.name || "Staff", "Staff", "DOCUMENT_UPLOAD", `Uploaded diagnostics report: ${docTitle} for patient ${patient.name}`);

    addToast(`Diagnostics report "${docTitle}" uploaded successfully to MongoDB cluster.`, "success");
    setDocTitle("");
    setDocContent("");
    refreshProfileData();
  };

  const patientAppointments = patient ? dbService.getAppointments().filter(a => a.patientId === patient.id || a.patientName === patient.name) : [];
  const patientLabTests = patient ? dbService.getLabTests().filter(l => l.patientName === patient.name) : [];

  const reportData = patient ? {
    subtitle: "Official Electronic Health Record - HIPAA Certified clinical dispatch",
    sections: [
      {
        title: "Subject Demographics & Contact Profile",
        fields: [
          { label: "Patient Core Identifier", value: patient.id },
          { label: "Legal Subject Name", value: patient.name },
          { label: "Subject Age / Gender", value: `${patient.age} Yrs / ${patient.gender}` },
          { label: "Blood Specimen Group", value: patient.bloodGroup || "O-Negative" },
          { label: "Emergency Spouse Contact", value: `${patient.emergencyContact.name} (${patient.emergencyContact.relation})` },
          { label: "Emergency Helpline Tel", value: patient.emergencyContact.phone }
        ]
      },
      {
        title: "Clinical Allergens & Diagnostic Profiles",
        fields: [
          { label: "Attending Clinical Diagnosis", value: patient.diagnosis || "No records" }
        ],
        content: `Allergic Drug Sensitivity Panels: ${patient.allergies.length > 0 ? patient.allergies.join(", ") : "No Known Drug Allergies (NKDA)"}\n\nSymptoms Logs:\n${patient.symptoms.length > 0 ? patient.symptoms.map(s => `• ${s}`).join("\n") : "No active acute symptoms reported."}`
      },
      {
        title: "Pharmaceutical Prescriptions Records",
        fields: [],
        content: patient.prescriptions.length > 0 
          ? patient.prescriptions.map((rx, i) => `Rx Line [${i+1}]: ${rx}`).join("\n")
          : "No active pharmacological medications registered in EMR logs."
      },
      {
        title: "Historic Consultations Timeline",
        fields: [],
        content: patient.treatmentHistory.length > 0
          ? patient.treatmentHistory.map((h, i) => `Consult [${i+1}]: ${h}`).join("\n")
          : "No prior clinician treatments recorded in database."
      },
      {
        title: "Recent Clinic Check-ins & Appointments",
        fields: [],
        content: patientAppointments.length > 0
          ? patientAppointments.map(a => `• [${a.date} @ ${a.time}] with ${a.doctorName} (${a.department}) - Status: ${a.status}. Symptoms: ${a.symptoms ? a.symptoms.join(", ") : "N/A"}`).join("\n")
          : "No recorded appointment sessions for this subject."
      },
      {
        title: "Laboratory Diagnostics Assays",
        fields: [],
        content: patientLabTests.length > 0
          ? patientLabTests.map(l => `• Test: ${l.testType} on ${l.dateOrdered} - Status: ${l.status}. Results: ${l.result}`).join("\n")
          : "No laboratory diagnostics assays found."
      }
    ],
    excelHeaders: ["Patient ID", "Full Name", "Age", "Gender", "Blood Group", "Allergies", "Diagnosis", "Emergency Contact", "Active Prescriptions"],
    excelRows: [[
      patient.id,
      patient.name,
      String(patient.age),
      patient.gender,
      patient.bloodGroup,
      patient.allergies.join("; "),
      patient.diagnosis,
      `${patient.emergencyContact.name} (${patient.emergencyContact.phone})`,
      patient.prescriptions.join("; ")
    ]]
  } : { subtitle: "", sections: [], excelHeaders: [], excelRows: [] };

  return (
    <div className="space-y-8" id="patient-profile">
      
      {/* Back to list ribbon */}
      <div className="flex items-center justify-between">
        <Link 
          to="/patients"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          Back to Patients Directory
        </Link>
        <div className="flex items-center gap-3">
          <DocumentButton
            title="Patient Clinical Medical Report"
            category="Patient"
            documentId={patient.id}
            data={reportData}
            variant="outline"
            label="Download Medical Report"
          />
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono py-1.5 px-3 rounded-xl font-bold">
            SECURE EHR STACK: {patient.id}
          </span>
        </div>
      </div>

      {/* CORE PROFILE HERO HEADER */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex gap-4 items-center">
          <img 
            src={patient.avatar} 
            alt={patient.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 uppercase tracking-widest">{patient.id}</span>
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 uppercase">{patient.bloodGroup}</span>
            </div>
            <h2 className="text-xl font-display font-extrabold text-white mt-1">{patient.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {patient.gender} • {patient.age} Years • Registered Hospital Inpatient
            </p>
          </div>
        </div>

        {/* Dynamic bio stats list */}
        <div className="flex flex-wrap gap-4 text-xs font-mono w-full md:w-auto">
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Allergies:</span>
            <span className="text-amber-400 font-bold truncate max-w-[150px] block">
              {patient.allergies.length > 0 ? patient.allergies.join(", ") : "No Known Drug Allergies (NKDA)"}
            </span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Emergency Line:</span>
            <span className="text-white font-bold block">{patient.emergencyContact.name} ({patient.emergencyContact.relation})</span>
            <span className="text-slate-400 block text-[10px]">{patient.emergencyContact.phone}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: DIAGNOSIS TIMELINE (LIFELONG STATUS) */}
        {/* ========================================== */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline chart logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-200">Patient Consultation Treatment Log</h3>
                <p className="text-xs text-slate-400">PostgreSQL clinical activity logs tracking previous diagnostics</p>
              </div>
              <span className="text-[10px] bg-slate-950 text-indigo-400 border border-slate-800 rounded py-1 px-2.5 font-bold font-mono">
                EMR ACTIVE HISTORIES
              </span>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {patient.treatmentHistory.map((item, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {/* Connected track line */}
                  {idx !== patient.treatmentHistory.length - 1 && (
                    <div className="absolute top-5 left-2 w-0.5 h-12 bg-slate-800" />
                  )}
                  <div className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                    <Clock className="w-2.5 h-2.5" />
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 flex-1">
                    <p className="text-xs text-slate-200 leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consultation interaction form */}
          {user?.role !== "Patient" && (
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-850 pb-2">
                <h3 className="font-display font-extrabold text-sm text-slate-200">Log Clinical Session Note</h3>
                <p className="text-xs text-slate-400">Instantly appends new clinical statements to the EMR chronological table</p>
              </div>

              <form onSubmit={handleConsultationSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-mono font-bold text-slate-400 block">NEW PRIMARY DIAGNOSIS DISMISSAL</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Acute bronchitis respiratory complications"
                      required
                      value={newDiagnosis}
                      onChange={(e) => setNewDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-mono font-bold text-slate-400 block">PRESENTED SYMPTOMS</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Coughing fits, lung crackling indices"
                      value={newSymptom}
                      onChange={(e) => setNewSymptom(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                  >
                    Add Session Note
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: MEDICINES & DOCUMENT VAULT */}
        {/* ========================================== */}
        <div className="space-y-6">
          
          {/* e-Prescriptions Vault */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-200">Active e-Prescriptions</h3>
                <p className="text-xs text-slate-400">Patient drug routines authorized inside HIPAA archives</p>
              </div>
              <Pill className="w-4.5 h-4.5 text-emerald-400" />
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {patient.prescriptions.length > 0 ? (
                patient.prescriptions.map((pStr, index) => (
                  <div key={index} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-start gap-2.5 hover:border-slate-800 transition-all">
                    <span className="p-1 text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded shrink-0.5 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <p className="text-xs text-slate-300 font-mono font-semibold">{pStr}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  No active pharmaceutical routines mapped to patient EMR.
                </div>
              )}
            </div>

            {/* Authorize drug inline form */}
            {user?.role !== "Patient" && (
              <form onSubmit={handlePrescriptionSubmit} className="space-y-3 pt-3 border-t border-slate-850">
                <span className="text-[10px] font-mono font-bold block text-slate-400 tracking-wider">AUTHORIZE PHARMACEUTICAL DRUG RX:</span>
                <div className="space-y-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search or pick compound drug..."
                      required
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      list="medicines-rack"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-250 text-xs rounded-lg placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <datalist id="medicines-rack">
                      {availableMedicines.map(m => (
                        <option key={m.id} value={m.name}>{m.name} (Available: {m.stock} units)</option>
                      ))}
                    </datalist>
                  </div>
                  
                  {(() => {
                    const matchedMed = availableMedicines.find(m => m.name.toLowerCase() === medName.toLowerCase());
                    if (matchedMed) {
                      if (matchedMed.stock <= 10) {
                        return (
                          <div className="p-2 bg-rose-950/20 border border-rose-500/10 text-rose-400 text-[10px] font-mono rounded flex flex-col gap-0.5">
                            <span className="font-extrabold">⚠️ CRITICAL STOCK SHORTAGE ALERT</span>
                            <span>Remaining inventory: only {matchedMed.stock} units. Refills might delay.</span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="p-2 bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded flex justify-between">
                            <span>✓ Active Compound Verified</span>
                            <span className="font-bold">Stock: {matchedMed.stock} pcs • ${matchedMed.price.toFixed(2)}</span>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}

                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. 90mcg aerosol"
                      required
                      value={medDose}
                      onChange={(e) => setMedDose(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-250 text-xs rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <select
                      value={medFreq}
                      onChange={(e) => setMedFreq(e.target.value)}
                      className="px-2 py-1.5 bg-slate-950 border border-slate-800 text-slate-350 text-xs rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option>Once Daily</option>
                      <option>Twice Daily</option>
                      <option>As Required (PRN)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10.5px] rounded-lg shadow cursor-pointer transition-colors"
                >
                  Issue e-Prescription
                </button>
              </form>
            )}
          </div>

          {/* MongoDB reports explorer document storage */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-200">MongoDB Documents vault</h3>
                <p className="text-xs text-slate-400">BSON diagnostics documents &amp; imaging reports logs</p>
              </div>
              <FolderOpen className="w-4.5 h-4.5 text-indigo-400" />
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
              {docs.length > 0 ? (
                docs.map((doc) => (
                  <div key={doc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5 hover:border-slate-800 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 block truncate max-w-[130px]">{doc.title}</span>
                      <span className="text-[8.5px] font-mono font-bold bg-slate-900 text-slate-500 border border-slate-850 px-1.5 py-0.2 rounded uppercase">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{doc.content}</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                      <span>Uploader: {doc.uploader}</span>
                      <span>{doc.id}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  No BSON medical documents loaded. Register report below.
                </div>
              )}
            </div>

            {/* Document generator form */}
            {user?.role !== "Patient" && (
              <form onSubmit={handleDocSimulatedUpload} className="space-y-2 pt-2 border-t border-slate-850">
                <span className="text-[10px] font-mono font-bold block text-slate-400 tracking-wider">GENERATE BIOCHEMICAL REPORT BSON:</span>
                <input 
                  type="text" 
                  placeholder="Doc title (e.g. Sputum Culture Panel)"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-250 text-xs rounded-lg focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 text-slate-350 text-xs rounded-lg"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Imaging">Imaging Scan</option>
                    <option value="Discharge Summary">Discharge Sheet</option>
                    <option value="EHR Chart">EHR Chart</option>
                  </select>
                  <button 
                    type="submit"
                    className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10.5px] rounded-lg transition-colors border border-slate-750 cursor-pointer"
                  >
                    Generate BSON
                  </button>
                </div>
                <textarea 
                  placeholder="Diagnostic feedback text write-up..."
                  required
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full min-h-[50px] px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-250 text-[11px] rounded-lg focus:outline-none"
                />
              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
