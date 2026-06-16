import React, { useState, useEffect } from "react";
import { dbService } from "../services/db";
import { LabTest, Patient } from "../types/hospital";
import { useAuth } from "../context/AuthContext";
import { 
  TestTube, Plus, Search, Filter, RefreshCw, X, 
  Check, Play, ArrowRight, ClipboardList, Sparkles 
} from "lucide-react";

export const LaboratoryWorkbench: React.FC = () => {
  const { user, addToast } = useAuth();
  
  // Workbench states
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  // New Lab test states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [testPatientId, setTestPatientId] = useState("");
  const [testType, setTestType] = useState("Comprehensive Blood Count");

  // Completion states
  const [selectedCompletedTestId, setSelectedCompletedTestId] = useState<string | null>(null);
  const [enteredResultNotes, setEnteredResultNotes] = useState("");

  const loadLabTests = () => {
    setLoading(true);
    setTimeout(() => {
      setLabTests(dbService.getLabTests());
      setPatients(dbService.getPatients());
      setLoading(false);
    }, 450);
  };

  useEffect(() => {
    loadLabTests();
  }, []);

  // Filter
  const filteredTests = labTests.filter((test) => {
    const matchesSearch = 
      test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      test.testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || test.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateLabTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPatientId) {
      addToast("Patient entity allocation is required.", "warning");
      return;
    }

    const matchedPat = patients.find(p => p.id === testPatientId);
    if (!matchedPat) {
      addToast("Invalid patient.", "error");
      return;
    }

    const list = dbService.getLabTests();
    const generatedId = "LAB-00" + (list.length + 1);

    const newTest: LabTest = {
      id: generatedId,
      patientId: matchedPat.id,
      patientName: matchedPat.name,
      testType: testType,
      dateOrdered: new Date().toLocaleDateString(),
      status: "Requested",
      result: "Awaiting clinical assay completion"
    };

    const updated = [newTest, ...list];
    dbService.saveLabTests(updated);
    dbService.logAction(user?.id || "System", user?.name || "Lab Admin", "Doctor/Staff", "LABTEST_REQUEST", `Scheduled biochemical panel: ${testType} for patient: ${matchedPat.name}`);

    addToast(`Laboratory order logged: ${generatedId}`, "success");
    setIsFormOpen(false);
    loadLabTests();
  };

  const handlePublishResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompletedTestId || !enteredResultNotes.trim()) {
      addToast("Assay result reports text is required.", "warning");
      return;
    }

    const list = dbService.getLabTests();
    const updated = list.map((test) => {
      if (test.id === selectedCompletedTestId) {
        return {
          ...test,
          status: "Completed" as any,
          result: enteredResultNotes
        };
      }
      return test;
    });

    dbService.saveLabTests(updated);
    dbService.logAction(user?.id || "System", user?.name || "Biologist", "Doctor/Staff", "LABTEST_COMPLETE", `Published biosample analysis on test row: ${selectedCompletedTestId}`);
    
    addToast(`Laboratory assay findings dispatched for test row: ${selectedCompletedTestId}`, "success");
    setSelectedCompletedTestId(null);
    setEnteredResultNotes("");
    loadLabTests();
  };

  return (
    <div className="space-y-6" id="lab-workbench">
      
      {/* CORNER CONTROL ROW */}
      <div className="flex border-b border-slate-805 pb-4 items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-400" />
            Biomedical Laboratory Workbench
          </h2>
          <p className="text-xs text-slate-400">Biological pathology: Order diagnostic tests, log pathology findings, and verify cellular reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadLabTests}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {user?.role !== "Patient" && (
            <button
              onClick={() => {
                setTestPatientId("");
                setTestType("Comprehensive Metabolic Panel");
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Order Biochemical Panel
            </button>
          )}
        </div>
      </div>

      {/* BENCH FILTERS ROW */}
      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search assays, patient matching name, lab ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 select-none text-[10px]">
          <span className="text-slate-500 font-mono font-bold mr-1">PROCESS SELECTOR:</span>
          {["All", "Requested", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                filterStatus === status 
                  ? "bg-purple-600 text-white shadow" 
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* PATHOLOGY RECORDS TABLE */}
      {loading ? (
        <div className="space-y-2 animate-pulse col-span-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-900 rounded-xl" />)}
        </div>
      ) : filteredTests.length > 0 ? (
        <div className="space-y-3">
          {filteredTests.map((test) => (
            <div key={test.id} className="p-4 bg-slate-900 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 shrink-0">
                  <TestTube className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-mono text-purple-400 font-bold bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10 block leading-none">{test.id}</span>
                    <strong className="font-display font-extrabold text-sm text-slate-100">{test.patientName}</strong>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Assay Target: <span className="font-bold text-slate-200">{test.testType}</span></p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Order Issued Date: {test.dateOrdered}</p>
                </div>
              </div>

              {/* Pathology notes */}
              <div className="flex flex-col gap-1 w-full md:w-56 text-[11px] font-mono leading-normal">
                <span className="text-slate-500 font-bold block select-none">LAB FINDINGS DETAILS:</span>
                <p className="text-slate-350 truncate italic" title={test.result}>"{test.result}"</p>
              </div>

              {/* Interactive completions panel */}
              <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
                <span className={`px-2.5 py-0.5 text-[9px] font-extrabold font-mono rounded-full border uppercase leading-tight select-none ${
                    test.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                }`}>
                  {test.status}
                </span>

                {user?.role !== "Patient" && test.status === "Requested" && (
                  <button 
                    onClick={() => { setSelectedCompletedTestId(test.id); setEnteredResultNotes(""); }}
                    className="px-3 py-1 bg-purple-650 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10.5px] rounded-lg shadow cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 text-purple-200" />
                    Run Lab assay
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center max-w-sm mx-auto space-y-3 bg-slate-900 border border-slate-850 rounded-2xl">
          <TestTube className="w-12 h-12 text-slate-650 mx-auto opacity-35" />
          <h3 className="text-xs font-extrabold text-slate-355 font-display text-slate-300">Biochemical Vaults Empty</h3>
          <p className="text-xs text-slate-500">No scheduled specimens encountered.</p>
        </div>
      )}

      {/* REQUEST LAB MODAL DIALOG */}
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
              <h3 className="font-display font-extrabold text-base text-white">Order Biochemical Panel</h3>
              <p className="text-xs text-slate-500 mt-0.5">Launches specimen tests under medical supervision</p>
            </div>

            <form onSubmit={handleCreateLabTest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">PATIENT ATTACHMENT FILE</label>
                <select 
                  value={testPatientId}
                  required
                  onChange={(e) => setTestPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  <option value="">Allocate patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">TEST TYPE ASSAY</label>
                <select 
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-305 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option>Comprehensive Metabolic Panel</option>
                  <option>CBC with Differential Panel</option>
                  <option>Liver Function Profile (LFT)</option>
                  <option>Magnetic Resonance Imaging (Brain Scan)</option>
                  <option>Thyroid stimulating biochemistry (TSH)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-305 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-650 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Order Assay
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* INPUT ASSAY FINDINGS RESULT MODAL DIALOG */}
      {selectedCompletedTestId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4 animate-scale-up">
            
            <button 
              onClick={() => setSelectedCompletedTestId(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display font-extrabold text-base text-white">Log Pathology Findings: {selectedCompletedTestId}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Write biological values or scans diagnostic parameters report</p>
            </div>

            <form onSubmit={handlePublishResults} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">PATHOLOGY LAB NOTES WRITE-UP</label>
                <textarea 
                  placeholder="e.g. Red cell volume: 4.8 million/mcL (normal), Hemoglobin count: 15.2 g/dL. Cellular metabolism balances standard."
                  required
                  rows={4}
                  value={enteredResultNotes}
                  onChange={(e) => setEnteredResultNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-205 text-slate-300 rounded-lg text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setSelectedCompletedTestId(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-750 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Publish Lab Report
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
