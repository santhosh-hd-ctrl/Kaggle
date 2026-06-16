import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dbService } from "../services/db";
import { useAuth } from "../context/AuthContext";
import { Staff } from "../types/hospital";
import { 
  Briefcase, Plus, Search, Filter, Trash2, Edit, Eye, 
  UserPlus, RefreshCw, X, Calendar, UserCheck, Shield 
} from "lucide-react";

export const StaffDirectory: React.FC = () => {
  const { user, addToast } = useAuth();
  const navigate = useNavigate();

  // Staff lists states
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stfName, setStfName] = useState("");
  const [stfRole, setStfRole] = useState("Front Desk Operator");
  const [stfDept, setStfDept] = useState("Logistics");
  const [stfEmail, setStfEmail] = useState("");
  const [stfPhone, setStfPhone] = useState("");

  const loadStaff = () => {
    setLoading(true);
    setTimeout(() => {
      setStaff(dbService.getStaff());
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // Filter
  const filteredStaff = staff.filter((stf) => {
    const matchesSearch = 
      stf.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      stf.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || stf.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stfName.trim() || !stfEmail.trim()) {
      addToast("Staff name and email keys are required.", "warning");
      return;
    }

    const currentStaff = dbService.getStaff();
    const generatedId = "STF-20" + (currentStaff.length + 1);

    const newStf: Staff = {
      id: generatedId,
      name: stfName,
      department: stfDept,
      role: stfRole,
      email: stfEmail,
      phone: stfPhone || "+1-555-4811",
      attendanceStatus: "Present",
      attendanceHistory: [
        { date: new Date().toLocaleDateString(), status: "Present" }
      ],
      avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? "1500648767791-00dcc994a43e" : "1438761681033-6461ffad8d80"}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
    };

    const updated = [...currentStaff, newStf];
    dbService.saveStaff(updated);
    dbService.logAction(user?.id || "System", user?.name || "Admin", "Admin", "STAFF_CREATE", `Registered new staff roster: ${newStf.name} as ${newStf.role}`);
    
    addToast(`Staff enrollment for ${newStf.name} succeeded.`, "success");
    setIsFormOpen(false);
    loadStaff();
  };

  const handleAttendanceChange = (id: string, name: string, status: "Present" | "Absent" | "On Leave") => {
    const currentList = dbService.getStaff();
    const updated = currentList.map(stf => {
      if (stf.id === id) {
        return {
          ...stf,
          attendanceStatus: status,
          attendanceHistory: [
            { date: new Date().toLocaleDateString(), status },
            ...stf.attendanceHistory
          ]
        };
      }
      return stf;
    });

    dbService.saveStaff(updated);
    dbService.logAction(user?.id || "System", user?.name || "Shift Lead", user?.role || "Staff", "STAFF_ATTENDANCE", `Marked attendance status of ${name} as ${status}`);
    
    addToast(`Attendance status of ${name} marked: ${status}`, "success");
    loadStaff();
  };

  const handleDeleteStaff = (id: string, name: string) => {
    const list = dbService.getStaff();
    const updated = list.filter(s => s.id !== id);
    dbService.saveStaff(updated);
    dbService.logAction(user?.id || "System", user?.name || "Admin", "Admin", "STAFF_DELETE", `Permanently revoked staff file: ${name} (${id})`);
    
    addToast(`Staff file for ${name} removed from roster.`, "info");
    loadStaff();
  };

  return (
    <div className="space-y-6" id="staff-directory-module">
      
      {/* HEADER ROW */}
      <div className="flex border-b border-slate-800 pb-4 items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-teal-400" />
            Hospital Staff Registry
          </h2>
          <p className="text-xs text-slate-400">Operations desk: Log attendance, allocate roster categories, and audit permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadStaff}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {user?.role === "Admin" && (
            <button
              onClick={() => {
                setStfName("");
                setStfEmail("");
                setStfPhone("");
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Enroll Operational Staff
            </button>
          )}
        </div>
      </div>

      {/* FILTER SHEETS */}
      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search roster names, specific roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-[10px] text-slate-500 font-mono">DEPARTMENT:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-350 text-xs rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Departments</option>
            {Array.from(new Set(staff.map(s => s.department))).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ROSTER TABLE LIST */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredStaff.length > 0 ? (
        <div className="space-y-3">
          {filteredStaff.map((stf) => (
            <div key={stf.id} className="p-4 bg-slate-900 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all">
              
              <div className="flex items-center gap-3.5 min-w-0">
                <img src={stf.avatar} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-700 bg-slate-800" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-mono text-teal-400 font-bold bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10 block leading-none">{stf.id}</span>
                    <strong className="font-display font-extrabold text-sm text-slate-200">{stf.name}</strong>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{stf.role} • <span className="font-mono text-[11px] text-slate-500">{stf.department}</span></p>
                </div>
              </div>

              {/* Attendance quick control togglers */}
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start md:justify-end">
                <div className="p-1 px-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold shrink-0">ATTENDANCE STATUS:</span>
                  <div className="flex gap-1.5 shrink-0 select-none">
                    {["Present", "Absent", "On Leave"].map((status: any) => {
                      const isActive = stf.attendanceStatus === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleAttendanceChange(stf.id, stf.name, status)}
                          className={`px-2 py-0.5 text-[9.5px] font-bold rounded cursor-pointer transition-colors ${
                            isActive 
                              ? status === "Present" ? "bg-emerald-600 text-white" : status === "Absent" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                              : "text-slate-500 hover:text-slate-350"
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0">
                  {user?.role === "Admin" && (
                    <button 
                      onClick={() => handleDeleteStaff(stf.id, stf.name)}
                      className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-red-500/10"
                      title="De-enroll roster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <Link
                    to={`/staff/${stf.id}`}
                    className="p-2 px-3 bg-teal-600/10 hover:bg-teal-600 border border-teal-500/20 text-teal-400 hover:text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Open Roster
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center max-w-sm mx-auto space-y-3 bg-slate-900 border border-slate-850 rounded-2xl animate-fade-in animate-duration-300">
          <Briefcase className="w-12 h-12 text-slate-650 mx-auto opacity-30" />
          <h3 className="text-sm font-extrabold text-slate-300">Roster Registers Empty</h3>
          <p className="text-xs text-slate-500">No organizational employees encountered.</p>
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
              <h3 className="font-display font-extrabold text-base text-white">Enroll Hospital Employee</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define hospital department sector and operational roles</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">STAFF COMPREHENSIVE NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. Richard Hendricks"
                  required
                  value={stfName}
                  onChange={(e) => setStfName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">DEPARTMENT</label>
                  <select 
                    value={stfDept}
                    onChange={(e) => setStfDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    <option>Logistics</option>
                    <option>Laboratory Operations</option>
                    <option>Emergency Triage</option>
                    <option>Apothecary Management</option>
                    <option>Administrative Clerks</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">ROLE ASSIGNMENT</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Registrar Officer"
                    required
                    value={stfRole}
                    onChange={(e) => setStfRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">EMAIL ID</label>
                <input 
                  type="email" 
                  placeholder="e.g. richard@smarthospital.com"
                  required
                  value={stfEmail}
                  onChange={(e) => setStfEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">CONTACT PHONE LINE</label>
                <input 
                  type="text" 
                  placeholder="e.g. +1-555-8910"
                  value={stfPhone}
                  onChange={(e) => setStfPhone(e.target.value)}
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
                  className="px-5 py-2 bg-teal-650 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
