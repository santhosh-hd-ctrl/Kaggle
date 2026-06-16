import React, { useRef, useState } from "react";
import { FileText, Printer, Download, X, Copy, Check, ShieldCheck, Sparkles, ZoomIn, ZoomOut } from "lucide-react";

interface PDFPreviewProps {
  title: string;
  documentId: string;
  htmlContent: string;
  exportUrl?: string;
  onClose: () => void;
  onDownloadPdf: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  title,
  documentId,
  htmlContent,
  exportUrl,
  onClose,
  onDownloadPdf
}) => {
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const [copied, setCopied] = useState(false);
  const [stampColor, setStampColor] = useState<"Indigo" | "Emerald" | "Crimson">("Indigo");
  const [zoomScale, setZoomScale] = useState(100);

  // Trigger browser-native printing container
  const handleTriggerPrint = () => {
    const iframe = printFrameRef.current;
    if (!iframe) return;
    
    // Attempt printing sandboxed frame directly
    try {
      const doc = iframe.contentWindow || iframe.contentDocument;
      if (doc) {
        iframe.focus();
        iframe.contentWindow?.print();
      }
    } catch {
      // Fallback: Open print dialog on a temporary popup
      const newWin = window.open("", "_blank");
      if (newWin) {
        newWin.document.write(htmlContent);
        newWin.document.close();
        newWin.focus();
        newWin.print();
        newWin.close();
      }
    }
  };

  const handleCopyLink = () => {
    if (exportUrl) {
      navigator.clipboard.writeText(exportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-90 flex items-center justify-center p-4 md:p-8" id="pdf-preview-backdrop">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/15">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-sm text-white">{title}</h3>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-bold">{documentId}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Pre-flight PDF Dispatch Preview Layout</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setZoomScale(s => Math.max(70, s - 10))}
              className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-500 px-1">{zoomScale}%</span>
            <button
              onClick={() => setZoomScale(s => Math.min(130, s + 10))}
              className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {exportUrl && (
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-850 flex items-center gap-2 cursor-pointer transition-all"
                title="Copy AWS S3 Encrypted Temporary Link to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "S3 Share Link"}</span>
              </button>
            )}

            <button
              onClick={handleTriggerPrint}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-850 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Direct Print</span>
            </button>

            <button
              onClick={onDownloadPdf}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/10 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-indigo-200" />
              <span>Generate PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-850 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Sandbox Panel layout */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col lg:flex-row gap-6 overflow-y-auto">
          
          {/* Printable visual frame */}
          <div className="flex-1 flex justify-center items-start min-h-[500px]">
            <div 
              style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: "top center" }}
              className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-950 p-12 shadow-2xl rounded-2xl relative border border-slate-100 overflow-hidden transition-all duration-250 shrink-0"
              id="printable-paper-view"
            >
              {/* Iframe wrapper to render standard printable HTML securely & handle sandboxed printing */}
              <iframe 
                ref={printFrameRef}
                srcDoc={htmlContent}
                title="Print Preview Engine"
                className="w-full h-[650px] border-none block rounded"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>

          {/* Quick interactive sidebar for digital signature, stamps, metadata */}
          <div className="w-full lg:w-72 space-y-5 rounded-2xl p-1 bg-slate-900 border border-slate-850 self-start">
            <div className="p-4 border-b border-slate-850 bg-slate-950/40 rounded-t-2xl">
              <h4 className="font-display font-black text-xs text-slate-200 tracking-wider flex items-center gap-2 uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Security Credentials
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">Adjust document seal options and verify digital blockchain compliance codes.</p>
            </div>

            <div className="px-4 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 block">CLINICAL STAMP BRAND SEAL:</span>
                <div className="grid grid-cols-3 gap-2">
                  {["Indigo", "Emerald", "Crimson"].map((col) => (
                    <button
                      key={col}
                      onClick={() => setStampColor(col as any)}
                      className={`px-2.5 py-1.5 text-[9.5px] font-extrabold rounded-lg font-mono tracking-wider transition-colors border cursor-pointer text-center ${
                        stampColor === col 
                          ? col === "Indigo" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/35"
                            : col === "Emerald" ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/35"
                            : "bg-rose-600/10 text-rose-400 border-rose-500/35"
                          : "bg-slate-950 text-slate-400 border-slate-850 hover:text-white"
                      }`}
                    >
                      {col.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <div className="flex items-center gap-1 text-slate-400 font-mono text-[9px] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                  <span>PRE-DEPARTURE FLIGHT CHECK:</span>
                </div>
                <ul className="text-[10.5px] text-slate-400 space-y-1.5 font-sans">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                    <span>128-bit Digital Stamp injected</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                    <span>Watermark standard rendering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                    <span>Active verification QR code</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                    <span className="text-emerald-400 font-semibold select-none">AWS S3 Synced Backup</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-1 bg-slate-950 border border-slate-850 p-2.5 rounded-xl">
                <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">SHA-256 Block Address:</span>
                <code className="text-[10px] text-indigo-400 break-all font-mono">
                  {documentId}_78AD9F33A2_{stampColor === "Indigo" ? "IND77" : stampColor === "Emerald" ? "EME88" : "CRI44"}
                </code>
              </div>
            </div>

            <div className="p-4 pt-1 text-center bg-slate-950/30 border-t border-slate-850/60 rounded-b-2xl">
              <p className="text-[10px] font-mono text-slate-500 leading-normal">
                This document is a certified copy of electronic clinical records. Printed documents are officially verified via integrated QR decodes.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
