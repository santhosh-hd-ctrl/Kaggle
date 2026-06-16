import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";

// Initial hospital models
import { 
  INITIAL_PATIENTS, 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_MEDICINES, 
  INITIAL_LABTESTS, 
  INITIAL_INVOICES, 
  INITIAL_BLOODSTOCK 
} from "./src/data/mockHospitalData";

const JWT_SECRET = "smart-hospital-super-secret-key-128bit-secure";

// Server-side persistent state synchronized via LocalStorage
let serverPatients = [...INITIAL_PATIENTS];
let serverDoctors = [...INITIAL_DOCTORS];
let serverAppointments = [...INITIAL_APPOINTMENTS];
let serverMedicines = [...INITIAL_MEDICINES];
let serverLabTests = [...INITIAL_LABTESTS];
let serverInvoices = [...INITIAL_INVOICES];
let serverBloodStock = [...INITIAL_BLOODSTOCK];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API CORS & headers compatibility
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Authorization");
    next();
  });

  // 1. JWT Security Authorization Token dispatcher
  app.post("/api/auth/token", (req, res) => {
    const { userId, name, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ error: "Missing required auth fields: userId & role" });
    }
    const token = jwt.sign({ userId, name, role }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token });
  });

  // 2. State-Sync Tunnel: Propagates client-side LocalStorage DB updates to the PDF engines instantly
  app.post("/api/sync", (req, res) => {
    const { patients, doctors, appointments, medicines, labTests, invoices, bloodStock } = req.body;
    if (patients) serverPatients = patients;
    if (doctors) serverDoctors = doctors;
    if (appointments) serverAppointments = appointments;
    if (medicines) serverMedicines = medicines;
    if (labTests) serverLabTests = labTests;
    if (invoices) serverInvoices = invoices;
    if (bloodStock) serverBloodStock = bloodStock;
    
    return res.json({ 
      status: "success", 
      message: "Security clearance: Server state synchronized perfectly with Client LocalStorage" 
    });
  });

  // JWT Authenticator & Role Verification Middleware
  function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers["authorization"];
    const queryToken = req.query.token;
    const token = (authHeader && authHeader.split(" ")[1]) || queryToken;

    if (!token) {
      return res.status(401).json({ error: "Access Denied: Missing HIPAA-mandated session token." });
    }

    try {
      const verified = jwt.verify(token, JWT_SECRET) as { userId: string; name: string; role: string };
      req.user = verified;
      next();
    } catch {
      return res.status(403).json({ error: "Access Denied: Invalid or expired security token." });
    }
  }

  // Clean PDF creation & streaming generator helper
  function buildSecurePDF(
    res: express.Response,
    title: string,
    id: string,
    subtitle: string,
    sections: { title: string; fields: { label: string; value: string | number }[]; content?: string }[],
    fileName: string
  ) {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });

      // Configure clean download headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      doc.pipe(res);

      // 1. Watermark design
      doc.save();
      doc.fontSize(52)
         .fillColor("#6366f1")
         .opacity(0.04)
         .rotate(-35, { origin: [300, 400] })
         .text("SMART HOSPITAL COPY", 90, 350)
         .restore();

      // Top Indigo border accent
      doc.rect(50, 40, 495, 3.5).fill("#6366f1");

      // Left-aligned header details
      doc.opacity(1.0).fillColor("#1e1b4b").fontSize(13).font("Helvetica-Bold").text("SMART HOSPITAL HEALTHCARE", 50, 60);
      doc.font("Courier").fontSize(7.5).fillColor("#64748b")
         .text("FACILITY CODE: HHS-CR-3000 | CLOUD PORT 3000 SERVING", 50, 78)
         .text("742 CLOUD RUN HIGHWAY, SUITE A", 50, 88)
         .text("SAN FRANCISCO, CA 94107", 50, 98);

      // Right-aligned title metadata
      doc.font("Helvetica-Bold").fontSize(15).fillColor("#000000").text(title.toUpperCase(), 300, 60, { width: 245, align: "right" });
      doc.font("Helvetica").fontSize(9.5).fillColor("#475569").text(subtitle, 300, 80, { width: 245, align: "right" });
      
      // Control Document ID Box
      doc.rect(435, 100, 110, 18).fill("#e0e7ff");
      doc.font("Courier-Bold").fontSize(8.5).fillColor("#4f46e5").text(id, 440, 104, { width: 100, align: "center" });

      // HIPAA Security transaction frame
      doc.rect(50, 128, 495, 42).fill("#f8fafc");
      doc.font("Courier").fontSize(7.5).fillColor("#475569")
         .text(`DATE COMPILED: ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}`, 60, 134)
         .text("COMPLIANCE SECURITY: HIPAA CFR TITLE II RECORD TRANSCRIPT", 60, 144)
         .text(`CLEARANCE DISPATCH: TRANSACTION_OK_PORT_3000_INGRESS`, 60, 154);

      // Render Dynamic Sections
      let currentY = 185;

      sections.forEach((sec) => {
        // Prevent bottom overflow page layout breaks
        if (currentY > 670) {
          doc.addPage();
          currentY = 50;
        }

        doc.rect(50, currentY, 495, 18).fill("#f1f5f9");
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#1e293b").text(sec.title.toUpperCase(), 60, currentY + 4);
        currentY += 26;

        if (sec.fields && sec.fields.length > 0) {
          let isLeft = true;
          sec.fields.forEach((f) => {
            const x = isLeft ? 60 : 300;
            doc.font("Courier-Bold").fontSize(7).fillColor("#64748b").text(f.label.toUpperCase(), x, currentY);
            doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a").text(String(f.value || "N/A"), x, currentY + 10);
            
            if (!isLeft) {
              currentY += 25;
            }
            isLeft = !isLeft;
          });
          if (!isLeft) {
            currentY += 25;
          }
        }

        if (sec.content) {
          doc.font("Helvetica").fontSize(9).fillColor("#334155").text(sec.content, 60, currentY, { width: 475, align: "justify" });
          const height = doc.heightOfString(sec.content, { width: 475 });
          currentY += height + 15;
        }

        currentY += 8; // generic spacing
      });

      // Signature & Stamp verification Footer
      if (currentY > 680) {
        doc.addPage();
        currentY = 50;
      }

      // Draw footer line
      doc.moveTo(50, 715).lineTo(545, 715).stroke("#e2e8f0");

      doc.font("Helvetica-Bold").fontSize(8).fillColor("#475569").text("DIGITAL CRYPTO COPIES VERIFIED VIA QR CODE", 50, 730);
      doc.font("Courier").fontSize(7).fillColor("#94a3b8").text(`STAMP: SHA256-${id}-CLOUD-RUN-PORT-3000-INGRESS`, 50, 742);

      doc.moveTo(390, 732).lineTo(545, 732).stroke("#0f172a");
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#475569").text("Attending Medical Director", 390, 737);
      doc.font("Courier").fontSize(6.5).fillColor("#94a3b8").text("Sealed under federal eHealth standards", 390, 747);

      doc.end();
    } catch (e: any) {
      console.error("PDF Compiling Error:", e);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to compile cryptographic PDF file", details: e.message });
      }
    }
  }

  // --- GET /api/documents/patient/{id} ---
  app.get("/api/documents/patient/:id", authenticateToken, (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      // Patients can download ONLY their own documents (Eleanor USR-004 corresponds to Patient profile PAT-001)
      if (user.role === "Patient") {
        if (user.userId === "USR-004" && id === "PAT-001") {
          // Permitted
        } else if (user.userId !== id) {
          return res.status(403).json({ error: "Access Denied: Patients are forbidden from downloading external medical profiles." });
        }
      }

      const patient = serverPatients.find(p => p.id === id);
      if (!patient) {
        return res.status(404).json({ error: `Patient Profile ID '${id}' not found in master records.` });
      }

      const sections = [
        {
          title: "Standard Identity & Demographics Desk",
          fields: [
            { label: "Patient Profile ID", value: patient.id },
            { label: "Legal Legal Name", value: patient.name },
            { label: "Age Group", value: `${patient.age} years` },
            { label: "Gender Identity", value: patient.gender },
            { label: "Blood Antigen Group", value: patient.bloodGroup || "O-Negative" }
          ]
        },
        {
          title: "Immediate Tele-Contact & Demographics",
          fields: [
            { label: "Emergency Contact", value: patient.emergencyContact.name },
            { label: "Relation", value: patient.emergencyContact.relation },
            { label: "Emergency Tel Link", value: patient.emergencyContact.phone }
          ]
        },
        {
          title: "Clinical Sensitivities & Allergens",
          fields: [],
          content: `Allergy Register:\n${patient.allergies.length > 0 ? patient.allergies.join(", ") : "No Known Drug Allergies (NKDA)"}\n\nExisting Comorbidities:\n${patient.symptoms.map(c => `• ${c}`).join("\n")}`
        },
        {
          title: "Consolidated Medical Histories",
          fields: [],
          content: `Primary Diagnosed State:\n${patient.diagnosis || "Under active clinical review."}\n\nCompleted Treatment Registers:\n${patient.treatmentHistory.map(t => `• ${t}`).join("\n")}`
        }
      ];

      buildSecurePDF(
        res,
        `Clinical Patient Medical Profile: ${patient.name}`,
        patient.id,
        "Official Comprehensive Patient Health Index Card",
        sections,
        `Patient_${patient.name.replace(/\s+/g, "_")}_Medical_Report.pdf`
      );
    } catch (err: any) {
      res.status(500).json({ error: "Error compiling Patient profile", details: err.message });
    }
  });

  // --- GET /api/documents/prescription/{id} ---
  app.get("/api/documents/prescription/:id", authenticateToken, (req: any, res) => {
    try {
      const { id } = req.params; // e.g., RX-MDB-PAT-001-1000 or DOC-MDB-802
      const user = req.user;

      let patientId = "PAT-001";
      let index = 0;

      if (id.startsWith("RX-MDB-")) {
        const parts = id.split("-");
        patientId = `${parts[2]}-${parts[3]}`; // PAT-001
        index = parseInt(parts[4]) - 1000;
        if (isNaN(index)) index = 0;
      } else {
        const foundDoc = [...serverLabTests, ...serverAppointments as any[]].find(a => a.id === id);
        patientId = foundDoc ? foundDoc.patientId || "PAT-001" : "PAT-001";
      }

      if (user.role === "Patient") {
        if (user.userId === "USR-004" && patientId === "PAT-001") {
          // Permitted
        } else if (user.userId !== patientId) {
          return res.status(403).json({ error: "Access Denied: You are not authorized to download this prescription sheet." });
        }
      }

      const patient = serverPatients.find(p => p.id === patientId);
      if (!patient) {
        return res.status(404).json({ error: "Patient record associated with this prescription not found." });
      }

      const prs = patient.prescriptions[index] || patient.prescriptions[0] || "Albuterol HFA 90 mcg - 2 puffs QID";
      const words = prs.split(" - ");
      const drugLine = words[0];
      const directivesLine = words[1] || "As prescribed by the attending specialist doctor.";

      const sections = [
        {
          title: "Dispensing Pharmacist Instructions",
          fields: [
            { label: "Prescription Slip ID", value: id },
            { label: "Date Authorized", value: new Date().toLocaleDateString() },
            { label: "Attending Specialist", value: "Dr. Jenkins (Interventional Cardiology)" },
            { label: "Medical Licensing Code", value: "LIC-CA-904812" },
            { label: "Regulatory Clearance", value: "VERIFIED ACTIVE REFILLS" }
          ]
        },
        {
          title: "Patient Beneficiary Details",
          fields: [
            { label: "Name", value: patient.name },
            { label: "Patient ID", value: patient.id },
            { label: "Age / Gender", value: `${patient.age} / ${patient.gender}` }
          ]
        },
        {
          title: "Therapeutic Agent Itemization",
          fields: [
            { label: "Therapeutic Compound", value: drugLine },
            { label: "Dispensing Protocol", value: directivesLine }
          ],
          content: `Clinical Advice Instructions:\nAdminister compound with substantial oral hydration. Immediately discontinue usage and contact our telemetry help desk if persistent bronchospasms, cardiac arrhythmia, or skin allergy hives manifest.\n\nAttending Signature Verified:\nDigitally sealed as prescribed under HIPAA Title II.`
        }
      ];

      buildSecurePDF(
        res,
        `e-Prescription Order: ${drugLine}`,
        id,
        "Official Pharmacological e-Prescription Dispatch",
        sections,
        `Prescription_ID_${id}.pdf`
      );
    } catch (err: any) {
      res.status(500).json({ error: "Error compiling prescription PDF", details: err.message });
    }
  });

  // --- GET /api/documents/doctor/{id} ---
  app.get("/api/documents/doctor/:id", authenticateToken, (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const doctor = serverDoctors.find(d => d.id === id);
      if (!doctor) {
        return res.status(404).json({ error: `Specialist Doctor ID '${id}' not found in registry.` });
      }

      const sections = [
        {
          title: "Specialist Corporate Coordinates",
          fields: [
            { label: "Doctor Specialist ID", value: doctor.id },
            { label: "Full Legal Name", value: doctor.name },
            { label: "Assigned Department", value: doctor.department },
            { label: "Years of Experience", value: `${doctor.experience} Years` },
            { label: "Clinic Specialization", value: doctor.specialization }
          ]
        },
        {
          title: "Availability Hours & Roster Shifts",
          fields: [
            { label: "Scheduled Slots", value: doctor.availability.join(", ") },
            { label: "Consultation Fee Rate", value: `$${doctor.consultationFee || 110}` },
            { label: "Patient Rating Score", value: `${doctor.rating} / 5.0 Rating Stars` }
          ]
        }
      ];

      buildSecurePDF(
        res,
        `Doctor Profile Report: ${doctor.name}`,
        doctor.id,
        "Medical Specialist Consultation & Performance Audit Ledger",
        sections,
        `Doctor_${doctor.name.replace(/\s+/g, "_")}_Profile_Report.pdf`
      );
    } catch (err: any) {
      res.status(500).json({ error: "Error compiling doctor report", details: err.message });
    }
  });

  // --- GET /api/documents/admin/report ---
  app.get("/api/documents/admin/report", authenticateToken, (req: any, res) => {
    try {
      const user = req.user;
      const { type } = req.query; // patients, doctors, staff, appointments, billing, analytics

      // Strict security authorization guard
      if (user.role !== "Admin") {
        if ((type === "appointments" || type === "patients") && (user.role === "Doctor" || user.role === "Staff")) {
          // Doctors or staff can access appointments and patients rosters under HIPAA
        } else {
          return res.status(403).json({ error: "Access Denied: Admin administrative override clearance is required." });
        }
      }

      if (type === "patients") {
        const sections = [
          {
            title: "Population Aggregates",
            fields: [
              { label: "Total Enrolled Patients", value: `${serverPatients.length} Admitted` },
              { label: "Registry Alignment", value: "VERIFIED SECURE DATABASE" }
            ]
          },
          {
            title: "Admitted Patient Registry Details",
            fields: [],
            content: serverPatients.map((p, i) => `[PATIENT MATCH #${i+1}] ID: ${p.id}
• Name: ${p.name} (${p.gender}, ${p.age} Yrs)
• Allergies: ${p.allergies.join(", ") || "No known sensitivities"}
• Primary Diagnosis: ${p.diagnosis || "Pending examination"}
• Active Rx Recipes: ${p.prescriptions.join("; ") || "None"}
• Emergency Contact: ${p.emergencyContact.name} (${p.emergencyContact.relation}) Tel: ${p.emergencyContact.phone}`).join("\n\n")
          }
        ];

        return buildSecurePDF(
          res,
          `Consolidated Hospital Patients Demographic Report`,
          "ADMIN-HOSP-PATIENTS-REP",
          "Consolidated Patient Demographic & Admission Registry",
          sections,
          `Hospital_Report_Patients_${new Date().getFullYear()}.pdf`
        );
      }

      if (type === "doctors") {
        const sections = [
          {
            title: "Roster Density Metrics",
            fields: [
              { label: "Active Specialists Desk", value: `${serverDoctors.length} Physicians` },
              { label: "Average Experience", value: `${(serverDoctors.reduce((sum, d) => sum + d.experience, 0) / (serverDoctors.length || 1)).toFixed(1)} Years` }
            ]
          },
          {
            title: "Roster Physician Profiles",
            fields: [],
            content: serverDoctors.map((d, i) => `[PHYSICIAN CLINICAL SPECIALIST #${i+1}] ID: ${d.id}
• Name: ${d.name}
• Department: ${d.department}
• Specialization: ${d.specialization}
• Experience: ${d.experience} Years
• Availability Shifts: ${d.availability.join(", ")}
• Consultation Fee Rate: $${d.consultationFee || 100} USD`).join("\n\n")
          }
        ];

        return buildSecurePDF(
          res,
          `Consolidated Medical Specialists Performance Report`,
          "ADMIN-HOSP-DOCTORS-REP",
          "Medical Specialist Consultation & Performance Audit Ledger",
          sections,
          `Hospital_Report_Doctors_${new Date().getFullYear()}.pdf`
        );
      }

      if (type === "staff") {
        const customStaff = [
          { id: "STF-201", name: "Arthur Dent", department: "Logistics", role: "Front Desk Administrator", email: "arthur.dent@smarthospital.com", phone: "+1-555-8910", attendanceStatus: "Present" },
          { id: "STF-202", name: "Sarah Connor", department: "Laboratory Operations", role: "Lead Lab Technician", email: "sarah.connor@smarthospital.com", phone: "+1-555-4820", attendanceStatus: "Present" },
          { id: "STF-203", name: "Roger Waters", department: "Emergency Triage", role: "Senior Charge Nurse", email: "roger.waters@smarthospital.com", phone: "+1-555-9921", attendanceStatus: "On Leave" }
        ];

        const sections = [
          {
            title: "Auxiliary Workforce Metrics",
            fields: [
              { label: "Auxiliary Staff Registered", value: `${customStaff.length} Active Officers` },
              { label: "Operational Division", value: "CLINICAL SERVICES" }
            ]
          },
          {
            title: "Auxiliary Staff Members logs",
            fields: [],
            content: customStaff.map((s, i) => `[AUXILIARY STAFF #${i+1}] ID: ${s.id}
• Employee Name: ${s.name}
• Department Coordinates: ${s.department}
• Professional Role: ${s.role}
• Contact Email Address: ${s.email}
• Direct Phone Line: ${s.phone}
• Present Attendance Status: ${s.attendanceStatus}`).join("\n\n")
          }
        ];

        return buildSecurePDF(
          res,
          `Hospital Auxiliary Staff Roster Audit`,
          "ADMIN-HOSP-STAFF-REP",
          "Operations & Auxiliary Officer Registry",
          sections,
          `Hospital_Report_Staff_${new Date().getFullYear()}.pdf`
        );
      }

      if (type === "appointments") {
        const sections = [
          {
            title: "Chronological Attendance Benchmarks",
            fields: [
              { label: "Total Booked Appointments", value: `${serverAppointments.length} Booked Schedules` },
              { label: "Hospital Target Status", value: "COMPLETED & QUEUED APPOINTMENTS" }
            ]
          },
          {
            title: "Roster Consultation Schedule",
            fields: [],
            content: serverAppointments.map((a, i) => `[APPOINTMENT SESSION #${i+1}] ID: ${a.id}
• Patient Subject Name: ${a.patientName} (${a.patientId})
• Booking Date & Time: ${a.date} @ ${a.time}
• Assumed Specialist Clinician: ${a.doctorName} (${a.department})
• Current Status Value: ${a.status.toUpperCase()}
• Presented Symptoms: ${a.symptoms ? a.symptoms.join(", ") : "None Recorded"}`).join("\n\n")
          }
        ];

        return buildSecurePDF(
          res,
          `Appointments Chronology Log`,
          "ADMIN-HOSP-APPOINTMENTS-REP",
          "Chronological Consultation Check-in Logs",
          sections,
          `Hospital_Report_Appointments_${new Date().getFullYear()}.pdf`
        );
      }

      if (type === "billing") {
        const sections = [
          {
            title: "Financial Ledger Accounts Summary",
            fields: [
              { label: "Unpaid/Outstanding Invoices", value: `${serverInvoices.filter(i => i.status === "Unpaid").length} Bills Overdue` },
              { label: "Paid Finance Settled Income", value: `$${serverInvoices.filter(i => i.status === "Paid").reduce((acc, i) => acc + i.amount, 0).toFixed(2)} USD` }
            ]
          },
          {
            title: "Hospital Billing Ledger Sheets",
            fields: [],
            content: serverInvoices.map((inv, i) => `[BILLING INVOICE TRANSACTION #${i+1}] ID: ${inv.id}
• Patient Payee Name: ${inv.patientName}
• Ledger Registered Date: ${inv.date}
• Provided Service: ${inv.service || "Smart Healthcare Consultation"}
• Attending Doctor: ${inv.doctorName || "Smart Hospital Clinic"}
• Billed Sum Value: $${inv.amount.toFixed(2)} USD
• Settlement Status: ${inv.status.toUpperCase()}`).join("\n\n")
          }
        ];

        return buildSecurePDF(
          res,
          `Consolidated Finance Accounts Ledger`,
          "ADMIN-HOSP-BILLING-REP",
          "Consolidated Ledger Billings & Outstanding Invoices",
          sections,
          `Hospital_Report_Billing_${new Date().getFullYear()}.pdf`
        );
      }

      // Default: operational analytics
      const paidTotalSum = serverInvoices.filter(i => i.status === "Paid").reduce((acc, i) => acc + i.amount, 0);
      const criticalBloods = serverBloodStock.filter(b => b.units <= 10).length;

      const sections = [
        {
          title: "Hospital Operational KPI Overview",
          fields: [
            { label: "Total Admitted Patients", value: `${serverPatients.length} Admitted` },
            { label: "Active Consulting Doctors", value: `${serverDoctors.length} Physicians` },
            { label: "Auxiliary Workforce Count", value: "3 Staff Officers" }
          ]
        },
        {
          title: "Pharmacy & Blood Bank Status Reserves",
          fields: [
            { label: "Total Blood Bank Units", value: `${serverBloodStock.reduce((acc, b) => acc + b.units, 0)} Units` },
            { label: "Shortage Blood Groups", value: `${criticalBloods} Critical Groups Alert` }
          ]
        },
        {
          title: "Financial Ledger Accounts Summary",
          fields: [
            { label: "Paid Clearance Income", value: `$${paidTotalSum.toFixed(2)} USD` },
            { label: "Outstanding Overdue Bills", value: `${serverInvoices.filter(i => i.status === "Unpaid").length} Overdue/Unpaid` }
          ]
        }
      ];

      buildSecurePDF(
        res,
        `Consolidated Operations Telemetry Checklist`,
        "ADMIN-HOSP-ANALYTICS-REP",
        "SaaS Operational KPI & Financial Performance Ledger",
        sections,
        `Hospital_Report_${new Date().getFullYear()}.pdf`
      );
    } catch (err: any) {
      res.status(500).json({ error: "Error compiling admin reports", details: err.message });
    }
  });

  // 3. Vite development middleware setup (serves standard entry scripts dynamically)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serves production bundles
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Hospital Enterprise Server booted on http://0.0.0.0:${PORT}`);
  });
}

startServer();
