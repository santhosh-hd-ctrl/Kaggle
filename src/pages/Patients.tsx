import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dbService } from "../services/db";
import { useAuth } from "../context/AuthContext";
import { Patient } from "../types/hospital";
import { 
  Users, Plus, Search, Filter, Trash2, Edit, Eye, UserPlus, 
  ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, X, AlertOctagon 
} from "lucide-react";

export const Patients: React.FC = () => {
  const { user, addToast } = useAuth();
  const navigate = useNavigate();

  // Patients states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodFilter, setBloodFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [sortField, setSortField] = useState<"name" | "age" | "id">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // CRUD Form states (Create and Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedPatId, setSelectedPatId] = useState("");

  const [patName, setPatName] = useState("");
  const [patAge, setPatAge] = useState(30);
  const [patGender, setPatGender] = useState("Female");
  const [patBlood, setPatBlood] = useState("O-Negative");
  const [patAllergies, setPatAllergies] = useState("");
  const [patContactName, setPatContactName] = useState("");
  const [patContactPhone, setPatContactPhone] = useState("");
  const [patContactRelation, setPatContactRelation] = useState("Spouse");
  const [patDiagnosis, setPatDiagnosis] = useState("Awaiting Diagnostic Review");
  const [patSymptoms, setPatSymptoms] = useState("");

  // Confirmation Delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fresh load
  const loadPatients = () => {
    setLoading(true);
    setTimeout(() => {
      setPatients(dbService.getPatients());
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Filter patients
  const filteredPatients = patients.filter((pat) => {
    const matchesSearch = 
      pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBlood = bloodFilter === "All" || pat.bloodGroup === bloodFilter;
    const matchesGender = genderFilter === "All" || pat.gender === genderFilter;

    return matchesSearch && matchesBlood && matchesGender;
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") comparison = a.name.localeCompare(b.name);
    else if (sortField === "age") comparison = a.age - b.age;
    else comparison = a.id.localeCompare(b.id);
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage) || 1;
  const paginatedPatients = sortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, bloodFilter, genderFilter]);

  const toggleSort = (field: "name" | "age" | "id") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleOpenCreate = () => {
    setFormMode("create");
    setPatName("");
    setPatAge(34);
    setPatGender("Female");
    setPatBlood("O-Negative");
    setPatAllergies("");
    setPatContactName("");
    setPatContactPhone("");
    setPatContactRelation("Spouse");
    setPatDiagnosis("Awaiting Diagnostic Review");
    setPatSymptoms("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pat: Patient) => {
    setFormMode("edit");
    setSelectedPatId(pat.id);
    setPatName(pat.name);
    setPatAge(pat.age);
    setPatGender(pat.gender);
    setPatBlood(pat.bloodGroup);
    setPatAllergies(pat.allergies.join(", "));
    setPatContactName(pat.emergencyContact.name);
    setPatContactPhone(pat.emergencyContact.phone);
    setPatContactRelation(pat.emergencyContact.relation);
    setPatDiagnosis(pat.diagnosis);
    setPatSymptoms(pat.symptoms.join(", "));
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName.trim()) {
      addToast("Patient name field is mandatory.", "warning");
      return;
    }

    const patientList = dbService.getPatients();

    if (formMode === "create") {
      const generatedId = "PAT-00" + (Math.max(...patientList.map(p => parseInt(p.id.split("-")[1]) || 0), 0) + 1);
      const newPatient: Patient = {
        id: generatedId,
        name: patName,
        age: patAge,
        gender: patGender,
        bloodGroup: patBlood,
        allergies: patAllergies ? patAllergies.split(",").map(a => a.trim()) : [],
        emergencyContact: {
          name: patContactName || "N/A",
          phone: patContactPhone || "N/A",
          relation: patContactRelation || "Other"
        },
        symptoms: patSymptoms ? patSymptoms.split(",").map(s => s.trim()) : [],
        diagnosis: patDiagnosis,
        prescriptions: [],
        treatmentHistory: [`Initial system registration - ${new Date().toLocaleDateString()}`],
        avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? "1534528741775-53994a69daeb" : "1539571696357-5a69c17a67c6"}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
      };

      const updated = [newPatient, ...patientList];
      dbService.savePatients(updated);
      dbService.logAction(user?.id || "System", user?.name || "Clinician", user?.role || "Staff", "PATIENT_CREATE", `Registered new patient file: ${newPatient.name} (${newPatient.id})`);
      addToast(`Patient file ${newPatient.name} generated successfully.`, "success");
    } else {
      // Edit mode
      const updated = patientList.map((p) => {
        if (p.id === selectedPatId) {
          return {
            ...p,
            name: patName,
            age: patAge,
            gender: patGender,
            bloodGroup: patBlood,
            allergies: patAllergies ? patAllergies.split(",").map(a => a.trim()) : [],
            emergencyContact: {
              name: patContactName,
              phone: patContactPhone,
              relation: patContactRelation
            },
            symptoms: patSymptoms ? patSymptoms.split(",").map(s => s.trim()) : [],
            diagnosis: patDiagnosis
          };
        }
        return p;
      });

      dbService.savePatients(updated);
      dbService.logAction(user?.id || "System", user?.name || "Clinician", user?.role || "Staff", "PATIENT_UPDATE", `Edited data metrics on patient: ${patName} (${selectedPatId})`);
      addToast(`Patient file ${patName} updated.`, "success");
    }

    setIsFormOpen(false);
    loadPatients();
  };

  const handleDeletePatient = (id: string) => {
    const list = dbService.getPatients();
    const target = list.find(p => p.id === id);
    if (!target) return;

    const updated = list.filter(p => p.id !== id);
    dbService.savePatients(updated);
    dbService.logAction(user?.id || "System", user?.name || "Admin", user?.role || "Admin", "PATIENT_DELETE", `Permanently wiped patient file: ${target.name} (${id})`);
    
    addToast(`Permanently deleted patient file for ${target.name}.`, "info");
    setDeleteConfirmId(null);
    loadPatients();
  };

  return (
    <div className="space-y-6" id="patients-module">
      
      {/* 1. TOP TITLE CONTROL BAR */}
      <div className="flex border-b border-slate-800 pb-4 items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Patients Registry Database
          </h2>
          <p className="text-xs text-slate-400">Clinical operations: Read, Create, Edit and Delete medical files securely</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadPatients}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Durable database sync"
          >
            <RefreshCw className="w-4 h-4 animate-hover-spin" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Enroll Patient File
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC SEARCH AND FILTER SHEETS */}
      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search matching names, ID, diagnoses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">BLOOD:</span>
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-350 text-xs rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All types</option>
              {Array.from(new Set(patients.map(p => p.bloodGroup))).map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">GENDER:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-350 text-xs rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
            </select>
          </div>

          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button 
              onClick={() => toggleSort("name")}
              className={`p-1.5 text-[10.5px] font-bold rounded flex items-center gap-1 ${sortField === "name" ? "bg-slate-900 text-white" : "text-slate-500"}`}
            >
              Name <ArrowUpDown className="w-3 h-3" />
            </button>
            <button 
              onClick={() => toggleSort("age")}
              className={`p-1.5 text-[10.5px] font-bold rounded flex items-center gap-1 ${sortField === "age" ? "bg-slate-900 text-white" : "text-slate-500"}`}
            >
              Age <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. CORE ADMISSIONS GRID & SKELETON LOADER */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/3" />
                </div>
              </div>
              <div className="h-10 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : paginatedPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPatients.map((pat) => (
            <div key={pat.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all shadow flex flex-col justify-between">
              
              <div className="p-5 space-y-4">
                {/* File Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <img 
                      src={pat.avatar} 
                      alt={pat.name} 
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-700 bg-slate-800"
                    />
                    <div>
                      <span className="text-[9.5px] font-mono text-indigo-400 font-bold uppercase tracking-wider">{pat.id}</span>
                      <h3 className="font-display font-extrabold text-sm text-white truncate max-w-[150px]">{pat.name}</h3>
                      <p className="text-[10px] text-slate-500">{pat.gender} • {pat.age} yrs • {pat.bloodGroup}</p>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEdit(pat)}
                      className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                      title="Edit file details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(pat.id)}
                      className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded"
                      title="Purge record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] leading-snug">
                  <strong className="text-slate-400 font-bold block mb-1">EHR Primary Diagnosis:</strong>
                  <p className="italic text-slate-300 truncate">{pat.diagnosis}</p>
                </div>

                <div className="flex gap-1 flex-wrap">
                  <span className="text-[9px] font-bold text-slate-500 mr-1 mt-0.5">Rx:</span>
                  {pat.prescriptions.length > 0 ? (
                    pat.prescriptions.slice(0, 2).map((rx, idx) => (
                      <span key={idx} className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/15 font-mono text-[9px] font-bold py-0.5 px-2 rounded-md truncate max-w-[100px]">{rx}</span>
                    ))
                  ) : (
                    <span className="text-[9.5px] text-slate-500 italic">No prescriptions logged</span>
                  )}
                </div>
              </div>

              {/* Enter Profile Link card */}
              <div className="p-4 border-t border-slate-850 bg-slate-950/40 flex justify-between items-center pr-3">
                <span className="text-[10.5px] font-mono text-slate-400">Emergency lines: {pat.emergencyContact.phone}</span>
                <Link
                  to={`/patients/${pat.id}`}
                  className="px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white font-bold text-[10.5px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  Open Chart <Eye className="w-3 h-3" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty results state */
        <div className="p-12 text-center max-w-md mx-auto space-y-4 bg-slate-900 border border-slate-850 rounded-2xl">
          <Users className="w-12 h-12 text-slate-650 mx-auto opacity-40 animate-pulse" />
          <h3 className="text-base font-extrabold text-white">Empty Patient Database results</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No patient files matched input parameters. Adjust lookup term or registers filters.
          </p>
          <button 
            onClick={() => { setSearchQuery(""); setBloodFilter("All"); setGenderFilter("All"); }}
            className="px-4 py-1.5 bg-slate-950 border border-slate-800 text-xs font-semibold rounded text-slate-300 hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination indicators */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center border-t border-slate-850 pt-4 text-xs select-none">
          <span className="text-slate-500">Showing page <strong className="text-slate-300">{currentPage}</strong> of {totalPages} ({filteredPatients.length} profiles)</span>
          <div className="flex gap-1.5">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1.5 rounded border border-slate-805 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1.5 rounded border border-slate-805 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      {/* ========================================================= */}
      {/* 4. CRUD DIALOG FORM POPUP MODAL */}
      {/* ========================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 relative space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                {formMode === "create" ? "Register Inpatient File" : `Modify EMR File: ${selectedPatId}`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 select-all">Allocate and sign clinical records profiles</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">PATIENT COMPREHENSIVE NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Eleanor Vance"
                    required
                    value={patName}
                    onChange={(e) => setPatName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">AGE</label>
                  <input 
                    type="number" 
                    required
                    value={patAge}
                    onChange={(e) => setPatAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">GENDER</label>
                  <select 
                    value={patGender}
                    onChange={(e) => setPatGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-Binary</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">BLOOD TYPE CLASS</label>
                  <select 
                    value={patBlood}
                    onChange={(e) => setPatBlood(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option>O-Positive</option>
                    <option>O-Negative</option>
                    <option>A-Positive</option>
                    <option>A-Negative</option>
                    <option>B-Positive</option>
                    <option>B-Negative</option>
                    <option>AB-Positive</option>
                    <option>AB-Negative</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">ALLERGIES (comma-separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Penicillin, Peanuts"
                    value={patAllergies}
                    onChange={(e) => setPatAllergies(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <span className="text-[10px] font-mono font-bold block text-slate-400 tracking-wider">EMERGENCY CONTACT RELATIONS</span>
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    placeholder="Name"
                    value={patContactName}
                    onChange={(e) => setPatContactName(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-250 text-[11px] rounded"
                  />
                  <input 
                    type="text" 
                    placeholder="Phone line"
                    value={patContactPhone}
                    onChange={(e) => setPatContactPhone(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-250 text-[11px] rounded"
                  />
                  <select 
                    value={patContactRelation}
                    onChange={(e) => setPatContactRelation(e.target.value)}
                    className="px-2 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-[11px] rounded"
                  >
                    <option>Spouse</option>
                    <option>Parent</option>
                    <option>Sibling</option>
                    <option>Child</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">PRIMARY CLINICAL DIAGNOSIS</label>
                <input 
                  type="text" 
                  value={patDiagnosis}
                  onChange={(e) => setPatDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block font-mono">PRESENTING SYMPTOMS (comma-separated)</label>
                <textarea 
                  placeholder="e.g. Continuous heavy breathing spasms, high fatigue metrics"
                  value={patSymptoms}
                  onChange={(e) => setPatSymptoms(e.target.value)}
                  className="w-full h-16 px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Commit EMR File
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CONFIRMATION DELETE ALERTS MODAL */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/20 max-w-sm rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertOctagon className="w-6 h-6 animate-bounce" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-tight">Purge Patient EMR File?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirming deletes this hospital diagnostic record permanently from local registers. This operation is IRREVERSIBLE.
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeletePatient(deleteConfirmId)}
                className="w-1/2 py-2 bg-red-650 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
