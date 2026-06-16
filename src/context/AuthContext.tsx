import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, UserRole } from "../types/hospital";
import { dbService, simpleHash } from "../services/db";

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, passwordHash: string, role: UserRole) => Promise<AuthUser>;
  verifyRegistration: (userId: string) => Promise<void>;
  assignUserRole: (userId: string, role: UserRole) => Promise<void>;
  logout: () => void;
  toasts: ToastProps[];
  addToast: (message: string, type?: ToastProps["type"]) => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Show dynamic toast helper
  const addToast = (message: string, type: ToastProps["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const cached = localStorage.getItem("smarthosp_session");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AuthUser;
        // Verify current live object from dbService in case role was updated
        const currentUsers = dbService.getUsers();
        const liveUser = currentUsers.find(u => u.id === parsed.id);
        if (liveUser) {
          setUser(liveUser);
        } else {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem("smarthosp_session");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const hash = simpleHash(password);
    const users = dbService.getUsers();
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (matched && matched.passwordHash === hash) {
      if (!matched.verified) {
        addToast("This account is pending security dispatch verification code.", "warning");
        // We will still set user but login route handles verification state
      }
      setUser(matched);
      localStorage.setItem("smarthosp_session", JSON.stringify(matched));
      dbService.logAction(matched.id, matched.name, matched.role, "SIGN_IN", "Employee logged in securely");
      addToast(`Welcome back, ${matched.name}! Authenticated as ${matched.role}.`, "success");
      return true;
    }
    
    addToast("Mismatching login email or secure password credentials.", "error");
    return false;
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<AuthUser> => {
    const users = dbService.getUsers();
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      addToast("A medical registration profile already exists with this email address.", "error");
      throw new Error("Registration profile exists");
    }

    const hash = simpleHash(password);
    const newId = "USR-00" + (users.length + 1);
    
    // Default system: Admin is verified instantly; other roles go through Authentication Verification
    const isVerifiedDefault = (role === "Admin");

    const newUser: AuthUser = {
      id: newId,
      name,
      email,
      passwordHash: hash,
      role: role,
      verified: isVerifiedDefault,
      avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? "1534528741775-53994a69daeb" : "1539571696357-5a69c17a67c6"}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`,
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [...users, newUser];
    dbService.saveUsers(updated);
    dbService.logAction(newUser.id, newUser.name, newUser.role, "SIGN_UP", `SaaS Registration created. Verification status: ${newUser.verified}`);

    return newUser;
  };

  const verifyRegistration = async (userId: string): Promise<void> => {
    const users = dbService.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, verified: true } : u);
    dbService.saveUsers(updated);
    
    // If active session matches, sync
    if (user && user.id === userId) {
      const active = { ...user, verified: true };
      setUser(active);
      localStorage.setItem("smarthosp_session", JSON.stringify(active));
    }
    
    dbService.logAction(userId, user?.name || "System", user?.role || "Guest", "AUTH_VERIFIED", "Authentication credentials verified manually");
    addToast("Identity verified. Security system clearances configured successfully.", "success");
  };

  const assignUserRole = async (userId: string, role: UserRole): Promise<void> => {
    const users = dbService.getUsers();
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updated = users.map(u => u.id === userId ? { ...u, role } : u);
    dbService.saveUsers(updated);

    if (user && user.id === userId) {
      const active = { ...user, role };
      setUser(active);
      localStorage.setItem("smarthosp_session", JSON.stringify(active));
    }

    dbService.logAction(user?.id || "System", user?.name || "Admin Manager", user?.role || "Admin", "ROLE_ASSIGNMENT", `Updated system roles of user ${targetUser.name} to ${role}`);
    addToast(`Role adjusted successfully to ${role}.`, "success");
  };

  const logout = () => {
    if (user) {
      dbService.logAction(user.id, user.name, user.role, "SIGN_OUT", "User closed connection session");
    }
    setUser(null);
    localStorage.removeItem("smarthosp_session");
    addToast("Secure connection closed.", "info");
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, register, verifyRegistration, assignUserRole, logout, 
      toasts, addToast, removeToast 
    }}>
      {children}
      
      {/* Toast Alert Portal Interface */}
      <div className="fixed bottom-5 right-5 z-80 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg transition-all transform animate-slide-in ${
              toast.type === "success" ? "bg-emerald-55 bg-emerald-50 text-emerald-900 border-emerald-250" :
              toast.type === "error" ? "bg-rose-55 bg-rose-50 text-rose-900 border-rose-250" :
              toast.type === "warning" ? "bg-amber-55 bg-amber-50 text-amber-900 border-amber-250" :
              "bg-indigo-55 bg-indigo-50 text-indigo-900 border-indigo-250"
            }`}
          >
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-900 font-bold text-xs select-none"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be invoked inside AuthProvider");
  return context;
};
