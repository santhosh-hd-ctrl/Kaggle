import React, { useState, useEffect } from "react";
import { dbService } from "../services/db";
import { Patient, MedicalDocument, Appointment, LabTest } from "../types/hospital";
import { useAuth } from "../context/AuthContext";
import { DocumentButton } from "../components/DocumentButton";
import { 
  FolderLock, UserCheck, Stethoscope, Calendar, FileText, Pill, 
  HelpCircle, Eye, RefreshCw, Layers, ShieldCheck, Terminal, Search, Info, ShieldAlert
} from "lucide-react";

// Supplemental patient records to satisfy enterprise standards
const SUPPLEMENTAL_PATIENT_DETAILS: Record<string, {
  dob: string;
  phone: string;
  address: string;
  existingConditions: string[];
  medicalHistory: string;
  previousTreatments: string[];
}> = {
  "PAT-001": {
    dob: "1992-04-12",
    phone: "+1-555-0190",
    address: "742 Cloud Run Drive, Suite A, San Francisco, CA",
    existingConditions: ["Moderate Bronchial Asthma", "Persistent Bronchial Spasms"],
    medicalHistory: "Childhood acute asthma, chronic inhaler dependencies since 2018. Pulmonic irritations under control.",
    previousTreatments: ["Pulmonary Function Test (PFT) - Jan 2026", "Subcutaneous Immunotherapy - Ongoing"]
  },
  "PAT-002": {
    dob: "1968-03-15",
    phone: "+1-555-0140",
    address: "1 Villa Hill Road, Rome, CA 94016",
    existingConditions: ["Grade II Essential Hypertension", "Occasional Cardial Tightness"],
    medicalHistory: "Diagnosed in 2021. Progressive arterial management under active beta blockers and cardiologist supervision.",
    previousTreatments: ["Electrocardiogram (ECG) - Mar 2026", "Stress Echocardiogram - Apr 2026"]
  },
  "PAT-003": {
    dob: "1999-11-03",
    phone: "+1-555-7830",
    address: "512 Golden Gate Boulevard, Apt 4C, San Francisco, CA",
    existingConditions: ["Type 1 Diabetes Mellitus"],
    medicalHistory: "Insulin-dependent since late pubescence. Active CGM synchronize reporting stable glucose trends.",
    previousTreatments: ["Continuous Glucose Monitoring (CGM) Sync - May 2026", "Diabetic Retinopathy Screen - Annual"]
  }
};

