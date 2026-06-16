import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  HeartPulse, LayoutDashboard, Users, Stethoscope, Briefcase, Calendar, 
  FileText, CreditCard, Settings, LogOut, ChevronDown, Menu, X, 
  ShieldAlert, Sparkles, Terminal, Bell, Search, RefreshCw,
  Package, TestTube, BookOpen, FolderLock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/hospital";

const ROLE_BADGES: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
  Admin: { label: "System Administrator", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  Doctor: { label: "Consultant Specialist", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Staff: { label: "Operational Officer", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  Patient: { label: "Registered Patient", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" }
};

interface MenuLink {
  to: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

const MENU_LINKS: MenuLink[] = [
  { to: "/dashboard", label: "Control Center", icon: LayoutDashboard, roles: ["Admin", "Doctor", "Staff", "Patient"] },
  { to: "/my-documents", label: "My Documents", icon: FolderLock, roles: ["Admin", "Doctor", "Patient"] },
  { to: "/patients", label: "Patients Registry", icon: Users, roles: ["Admin", "Doctor", "Staff"] },
  { to: "/doctors", label: "Medical Specialists", icon: Stethoscope, roles: ["Admin", "Doctor", "Patient"] },
  { to: "/staff", label: "Staff Directory", icon: Briefcase, roles: ["Admin", "Staff"] },
  { to: "/appointments", label: "Appointment Desk", icon: Calendar, roles: ["Admin", "Doctor", "Staff", "Patient"] },
  { to: "/medical-records", label: "MongoDB Records", icon: FileText, roles: ["Admin", "Doctor", "Patient"] },
  { to: "/billing", label: "Finances & Billing", icon: CreditCard, roles: ["Admin", "Staff"] },
  { to: "/pharmacy", label: "Pharmacy & Inventory", icon: Package, roles: ["Admin", "Doctor", "Staff"] },
  { to: "/laboratory", label: "Laboratory Desk", icon: TestTube, roles: ["Admin", "Doctor", "Staff"] },
  { to: "/blueprints", label: "Java Spring Blueprints", icon: BookOpen, roles: ["Admin", "Doctor", "Staff", "Patient"] },
  { to: "/settings", label: "System Control", icon: Settings, roles: ["Admin", "Doctor", "Staff", "Patient"] },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, addToast } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) return <>{children}</>;

  const currentPath = location.pathname;
  const badge = ROLE_BADGES[user.role];

  // Quick navigation search simulation
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      setSearchQuery("");
      if ("patients".includes(q) || "patient".includes(q)) navigate("/patients");
      else if ("doctors".includes(q) || "doctor".includes(q)) navigate("/doctors");
      else if ("staff".includes(q)) navigate("/staff");
      else if ("appointments".includes(q) || "appointment".includes(q)) navigate("/appointments");
      else if ("billing".includes(q) || "invoice".includes(q)) navigate("/billing");
      else if ("records".includes(q) || "mongodb".includes(q) || "ehr".includes(q)) navigate("/medical-records");
      else if ("settings".includes(q) || "control".includes(q)) navigate("/settings");
      else {
        addToast(`Query "${q}" executed. Redirecting to appropriate module helper.`, "info");
        navigate("/dashboard");
      }
    }
  };

  // Check role-based path authorization
  const currentLink = MENU_LINKS.find(link => currentPath.startsWith(link.to));
  const isAuthorized = currentLink ? currentLink.roles.includes(user.role) : true;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row antialiased select-none font-sans" id="hospital-dashboard-parent">
      
      {/* --- SIDEBAR NAV (DESKTOP) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 shrink-0 sticky top-0 h-screen overflow-y-auto">
        
        {/* Core Brand Header */}
        <div className="p-6 border-b border-slate-850 flex items-center gap-3 bg-gradient-to-br from-slate-950 to-slate-900">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 block uppercase">SaaS Enterprise</span>
            <span className="font-display font-extrabold text-sm text-white flex items-center gap-1 leading-none">
              SmartHospital
              <Sparkles className="w-3 h-3 text-indigo-400" />
            </span>
          </div>
        </div>

        {/* Global Patient Portal lookup field */}
        <div className="px-4 py-3 border-b border-slate-850">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Module jump (patients...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500 font-mono transition-colors"
            />
          </div>
        </div>

        {/* Menu URLs */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {MENU_LINKS.map((link) => {
            const hasClearance = link.roles.includes(user.role);
            const isActive = currentPath === link.to || (link.to !== "/" && currentPath.startsWith(link.to));
            const LinkIcon = link.icon;

            return (
              <Link
                key={link.to}
                to={hasClearance ? link.to : "/dashboard"}
                onClick={() => {
                  if (!hasClearance) {
                    addToast(`Your role (${user.role}) is unauthorized to view ${link.label}.`, "warning");
                  }
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold select-none group transition-all ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                    : hasClearance
                      ? "text-slate-400 hover:bg-slate-900 hover:text-white"
                      : "text-slate-600 cursor-not-allowed opacity-40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`p-1 rounded-md shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"}`}>
                    <LinkIcon className="w-4 h-4" />
                  </span>
                  <span>{link.label}</span>
                </div>
                {!hasClearance && (
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Foot Profile Summary */}
        <div className="p-4 border-t border-slate-850 bg-slate-900/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-8.5 h-8.5 rounded-full object-cover border border-slate-705 shrink-0 bg-slate-700"
            />
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-slate-200 truncate leading-none mb-1">{user.name}</span>
              <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.2 select-none border rounded leading-tight ${badge.bg} ${badge.text} ${badge.border}`}>
                {user.role}
              </span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
            title="Disconnect portal"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </aside>

      {/* --- MOBILE NAVBAR --- */}
      <header className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-55">
        <Link to="/dashboard" className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-indigo-500" />
          <span className="font-display font-extrabold text-sm text-white">SmartHospital™</span>
        </Link>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-350"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile Nav Sidebar Expansion */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] bg-slate-950 z-50 p-6 flex flex-col justify-between overflow-y-auto animate-fade-in">
          <nav className="space-y-2">
            {MENU_LINKS.map((link) => {
              const hasClearance = link.roles.includes(user.role);
              const isActive = currentPath === link.to;
              const LinkIcon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={hasClearance ? link.to : "#"}
                  onClick={() => {
                    if (hasClearance) setMobileOpen(false);
                    else addToast(`Permissions restricted for your role (${user.role})`, "warning");
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs ${
                    isActive 
                      ? "bg-indigo-600 text-white" 
                      : hasClearance 
                        ? "text-slate-300 hover:bg-slate-900"
                        : "text-slate-600 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-850 flex items-center justify-between">
            <div className="flex gap-2">
              <img src={user.avatar} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <span className="text-xs font-bold block text-white">{user.name}</span>
                <span className="text-[9px] font-mono text-indigo-400">{user.role} Portal</span>
              </div>
            </div>
            <button onClick={() => { setMobileOpen(false); logout(); }} className="p-2 text-red-400 bg-red-500/10 rounded-xl text-xs font-bold leading-none">
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN FRAME WRAPPER --- */}
      <main className="flex-1 flex flex-col bg-slate-950 overflow-x-hidden min-h-screen">
        
        {/* Top Operational Status Ribbon */}
        <div className="hidden md:flex bg-slate-950 border-b border-slate-800/80 px-8 py-3.5 items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400">POSTGRES CORE: CONNECTED</span>
            </div>
            <div className="text-slate-600 font-mono text-[11px]">|</div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-slate-900 border border-slate-850 text-indigo-400 text-[10px] font-mono font-bold leading-none">MongoDB document store</span>
              <span className="text-[10px] font-mono tracking-wider text-slate-400">CLUSTER INTEGRATIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-indigo-400 font-bold bg-indigo-500/5 py-1 px-2 rounded border border-indigo-500/10">SAAS-STATION: HOSP-CLUST-X9</span>
          </div>
        </div>

        {/* Inner Context Stage */}
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {isAuthorized ? (
            children
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 max-w-lg mx-auto text-center space-y-6 shadow-2xl mt-10">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-display font-extrabold text-white">Security Bypass Intercepted</h2>
                <p className="text-xs text-slate-400">
                  Your current system security profile clearance level (<span className="text-indigo-400 font-bold font-mono text-[11.5px] uppercase bg-indigo-500/10 px-1.5 py-0.5 rounded">{user.role}</span>) is unauthorized to access files on route <span className="font-mono text-[11px] text-slate-200 bg-slate-950 p-1 rounded border border-slate-850">{currentPath}</span>.
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10.5px] text-slate-400 leading-relaxed text-left flex gap-2">
                <Terminal className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>To inspect all aspects of the application, you can switch your active identity to <strong>Admin</strong> utilizing the Profile menu parameters.</span>
              </div>
              <button 
                onClick={() => navigate("/dashboard")}
                className="w-full py-2 bg-indigo-600 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
              >
                Safe Fallback to Control Center
              </button>
            </div>
          )}
        </div>

      </main>

    </div>
  );
};
