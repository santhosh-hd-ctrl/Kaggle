import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dbService } from "../services/db";
import { useAuth } from "../context/AuthContext";
import { Doctor } from "../types/hospital";
import { 
  Stethoscope, Plus, Search, Filter, Trash2, Edit, Eye, 
  UserPlus, RefreshCw, X, Award, MapPin, Calendar, Heart 
} from "lucide-react";

export const Doctors: React.FC = () => {
  const { user, addToast } = useAuth();
  const navigate = useNavigate();

  // Doctors lists states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docSpec, setDocSpec] = useState("General Medicine");
  const [docEmail, setDocEmail] = useState("");
  const [docPhone, setDocPhone] = useState("");
  const [docAvailability, setDocAvailability] = useState("Mon, Tue, Wed, Thu, Fri");
  const [docFee, setDocFee] = useState(150);

  const loadDoctors = () => {
    setLoading(true);
    setTimeout(() => {
      setDoctors(dbService.getDoctors());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // Filter
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || doc.specialization === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docEmail.trim()) {
      addToast("Doctor name and email keys are mandatory.", "warning");
      return;
    }

    const currentDoctors = dbService.getDoctors();
    const generatedId = "DOC-00" + (currentDoctors.length + 1);

    const newDoc: Doctor = {
      id: generatedId,
      name: docName,
      department: docSpec,
      specialization: docSpec,
      experience: 5 + Math.floor(Math.random() * 15),
      email: docEmail,
      phone: docPhone || "+1-555-0100",
      availability: docAvailability.split(",").map(s => s.trim()),
      rating: 4.8 + (Math.random() * 0.2), // Generate premium 4.8 - 5.0
      consultationFee: docFee,
      avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? "1537368910025-700350fe46c7" : "1559839734-2b71ea197ec2"}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
    };

    const updated = [...currentDoctors, newDoc];
    dbService.saveDoctors(updated);
    dbService.logAction(user?.id || "System", user?.name || "HR Director", "Admin", "DOCTOR_CREATE", `Enrolled dynamic Doctor profile: ${newDoc.name} in specialty: ${newDoc.specialization}`);

    addToast(`Doctor enrollment ${newDoc.name} succeeded. Register synced to local storage.`, "success");
    setIsFormOpen(false);
    loadDoctors();
  };

  const handleDeleteDoctor = (id: string, name: string) => {
    const currentList = dbService.getDoctors();
    const updated = currentList.filter(d => d.id !== id);
    dbService.saveDoctors(updated);
    dbService.logAction(user?.id || "System", user?.name || "Admin", user?.role || "Admin", "DOCTOR_DELETE", `Permanently revoked doctor credentials: ${name} (${id})`);
    
    addToast(`Doctor record ${name} revoked.`, "info");
    loadDoctors();
  };

  return (
    <div className="space-y-6" id="doctors-module">
      
      {/* HEADER SECTION */}
      <div className="flex border-b border-slate-800 pb-4 items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-400" />
            Medical Specialists Board
          </h2>
          <p className="text-xs text-slate-400">Dynamic registration pipelines: Add, remove, and audit consultants records</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadDoctors}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {user?.role === "Admin" && (
            <button
              onClick={() => {
                setDocName("");
                setDocEmail("");
                setDocPhone("");
                setDocAvailability("Mon, Wed, Fri");
                setDocFee(150);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Enroll Consultant Doctor
            </button>
          )}
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search matching names or specialization details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-[10px] text-slate-500 font-mono">SPECIALIZATION:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-350 text-xs rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Specializations</option>
            {Array.from(new Set(doctors.map(d => d.specialization))).map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DOCTORS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between">
              
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <img src={doc.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-705 bg-slate-800" />
                    <div>
                      <span className="text-[9.5px] font-mono text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 block w-max leading-none mb-1.5">{doc.id}</span>
                      <h3 className="font-display font-extrabold text-sm text-white">{doc.name}</h3>
                      <p className="text-[11px] text-slate-400 font-semibold">{doc.specialization}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 shrink-0 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 leading-none">
                    ★ {doc.rating.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px]">AVAILABILITIES:</span>
                    <span className="text-slate-300 font-bold text-[11px]">{doc.availability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px]">CONSULTATION FEE:</span>
                    <span className="text-emerald-400 font-bold">${doc.consultationFee}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-850 bg-slate-950/40 flex justify-between items-center pr-3">
                <span className="text-[10px] text-slate-500 font-mono">Tel: {doc.phone}</span>
                <div className="flex gap-2">
                  {user?.role === "Admin" && (
                    <button 
                      onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors cursor-pointer border border-red-500/10"
                      title="De-enroll credentials"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <Link
                    to={`/doctors/${doc.id}`}
                    className="px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white font-bold text-[10.5px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Specialist Profile <Eye className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center max-w-sm mx-auto space-y-3 bg-slate-900 border border-slate-850 rounded-2xl">
          <Stethoscope className="w-12 h-12 text-slate-650 mx-auto opacity-30" />
          <h3 className="text-sm font-extrabold text-slate-300">Specialists Database Empty</h3>
          <p className="text-xs text-slate-500 leading-relaxed">No matching medical consultant registers encountered.</p>
        </div>
      )}

      {/* REGISTRATION MODAL FORM */}
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
              <h3 className="font-display font-extrabold text-base text-white">Enroll Medical Specialist</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure clinical credentials and fee margins</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">DOCTOR COMPREHENSIVE NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Allison Cameron"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">SPECIALTY SECTOR</label>
                  <select 
                    value={docSpec}
                    onChange={(e) => setDocSpec(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    <option>General Medicine</option>
                    <option>Pulmology &amp; Critical Care</option>
                    <option>Cardiology Specialist</option>
                    <option>Endocrinology Clinic</option>
                    <option>Neurology Specialist</option>
                    <option>Triage Emergency Care</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">CONSULTATION FEE ($)</label>
                  <input 
                    type="number" 
                    required
                    value={docFee}
                    onChange={(e) => setDocFee(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">EMAIL LICENSING ID</label>
                <input 
                  type="email" 
                  placeholder="e.g. cameron@smarthospital.com"
                  required
                  value={docEmail}
                  onChange={(e) => setDocEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">WEEKLY AVAILABILITY HOURS</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mon, Wed, Fri (9:00 - 15:00)"
                  required
                  value={docAvailability}
                  onChange={(e) => setDocAvailability(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none"
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
                  className="px-5 py-2 bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Certify Credentials
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
