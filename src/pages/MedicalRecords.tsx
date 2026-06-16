import React, { useState, useEffect } from "react";
import { dbService } from "../services/db";
import { MedicalDocument, Patient } from "../types/hospital";
import { useAuth } from "../context/AuthContext";
import { DocumentButton } from "../components/DocumentButton";
import { 
  FileText, Search, Filter, RefreshCw, Eye, EyeOff, Save, Terminal, 
  Settings, FolderKanban, Plus, X, ServerCrash, Code2, Database 
} from "lucide-react";

export const MedicalRecords: React.FC = () => {
  const { user, addToast } = useAuth();
  
  // States
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  
  // Interactive JSON Editor States
  const [isEditingJson, setIsEditingJson] = useState(false);
  const [editedJsonString, setEditedJsonString] = useState("");
  
  // New Document Forms States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState<any>("Lab Report");
  const [newCont, setNewCont] = useState("");
  const [newPatId, setNewPatId] = useState("");

  const loadDocuments = () => {
    const list = dbService.getDocuments();
    setDocuments(list);
    setPatients(dbService.getPatients());
    if (list.length > 0 && !selectedDoc) {
      setSelectedDoc(list[0]);
      setEditedJsonString(JSON.stringify(list[0].meta, null, 2));
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSelectDoc = (doc: MedicalDocument) => {
    setSelectedDoc(doc);
    setEditedJsonString(JSON.stringify(doc.meta, null, 2));
    setIsEditingJson(false);
  };

  // Filter
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = categoryFilter === "All" || doc.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Commit updated BSON meta JSON editor back to dbService
  const handleSaveJsonEditor = () => {
    if (!selectedDoc) return;
    try {
      const parsedMeta = JSON.parse(editedJsonString);
      const allDocs = dbService.getDocuments();
      
      const updated = allDocs.map((d) => {
        if (d.id === selectedDoc.id) {
          return {
            ...d,
            meta: parsedMeta
          };
        }
        return d;
      });

      dbService.saveDocuments(updated);
      dbService.logAction(user?.id || "System", user?.name || "MD Admin", "Admin", "MONGODB_COMMIT", `Committed upgraded raw BSON document metadata schema on: ${selectedDoc.id}`);
      
      addToast(`MongoDB BSON schemas update committed for document ${selectedDoc.id}.`, "success");
      setIsEditingJson(false);
      
      // Update local states
      setDocuments(updated);
      setSelectedDoc({ ...selectedDoc, meta: parsedMeta });
    } catch (err: any) {
      addToast(`Malformed BSON syntax: ${err.message}. Parse aborted.`, "error");
    }
  };

  // Create new raw report document
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCont.trim() || !newPatId) {
      addToast("Report title, client file ID, and summaries write-up are required.", "warning");
      return;
    }

    const matchedPat = patients.find(p => p.id === newPatId);
    const patName = matchedPat ? matchedPat.name : "Unregistered Inpatient";

    const allDocs = dbService.getDocuments();
    const generatedId = "DOC-MDB-" + (800 + allDocs.length + 1);

    const newDoc: MedicalDocument = {
      id: generatedId,
      patientId: newPatId,
      patientName: patName,
      title: newTitle,
      category: newCat,
      content: newCont,
      uploader: user?.name || "Clerical Administrator",
      timestamp: new Date().toISOString(),
      meta: {
        collection: "ehr_diagnostics",
        secureRelayPort: "3000",
        authorizer: user?.name || "Clinician",
        verified: true,
        documentRevision: 1
      }
    };

    const updated = [newDoc, ...allDocs];
    dbService.saveDocuments(updated);
    dbService.logAction(user?.id || "System", user?.name || "Staff Clerk", "Staff", "MONGODB_INSERT", `Inserted document: ${generatedId} under collection: ehr_diagnostics`);

    addToast(`Document insertion row ${generatedId} posted successfully to MongoDB collection.`, "success");
    setIsFormOpen(false);
    
    // Refresh
    setDocuments(updated);
    setSelectedDoc(newDoc);
    setEditedJsonString(JSON.stringify(newDoc.meta, null, 2));
  };

  const getEhrReportData = (doc: MedicalDocument) => ({
    subtitle: "Electronic Health Record (EHR) Diagnostic Dispatch",
    sections: [
      {
        title: "Patient & Record Summary",
        fields: [
          { label: "Target Patient Name", value: doc.patientName },
          { label: "Target Patient Identifier", value: doc.patientId },
          { label: "Document Dispatch ID", value: doc.id },
          { label: "Record Entry Category", value: doc.category },
          { label: "Authoring Clinician", value: doc.uploader },
          { label: "Audit Log Timestamp", value: new Date(doc.timestamp).toLocaleString() }
        ]
      },
      {
        title: "Clinical Narrative & Findings",
        fields: [],
        content: `Study Findings Title:\n${doc.title}\n\nClinical Transcript Details:\n${doc.content}\n\nHospital Integrity Statement:\nThese measurements have been archived securely on non-volatile BSON storage structures. All clinical entries comply with HIPAA Privacy Rules.`
      },
      {
        title: "Database Metadata Audit Specs",
        fields: Object.entries(doc.meta || {}).map(([key, val]) => ({
          label: `Meta: ${key.replace(/_/g, " ").toUpperCase()}`,
          value: typeof val === "object" ? JSON.stringify(val) : String(val)
        }))
      }
    ],
    excelHeaders: ["Doc ID", "Patient Name", "Patient ID", "Title", "Category", "Uploader", "Timestamp", "Meta Keys Count"],
    excelRows: [[
      doc.id,
      doc.patientName,
      doc.patientId,
      doc.title,
      doc.category,
      doc.uploader,
      doc.timestamp,
      String(Object.keys(doc.meta || {}).length)
    ]]
  });

  return (
    <div className="space-y-6" id="mongodb-records">
      
      {/* HEADER CONTROLS */}
      <div className="flex border-b border-slate-800 pb-4 items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400 animate-pulse" />
            MongoDB EHR Document Store
          </h2>
          <p className="text-xs text-slate-400">Advanced diagnostic vaults: Query BSON collections, alter schemas, and audit compliance logs</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadDocuments}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {user?.role !== "Patient" && (
            <button
              onClick={() => {
                setNewTitle("");
                setNewCont("");
                setNewPatId("");
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Insert BSON Document
            </button>
          )}
        </div>
      </div>

      {/* FILTER BUTTON TILES */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 border border-slate-850 rounded-2xl">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search BSON names, patient, doc ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 select-none text-[10.5px]">
          {["All", "Lab Report", "Prescription", "Discharge Summary", "Imaging", "EHR Chart"].map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                categoryFilter === category 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* DETAILED DOUBLE-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* LEFT COLUMN: DOCUMENT FINDER */}
        <div className="lg:col-span-2 space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
              const worksAsSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc)}
                  className={`p-4 rounded-xl border transition-all text-left block w-full outline-hidden cursor-pointer select-none ${
                    worksAsSelected 
                      ? "bg-slate-900 border-indigo-500 shadow-md shadow-indigo-600/5" 
                      : "bg-slate-950 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-indigo-400 font-bold block">{doc.id}</span>
                      <h4 className="font-display font-extrabold text-sm text-slate-100">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400">Patient: <strong className="text-slate-300">{doc.patientName}</strong></p>
                    </div>

                    <span className="text-[8.5px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase shrink-0">
                      {doc.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{doc.content}</p>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-905 bg-slate-900 border border-slate-850 rounded-2xl text-xs font-mono">
              Empty results. No MongoDB BSON documents met queries criteria.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RAW BSON SCHEMAS INSPECTOR (SYNTAX EDITOR) */}
        <div className="lg:col-span-3 space-y-6">
          {selectedDoc ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              
              {/* Explorer Head */}
              <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-500/15 text-indigo-400 rounded-md">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-tight">CONNECTED OBJECT ANALYZER</h3>
                    <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest block font-bold mt-0.5">Database Cluster: mongodb://replica-shard-0</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <DocumentButton
                    title="Electronic Health Record (EHR) PDF"
                    category="EHR"
                    documentId={selectedDoc.id}
                    data={getEhrReportData(selectedDoc)}
                    variant="outline"
                    label="Export EMR PDF"
                  />
                  {user?.role !== "Patient" && (
                    <>
                      {isEditingJson ? (
                        <>
                          <button 
                            onClick={handleSaveJsonEditor}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer text-[10.5px]"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Commit Raw BSON
                          </button>
                          <button 
                            onClick={() => { setIsEditingJson(false); setEditedJsonString(JSON.stringify(selectedDoc.meta, null, 2)); }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 text-[10.5px]"
                          >
                            Reset
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setIsEditingJson(true)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white rounded border border-slate-800 text-[10.5px]"
                        >
                          Modify Schema BSON
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Inspector Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* Visual diagnostic results */}
                <div className="p-5 border-b md:border-b-0 md:border-r border-slate-850 space-y-4">
                  <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider block uppercase select-none">CLINICAL OBSERVATION:</span>
                  <div className="space-y-3 leading-relaxed">
                    <h4 className="font-display font-bold text-sm text-slate-100">{selectedDoc.title}</h4>
                    <p className="text-xs text-slate-300 italic">"{selectedDoc.content}"</p>
                  </div>
                  
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[10.5px] leading-snug text-slate-400 space-y-1">
                    <p>• Patient: <strong className="text-slate-200">{selectedDoc.patientName} ({selectedDoc.patientId})</strong></p>
                    <p>• Logged: {new Date(selectedDoc.timestamp).toLocaleString()}</p>
                    <p>• Signed: {selectedDoc.uploader}</p>
                  </div>
                </div>

                {/* RAW MONGO JSON PREVIEW OR CODE EDITOR ELEMENT */}
                <div className="p-5 bg-slate-950 flex flex-col justify-between font-mono text-[11px] leading-relaxed">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-slate-500 uppercase tracking-wide font-semibold text-[9.5px]">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      RAW JSON BSON DOCUMENT SCHEMAS:
                    </div>

                    {isEditingJson ? (
                      <textarea
                        value={editedJsonString}
                        onChange={(e) => setEditedJsonString(e.target.value)}
                        className="w-full h-56 p-3 bg-slate-900 border border-indigo-500/35 text-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                      />
                    ) : (
                      <pre className="p-3 bg-slate-900 rounded-lg border border-slate-850 text-indigo-300 overflow-x-auto max-h-[220px] select-all">
                        {JSON.stringify(selectedDoc.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                  
                  <div className="flex gap-2.5 pt-3 text-[10px] text-slate-500 border-t border-slate-850">
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    <p>Document index key: <strong className="text-slate-400">_id: ObjectId("{selectedDoc.id}")</strong>. HIPAA compliance schemas verified.</p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-xs max-w-sm mx-auto">
              Choose a document on the left panel to trigger the BSON inspector.
            </div>
          )}
        </div>

      </div>

      {/* NEW BSON DOCUMENT DIALOG FORM OVERLAY */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4 animate-scale-up">
            
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display font-extrabold text-base text-white">Insert Document record (BSON)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Posts a brand new medical record to our MongoDB Replica Shard.</p>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">REPORT TITLE</label>
                <input 
                  type="text" 
                  placeholder="e.g. Echocardiogram Stress Check Sheet"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">PATIENT ATTACHMENT</label>
                  <select 
                    value={newPatId}
                    required
                    onChange={(e) => setNewPatId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    <option value="">Choose Patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">CORE CATEGORY</label>
                  <select 
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-305 rounded-lg text-xs"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Imaging">Imaging Scan</option>
                    <option value="EHR Chart">EHR Chart</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block font-mono">OBSERVATIONS WRITE-UP TEXT</label>
                <textarea 
                  placeholder="Insert the written medical diagnostics text details..."
                  required
                  value={newCont}
                  onChange={(e) => setNewCont(e.target.value)}
                  className="w-full h-20 px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Insert BSON document
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
