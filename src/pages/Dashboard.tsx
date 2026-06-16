import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dbService } from "../services/db";
import { DocumentButton } from "../components/DocumentButton";
import { 
  Users, Stethoscope, Briefcase, Calendar, FileText, CreditCard, Droplet, 
  Activity, Sparkles, LogIn, ExternalLink, RefreshCw, Terminal, Search, ArrowRight, TrendingUp, AlertTriangle 
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, Cell } from "recharts";

export const Dashboard: React.FC = () => {
  const { user, assignUserRole, addToast } = useAuth();
  const navigate = useNavigate();
  
  // Real Local Database State variables
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [blood, setBlood] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [ticker, setTicker] = useState(0);

  // Load state from dbService
  useEffect(() => {
    setPatients(dbService.getPatients());
    setDoctors(dbService.getDoctors());
    setAppointments(dbService.getAppointments());
    setStaff(dbService.getStaff());
    setInvoices(dbService.getInvoices());
    setBlood(dbService.getBloodStock());
    setAuditLogs(dbService.getAuditLogs().slice(0, 5));
  }, [ticker]);

  if (!user) return null;

  // Compute stats
  const pendingAppointments = appointments.filter(a => a.status === "Requested").length;
  const criticalBloods = blood.filter(b => b.units <= 10).length;
  const invoiceTotalSum = invoices.reduce((acc, inv) => acc + (inv.status === "Paid" ? inv.total : 0), 0);
  const unpaidInvs = invoices.filter(i => i.status === "Unpaid").length;

  // Chart data sets
  const bloodChartData = blood.map(b => ({
    name: b.group.replace("-Positive", "+").replace("-Negative", "-"),
    Units: b.units,
    CriticalLevel: 10
  }));

  const invoiceOverviewData = invoices.map((inv, idx) => ({
    name: `INV-${inv.id.substring(4)}`,
    Amount: inv.total,
    status: inv.status
  }));

  const patientDemographics = [
    { name: "Pediatrics", count: patients.filter(p => p.age < 18).length },
    { name: "Adults", count: patients.filter(p => p.age >= 18 && p.age < 60).length },
    { name: "Seniors", count: patients.filter(p => p.age >= 60).length }
  ];

  const handlePersonaSwitch = async (role: any) => {
    await assignUserRole(user.id, role);
    setTicker(prev => prev + 1);
  };

  const dashboardReportData = {
    subtitle: "Consolidated Multi-Departmental Hospital Performance Ledger",
    sections: [
      {
        title: "Subject Population & Specialist Density Registers",
        fields: [
          { label: "Active Registered Inpatients", value: `${patients.length} Registered` },
          { label: "Enrolled Consulting Specialists", value: `${doctors.length} Physicians` },
          { label: "Clinical Staff Personnel", value: `${staff.length} Active Officers` },
          { label: "Blood Specimen Containers", value: `${blood.reduce((acc, b) => acc + b.units, 0)} Units` }
        ]
      },
      {
        title: "Consultation Queue Analytics & Scheduling",
        fields: [
          { label: "Total Booked Appointments", value: `${appointments.length} Tickets` },
          { label: "Pending Approvals Needed", value: `${pendingAppointments} Requests` },
          { label: "Average Doctor Rating Score", value: `${(doctors.reduce((sum, d) => sum + d.rating, 0) / (doctors.length || 1)).toFixed(2)} ★` }
        ]
      },
      {
        title: "SaaS Financial Cashflow & Ledgers Summary",
        fields: [
          { label: "Total Cleared Revenue", value: `$${invoiceTotalSum.toFixed(2)} USD` },
          { label: "Unpaid Outstanding Invoices", value: `${unpaidInvs} Invoices` }
        ],
        content: `Audit Statement:\nSmart Hospital financial pipelines have settled $${invoiceTotalSum.toFixed(2)} in total consultation transactions. Taxes and regulatory surcharges have been distributed under legal healthcare protocols.`
      }
    ],
    excelHeaders: ["Patients Count", "Doctors Count", "Staff Count", "Appointments Total", "Blood Reserve Units", "Settled Income", "Outstanding Bills"],
    excelRows: [[
      String(patients.length),
      String(doctors.length),
      String(staff.length),
      String(appointments.length),
      String(blood.reduce((acc, b) => acc + b.units, 0)),
      `$${invoiceTotalSum.toFixed(2)}`,
      String(unpaidInvs)
    ]]
  };

  // --- Real Dynamic Admin Dossier Composers ---
  const composeAllPatientsReport = () => {
    return {
      subtitle: "Consolidated Patient Demographic & Admission Registry",
      sections: [
        {
          title: "Population Aggregates",
          fields: [
            { label: "Total Enrolled Patients", value: `${patients.length} Registered` },
            { label: "Blood Specimen Shortages", value: `${criticalBloods} Critical Groups` }
          ]
        },
        {
          title: "Admitted Patient Registry Details",
          fields: [],
          content: patients.map((p, i) => `[PATIENT MATCH #${i+1}] ID: ${p.id}
• Name: ${p.name} (${p.gender}, ${p.age} Yrs)
• Allergies: ${p.allergies.join(", ") || "No known sensitivities"}
• Primary Diagnosis: ${p.diagnosis || "Pending examination"}
• Active Rx Recipes: ${p.prescriptions.join("; ") || "None"}
• Emergency Contact: ${p.emergencyContact.name} (${p.emergencyContact.relation}) Tel: ${p.emergencyContact.phone}`).join("\n\n")
        }
      ],
      excelHeaders: ["Patient ID", "Name", "Age", "Gender", "Blood Group", "Allergies", "Diagnosis", "Active Prescriptions"],
      excelRows: patients.map(p => [
        p.id, p.name, String(p.age), p.gender, p.bloodGroup, p.allergies.join("; "), p.diagnosis, p.prescriptions.join("; ")
      ])
    };
  };

  const composeAllDoctorsReport = () => {
    return {
      subtitle: "Medical Specialist Consultation & Performance Audit Ledger",
      sections: [
        {
          title: "Roster Density Metrics",
          fields: [
            { label: "Active Specialists Desk", value: `${doctors.length} Physicians` },
            { label: "Average Expertise", value: `${(doctors.reduce((sum, d) => sum + d.experience, 0) / (doctors.length || 1)).toFixed(1)} Years` }
          ]
        },
        {
          title: "Physician Profiles",
          fields: [],
          content: doctors.map((d, i) => `[PHYSICIAN SPECIALIST #${i+1}] ID: ${d.id}
• Name: ${d.name}
• Department: ${d.department}
• Specialization: ${d.specialization}
• Clinic Experience: ${d.experience} Years
• Availability Schedules: ${d.availability.join(", ")}
• Patient Satisfaction: ${d.rating} / 5.0 ★
• Consultation Fee Structured Rate: $${d.consultationFee || 100} USD`).join("\n\n")
        }
      ],
      excelHeaders: ["Doctor ID", "Name", "Department", "Specialization", "Experience (Yrs)", "Rating", "Schedules", "Fee"],
      excelRows: doctors.map(d => [
        d.id, d.name, d.department, d.specialization, String(d.experience), String(d.rating), d.availability.join("; "), `$${d.consultationFee || 100}`
      ])
    };
  };

  const composeAllStaffReport = () => {
    return {
      subtitle: "Operations & Auxiliary Officer Registry",
      sections: [
        {
          title: "Workforce Metrics",
          fields: [
            { label: "Registered Staff Personnel", value: `${staff.length} Officers` },
            { label: "Present Shift Status", value: `${staff.filter(s => s.attendanceStatus === "Present").length} Present` }
          ]
        },
        {
          title: "Staff Directory Records",
          fields: [],
          content: staff.map((s, i) => `[AUXILIARY STAFF #${i+1}] ID: ${s.id}
• Name: ${s.name}
• Assigned Department: ${s.department}
• Operational Role: ${s.role}
• Contact Email: ${s.email}
• Direct Phone Line: ${s.phone}
• Present Attendance: ${s.attendanceStatus}`).join("\n\n")
        }
      ],
      excelHeaders: ["Staff ID", "Name", "Department", "Role", "Email", "Phone", "Status"],
      excelRows: staff.map(s => [
        s.id, s.name, s.department, s.role, s.email, s.phone, s.attendanceStatus
      ])
    };
  };

  const composeOperationalAnalyticsReport = () => {
    return {
      subtitle: "SaaS Operational KPI & Financial Performance Ledger",
      sections: [
        {
          title: "Hospital Operational KPI Overview",
          fields: [
            { label: "Total Admitted Patients", value: `${patients.length} Registered` },
            { label: "Active Doctors", value: `${doctors.length} Physicians` },
            { label: "Total Auxiliary Staff", value: `${staff.length} Officers` }
          ]
        },
        {
          title: "Pharmacy & Blood Bank Status Reserves",
          fields: [
            { label: "Total Blood Bags", value: `${blood.reduce((acc, b) => acc + b.units, 0)} Units` },
            { label: "Shortage Blood Groups", value: `${criticalBloods} Groups Alert` }
          ]
        },
        {
          title: "Financial Ledger Accounts Summary",
          fields: [
            { label: "Paid Finance Income", value: `$${invoiceTotalSum.toFixed(2)} USD` },
            { label: "Outstanding Unpaid Bills", value: `${unpaidInvs} Overdue/Unpaid` }
          ],
          content: `Revenue breakdown statement:\nTotal settled paid consultations have generated $${invoiceTotalSum.toFixed(2)} in processed transactions. Regulatory accounting logs verify HIPAA-compliant allocations.`
        }
      ],
      excelHeaders: ["Inpatients Count", "Doctors Registry", "Auxiliary Workforce", "Blood Bag Units", "Critical Blood Groups", "Cleared Income", "Outstanding Bills"],
      excelRows: [[
        String(patients.length),
        String(doctors.length),
        String(staff.length),
        String(blood.reduce((acc, b) => acc + b.units, 0)),
        String(criticalBloods),
        `$${invoiceTotalSum.toFixed(2)}`,
        String(unpaidInvs)
      ]]
    };
  };

  return (
    <div className="space-y-8" id="core-dashboard">
      
      {/* 1. TOP ACCESS JUMBO BANNER */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-indigo-400 text-[10px] font-mono uppercase tracking-wider">
            <Sparkles className="w-3 h-3 animate-spin" />
            HIPAA CERTIFIED HEALTH SECURITY ACTIVE
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-2xl font-display font-extrabold text-white">
              SmartHospital Control Center
            </h2>
            <DocumentButton
              title="Hospital Operations Analytics"
              category="Analytics"
              documentId="ADMIN-KPI-REPORT"
              data={dashboardReportData}
              variant="primary"
              label="Export Hospital Analytics"
            />
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            SaaS operational node dashboard. Trigger clinical scheduling pipelines, query active PostgreSQL relational tables, and review MongoDB-backed Electronic Health Documents.
          </p>
        </div>

        {/* Quick persona selector */}
        <div className="bg-slate-950 p-2 border border-slate-800 rounded-xl space-y-1.5 shrink-0 w-full md:w-auto relative">
          <span className="text-[9px] font-mono font-bold text-slate-500 block px-1 tracking-wider uppercase">Quick Identity Swapper (Role Check):</span>
          <div className="flex gap-1">
            {["Admin", "Doctor", "Staff", "Patient"].map((role: any) => (
              <button
                key={role}
                onClick={() => handlePersonaSwitch(role)}
                className={`px-2.5 py-1 text-[10.5px] font-extrabold rounded-md transition-all cursor-pointer ${user.role === role ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-slate-900 text-slate-400 hover:text-white"}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ADMINISTRATIVE CONSISTENT REPORT DESK */}
      {user.role !== "Patient" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-100 flex items-center gap-1.5 uppercase font-sans">
                <FileText className="w-4 h-4 text-indigo-400" />
                Administrative Records & Report Desk
              </h3>
              <p className="text-xs text-slate-400">Export structured PDFs, CSVs, and printable hospital rosters on-demand</p>
            </div>
            <span className="text-[9.5px] font-mono bg-slate-950 border border-slate-850 px-2.5 py-1 rounded font-bold text-slate-500 uppercase tracking-widest">
              Operational Audit Stack
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Patients Report */}
            <div className="p-4 bg-slate-950 border border-slate-850/65 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <strong className="text-xs text-slate-200 block">Patient Demographic PDF</strong>
                <p className="text-[10.5px] text-slate-500 mt-1">Detailed demographic analysis, primary medical diagnosis and active prescriptions audit logs.</p>
              </div>
              <DocumentButton
                title="Consolidated Hospital Patients Demographic Report"
                category="Patient"
                documentId="ADMIN-HOSP-PATIENTS-REP"
                data={composeAllPatientsReport()}
                variant="outline"
                label="Generate Patients Report"
              />
            </div>

            {/* 2. Doctors Report */}
            <div className="p-4 bg-slate-950 border border-slate-850/65 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <strong className="text-xs text-slate-200 block">Specialist Rosters Ledger</strong>
                <p className="text-[10.5px] text-slate-500 mt-1">Detailed specialist directories, departmental structures, years of experience, and billing scores.</p>
              </div>
              <DocumentButton
                title="Consolidated Medical Specialists Performance Report"
                category="Doctor"
                documentId="ADMIN-HOSP-DOCTORS-REP"
                data={composeAllDoctorsReport()}
                variant="outline"
                label="Generate Doctors Report"
              />
            </div>

            {/* 3. Staff Report */}
            <div className="p-4 bg-slate-950 border border-slate-850/65 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <strong className="text-xs text-slate-200 block">Staff Directory & Shifts</strong>
                <p className="text-[10.5px] text-slate-500 mt-1">Roster directories of all active clinical and operational team leaders, including attendance logs.</p>
              </div>
              <DocumentButton
                title="Hospital Auxiliary Staff Roster Audit"
                category="Staff"
                documentId="ADMIN-HOSP-STAFF-REP"
                data={composeAllStaffReport()}
                variant="outline"
                label="Generate Staff Roster"
              />
            </div>

            {/* 4. Operations Analytics */}
            <div className="p-4 bg-slate-950 border border-slate-850/65 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <strong className="text-xs text-slate-200 block">Total Hospital Analytics</strong>
                <p className="text-[10.5px] text-slate-500 mt-1">SaaS operational telemetry checklist: blood bank shortfalls, financial ledgers, and critical check-ins.</p>
              </div>
              <DocumentButton
                title="Consolidated Operations Telemetry Checklist"
                category="Analytics"
                documentId="ADMIN-HOSP-ANALYTICS-REP"
                data={composeOperationalAnalyticsReport()}
                variant="primary"
                label="Generate Analytics Dossier"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. OPERATIONAL KPI COUNTERS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI: Patients */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 transition-all flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase block">Patients Registered</span>
            <span className="text-2xl font-display font-extrabold text-white">{patients.length}</span>
            <Link to="/patients" className="text-[10.5px] text-indigo-400 hover:underline flex items-center gap-1">
              Configure admissions <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Doctors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 transition-all flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase block">active specialists</span>
            <span className="text-2xl font-display font-extrabold text-white">{doctors.length}</span>
            <Link to="/doctors" className="text-[10.5px] text-indigo-400 hover:underline flex items-center gap-1">
              Schedules workbench <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/10">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Actionable Appointments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 transition-all flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase block">Pending Schedules</span>
            <span className="text-2xl font-display font-extrabold text-white">{pendingAppointments}</span>
            <Link to="/appointments" className="text-[10.5px] text-indigo-400 hover:underline flex items-center gap-1">
              Triage queue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Revenue Account */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 transition-all flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase block">PAID FINANCE REVENUE</span>
            <span className="text-2xl font-display font-extrabold text-emerald-400">${invoiceTotalSum.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">{unpaidInvs} bills pending review</span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

      </section>

      {/* 3. INTERACTIVE RECHARTS CHARTS PLANEL */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Blood bank visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 lg:col-span-2">
          <div>
            <h3 className="font-display font-extrabold text-sm text-slate-200">TRAUMA EMERGENCY BLOOD BANK (units)</h3>
            <p className="text-xs text-slate-400">PostgreSQL inventory status for emergency surgical allocations</p>
          </div>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="Units" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {bloodChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.Units <= 10 ? "#ef4444" : entry.Units <= 20 ? "#f59e0b" : "#10b981"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-500 pt-2 border-t border-slate-850">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Optimal (&gt;20 Units)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Low (&lt;=20 Units)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> Critical (&lt;=10 Units)</span>
          </div>
        </div>

        {/* Demographics chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-sm text-slate-200">PATIENT DEMOGRAPHICS BIAS</h3>
            <p className="text-xs text-slate-400">Clinical breakdown representing currently hospitalized demographics</p>
          </div>

          <div className="space-y-4">
            {patientDemographics.map((demo, index) => {
              const max = Math.max(...patientDemographics.map(d => d.count)) || 1;
              const pct = (demo.count / max) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-355">{demo.name}</span>
                    <span className="text-slate-200">{demo.count} Patients</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${index === 0 ? "bg-amber-400" : index === 1 ? "bg-indigo-500" : "bg-teal-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
            <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest block">EMR METADATA INSIGHT:</span>
            <p className="text-[10.5px] text-slate-400 leading-snug">Average registered age is <strong className="text-slate-200">{Math.round(patients.reduce((acc, p) => acc + p.age, 0) / (patients.length || 1))} years old</strong>. Standard distribution remains stable.</p>
          </div>
        </div>

      </section>

      {/* 4. REAL-TIME OPERATIONS FEEDS (Postgres vs MongoDB) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Operational logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-200">DBMS AUDIT TRANSCRIPT</h3>
              <p className="text-xs text-slate-400">Security audit trail logged natively via dbService orchestrator</p>
            </div>
            <span className="text-[9.5px] font-mono font-bold bg-slate-950 rounded border border-slate-800 py-1 px-2.5 text-slate-400 uppercase tracking-wider">
              Secure SQL Pipeline
            </span>
          </div>

          <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-start gap-3.5 hover:border-slate-800 transition-all font-mono text-xs">
                  <span className="font-bold text-indigo-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {log.action}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-300 text-xs font-sans leading-none mb-1">{log.details}</p>
                    <span className="text-[9px] text-slate-500 uppercase block">By {log.userName} ({log.role}) • {new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 font-mono text-xs">
                No telemetry statements parsed yet. Perform operation actions above to trigger.
              </div>
            )}
          </div>
        </div>

        {/* Microservices metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-3">
            <h3 className="font-display font-extrabold text-sm text-slate-200">microservice infrastructure</h3>
            <p className="text-xs text-slate-400">Live operational clusters response latency heartbeat</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              { name: "Auth Microservice", latency: "6ms", status: "ONLINE", flagColor: "bg-emerald-500" },
              { name: "Patient core adapter", latency: "11ms", status: "ONLINE", flagColor: "bg-emerald-500" },
              { name: "Appointments queue", latency: "4ms", status: "ONLINE", flagColor: "bg-emerald-500" },
              { name: "MongoDB billing API", latency: "16ms", status: "ONLINE", flagColor: "bg-emerald-500" }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-850">
                <div>
                  <strong className="text-slate-200 block text-[11px] leading-none mb-1">{item.name}</strong>
                  <span className="text-[9px] text-slate-500">Latency: {item.latency} • Socket SSL</span>
                </div>
                <span className="text-[9px] font-extrabold bg-slate-900 text-slate-300 border border-slate-850 px-2 py-0.5 rounded-md flex items-center gap-1 leading-none select-none">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.flagColor}`} />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
};