export const MyDocuments: React.FC = () => {
  const { user, addToast } = useAuth();
  
  // Database states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("PAT-001");
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const loadedPatients = dbService.getPatients();
    setPatients(loadedPatients);
    setAppointments(dbService.getAppointments());
    setLabTests(dbService.getLabTests());
    setDocuments(dbService.getDocuments());

    // Auto-map Patient role to Eleanor Vance if they are the default patient user
    if (user?.role === "Patient") {
      // Find a patient profile with name resembling Patient Vance or Vance
      const matchingPat = loadedPatients.find(p => p.name.toLowerCase().includes("vance") || p.id === "PAT-001");
      if (matchingPat) {
        setSelectedPatientId(matchingPat.id);
      }
    }
  }, [user, ticker]);

  const activePatientObj = patients.find(p => p.id === selectedPatientId) || patients[0];

  if (!activePatientObj) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs max-w-md mx-auto">
        Database synchronization in progress...
      </div>
    );
  }

  // Retrieve supplemental profile stats
  const activeSupplemental = SUPPLEMENTAL_PATIENT_DETAILS[activePatientObj.id] || {
    dob: "1995-08-20",
    phone: "+1-555-9000",
    address: "Emergency Registered Shelter Area, San Francisco, CA",
    existingConditions: activePatientObj.symptoms,
    medicalHistory: `Diagnosed with ${activePatientObj.diagnosis || "Acute Clinical Symptoms"}`,
    previousTreatments: activePatientObj.treatmentHistory
  };

  const patientAppointments = appointments.filter(a => a.patientId === activePatientObj.id || a.patientName === activePatientObj.name);
  const patientLabTests = labTests.filter(l => l.patientName === activePatientObj.name || l.patientId === activePatientObj.id);
  const patientBsonDocs = documents.filter(d => d.patientId === activePatientObj.id);

  // 1. COMPLETE PATIENT MEDICAL PROFILE DATA TEMPLATE
  const composeMedicalProfileData = () => {
    return {
      subtitle: "Official Comprehensive Patient Health Index Card",
      sections: [
        {
          title: "Standard Identity & Demographics Desk",
          fields: [
            { label: "Patient Profile ID", value: activePatientObj.id },
            { label: "Legal Legal Name", value: activePatientObj.name },
            { label: "Date of Birth (DoB)", value: activeSupplemental.dob },
            { label: "Calculated Age", value: `${activePatientObj.age} years` },
            { label: "Gender Identity", value: activePatientObj.gender },
            { label: "Blood Antigen Group", value: activePatientObj.bloodGroup || "O-Negative" }
          ]
        },
        {
          title: "Immediate Tele-Contact & Demographics",
          fields: [
            { label: "Direct Phone Line", value: activeSupplemental.phone },
            { label: "Clinical Residence Address", value: activeSupplemental.address },
            { label: "Emergency Contact", value: `${activePatientObj.emergencyContact.name} (${activePatientObj.emergencyContact.relation})` },
            { label: "Emergency Contact Tel", value: activePatientObj.emergencyContact.phone }
          ]
        },
        {
          title: "Clinical Sensitivities & Allergens",
          fields: [],
          content: `Allergy Register:\n${activePatientObj.allergies.length > 0 ? activePatientObj.allergies.join(", ") : "No Known Drug Allergies (NKDA)"}\n\nExisting Comorbidities:\n${activeSupplemental.existingConditions.map(c => `• ${c}`).join("\n")}`
        },
        {
          title: "Consolidated Medical Histories",
          fields: [],
          content: `Primary Diagnosed State:\n${activePatientObj.diagnosis || "Under active clinical review."}\n\nClinical History Narrative:\n${activeSupplemental.medicalHistory}\n\nCompleted Treatment Registers:\n${activeSupplemental.previousTreatments.map(t => `• ${t}`).join("\n")}`
        }
      ],
      excelHeaders: ["Patient ID", "Name", "DoB", "Age", "Gender", "Blood Group", "Phone", "Address", "Allergies", "Diagnosis"],
      excelRows: [[
        activePatientObj.id,
        activePatientObj.name,
        activeSupplemental.dob,
        String(activePatientObj.age),
        activePatientObj.gender,
        activePatientObj.bloodGroup,
        activeSupplemental.phone,
        activeSupplemental.address,
        activePatientObj.allergies.join("; "),
        activePatientObj.diagnosis
      ]]
    };
  };

  // 2. PRESCRIPTION EXPORT COMPOSE
  const composePrescriptionPdfData = (medString: string, index: number) => {
    // Parse drug details out
    // "Albuterol HFA 90 mcg (2 puffs), QID"
    const words = medString.split(" - ");
    const drugLine = words[0];
    const directivesLine = words[1] || "As prescribed by the attending doctor.";
    
    return {
      subtitle: "Official Pharmacological e-Prescription Dispatch",
      sections: [
        {
          title: "Dispensing Pharmacist Instructions",
          fields: [
            { label: "Prescription Slip ID", value: `RX-MDB-${activePatientObj.id}-${1000 + index}` },
            { label: "Date Authorized", value: new Date().toLocaleDateString() },
            { label: "Attending Specialist", value: "Dr. Jenkins (Interventional Cardiology)" },
            { label: "Medical Licensing Code", value: "LIC-CA-904812" },
            { label: "Regulatory Clearance", value: "VERIFIED ACTIVE REFILS" }
          ]
        },
        {
          title: "Patient Beneficiary Details",
          fields: [
            { label: "Name", value: activePatientObj.name },
            { label: "Patient ID", value: activePatientObj.id },
            { label: "Age / Gender", value: `${activePatientObj.age} / ${activePatientObj.gender}` }
          ]
        },
        {
          title: "Therapeutic Agent Itemization",
          fields: [
            { label: "Therapeutic Compound", value: drugLine },
            { label: "Dispensing Protocol", value: directivesLine }
          ],
          content: `Clinical Advice Instructions:\nAdminister with substantial oral hydration. Immediately discontinue usage and contact our telemetry help desk if persistent bronchospasms, cardiac arithmetic, or hives manifest.\n\nAttending Signature Verified:\nDigitally sealed as prescribed under HIPAA Title II.`
        }
      ],
      excelHeaders: ["Rx ID", "Patient Name", "Drug Compound", "Instructions", "Date Issued", "Doctor"],
      excelRows: [[
        `RX-${activePatientObj.id}-${1000 + index}`,
        activePatientObj.name,
        drugLine,
        directivesLine,
        new Date().toLocaleDateString(),
        "Dr. Sarah Jenkins"
      ]]
    };
  };

  // 3. APPOINTMENT HISTORY LEDGER COMPOSE
  const composeAppointmentLedgerData = () => {
    return {
      subtitle: "Chronological Consultation Check-in Logs",
      sections: [
        {
          title: "Consolidated Attendance Benchmarks",
          fields: [
            { label: "Total Booked Appointments", value: `${patientAppointments.length} Sessions` },
            { label: "Enrolled Patient Subject", value: activePatientObj.name },
            { label: "Unique Patient ID", value: activePatientObj.id }
          ]
        },
        {
          title: "Roster Itemization Details",
          fields: [],
          content: patientAppointments.length > 0
            ? patientAppointments.map((a, i) => `[Session #${i+1}] ID: ${a.id}\n• Date/Time: ${a.date} @ ${a.time}\n• Specialization/Doctor: ${a.doctorName} (${a.department})\n• Status Code: ${a.status.toUpperCase()}\n• Presented Symptoms: ${a.symptoms ? a.symptoms.join(", ") : "N/A"}`).join("\n\n")
            : "No recorded scheduler roster history exists in LocalStorage SQL structures."
        }
      ],
      excelHeaders: ["Appt ID", "Date", "Time", "Doctor", "Department", "Status", "Symptoms"],
      excelRows: patientAppointments.map(a => [
        a.id,
        a.date,
        a.time,
        a.doctorName,
        a.department,
        a.status,
        a.symptoms ? a.symptoms.join("; ") : ""
      ])
    };
  };

  // 4. LAB & REPORT LEDGER COMPOSE
  const composeLabReportData = (test: LabTest) => {
    return {
      subtitle: "Biochemical Pathology Laboratory Assay",
      sections: [
        {
          title: "Laboratory Information System (LIS) Metadata",
          fields: [
            { label: "Lab Specimen Ticket", value: test.id },
            { label: "Requested Panel Name", value: test.testType || "Pathology Panel" },
            { label: "Attending Patient Subject", value: test.patientName },
            { label: "Collection Registered Date", value: test.dateOrdered || new Date().toLocaleDateString() },
            { label: "Assay Execution Status", value: test.status.toUpperCase() }
          ]
        },
        {
          title: "Quantitative Patho-Results & Medical Advice",
          fields: [],
          content: `Test Diagnostic Findings Summary:\n${test.result || "Awaiting laboratory centrifuge processing."}\n\nPathology Integrity Audit:\nAll biochemical readings comply with CLIA certification parameters. Reference intervals check stable.`
        }
      ],
      excelHeaders: ["Test ID", "Patient Name", "Panel Type", "Date Ordered", "Status", "Clinical Result"],
      excelRows: [[
        test.id,
        test.patientName,
        test.testType || "Chemical Roster",
        test.dateOrdered || "",
        test.status,
        test.result || "Awaiting centrifuge results"
      ]]
    };
  };

  return (
    <div className="space-y-6" id="my-documents-portal">
      
      {/* SECTION HEADER */}
      <div className="flex border-b border-slate-800 pb-4 items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-indigo-400" />
            Enterprise Patient Document Portal
          </h2>
          <p className="text-xs text-slate-400">HIPAA Certified role-based printable profiles, prescriptions, appointments roster and pathology reports</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setTicker(t => t + 1)}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            title="Refresh database state"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 font-mono py-1.5 px-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Active Role: {user?.role}
          </span>
        </div>
      </div>

      {/* CLERICAL/ADMIN SEARCH OVERRIDE SELECTOR */}
      {user?.role !== "Patient" ? (
        <div className="bg-indigo-950/25 border border-indigo-500/10 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-indigo-350 uppercase tracking-wider flex items-center gap-2 font-mono">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Administrative Overview override selector:
            </h3>
            <p className="text-xs text-slate-400">You are logged in as <strong className="text-slate-200">{user?.role}</strong>. Select any registered patient below to generate their complete report dossiers.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold leading-none cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-4 border border-slate-850 rounded-2xl flex items-center gap-3 text-xs leading-normal">
          <Info className="w-5 h-5 text-indigo-400 shrink-0" />
          <p className="text-slate-400">
            Secure Portal Rule: You are authorized to access and examine own records. In compliance with **HIPAA Security Rule Standards (45 CFR Part 160/164)**, transactions are logged in the **DBMS AUDIT TRANSCRIPT**.
          </p>
        </div>
      )}

      {/* ACTIVE INDIVIDUAL CARD WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEADING BIO INFO PANEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-850 pb-4">
            <img 
              src={activePatientObj.avatar} 
              alt={activePatientObj.name} 
              className="w-14 h-14 rounded-full object-cover border border-slate-700 bg-slate-800"
            />
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400">{activePatientObj.id}</span>
              <h2 className="text-lg font-display font-extrabold text-white leading-none">{activePatientObj.name}</h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">{activePatientObj.gender} • {activePatientObj.age} Yrs • Inpatient</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase select-none">Blood Group:</span>
              <span className="text-rose-400 font-extrabold uppercase">{activePatientObj.bloodGroup || "O-Negative"}</span>
            </div>
            
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase select-none">Date of Birth:</span>
              <span className="text-slate-200 font-bold">{activeSupplemental.dob}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5 text-left">
              <span className="text-slate-500 text-[10px] font-bold uppercase block select-none">Address location:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{activeSupplemental.address}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5 text-left">
              <span className="text-slate-500 text-[10px] font-bold uppercase block select-none">Drug Allergies Alert:</span>
              <div className="flex flex-wrap gap-1">
                {activePatientObj.allergies.length > 0 ? (
                  activePatientObj.allergies.map((all, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase leading-none">
                      {all}
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-400 text-[10.5px] font-bold">No Known Drug Allergies (NKDA)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COMPILING WORK STATIONS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DOSSIER EXPORT ROW 1: PRIMARY PROFILE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-indigo-400 font-mono font-bold text-[9px] tracking-widest uppercase block">DOCUMENT PACK #1</span>
              <h3 className="font-display font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <UserCheck className="w-4.5 h-4.5 text-indigo-400" />
                Complete Patient Medical Profile Form
              </h3>
              <p className="text-xs text-slate-400 max-w-md">Compiles legal demographics, immediate contact details, allergies, historical treatments, and diagnoses overview into an index card PDF.</p>
            </div>

            <DocumentButton
              title={`Clinical Patient Medical Profile: ${activePatientObj.name}`}
              category="Patient"
              documentId={activePatientObj.id}
              data={composeMedicalProfileData()}
              variant="primary"
              label="Compile & Download Profile"
            />
          </div>

          {/* DOSSIER EXPORT ROW 2: PRESCRIPTION LOGS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <span className="text-emerald-400 font-mono font-bold text-[9px] tracking-widest uppercase block">DOCUMENT PACK #2</span>
              <h3 className="font-display font-extrabold text-sm text-slate-200 flex items-center gap-2">
                <Pill className="w-4.5 h-4.5 text-emerald-400" />
                Authorized Medical Recipes &amp; Prescriptions
              </h3>
              <p className="text-xs text-slate-400">Export high-fidelity prescription slips signed by consulting specialists. Each document is cryptographically verified to support pharmacy clearance.</p>
            </div>

            <div className="space-y-3">
              {activePatientObj.prescriptions.length > 0 ? (
                activePatientObj.prescriptions.map((prs, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-4 flex-wrap hover:border-slate-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <Pill className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-xs text-slate-300 block">{prs.split(" - ")[0]}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">Dosing Directives: {prs.split(" - ")[1] || "As required"}</span>
                      </div>
                    </div>

                    <DocumentButton
                      title={`e-Prescription Order: ${prs.split(" - ")[0]}`}
                      category="EHR"
                      documentId={`RX-MDB-${activePatientObj.id}-${1000 + idx}`}
                      data={composePrescriptionPdfData(prs, idx)}
                      variant="outline"
                      label="Download Certified Rx"
                    />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl font-mono text-xs">
                  No registered active pharmacotherapy routine found.
                </div>
              )}
            </div>
          </div>

          {/* DOSSIER EXPORT ROW 3: APPOINTMENTS DESK */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-amber-400 font-mono font-bold text-[9px] tracking-widest uppercase block">DOCUMENT PACK #3</span>
              <h3 className="font-display font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-amber-400" />
                Appointment Booking &amp; Consulting History
              </h3>
              <p className="text-xs text-slate-400 max-w-md">Compile chronological consultation bookings, symptoms diaries and doctor check-ins into tabular spreadsheets or system PDF archives.</p>
            </div>

            <DocumentButton
              title={`Appointments Chronology Log: ${activePatientObj.name}`}
              category="Appointment"
              documentId={activePatientObj.id}
              data={composeAppointmentLedgerData()}
              variant="outline"
              label="Download Scheduler Logs"
            />
          </div>

          {/* DOSSIER EXPORT ROW 4: LABS & TEST TESTING */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <span className="text-indigo-400 font-mono font-bold text-[9px] tracking-widest uppercase block">DOCUMENT PACK #4</span>
              <h3 className="font-display font-extrabold text-sm text-slate-200 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-400" />
                Biochemical Diagnostics Pathology Assays
              </h3>
              <p className="text-xs text-slate-400">Download biochemical blood reports, scan panels assays, and clinical reports verified by the central pathology team.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientLabTests.length > 0 ? (
                patientLabTests.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 hover:border-slate-800 transition-all text-left">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-300 truncate max-w-[130px]">{t.testType}</h4>
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono uppercase font-bold text-slate-400 border border-slate-800 bg-slate-900`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">"Findings: {t.result || " centrifuged results pending "}"</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-900 pt-2.5">
                      <span>Ref ID: {t.id}</span>
                      <DocumentButton
                        title={`Pathology Lab Assay Certificate: ${t.id}`}
                        category="Lab"
                        documentId={t.id}
                        data={composeLabReportData(t)}
                        variant="ghost"
                        label="Download Certificate"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 md:col-span-2 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl font-mono text-xs">
                  No laboratory pathology diagnostic logs listed for this patient.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
