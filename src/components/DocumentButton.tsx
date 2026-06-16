import React, { useState } from "react";
import { FileDown, Printer, FileSpreadsheet, Sparkles, BookOpen } from "lucide-react";
import { ExportModal } from "./ExportModal";
import { ExportLog } from "../services/documentService";

interface DocumentButtonProps {
  title: string;
  category: ExportLog["category"];
  documentId: string;
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
  variant?: "primary" | "secondary" | "outline" | "icon" | "ghost";
  label?: string;
}

export const DocumentButton: React.FC<DocumentButtonProps> = ({
  title,
  category,
  documentId,
  data,
  variant = "outline",
  label = "Export Documents"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-2 cursor-pointer";
      case "secondary":
        return "px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/15 transition-all flex items-center gap-2 cursor-pointer";
      case "outline":
        return "px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-[11px] rounded-xl border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer";
      case "ghost":
        return "px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-[10px] rounded border border-transparent transition-all flex items-center gap-1 cursor-pointer";
      case "icon":
        return "p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg border border-slate-850 hover:border-indigo-500/20 transition-all cursor-pointer";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={getVariantStyles()}
        title={`${label} for ${documentId}`}
      >
        <FileDown className={variant === "icon" ? "w-4 h-4" : "w-3.5 h-3.5 text-indigo-400"} />
        {variant !== "icon" && <span>{label}</span>}
      </button>

      <ExportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        category={category}
        documentId={documentId}
        data={data}
      />
    </>
  );
};
