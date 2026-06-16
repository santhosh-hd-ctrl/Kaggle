import React, { useState } from "react";
import { 
  Network, Code, Database, Server, Terminal, Copy, Check, Info, Shield, 
  Settings, Layers, Cpu, Cloud, GitBranch, PlayCircle, Eye
} from "lucide-react";

export const ArchitectureSuite: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeArchSubTab, setActiveArchSubTab] = useState<"diagram" | "javaCode" | "database" | "devops" | "swagger">("diagram");

  const [simulatedEndpoint, setSimulatedEndpoint] = useState<string>("/api/v1/auth/login");
  const [simulatedPayload, setSimulatedPayload] = useState<string>(
    JSON.stringify({ email: "admin@smarthospital.com", password: "Password123" }, null, 2)
  );
  const [simulatedResponse, setSimulatedResponse] = useState<string>("// Send request to simulate Spring Boot JWT Auth return");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // 1. JAVA SPRING BOOT CONTROLLERS AND SERVICES
  const javaAuthController = `package com.smarthospital.auth.controller;

import com.smarthospital.auth.dto.AuthRequest;
import com.smarthospital.auth.dto.AuthResponse;
import com.smarthospital.auth.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Error: Invalid credentials");
        }

        final String token = jwtService.generateToken(request.getEmail(), "Admin");
        return ResponseEntity.ok(new AuthResponse(token, "Login success"));
    }
}`;

  const javaSecurityConfig = `package com.smarthospital.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/swagger-ui/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/doctor/**").hasRole("DOCTOR")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}`;

  const javaAppointmentService = `package com.smarthospital.appointment.service;

import com.smarthospital.appointment.entity.Appointment;
import com.smarthospital.appointment.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository repository;

    public AppointmentService(AppointmentRepository repository) {
        this.repository = repository;
    }

    public Appointment createAppointment(Appointment appointment) {
        // Enforce availability validation checks
        appointment.setStatus("REQUESTED");
        return repository.save(appointment);
    }

    public Appointment approveAppointment(Long id) {
        Appointment app = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        app.setStatus("APPROVED");
        return repository.save(app);
    }
}`;

  // 2. DATABASE DDL AND SCHEMAS
  const dbPostgreSql = `-- PostgreSQL DDL - Primary transactional relational schemas
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id)
);

CREATE TABLE patients (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    blood_group VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_blood ON patients(blood_group);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id),
    doctor_id VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'Requested'
);`;

  const dbMongoModel = `// MongoDB Document Model - EHR Lab Reports & Medical Records JSON structure
{
  "_id": "647de7bf3f345672abcd829a",
  "patientId": "PAT-001",
  "diagnosticHistory": [
    {
      "date": "2026-06-16T12:00:00Z",
      "symptoms": ["Chronic dry cough", "Asthma spasms"],
      "findings": "Inflamed bronchial tracts, decreased forced vital capacity.",
      "clinicalStage": "Asthma Stage III",
      "specialistCode": "DOC-004"
    }
  ],
  "labResults": [
    {
      "testCode": "ABG-99",
      "testName": "Arterial Blood Gas",
      "values": {
        "pO2": "82 mmHg",
        "pCO2": "44 mmHg"
      },
      "verifiedBy": "Roger Waters"
    }
  ]
}`;

  // 3. DEVOPS & CI-CD
  const rootDockerCompose = `# Multi-Service Orchestration Compose File
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    depends_on:
      - auth-service
      - patient-service

  auth-service:
    build: ./auth-service
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-db:5432/hospital_auth
      - SPRING_DATA_REDIS_HOST=cache-redis
    depends_on:
      - postgres-db
      - cache-redis

  postgres-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=hospital_auth
      - POSTGRES_PASSWORD=SecurePassword123
    volumes:
      - pgdata:/var/lib/postgresql/data

  cache-redis:
    image: redis:7-alpine
    command: redis-server --requirepass SecureRedisPass123

volumes:
  pgdata:`;

  const githubCiCd = `# GitHub Actions Enterprise Pipeline CI/CD yaml
name: Build and Deploy SmartHospital SaaS

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven

    - name: Build Java Spring Services with Maven
      run: |
        mvn clean package -DskipTests

    - name: Set up QEMU
      uses: docker/setup-qemu-action@v2

    - name: Log in to AWS Elastic Container Registry (ECR)
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push Docker cluster image
      run: |
        docker build -t \$ECR_REGISTRY/\$ECR_REPOSITORY:latest .
        docker push \$ECR_REGISTRY/\$ECR_REPOSITORY:latest`;

  // Swagger testing simulator
  const handleSimulateSwagger = () => {
    if (simulatedEndpoint === "/api/v1/auth/login") {
      setSimulatedResponse(JSON.stringify({
        status: "200 OK",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBzbWFydGhvc3BpdGFsLmNvbSIsImlhdCI6MTY4Njc1MjAwMCwiZXhwIjoxNjg2NzU1NjAwLCJyb2xlIjoiQWRtaW4ifQ...",
        user: { name: "Clinical System Admin", email: "admin@smarthospital.com", role: "Admin" },
        message: "JWT Token successfully generated."
      }, null, 2));
    } else if (simulatedEndpoint === "/api/v1/patients/PAT-001") {
      setSimulatedResponse(JSON.stringify({
        status: "200 OK",
        patientRecord: {
          id: "PAT-001",
          name: "Eleanor Vance",
          age: 34,
          primaryDiagnosis: "Moderate Bronchial Asthma",
          allergies: ["Penicillin"],
          restrictedClass: "SaaS HIPAA Restricted Record",
          cacheHits: "MISS (Database query standard runtime 12ms)"
        }
      }, null, 2));
    } else if (simulatedEndpoint === "/api/v1/appointments/book") {
      setSimulatedResponse(JSON.stringify({
        status: "201 Created",
        transactionId: `TXN-${Math.floor(Math.random() * 900000000)}`,
        appointmentCode: "APP-3904",
        message: "Appointment created successfully inside PostgreSQL core table. Notification queued.",
        notifRelaySent: true
      }, null, 2));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden" id="architecture-development-suite">
      
      {/* Dev Header Badge */}
      <div className="px-6 py-5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-2 bg-indigo-500 rounded text-indigo-500 tracking-wider inline-block bg-indigo-500/10 text-indigo-400">
            Developer Blueprint Suite
          </span>
          <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Spring Boot &amp; Microservices Architecture
          </h2>
          <p className="text-xs text-slate-400">Review exact backend Java blueprints, relational schemes, docker builds and Swagger APIs</p>
        </div>
        
        {/* Core Dev Selector sub tabs */}
        <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 gap-1 overflow-x-auto select-none font-mono text-[11px] font-bold">
          <button 
            onClick={() => setActiveArchSubTab("diagram")}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${activeArchSubTab === "diagram" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Structure Map
          </button>
          <button 
            onClick={() => setActiveArchSubTab("javaCode")}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${activeArchSubTab === "javaCode" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Spring Controller
          </button>
          <button 
            onClick={() => setActiveArchSubTab("database")}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${activeArchSubTab === "database" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Relational SQL
          </button>
          <button 
            onClick={() => setActiveArchSubTab("devops")}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${activeArchSubTab === "devops" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Docker &amp; CI/CD
          </button>
          <button 
            onClick={() => setActiveArchSubTab("swagger")}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${activeArchSubTab === "swagger" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Swagger APIs sandbox
          </button>
        </div>
      </div>

      <div className="p-6">
        
        {/* 1. VISUAL SYSTEM ARCHITECTURE MAP */}
        {activeArchSubTab === "diagram" && (
          <div className="space-y-6">
            
            {/* Explanatory Info Card */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs flex gap-3 text-indigo-950">
              <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong>Distributed System Overview &amp; Cloud Gateway Layer</strong>
                <p className="text-indigo-850 mt-1">
                  The SaaS platform operates over a high-performance Spring Cloud Gateway API Gateway that routes core JWT-authenticated clients. PostgreSQL acts as standard ACID-compliant relational tabular system for Auth &amp; Payments, MongoDB documents retain heavy patient diagnostic historical charts (EHRs/Reports JSON logs), and Redis intercepts hot queries for instant response values.
                </p>
              </div>
            </div>

            {/* Simulated Vector Graph representing the microservices architecture */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center">
              <div className="w-full max-w-2xl text-center space-y-4">
                
                {/* Layer 1: Client web apps representation */}
                <div className="p-3 bg-white border border-slate-300 shadow-sm rounded-xl font-bold font-mono text-xs text-slate-800">
                  ⚡ Premium React Client Dashboard (Fidelity UI) IP: 104.24.12.18
                </div>

                <div className="text-slate-400 text-xs">⬇ HTTPS Client SSL requests</div>

                {/* Layer 2: API Gateway */}
                <div className="p-3 bg-slate-900 text-indigo-400 border border-indigo-500/30 rounded-xl font-bold font-mono text-xs shadow">
                  ⚓ API Gateway Layer (Spring Cloud Gateway, Port: 8080)
                </div>

                <span className="text-slate-400 text-xs">⬇ Secure Triage JWT Filter and Routing Match</span>

                {/* Layer 3: Services */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs flex flex-col justify-between">
                    <strong className="text-indigo-950 font-mono">🔒 Auth Service</strong>
                    <span className="text-[10px] text-slate-500 mt-1">JWT Issuing &amp; Password Cryptography</span>
                  </div>
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs flex flex-col justify-between">
                    <strong className="text-sky-950 font-mono">🩺 Operational Services</strong>
                    <span className="text-[10px] text-slate-500 mt-1">Patients, Scheduling &amp; EMR Core</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs flex flex-col justify-between">
                    <strong className="text-amber-950 font-mono">💰 Billing &amp; Pharmacy</strong>
                    <span className="text-[10px] text-slate-500 mt-1">Payments, Accounting Ledger &amp; Stock</span>
                  </div>
                </div>

                <span className="text-slate-400 text-xs text-center block">⬇ Distributed persistence adapters</span>

                {/* Layer 4: Multi database layer */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-center text-xs">
                    <Database className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
                    <strong className="font-mono block text-[11px] text-slate-700">PostgreSQL</strong>
                    <span className="text-[9.5px] text-slate-500">Relational Users &amp; Accounting</span>
                  </div>
                  <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-center text-xs">
                    <Server className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                    <strong className="font-mono block text-[11px] text-slate-700">MongoDB</strong>
                    <span className="text-[9.5px] text-slate-500">Unstructured EMR Documents</span>
                  </div>
                  <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-center text-xs">
                    <Cpu className="w-5 h-5 mx-auto text-rose-600 mb-1" />
                    <strong className="font-mono block text-[11px] text-slate-700">Redis Cache</strong>
                    <span className="text-[9.5px] text-slate-500">Hot medical sessions cache</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 2. JAVA SPRING BOOT BLUEPRINTS */}
        {activeArchSubTab === "javaCode" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-slate-800">Spring Boot Enterprise Class Blueprints</h3>
            
            {/* File 1: AuthController.java */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 py-1 px-3 rounded-md border border-slate-250">
                  AuthController.java
                </span>
                <button
                  onClick={() => copyToClipboard(javaAuthController, "auth")}
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied === "auth" ? <span className="text-emerald-600">✓ Copied</span> : "Copy Blueprint"}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[10.5px] rounded-lg overflow-x-auto border border-slate-800 leading-relaxed max-h-[300px] overflow-y-auto">
                {javaAuthController}
              </pre>
            </div>

            {/* File 2: SecurityConfig.java */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 py-1 px-3 rounded-md border border-slate-250">
                  SecurityConfig.java
                </span>
                <button
                  onClick={() => copyToClipboard(javaSecurityConfig, "security")}
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied === "security" ? <span className="text-emerald-600">✓ Copied</span> : "Copy Blueprint"}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[10.5px] rounded-lg overflow-x-auto border border-slate-800 leading-relaxed max-h-[260px] overflow-y-auto">
                {javaSecurityConfig}
              </pre>
            </div>

            {/* File 3: AppointmentService.java */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 py-1 px-3 rounded-md border border-slate-250">
                  AppointmentService.java
                </span>
                <button
                  onClick={() => copyToClipboard(javaAppointmentService, "appointment")}
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied === "appointment" ? <span className="text-emerald-600">✓ Copied</span> : "Copy Blueprint"}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[10.5px] rounded-lg overflow-x-auto border border-slate-800 leading-relaxed max-h-[260px] overflow-y-auto">
                {javaAppointmentService}
              </pre>
            </div>

          </div>
        )}

        {/* 3. RELATIONAL SQL SCHEMAS AND DATABASE DESIGN */}
        {activeArchSubTab === "database" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-slate-800">Dual Database Persistence Configuration</h3>
            
            {/* SQL DDL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">PostgreSQL core DDL statement schema rules</h4>
                  <p className="text-[10px] text-slate-400">Stores ACID transactional schedules, auth user records and clinical inventories</p>
                </div>
                <button
                  onClick={() => copyToClipboard(dbPostgreSql, "postgres")}
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 rounded cursor-pointer"
                >
                  {copied === "postgres" ? "✓ Copied" : "Copy DDL"}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-sky-400 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800 leading-relaxed max-h-[300px] overflow-y-auto">
                {dbPostgreSql}
              </pre>
            </div>

            {/* MongoDB EHR Document Mock JSON format */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">MongoDB Diagnostic Document format</h4>
                  <p className="text-[10px] text-slate-400">Accommodates unstructured patient diagnostic summaries, lab files and test logs</p>
                </div>
                <button
                  onClick={() => copyToClipboard(dbMongoModel, "mongo")}
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 rounded cursor-pointer"
                >
                  {copied === "mongo" ? "✓ Copied" : "Copy Document Schema"}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-sky-400 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800 leading-relaxed">
                {dbMongoModel}
              </pre>
            </div>

          </div>
        )}

        {/* 4. DEVOPS AND CI-CD pipelines */}
        {activeArchSubTab === "devops" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-slate-800">Docker orchestrations and Automated GitHub Actions pipelines</h3>
            
            {/* Docker Compose YAML config */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 py-1 px-3 rounded-md">
                  docker-compose.yml
                </span>
                <button
                  onClick={() => copyToClipboard(rootDockerCompose, "docker")}
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 rounded cursor-pointer"
                >
                  {copied === "docker" ? "✓ Copied" : "Copy Compose Setup"}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-indigo-300 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800 leading-relaxed max-h-[300px] overflow-y-auto">
                {rootDockerCompose}
              </pre>
            </div>

            {/* GitHub action workflow */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 py-1 px-3 rounded-md">
                  deploy-pipeline.yml
                </span>
                <button
                  onClick={() => copyToClipboard(githubCiCd, "githubcd")}
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 rounded cursor-pointer"
                >
                  {copied === "githubcd" ? "✓ Copied" : "Copy deployment actions"}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-indigo-300 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800 leading-relaxed max-h-[300px] overflow-y-auto">
                {githubCiCd}
              </pre>
            </div>

          </div>
        )}

        {/* 5. SWAGGER API TESTING API SANDBOX */}
        {activeArchSubTab === "swagger" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-800">Swagger API Endpoint Response Sandbox</h3>
              <p className="text-xs text-slate-550">Simulate backend endpoint executions securely within this local workspace environment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4 bg-slate-50 p-4 border border-slate-250/60 rounded-xl">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">TARGET API PATHWAY</label>
                  <select
                    value={simulatedEndpoint}
                    onChange={(e) => {
                      setSimulatedEndpoint(e.target.value);
                      if (e.target.value === "/api/v1/auth/login") {
                        setSimulatedPayload(JSON.stringify({ email: "admin@smarthospital.com", password: "Password123" }, null, 2));
                      } else if (e.target.value === "/api/v1/patients/PAT-001") {
                        setSimulatedPayload("// GET method takes empty payload body");
                      } else if (e.target.value === "/api/v1/appointments/book") {
                        setSimulatedPayload(JSON.stringify({ patientId: "PAT-001", doctorId: "DOC-004", symptoms: "Breathlessness spasms" }, null, 2));
                      }
                    }}
                    className="w-full text-xs font-mono border border-slate-300 bg-white rounded px-2.5 py-2 focus:outline-none"
                  >
                    <option value="/api/v1/auth/login">POST /api/v1/auth/login (JWT Issuer)</option>
                    <option value="/api/v1/patients/PAT-001">GET /api/v1/patients/PAT-001 (Patient File)</option>
                    <option value="/api/v1/appointments/book">POST /api/v1/appointments/book (Schedule Reservation)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">REQUEST BODY (PAYLOAD)</label>
                  <textarea
                    value={simulatedPayload}
                    onChange={(e) => setSimulatedPayload(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded px-2.5 py-2 focus:outline-none h-34 bg-white"
                  />
                </div>

                <button
                  onClick={handleSimulateSwagger}
                  className="w-full py-2 bg-slate-900 border hover:bg-slate-800 text-white text-xs font-mono font-bold rounded shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-emerald-400" />
                  Simulate API Request Call
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">HTTP RESPONSE HEADERS &amp; RESULT RECOVERY</span>
                <pre className="p-4 bg-slate-950 text-indigo-400 font-mono text-xs rounded-xl overflow-x-auto min-h-[220px] max-h-[300px] overflow-y-auto leading-relaxed border border-slate-900">
                  {simulatedResponse}
                </pre>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
