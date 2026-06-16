import React from "react";
import { BookOpen, KeyRound, Server, Code, Layers, ShieldCheck, Database, GitMerge, FileCode } from "lucide-react";

export const DeveloperBlueprints: React.FC = () => {
  return (
    <div className="space-y-6" id="developer-blueprints">
      
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Java Spring Boot &amp; Systems Architecture
        </h2>
        <p className="text-xs text-slate-400">Security Clearence specifications: Swagger REST specifications, PostgreSQL relational indices, and CI/CD pipelines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PostgreSQL Indexes & Spring Security */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display font-extrabold text-sm text-slate-200">Spring Security JWT Filters</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The multi-tenant auth layer intercepts API requests using custom <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">OncePerRequestFilter</code> beans, parsing authorization headers into standard decrypted <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">UsernamePasswordAuthenticationToken</code>.
          </p>

          <pre className="p-4 bg-slate-950 text-indigo-305 text-indigo-300 font-mono text-[10.5px] rounded-xl overflow-x-auto border border-slate-850 max-h-56">
{`@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtService jwtService;
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request, 
        HttpServletResponse response, 
        FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        // Validate Token details & load credentials...
    }
}`}
          </pre>
        </div>

        {/* PostgreSQL / Hibernate ORM indexes schemas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="font-display font-extrabold text-sm text-slate-200">PostgreSQL Relational Entities</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Relational tables leverage composite keys, lazy foreign fetch properties, and automatic database sequence generators mapped via standard Hibernate ORM schemas.
          </p>

          <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-[10.5px] rounded-xl overflow-x-auto border border-slate-850 max-h-56">
{`@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_apt_date", columnList = "appointment_date"),
    @Index(name = "idx_patient_role", columnList = "patient_id")
})
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(nullable = false)
    private LocalDateTime appointmentDate;
}`}
          </pre>
        </div>

        {/* MongoDB collections */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-purple-400" />
            <h3 className="font-display font-extrabold text-sm text-slate-200">MongoDB BSON Collections</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Inpatient documentation charts and binary imaging reports utilize a document scheme collection structure inside MongoDB Replica Shards.
          </p>

          <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-[10.5px] rounded-xl overflow-x-auto border border-slate-850 max-h-56">
{`@Document(collection = "ehr_reports")
public class MedicalReport {
    @Id
    private String id;
    
    @Field("patient_id")
    @Indexed
    private String patientId;
    
    private String diagnosticContent;
    
    private Map<String, Object> metaData;
}`}
          </pre>
        </div>

        {/* AWS / DevOps Docker config schemas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display font-extrabold text-sm text-slate-200">AWS DevOps Clusters</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-stage Docker containers coordinate across private subnet VPC lines using an Application Load Balancer and Kubernetes pod replication loops.
          </p>

          <pre className="p-4 bg-slate-950 text-indigo-305 text-indigo-300 font-mono text-[10.5px] rounded-xl overflow-x-auto border border-slate-850 max-h-56">
{`version: '3.8'
services:
  eureka-naming:
    image: smart_hosp/eureka:latest
    ports:
      - "8761:8761"
  gateway-api:
    image: smart_hosp/gateway:latest
    ports:
      - "8080:8080"
  patient-service:
    image: smart_hosp/patients:latest
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://rds-cluster:5432`}
          </pre>
        </div>

      </div>

    </div>
  );
};
