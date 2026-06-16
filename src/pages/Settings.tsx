import React, { useState } from "react";
import { dbService } from "../services/db";
import { useAuth } from "../context/AuthContext";
import { 
  Settings, RefreshCw, Database, Download, ShieldCheck, HelpCircle, 
  Terminal, Sparkles, AlertOctagon, Heart, ServerCrash, KeyRound, MonitorCheck 
} from "lucide-react";

export const SystemSettings: React.FC = () => {
  const { user, addToast } = useAuth();
  const [resetConfirm, setResetConfirm] = useState(false);
  
  // Simulated configuration flags
  const [latencyCheck, setLatencyCheck] = useState(true);
  const [hipaaShield, setHipaaShield] = useState(true);
  const [logsTrace, setLogsTrace] = useState(true);

  // Trigger Database Backup File Download
  const handleExportDatabase = () => {
    try {
      const data: Record<string, any> = {
        users: dbService.getUsers(),
        patients: dbService.getPatients(),
        doctors: dbService.getDoctors(),
        staff: dbService.getStaff(),
        appointments: dbService.getAppointments(),
        invoices: dbService.getInvoices(),
        documents: dbService.getDocuments(),
        auditLogs: dbService.getAuditLogs(),
        exported_at: new Date().toISOString(),
        backup_signature: "md5_hosp_saas_" + Math.random().toString(36).substring(3, 10)
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `smarthospital_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast("PostgreSQL & MongoDB local registers backups exported for download.", "success");
      dbService.logAction(user?.id || "System", user?.name || "MD Admin", "Admin", "DATABASE_BACKUP", "Created comprehensive system variables JSON backup");
    } catch {
      addToast("Failed to compile database objects.", "error");
    }
  };

  const handlePerformReset = () => {
    dbService.factoryReset();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="settings-workbench">
      
      {/* HEADER CONTROLS */}
      <div className="border-b border-slate-800 pb-3.5 space-y-1">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          System Settings &amp; Control
        </h2>
        <p className="text-xs text-slate-400">DBMS Workbench: Manage cluster nodes latency, export backups, and trigger relational table resets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT CARD: DIRECTORY BACKUP EXPORTER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 md:col-span-2">
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2.5">
            <Database className="w-4.5 h-4.5 text-indigo-400" />
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-200">ACID DBMS BACKUPS</h3>
              <p className="text-xs text-slate-400">Compile PostgreSQL transactional rows &amp; MongoDB document store to self-contained JSON</p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-400">
            <p>
              This backup utility gathers all current device persistent stores, models schemas, diagnostic records, and personnel rosters, compiling them onto an industry-standard BSON/JSON payload. Perfect for local storage backups or migrating indexes across environment partitions.
            </p>
            
            <button
              onClick={handleExportDatabase}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Local Database Backup (.json)
            </button>
          </div>
        </div>

        {/* RIGHT CARD: SECURE HIPAA POLICIES INDICES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2.5">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            <div>
              <h3 className="font-display font-extrabold text-xs text-slate-200">HIPAA PRIVACY CONTROLS</h3>
              <p className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">Clearence level: tier-3</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-[11px] leading-relaxed">
            <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-400">EMR ENCRYPTIONS</span>
              <span className="text-emerald-400 font-extrabold uppercase">SHA-256 AES</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-400">ROUTER PROTECTION</span>
              <span className="text-emerald-400 font-extrabold uppercase">ACTIVE RBAC</span>
            </div>
            <div className="p-2.5 bg-indigo-500/5 text-[10px] rounded border border-indigo-500/10 text-slate-400 leading-normal flex gap-2">
              <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Full compliance audited and logs hashed automatically before state persistence.</span>
            </div>
          </div>
        </div>

      </div>

      {/* SYSTEM HARDWARE CONFIG FLAGS */}
      <div className="bg-slate-900 border border-slate-855 rounded-2xl p-6 space-y-4">
        <div className="border-b border-slate-850 pb-3">
          <h3 className="font-display font-extrabold text-sm text-slate-200">SaaS Node Orchestrations Parameters</h3>
          <p className="text-xs text-slate-400">Alter mock clinical latencies and debugging flags on local environment</p>
        </div>

        <div className="space-y-3 max-w-xl">
          <div className="flex items-center justify-between p-3 bg-slate-955 bg-slate-950 border border-slate-850 rounded-xl">
            <div>
              <strong className="text-slate-200 block text-xs leading-none mb-1">Simulate Milliseconds Network Delay</strong>
              <span className="text-[10.5px] text-slate-500">Appends standard 400-600ms latency to all service queries to emulate connected cloud speeds</span>
            </div>
            <input 
              type="checkbox" 
              checked={latencyCheck}
              onChange={(e) => { setLatencyCheck(e.target.checked); addToast(`Network latencies simulation: ${e.target.checked ? "Active" : "Bypassed"}`, "info"); }}
              className="w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-850 rounded-xl">
            <div>
              <strong className="text-slate-200 block text-xs leading-none mb-1">Active HIPAA Audit Shielding</strong>
              <span className="text-[10.5px] text-slate-500">Enforces complete system audit logging trace pipelines on CRUD events</span>
            </div>
            <input 
              type="checkbox" 
              checked={hipaaShield}
              onChange={(e) => { setHipaaShield(e.target.checked); addToast(`Strict GDPR audit tracing: ${e.target.checked ? "Active" : "Bypassed"}`, "warning"); }}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* FOOT DESTRUCTIVE ZONE */}
      <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/10">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-sm text-red-400">DESTRUCTIVE ADMINISTRATIVE ACTION ZONE</h3>
            <p className="text-xs text-slate-400">Permanently purge all data tables. Restores files to factory baseline seeds.</p>
          </div>
        </div>

        <div className="pt-2">
          {resetConfirm ? (
            <div className="space-y-3 text-xs bg-slate-950 p-4 border border-rose-500/20 rounded-xl max-w-md">
              <span className="text-rose-500 font-bold uppercase tracking-widest block font-mono">⚠️ CRITICAL: SYSTEM RESET INITIATING?</span>
              <p className="text-slate-405 text-slate-400 leading-relaxed font-mono">
                This operation will delete all dynamic patients (EMR), doctors rosters, billing logs, and medical document uploads. Dynamic localStorage objects will be deleted immediately.
              </p>
              <div className="flex gap-2 font-bold font-sans">
                <button 
                  onClick={handlePerformReset}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                >
                  Confirm Reset &amp; Reload Logs
                </button>
                <button 
                  onClick={() => setResetConfirm(false)}
                  className="px-4 py-1.5 bg-slate-900 border border-slate-805 text-slate-405 text-slate-400 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-650 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-400 text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              Factory Purge System Registers
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
