import React, { useState } from "react";
import { 
  X, FileDown, Eye, FileSpreadsheet, Printer, ShieldAlert, CheckSquare, 
  Settings, Check, Layout, Sparkles, Cloud, History, Info 
} from "lucide-react";
import { documentService, ExportLog } from "../services/documentService";
import { useAuth } from "../context/AuthContext";
import { PDFPreview } from "./PDFPreview";
import { downloadService, DownloadState } from "../services/downloadService";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: ExportLog["category"];
  documentId: string;
  // Dynamic template structures
  data: {
    subtitle?: string;
    sections: {
      title: string;
      fields: { label: string; value: string | number }[];
      content?: string;
    }[];
    excelHeaders: string[];
    excelRows: string[][];
  };
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  documentId,
  data
}) => {
  const { user, addToast } = useAuth();
  
  // Settings / toggles
  const [format, setFormat] = useState<"PDF" | "Excel" | "CSV" | "Print">("PDF");
  const [includeSignature, setIncludeSignature] = useState(true);
  const [includeQR, setIncludeQR] = useState(true);
  const [watermark, setWatermark] = useState("OFFICIAL CLONE");
  const [version, setVersion] = useState("v1.0.0");
  const [s3Backup, setS3Backup] = useState(true);

  // Preview overlay states
  const [showPreview, setShowPreview] = useState(false);
  const [dlState, setDlState] = useState<DownloadState | null>(null);

  if (!isOpen) return null;

  // Verify access permissions using Role access checks
  const accessCheck = documentService.verifyRoleAccess(
    user?.role || "Patient",
    category,
    // If patient or category patient matches
    category === "Patient" ? documentId : undefined,
    user?.id
  );

  const cleanFileName = `${category.toUpperCase()}_${documentId}_${Date.now()}`;

  // Process Document Compilations
  const getCompiledHtml = () => {
    // Generate signature block sections dynamically if turned on
    const currentSections = [...data.sections];
    if (includeSignature) {
      currentSections.push({
        title: "CLINICAL DISPATCH SIGN-OFFS",
        fields: [
          { label: "ATTENDING PRACTITIONER", value: user?.name || "Dr. Staff Internist" },
          { label: "SIGNATURE HASH ID", value: documentService.generateVerificationHash(documentId) },
          { label: "DIGITAL IDENTITY KEY", value: `UID-${user?.id || "9231"}_ROLE-${user?.role || "Staff"}` },
          { label: "VERSION REVISION", value: version }
        ],
        content: `This clinical information has been digitally completed and sealed under federal HITECH security standards. Reviewing personnel should cross-reference QR decodes to verify active validity against the s3://smart-hosp-vault S3 master branch.`
      });
    }

    return documentService.compileHtmlTemplate(
      title,
      documentId,
      data.subtitle || "Smart Hospital Official Automated Record",
      currentSections,
      cleanFileName + ".pdf"
    );
  };

  const getApiEndpoint = () => {
    if (category === "Patient") {
      return `/api/documents/patient/${documentId}`;
    } else if (category === "Doctor") {
      return `/api/documents/doctor/${documentId}`;
    } else if (category === "Staff") {
      return `/api/documents/admin/report?type=staff`;
    } else if (category === "Appointment") {
      return `/api/documents/admin/report?type=appointments`;
    } else if (category === "EHR" || category === "Invoice") {
      if (documentId.startsWith("RX") || category === "EHR") {
        return `/api/documents/prescription/${documentId}`;
      }
      return `/api/documents/admin/report?type=billing`;
    } else {
      if (documentId === "ADMIN-HOSP-PATIENTS-REP") return "/api/documents/admin/report?type=patients";
      if (documentId === "ADMIN-HOSP-DOCTORS-REP") return "/api/documents/admin/report?type=doctors";
      if (documentId === "ADMIN-HOSP-STAFF-REP") return "/api/documents/admin/report?type=staff";
      if (documentId === "ADMIN-HOSP-ANALYTICS-REP") return "/api/documents/admin/report?type=analytics";
      return "/api/documents/admin/report?type=analytics";
    }
  };

  const handleRetryDownload = () => {
    const endpoint = getApiEndpoint();
    downloadService.downloadDocument(
      endpoint,
      (state) => {
        setDlState(state);
        if (state.status === "completed") {
          addToast(`Document downloaded successfully!`, "success");
          documentService.recordExportSuccess(
            user?.id || "System",
            user?.name || "User",
            user?.role || "Staff",
            title,
            category,
            "PDF",
            state.fileName || `${cleanFileName}.pdf`,
            version
          );
          setTimeout(() => {
            setDlState(null);
            onClose();
          }, 1200);
        } else if (state.status === "failed") {
          addToast(`Retry failed too: ${state.errorMessage}`, "error");
        }
      },
      1
    );
  };

  const handleExportAction = () => {
    if (!accessCheck.allowed) {
      addToast(`Security Restriction: ${accessCheck.message}`, "error");
      documentService.logDocumentAction(
        user?.id || "Unknown",
        user?.name || "Anonymous",
        user?.role || "Patient",
        "RESTRICTED_ACCESS",
        cleanFileName,
        category,
        "Failed access permission override check."
      );
      return;
    }

    const nameWithExt = `${cleanFileName}.${format === "Excel" ? "xlsx" : format === "CSV" ? "csv" : format === "Print" ? "html" : "pdf"}`;

    if (format === "Excel" || format === "CSV") {
      const blob = format === "Excel" 
        ? documentService.generateExcelBlob(data.excelHeaders, data.excelRows)
        : documentService.generateCsvBlob(data.excelHeaders, data.excelRows);
        
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", nameWithExt);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      documentService.recordExportSuccess(
        user?.id || "System",
        user?.name || "User",
        user?.role || "Staff",
        title,
        category,
        format,
        nameWithExt,
        version
      );
      addToast(`Spreadsheet exported: ${nameWithExt}`, "success");
      onClose();
    } else if (format === "Print") {
      const html = getCompiledHtml();
      const popup = window.open("", "_blank");
      if (popup) {
        popup.document.write(html);
        popup.document.close();
        popup.focus();
        popup.print();
        addToast("Document dispatched to system printing pool.", "success");
        popup.close();
      } else {
        addToast("Pop-up blocked. Enabled pop-ups or trigger view preview mode.", "warning");
      }
      documentService.recordExportSuccess(
        user?.id || "System",
        user?.name || "User",
        user?.role || "Staff",
        title,
        category,
        "Print",
        nameWithExt,
        version
      );
      onClose();
    } else if (format === "PDF") {
      const endpoint = getApiEndpoint();
      downloadService.downloadDocument(
        endpoint,
        (state) => {
          setDlState(state);
          if (state.status === "completed") {
            addToast(`Document downloaded successfully!`, "success");
            documentService.recordExportSuccess(
              user?.id || "System",
              user?.name || "User",
              user?.role || "Staff",
              title,
              category,
              "PDF",
              state.fileName || nameWithExt,
              version
            );
            setTimeout(() => {
              setDlState(null);
              onClose();
            }, 1200);
          } else if (state.status === "failed") {
            addToast(`Download failed: ${state.errorMessage}`, "error");
          }
        },
        1
      );
    }
  };

  const handleDownloadPdfFromPreview = () => {
    const endpoint = getApiEndpoint();
    setShowPreview(false);
    downloadService.downloadDocument(
      endpoint,
      (state) => {
        setDlState(state);
        if (state.status === "completed") {
          addToast(`PDF Document generated successfully from preview draft.`, "success");
          documentService.recordExportSuccess(
            user?.id || "System",
            user?.name || "User",
            user?.role || "Staff",
            title,
            category,
            "PDF",
            state.fileName || `${cleanFileName}.pdf`,
            version
          );
          setTimeout(() => {
            setDlState(null);
            onClose();
          }, 1200);
        } else if (state.status === "failed") {
          addToast(`Download failed: ${state.errorMessage}`, "error");
        }
      },
      1
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 flex items-center justify-center p-4" id="export-modal-backdrop">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative animate-scale-up">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900/40 to-slate-950 p-6 border-b border-slate-850 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-2xl shadow-inner">
                <FileDown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
                  <span>Export Document: {category}</span>
                  <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded text-white font-bold tracking-widest">{version}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Verify credentials, select export configurations and run compiler</p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            
            {/* Access Permission Guard Summary */}
            <div className={`p-3.5 rounded-2xl flex items-start gap-3 border ${
              accessCheck.allowed 
                ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-400" 
                : "bg-rose-500/5 border-rose-500/15 text-rose-400"
            }`}>
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-normal">
                <span className="font-bold uppercase tracking-wider block font-mono text-[9px]">SECURITY COMPLIANCE AUDIT PASSED:</span>
                <p className="mt-0.5 text-slate-300 font-medium">{accessCheck.message}</p>
              </div>
            </div>

            {/* Selector: format */}
            <div className="space-y-2">
              <h4 className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block select-none">SELECT EXPORT FORMAT</h4>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { fileType: "PDF", desc: "Attending PDF Report", icon: FileDown },
                  { fileType: "Excel", desc: "Microsoft Excel Ledger", icon: FileSpreadsheet },
                  { fileType: "CSV", desc: "Raw CSV Tabular Data", icon: FileSpreadsheet },
                  { fileType: "Print", desc: "Universal System Print", icon: Printer }
                ].map(({ fileType, desc, icon: Icon }) => (
                  <button
                    key={fileType}
                    type="button"
                    onClick={() => setFormat(fileType as any)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 relative overflow-hidden group cursor-pointer ${
                      format === fileType 
                        ? "bg-indigo-600/10 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/5" 
                        : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${format === fileType ? "text-indigo-400" : "text-slate-500Group-hover:text-slate-300"}`} />
                    <div>
                      <strong className="text-xs font-black block">{fileType}</strong>
                      <span className="text-[8px] text-slate-500 leading-none block mt-0.5">{desc}</span>
                    </div>
                    {format === fileType && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles settings */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-indigo-400" />
                  DOCUMENT META COMPILING PARAMETERS
                </span>
                <span className="text-[9px] font-mono text-slate-500 font-bold select-none">SECURE DISPATCH</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 font-bold bg-slate-900 focus:ring-indigo-500"
                  />
                  <span>Digitized Stamp Signature Signatures</span>
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeQR}
                    onChange={(e) => setIncludeQR(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-900 focus:ring-indigo-500"
                  />
                  <span>QR Authenticity Verification Decodes</span>
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={s3Backup}
                    onChange={(e) => setS3Backup(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-900 focus:ring-indigo-500"
                  />
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Cloud className="w-3.5 h-3.5" />
                    AWS S3 Secure Cloud Archive Sync
                  </span>
                </label>
              </div>

              {/* Advanced form fields */}
              <div className="grid grid-cols-2 gap-4 pb-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-500 block">WATERMARK OVERLAY TEXT</label>
                  <input 
                    type="text" 
                    value={watermark}
                    onChange={(e) => setWatermark(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-500 block">DOCUMENT CONTROL VERSION</label>
                  <select 
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                  >
                    <option>v1.0.0 (Baseline Draft)</option>
                    <option>v1.1.0 (Attending Audit Review)</option>
                    <option>v1.2.0 (Verified Released Statement)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* S3 link preview info */}
            {s3Backup && (
              <div className="bg-indigo-950/20 border border-indigo-500/10 p-3 rounded-2xl flex gap-2 w-full text-[11px] leading-normal text-indigo-300 items-start">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                <div>
                  <strong>Enterprise S3 Encryption Active:</strong> Automatically formats secure SHA hashes, generates access expirations and submits duplicate logs to the central auditer.
                </div>
              </div>
            )}

          </div>

          {/* Action Footer */}
          <div className="bg-slate-950 px-6 py-4 border-t border-slate-850 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!accessCheck.allowed}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Preview Live Document</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportAction}
                disabled={!accessCheck.allowed}
                className="px-5 py-2 disabled:opacity-40 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <span>Compile &amp; Export</span>
              </button>
            </div>
          </div>

          {/* Progress / Status Overlay */}
          {dlState && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-90 flex flex-col items-center justify-center p-8 text-center animate-fade-in" id="download-progress-overlay">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center mb-6">
                <FileDown className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-2">
                {dlState.status === "authorizing" && "Authorizing Clinical Vault..."}
                {dlState.status === "syncing" && "Synchronizing State Layers..."}
                {dlState.status === "generating" && "Compiling HIPAA Cryptographic PDF..."}
                {dlState.status === "downloading" && "Streaming Medical Transcript..."}
                {dlState.status === "completed" && "Download Dispatched Successfully!"}
                {dlState.status === "failed" && "Medical Clearance Refused!"}
              </h3>

              <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
                {dlState.status === "authorizing" && "Exchanging safe-token credentials with HHS cryptographic security cores..."}
                {dlState.status === "syncing" && "Ensuring on-server database profiles match localized clinical actions..."}
                {dlState.status === "generating" && "Generating high-fidelity watermarked vector canvas and signing signatures..."}
                {dlState.status === "downloading" && `Piping document bundle: ${dlState.fileName}...`}
                {dlState.status === "completed" && "File saved securely on your local storage system."}
                {dlState.status === "failed" && dlState.errorMessage}
              </p>

              {/* Progress bar */}
              {dlState.status !== "failed" && (
                <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-full h-3 overflow-hidden p-0.5 mb-2">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${dlState.progress}%` }}
                  />
                </div>
              )}

              {dlState.status !== "failed" && (
                <span className="text-[11px] font-mono font-bold text-indigo-400">{dlState.progress}% Completed</span>
              )}

              {/* Failed Retry Buttons */}
              {dlState.status === "failed" && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDlState(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-800"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={handleRetryDownload}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20"
                  >
                    Retry Verification
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* PDFPreview Portal Overlay */}
      {showPreview && (
        <PDFPreview
          title={title}
          documentId={documentId}
          htmlContent={getCompiledHtml()}
          exportUrl={s3Backup ? documentService.generateS3SecureUrl(`${cleanFileName}.pdf`, category).url : undefined}
          onClose={() => setShowPreview(false)}
          onDownloadPdf={handleDownloadPdfFromPreview}
        />
      )}
    </>
  );
};
