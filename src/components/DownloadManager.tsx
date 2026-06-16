import React, { useState, useEffect } from "react";
import { 
  History, Search, Filter, ShieldCheck, Cloud, Copy, Check, Download, 
  Trash2, RefreshCw, FileText, ExternalLink, Calendar, Users, Eye, AlertTriangle 
} from "lucide-react";
import { documentService, ExportLog } from "../services/documentService";
import { dbService } from "../services/db";
import { useAuth } from "../context/AuthContext";
import { AuditLog } from "../types/hospital";

export const DownloadManager: React.FC = () => {
  const { user, addToast } = useAuth();
  const [history, setHistory] = useState<ExportLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"history" | "audits">("history");

  const loadData = () => {
    setHistory(documentService.getExportHistory());
    // Get doc-specific audit logs from central database to display
    const logs = dbService.getAuditLogs().filter(log => log.action.startsWith("DOC_"));
    setAuditLogs(logs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to purge all secure document generation cache? Cloud Master templates will not be affected.")) {
      documentService.saveExportHistory([]);
      addToast("Local document cache purged.", "info");
      loadData();
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    addToast("AWS S3 secure sharing URL copied to clipboard.", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.generatedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6" id="download-manager-panel">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-1 px-3.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold rounded-full select-none">
              SECURE PLATFORM CORE
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-400" />
            AWS S3 Document &amp; Compliance Vaults
          </h3>
          <p className="text-slate-400 text-xs max-w-2xl font-medium leading-relaxed">
            Centralized file distribution node. Track historical export audits, trace HIPAA role-based data accesses, and generate short-lived signed S3 share links for clinical dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 md:self-end lg:self-center">
          <button 
            onClick={loadData}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-850 cursor-pointer transition-all"
            title="Refresh Vault Contents"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {user?.role === "Admin" && (
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-950 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 cursor-pointer transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge Cache
            </button>
          )}
        </div>
      </div>

      {/* Selector and filters row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-850 pb-5">
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-850 flex-wrap">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-display font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "history" 
                ? "bg-slate-900 text-indigo-400 shadow-inner" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-4 h-4" />
            Output Logs ({filteredHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("audits")}
            className={`px-4 py-2 font-display font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "audits" 
                ? "bg-slate-900 text-indigo-400 shadow-inner" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            Security Downloads Audits ({auditLogs.length})
          </button>
        </div>

        {activeTab === "history" && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input 
                type="text" 
                placeholder="Search outputs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 select-none text-[10px]">
              <span className="text-slate-500 font-mono font-bold mr-1">CATEGORY:</span>
              {["All", "Patient", "Doctor", "Invoice", "Admin"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                    filterCategory === cat 
                      ? "bg-indigo-600 text-white shadow" 
                      : "bg-slate-950 text-slate-400 border border-slate-850 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main logs display grids */}
      {activeTab === "history" ? (
        filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map((item) => (
              <div 
                key={item.id} 
                className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col h-60 justify-between hover:border-slate-800 transition-all shadow-sm"
              >
                {/* Header indicators */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-slate-950 border border-slate-850 text-indigo-400 rounded-xl shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-black text-xs text-white truncate" title={item.title}>{item.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 font-bold uppercase">{item.category}</span>
                        <span className="text-[9px] font-mono text-slate-500 font-bold">{item.format}</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className="px-2 py-0.5 bg-slate-950 border border-slate-850 text-slate-500 text-[10px] uppercase font-mono font-bold rounded shrink-0">
                    {item.version}
                  </span>
                </div>

                {/* Metadata and file size info */}
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Generated By:</span>
                    <span className="text-slate-205 text-slate-200 font-bold font-sans">{item.generatedBy} ({item.role})</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>File size:</span>
                    <span className="text-slate-200 font-bold">{item.fileSize}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>System ID:</span>
                    <span className="text-indigo-400 font-bold">{item.id}</span>
                  </div>
                </div>

                {/* Footer buttons row */}
                <div className="flex items-center justify-between border-t border-slate-850/60 pt-3 flex-wrap gap-2.5">
                  <span className="text-[9px] font-mono text-slate-500 tracking-tight text-left">
                    Cloud link expires:<br />
                    <span className="text-slate-400 font-bold">{item.expiresAt}</span>
                  </span>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => handleCopyLink(item.cloudUrl, item.id)}
                      className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-850 shrink-0 transition-colors cursor-pointer"
                      title="Copy Signed AWS S3 URL"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <a
                      href={item.cloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        documentService.logDocumentAction(
                          user?.id || "System",
                          user?.name || "Practitioner",
                          user?.role || "Staff",
                          "DOWNLOAD",
                          item.fileName,
                          item.category,
                          "Triggered direct download of secure encrypted S3 file copy."
                        );
                        addToast(`Opening secure download stream: ${item.fileName}`, "info");
                      }}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-indigo-405 text-indigo-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      title="Download File Copy"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center max-w-sm mx-auto space-y-4 bg-slate-900 border border-slate-850 rounded-2xl">
            <FileText className="w-12 h-12 text-slate-600 mx-auto opacity-30" />
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-sm text-slate-300">Secure Vault Empty</h3>
              <p className="text-xs text-slate-500">No official records have been generated or exported in this session yet.</p>
            </div>
          </div>
        )
      ) : (
        /* AUDIT LOGGER VIEW */
        auditLogs.length > 0 ? (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-md">
            <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between select-none">
              <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">SECURE DIGITAL TRACKING AUDIT TRAILS (HIPAA IN COMPLIANCE)</span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 rounded font-mono font-bold">MONITORING ACTIVE</span>
            </div>

            <div className="divide-y divide-slate-850/60 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-950/20 transition-all">
                  <div className="flex gap-3 items-start">
                    <div className="p-1 px-2.5 bg-indigo-500/15 border border-indigo-500/20 rounded font-bold text-indigo-400 text-[10.5px] tracking-wide mt-0.5 shrink-0 uppercase">
                      {log.action.replace("DOC_", "")}
                    </div>
                    <div>
                      <p className="text-slate-200 italic font-sans">"{log.details}"</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5 flex-wrap">
                        <span className="font-bold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          {log.userName} ({log.role})
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">User ID: {log.userId}</span>
                        <span>•</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[9.5px] font-bold text-indigo-400 select-none bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10 self-start md:self-center shrink-0">
                    {log.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center max-w-sm mx-auto space-y-4 bg-slate-900 border border-slate-850 rounded-2xl">
            <AlertTriangle className="w-12 h-12 text-slate-650 text-slate-600 mx-auto opacity-35" />
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-sm text-slate-300 font-display">No Security Audits Placed</h3>
              <p className="text-xs text-slate-500">Trigger standard or clinical reports exports to populate digital audit logs.</p>
            </div>
          </div>
        )
      )}

    </div>
  );
};
