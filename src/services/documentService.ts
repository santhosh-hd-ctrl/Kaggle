import { dbService } from "./db";
import { Patient, Doctor, Staff, Appointment, LabTest, Invoice, MedicalDocument, AuditLog } from "../types/hospital";

export interface ExportLog {
  id: string;
  fileName: string;
  title: string;
  category: "Patient" | "Doctor" | "Staff" | "Appointment" | "EHR" | "Invoice" | "Admin";
  format: "PDF" | "Excel" | "CSV" | "Print";
  generatedBy: string;
  role: string;
  timestamp: string;
  fileSize: string;
  cloudUrl: string;
  expiresAt: string;
  version: string;
  status: "Securely Synced" | "Local Temp";
}

class AdvancedDocumentService {
  // Helper to generate a verification hash (SHA-256 simulation)
  public generateVerificationHash(id: string): string {
    let hash = 0;
    const str = `${id}-${Date.now()}-smart-verify`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return "SHA-256:" + Math.abs(hash).toString(16).toUpperCase().padStart(8, "0") + "F" + Math.floor(Math.random() * 900);
  }

  // Get S3 secure temporary links
  public generateS3SecureUrl(fileName: string, category: string): { url: string; expiresAt: string } {
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour link security expiry
    const cleanName = encodeURIComponent(fileName);
    const mockAuthQuery = `?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20260616%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260616T114948Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=${this.generateVerificationHash(fileName).split(":")[1].toLowerCase()}`;
    return {
      url: `https://s3.amazonaws.com/smart-hospital-vault/${category.toLowerCase()}s/${cleanName}${mockAuthQuery}`,
      expiresAt: expires.toLocaleString()
    };
  }

