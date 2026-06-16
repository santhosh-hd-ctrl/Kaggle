import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DashboardLayout } from "./components/DashboardLayout";

// Import pristine dynamic pages
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { PatientProfile } from "./pages/PatientProfile";
import { Doctors } from "./pages/Doctors";
import { DoctorProfile } from "./pages/DoctorProfile";
import { StaffDirectory } from "./pages/Staff";
import { StaffProfile } from "./pages/StaffProfile";
import { Appointments } from "./pages/Appointments";
import { MedicalRecords } from "./pages/MedicalRecords";
import { BillingLedger } from "./pages/Billing";
import { SystemSettings } from "./pages/Settings";
import { PharmacyInventory } from "./pages/Pharmacy";
import { LaboratoryWorkbench } from "./pages/Laboratory";
import { DeveloperBlueprints } from "./pages/DeveloperBlueprints";
import { MyDocuments } from "./pages/MyDocuments";

// Secure private route session verification
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 font-mono text-xs text-slate-500 animate-pulse">
        Polling clinic security clearance keys...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          {/* Public Access Control Gateway */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />

          {/* Secure Inpatient & Operations Hub */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Patients Module */}
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute>
                <Patients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:id" 
            element={
              <ProtectedRoute>
                <PatientProfile />
              </ProtectedRoute>
            } 
          />

          {/* Doctors Module */}
          <Route 
            path="/doctors" 
            element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctors/:id" 
            element={
              <ProtectedRoute>
                <DoctorProfile />
              </ProtectedRoute>
            } 
          />

          {/* Staff Module */}
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute>
                <StaffDirectory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/:id" 
            element={
              <ProtectedRoute>
                <StaffProfile />
              </ProtectedRoute>
            } 
          />

          {/* Appointments Module */}
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } 
          />

          {/* MongoDB BSON EHR Documents Module */}
          <Route 
            path="/medical-records" 
            element={
              <ProtectedRoute>
                <MedicalRecords />
              </ProtectedRoute>
            } 
          />

          {/* Secure Patient Portal My Documents Module */}
          <Route 
            path="/my-documents" 
            element={
              <ProtectedRoute>
                <MyDocuments />
              </ProtectedRoute>
            } 
          />

          {/* Invoicing Ledgers Module */}
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute>
                <BillingLedger />
              </ProtectedRoute>
            } 
          />

          {/* Apothecary Inventory Module */}
          <Route 
            path="/pharmacy" 
            element={
              <ProtectedRoute>
                <PharmacyInventory />
              </ProtectedRoute>
            } 
          />

          {/* Pathology Laboratory Module */}
          <Route 
            path="/laboratory" 
            element={
              <ProtectedRoute>
                <LaboratoryWorkbench />
              </ProtectedRoute>
            } 
          />

          {/* Developer Blueprints System Module */}
          <Route 
            path="/blueprints" 
            element={
              <ProtectedRoute>
                <DeveloperBlueprints />
              </ProtectedRoute>
            } 
          />

          {/* System Control Settings */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SystemSettings />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
