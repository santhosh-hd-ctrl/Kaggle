import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/hospital";
import { 
  HeartPulse, Shield, Mail, Lock, UserPlus, KeyRound, Sparkles, 
  Terminal, ShieldCheck, CheckCircle, RefreshCw
} from "lucide-react";

export const Login: React.FC = () => {
  const { login, register, verifyRegistration, addToast } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("Patient");

  // Verification Step States
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationUserId, setVerificationUserId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [simulatedCode, setSimulatedCode] = useState("");
  const [isVerifyingState, setIsVerifyingState] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Both login identifier email and passcode credentials are required.", "warning");
      return;
    }
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      addToast("All registrations fields are required to allocate clinician identities.", "warning");
      return;
    }
    try {
      const newUser = await register(regName, regEmail, regPassword, regRole);
      setVerificationUserId(newUser.id);
      
      if (regRole === "Admin") {
        addToast("Admins bypass verification. Accessing credentials instantly.", "success");
        await login(regEmail, regPassword);
        navigate("/dashboard");
      } else {
        // Trigger verification simulation code
        const codeNum = Math.floor(Math.random() * 9000 + 1000).toString();
        setSimulatedCode(codeNum);
        setVerificationPending(true);
        addToast(`Security OTP generated: ${codeNum}. Complete identity authentication verification.`, "info");
      }
    } catch {
      // Handled by AuthContext toasts
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === simulatedCode) {
      setIsVerifyingState(true);
      setTimeout(async () => {
        await verifyRegistration(verificationUserId);
        setIsVerifyingState(false);
        setVerificationPending(false);
        addToast("Verification verified in our HIPAA core registers.", "success");
        
        // Log in
        await login(isRegistering ? regEmail : email, isRegistering ? regPassword : password);
        navigate("/dashboard");
      }, 1500);
    } else {
      addToast("Invalid authorization token bypass key. Please review active logs.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 antialiased selection:bg-indigo-500 font-sans" id="saas-login-view">
      
      {/* Background radial atmosphere */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-550/10 to-transparent pointer-events-none filter blur-2xl opacity-50" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden space-y-6">
        
        {/* Verification sub step */}
        {verificationPending ? (
          <div className="space-y-6 text-center" id="verification-card">
            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Identity Verification Clearances</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter the system security authorization token code generated in the operational logs to link profile <span className="text-indigo-400 font-mono">({verificationUserId})</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Enter dynamic OTP (Code: in system message)"
                  maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-center text-lg font-mono tracking-widest uppercase"
                />
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-left text-[11px] font-mono leading-relaxed space-y-1 text-slate-400">
                <span className="text-indigo-400 font-bold block mb-1">📟 CLINICAL DISPATCH FEED:</span>
                <p>SIMULATED SECURITY COMPILER SECURE RELAY:</p>
                <p>Your authentication code path bypass OTP is: <span className="font-extrabold text-white text-xs bg-indigo-600/35 px-1.5 py-0.5 rounded tracking-wide">{simulatedCode}</span></p>
              </div>

              <button
                type="submit"
                disabled={isVerifyingState}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifyingState ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-300" />
                    Checking registers...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5 text-indigo-300" />
                    Verify &amp; Activate License
                  </>
                )}
              </button>
            </form>

            <button 
              onClick={() => { setVerificationPending(false); addToast("Identity session abandoned.", "info"); }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel &amp; Sign in instead
            </button>
          </div>
        ) : (
          /* Main Form Block */
          <div className="space-y-6">
            
            {/* Form Title & Logo */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight text-white leading-none">
                SmartHospital Core™
              </h1>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Secure clinical login framework. PostgreSQL ACID transactional models &amp; MongoDB documents analyzer.
              </p>
            </div>

            <div className="flex border-b border-slate-800 p-0.5 bg-slate-950 rounded-xl">
              <button 
                onClick={() => setIsRegistering(false)} 
                className={`w-1/2 py-2 text-xs font-bold rounded-lg cursor-pointer ${!isRegistering ? "bg-slate-900 text-white shadow-sm" : "text-slate-400"}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsRegistering(true)} 
                className={`w-1/2 py-2 text-xs font-bold rounded-lg cursor-pointer ${isRegistering ? "bg-slate-900 text-white shadow-sm" : "text-slate-400"}`}
              >
                Register
              </button>
            </div>

            {/* --- SIGN IN FORM --- */}
            {!isRegistering ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase block">USER RECOGNIZER IDENTIFIER</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input 
                      type="email" 
                      placeholder="e.g. admin@smarthospital.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase block">PASSWORD KEY</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  Request HIPAA Authorization Credentials
                </button>
              </form>
            ) : (
              /* --- REGISTRATION FORM --- */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase block">COMPREHENSIVE NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Richard Hendricks"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-650 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase block">EMAIL REGISTRY</label>
                  <input 
                    type="email" 
                    placeholder="e.g. richard@hooli.net"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-650 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase block">SECURITY PASSCODE</label>
                  <input 
                    type="password" 
                    placeholder="Allocate strong passcode..."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-650 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase block">SYSTEM ASSIGNED ROLE</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 text-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    <option value="Admin">System Administrator (Admin)</option>
                    <option value="Doctor">Clinic Consultant Doctor</option>
                    <option value="Staff">Operations Management Staff</option>
                    <option value="Patient">Standard Managed Patient</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Initiate System Verification Enrollment
                </button>
              </form>
            )}

            {/* Quick Helper Panel */}
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] text-slate-500 space-y-1.5 font-mono">
              <span className="text-slate-400 font-extrabold block">🔑 SEED CREDENTIALS ON DEVICE:</span>
              <p>• Admin: <span className="text-white hover:underline cursor-pointer" onClick={() => { setEmail("admin@smarthospital.com"); setPassword("Password123"); setIsRegistering(false); }}>admin@smarthospital.com</span> (Pass: Password123)</p>
              <p>• Doctor: <span className="text-white hover:underline cursor-pointer" onClick={() => { setEmail("doctor@smarthospital.com"); setPassword("Password123"); setIsRegistering(false); }}>doctor@smarthospital.com</span> (Pass: Password123)</p>
              <p>• Staff: <span className="text-white hover:underline cursor-pointer" onClick={() => { setEmail("staff@smarthospital.com"); setPassword("Password123"); setIsRegistering(false); }}>staff@smarthospital.com</span> (Pass: Password123)</p>
              <p>• Patient: <span className="text-white hover:underline cursor-pointer" onClick={() => { setEmail("patient@smarthospital.com"); setPassword("Password123"); setIsRegistering(false); }}>patient@smarthospital.com</span> (Pass: Password123)</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