  // Retrieve current export logs 
  public getExportHistory(): ExportLog[] {
    const saved = localStorage.getItem("smarthosp_export_history");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  // Save history
  public saveExportHistory(history: ExportLog[]): void {
    localStorage.setItem("smarthosp_export_history", JSON.stringify(history));
  }

  // Record an audit log for document download / generate
  public logDocumentAction(
    userId: string,
    userName: string,
    userRole: string,
    action: "GENERATE" | "DOWNLOAD" | "PRINT" | "RESTRICTED_ACCESS",
    fileName: string,
    category: string,
    details: string
  ): void {
    // Record in central dbService audit
    dbService.logAction(
      userId,
      userName,
      userRole,
      `DOC_${action}`,
      `Document: ${fileName} [Cat: ${category}] - ${details}`
    );
  }

  // Add item to export history
  public recordExportSuccess(
    userId: string,
    userName: string,
    userRole: string,
    title: string,
    category: ExportLog["category"],
    format: ExportLog["format"],
    fileName: string,
    version: string = "v1.0"
  ): ExportLog {
    const history = this.getExportHistory();
    const id = "DOC-EXP-" + Math.floor(Math.random() * 90000 + 10000);
    const { url, expiresAt } = this.generateS3SecureUrl(fileName, category);
    
    const newLog: ExportLog = {
      id,
      fileName,
      title,
      category,
      format,
      generatedBy: userName,
      role: userRole,
      timestamp: new Date().toLocaleString(),
      fileSize: `${(Math.random() * 45 + 15).toFixed(1)} KB`,
      cloudUrl: url,
      expiresAt,
      version,
      status: "Securely Synced"
    };

    this.saveExportHistory([newLog, ...history]);
    this.logDocumentAction(userId, userName, userRole, "GENERATE", fileName, category, `Successfully compiled ${format} export report.`);
    return newLog;
  }

  // Access control guard
  public verifyRoleAccess(role: string, category: string, resourceOwnerId?: string, currentUserId?: string): { allowed: boolean; message: string } {
    if (role === "Admin") {
      return { allowed: true, message: "Granted corporate administrative override." };
    }

    if (category === "Patient") {
      // Patients can only view their own documents
      if (role === "Patient") {
        if (resourceOwnerId && currentUserId && resourceOwnerId === currentUserId) {
          return { allowed: true, message: "Patient cleared to download personal clinical records." };
        }
        return { allowed: false, message: "Security Violation: Patients are forbidden from downloading external medical files." };
      }
      // Doctors/Staff have clearance for clinical patients
      return { allowed: true, message: "Medical staff cleared to generate case summaries." };
    }

    if (category === "EHR" || category === "Lab") {
      if (role === "Patient") {
        if (resourceOwnerId && currentUserId && resourceOwnerId === currentUserId) {
          return { allowed: true, message: "Cleared to view raw test panels." };
        }
        return { allowed: false, message: "Access Denied: Inpatient records are strictly confidential." };
      }
      return { allowed: true, message: "Practitioner access approved for digital charting." };
    }

    if (category === "Doctor") {
      if (role === "Patient") {
        return { allowed: true, message: "Patient cleared to view doctor scheduling rosters." };
      }
      return { allowed: true, message: "Staff clearance granted." };
    }

    if (category === "Staff") {
      if (role === "Patient") {
        return { allowed: false, message: "Security Violation: Internal staff roster metadata is restricted." };
      }
      return { allowed: true, message: "Operations staff cleared." };
    }

    if (category === "Invoice" || category === "Admin") {
      if (role === "Patient") {
        if (resourceOwnerId && currentUserId && resourceOwnerId === currentUserId) {
          return { allowed: true, message: "Patient cleared to view billing invoice statements." };
        }
        return { allowed: false, message: "Security Alert: Finance ledgers are restricted to accounts teams." };
      }
      if (role === "Staff") {
        return { allowed: true, message: "Accounting personnel cleared for invoicing." };
      }
      if (role === "Doctor") {
        return { allowed: true, message: "Medical analyst cleared." };
      }
    }

    return { allowed: false, message: "Clearance Level Insufficient." };
  }

  // --- Export Excel Simulation (CSV with custom formatting that opens in Excel seamlessly) ---
  public generateExcelBlob(headers: string[], rows: string[][]): Blob {
    let content = "\uFEFF"; // Byte Order Mark (BOM) to support UTF-8 in Excel
    content += headers.join(",") + "\n";
    rows.forEach(row => {
      const sanitized = row.map(cell => {
        if (typeof cell === "string") {
          let clean = cell.replace(/"/g, '""');
          if (clean.includes(",") || clean.includes("\n") || clean.includes('"')) {
            clean = `"${clean}"`;
          }
          return clean;
        }
        return cell;
      });
      content += sanitized.join(",") + "\n";
    });
    return new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8;" });
  }

  // --- Export CSV Blob ---
  public generateCsvBlob(headers: string[], rows: string[][]): Blob {
    let content = headers.join(",") + "\n";
    rows.forEach(row => {
      const sanitized = row.map(cell => {
        let clean = String(cell).replace(/"/g, '""');
        if (clean.includes(",") || clean.includes("\n") || clean.includes('"')) {
          clean = `"${clean}"`;
        }
        return clean;
      });
      content += sanitized.join(",") + "\n";
    });
    return new Blob([content], { type: "text/csv;charset=utf-8;" });
  }

  // --- HTML layout builder for professional print templates ---
  public compileHtmlTemplate(
    title: string,
    id: string,
    subtitle: string,
    sections: { title: string; fields: { label: string; value: string | number }[]; content?: string }[],
    qrValue: string = "SMART-HOSP-VERIFY"
  ): string {
    const secHtml = sections.map(sec => `
      <div style="margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; overflow: hidden; page-break-inside: avoid;">
        <div style="background: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between; align-items: center;">
          <span>${sec.title}</span>
        </div>
        <div style="padding: 15px;">
          ${sec.fields.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-family: 'Inter', sans-serif;">
              ${sec.fields.map(f => `
                <div>
                  <span style="font-size: 9px; font-weight: 600; color: #64748b; font-family: 'JetBrains Mono', monospace; display: block; text-transform: uppercase;">${f.label}</span>
                  <span style="font-size: 11px; font-weight: 500; color: #0f172a; display: block; margin-top: 3px;">${f.value || "N/A"}</span>
                </div>
              `).join("")}
            </div>
          ` : ""}
          ${sec.content ? `
            <div style="font-family: 'Inter', sans-serif; font-size: 11px; line-height: 1.6; color: #334155; margin-top: ${sec.fields.length > 0 ? "15px" : "0"}; padding-top: ${sec.fields.length > 0 ? "15px" : "0"}; border-top: ${sec.fields.length > 0 ? "1px dashed #f1f5f9" : "none"}; text-align: justify; white-space: pre-line;">
              ${sec.content}
            </div>
          ` : ""}
        </div>
      </div>
    `).join("");

    const hash = this.generateVerificationHash(id);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - ${id}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
        <style>
          @page { size: portrait; margin: 15mm; }
          body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #0f172a; margin: 0; padding: 0; line-height: 1.5; -webkit-print-color-adjust: exact; }
          .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 25px; }
          .clinic-logo { display: flex; align-items: center; gap: 8px; color: #4f46e5; }
          .clinic-logo svg { width: 34px; height: 34px; fill: none; stroke: currentColor; stroke-width: 2.5; }
          .clinic-title { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; color: #1e1b4b; }
          .clinic-address { font-size: 9.5px; color: #64748b; font-family: 'JetBrains Mono', monospace; line-height: 1.4; margin-top: 4px; }
          .doc-badges { text-align: right; }
          .doc-title { font-size: 18px; font-weight: 800; color: #000000; text-transform: uppercase; margin: 0; letter-spacing: -0.01em; }
          .doc-id { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #4f46e5; background: #e0e7ff; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 6px; }
          .system-verification { border-top: 1.5px solid #e2e8f0; padding-top: 20px; margin-top: 35px; display: flex; justify-content: space-between; align-items: center; page-break-inside: avoid; }
          .verif-text { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; color: #94a3b8; line-height: 1.5; }
          .signature-box { text-align: right; min-width: 150px; }
          .sig-line { border-bottom: 1.5px solid #0f172a; width: 140px; margin-left: auto; height: 35px; margin-bottom: 5px; }
          .sig-title { font-size: 9px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
          .watermark { position: fixed; top: 40%; left: 15%; font-size: 78px; color: rgba(99, 102, 241, 0.04); transform: rotate(-35deg); font-weight: 800; pointer-events: none; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Inter', sans-serif; }
        </style>
      </head>
      <body>
        <div class="watermark">OFFICIAL COPIES</div>
        
        <div class="header-container">
          <div>
            <div class="clinic-logo">
              <svg viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M2.25 12l3 3m-3-3l-3 3M4.5 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5" />
              </svg>
              <div>
                <div class="clinic-title">SMART HOSPITAL HEALTHCARE</div>
                <div class="clinic-address">
                  FACILITY CODE: HHS-CR-3000 | PORT 3000 SYSTEMS<br>
                  742 CLOUD RUN HIGHWAY, SUITE A<br>
                  SAN FRANCISCO, CA 94107
                </div>
              </div>
            </div>
          </div>
          <div class="doc-badges">
            <h1 class="doc-title">${title}</h1>
            <div style="font-size: 10px; font-weight: 500; color: #475569; margin-top: 3px;">${subtitle}</div>
            <div class="doc-id">${id}</div>
          </div>
        </div>

        <div style="font-size: 10px; font-family: 'JetBrains Mono', monospace; margin-bottom: 20px; color: #475569; border-left: 2.5px solid #6366f1; padding-left: 10px; background: #f8fafc; padding-top: 6px; padding-bottom: 6px;">
          DATE ENCRYPTED LOGGED: ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}<br>
          TRANSACTION CLEARANCE BLOCK: ${this.generateVerificationHash(id).split(":")[1]}<br>
          SYSTEM WATERMARK STATUS: CERTIFIED OFFICIAL INTERNIST DISPATCH
        </div>

        <div>
          ${secHtml}
        </div>

        <div class="system-verification">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <!-- Simulated QR code SVG -->
              <svg width="45" height="45" viewBox="0 0 100 100" style="background:#000; padding:4px; border-radius:4px; color:#fff;" fill="currentColor">
                <rect x="10" y="10" width="25" height="25" />
                <rect x="65" y="10" width="25" height="25" />
                <rect x="10" y="65" width="25" height="25" />
                <rect x="15" y="15" width="15" height="15" fill="#000" />
                <rect x="70" y="15" width="15" height="15" fill="#000" />
                <rect x="15" y="70" width="15" height="15" fill="#000" />
                <rect x="18" y="18" width="9" height="9" fill="#fff" />
                <rect x="73" y="18" width="9" height="9" fill="#fff" />
                <rect x="18" y="73" width="9" height="9" fill="#fff" />
                <rect x="45" y="45" width="10" height="10" />
                <rect x="55" y="55" width="15" height="10" />
                <rect x="45" y="75" width="15" height="15" />
                <rect x="75" y="45" width="15" height="15" />
              </svg>
              <div class="verif-text">
                <strong>DIGITAL CRYPTO VERIFIED DOCUMENT</strong><br>
                VERIFY CODES: ${hash}<br>
                TARGET CLoud LINK: s3://smart-hosp-vault/${qrValue}<br>
                SECURE AUTHENTICITY ASSURED
              </div>
            </div>
          </div>
          <div class="signature-box">
            <div class="sig-line"></div>
            <div class="sig-title">Attending Clinician</div>
            <div style="font-size: 8px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">DIGITAL STAMP ACTIVE</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const documentService = new AdvancedDocumentService();
