import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { dbService } from "../services/db";
import { Staff } from "../types/hospital";
import { DocumentButton } from "../components/DocumentButton";
import { 
  ArrowLeft, Briefcase, Mail, Phone, Calendar, UserCheck, 
  MapPin, Clock, HelpCircle, ShieldAlert, CheckCircle, XCircle 
} from "lucide-react";

export const StaffProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const stfObj = dbService.getStaff().find(s => s.id === id);
    if (stfObj) {
      setEmployee(stfObj);
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs max-w-sm mx-auto animate-pulse">
        Polling clinic personnel logs...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-md mx-auto space-y-4 text-center p-12 bg-slate-900 border border-slate-800 rounded-2xl mt-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-extrabold text-white">Employee Profile Not Seeded</h3>
        <p className="text-xs text-slate-400">
          The requested clinical staff identifier <strong className="text-indigo-400 font-mono">({id})</strong> does not reside in our HIPAA registers.
        </p>
        <Link to="/staff" className="inline-block px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl">
          Return to Staff Directory
        </Link>
      </div>
    );
  }

  const staffReportData = employee ? {
    subtitle: "Hospital Staff Personnel Operations Summary Card",
    sections: [
      {
        title: "Personnel Demographics & Office Roles",
        fields: [
          { label: "Employee Core ID", value: employee.id },
          { label: "Legal Full Name", value: employee.name },
          { label: "Office Directory Role", value: employee.role },
          { label: "Assigned Facility Department", value: employee.department },
          { label: "Active Operational Status", value: employee.attendanceStatus || "Present" },
          { label: "Corporate Register Email", value: employee.email || `${employee.id}@smarthosp.com` }
        ]
      },
      {
        title: "Employment Tenure & Work Profile",
        fields: [
          { label: "Direct Phone Contact", value: employee.phone || "+1-555" },
          { label: "Registry Joining Date", value: "2025-01-15 (Certified Permanent Line)" },
          { label: "Inpatient Facility Clear", value: "Level-3 Inpatient Clearance Secured" }
        ],
        content: `Subject serves as ${employee.role} within the ${employee.department} department. Key duties involve executing operational pipelines, ensuring clinical database safety, and maintaining strict compliance records under Smart Hospital guidelines.`
      },
      {
        title: "Recent Attendance Registry Sheets",
        fields: [],
        content: employee.attendanceHistory && employee.attendanceHistory.length > 0
          ? employee.attendanceHistory.map(h => `• Date: ${h.date} - Compliance Status: ${h.status}`).join("\n")
          : "• Present (Current Real-time Shift Active)"
      }
    ],
    excelHeaders: ["Employee ID", "Name", "Role", "Department", "Email", "Phone", "Status"],
    excelRows: [[
      employee.id,
      employee.name,
      employee.role,
      employee.department,
      employee.email || "N/A",
      employee.phone || "N/A",
      employee.attendanceStatus
    ]]
  } : { subtitle: "", sections: [], excelHeaders: [], excelRows: [] };

  return (
    <div className="space-y-8" id="staff-profile">
      
      {/* Menu ribbon back to roster */}
      <div className="flex items-center justify-between">
        <Link 
          to="/staff"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          Back to Staff Directory
        </Link>
        <div className="flex items-center gap-3">
          <DocumentButton
            title="Hospital Staff Operations Report"
            category="Staff"
            documentId={employee.id}
            data={staffReportData}
            variant="outline"
            label="Download Staff Report"
          />
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono py-1.5 px-3 rounded-xl font-bold">
            ROSTER ID: {employee.id}
          </span>
        </div>
      </div>

      {/* DETAILED COVER SHEET */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-lg">
        <div className="flex gap-4 items-center">
          <img 
            src={employee.avatar} 
            alt={employee.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-teal-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10 uppercase tracking-widest">{employee.id}</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 select-none border rounded border-teal-500/10 leading-tight bg-teal-500/5 text-teal-400 uppercase`}>
                Active {employee.attendanceStatus}
              </span>
            </div>
            <h2 className="text-xl font-display font-extrabold text-white mt-1">{employee.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold text-teal-350">
              {employee.role} • <span className="font-mono text-slate-500">{employee.department}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-mono w-full md:w-auto">
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Shift status:</span>
            <span className="text-emerald-400 font-extrabold block text-sm">On Duty (Present)</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Internal Comm Lines:</span>
            <span className="text-white font-bold block">{employee.email}</span>
            <span className="text-slate-400 block text-[10px]">{employee.phone}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Attendance history logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-2">
            <h3 className="font-display font-extrabold text-sm text-slate-200">Chronological Attendance Logs</h3>
            <p className="text-xs text-slate-400">Shift login entries tracked securely inside ACID logs</p>
          </div>

          <div className="space-y-3">
            {employee.attendanceHistory.map((hist, index) => (
              <div key={index} className="px-3.5 py-3 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                <span className="font-mono text-slate-300 font-semibold">{hist.date}</span>
                <span className={`px-2.5 py-0.5 rounded font-mono text-[9.5px] font-bold border ${
                  hist.status === "Present" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" :
                  hist.status === "Absent" ? "bg-rose-500/10 text-rose-400 border-rose-500/15" :
                  "bg-amber-500/10 text-amber-400 border-amber-500/15"
                }`}>
                  {hist.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security / System Access profile roles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-2">
            <h3 className="font-display font-extrabold text-sm text-slate-200">System Role Authorization Clearence</h3>
            <p className="text-xs text-slate-400">Connected authentication credentials and microservices access lines</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 size-full text-xs leading-relaxed text-slate-400">
            <div className="flex gap-2.5 items-center pb-2 border-b border-slate-850">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span className="text-slate-200 font-bold font-sans">Active HIPAA System Profile</span>
            </div>
            <p>• Department Node: <strong className="text-white uppercase font-mono text-[10.5px]">{employee.department}</strong></p>
            <p>• Active Key Level: <strong className="text-teal-400 uppercase font-mono">STAFF OPERATOR (Tier-2 Clearance)</strong></p>
            <p>• Connected Microservice Ports: <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400 border border-slate-850 text-xs">Auth_Port:2083</code>, <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400 border border-slate-850 text-xs">Billing_Port:8081</code></p>
            <p>• Security Audit Checks: Passed (Daily checksum certified automatically on cluster restarts)</p>
          </div>
        </div>

      </div>

    </div>
  );
};
