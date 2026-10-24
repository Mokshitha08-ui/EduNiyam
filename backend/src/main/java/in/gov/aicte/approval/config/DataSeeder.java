package in.gov.aicte.approval.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import in.gov.aicte.approval.application.entity.*;
import in.gov.aicte.approval.application.repository.*;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.compliance.entity.ComplianceItem;
import in.gov.aicte.approval.compliance.repository.ComplianceItemRepository;
import in.gov.aicte.approval.evc.entity.EvcMember;
import in.gov.aicte.approval.evc.entity.EvcSchedule;
import in.gov.aicte.approval.evc.repository.EvcMemberRepository;
import in.gov.aicte.approval.evc.repository.EvcScheduleRepository;
import in.gov.aicte.approval.institution.entity.Institution;
import in.gov.aicte.approval.institution.repository.InstitutionRepository;
import in.gov.aicte.approval.notification.entity.Escalation;
import in.gov.aicte.approval.notification.entity.Notification;
import in.gov.aicte.approval.notification.repository.EscalationRepository;
import in.gov.aicte.approval.notification.repository.NotificationRepository;
import in.gov.aicte.approval.user.entity.User;
import in.gov.aicte.approval.user.repository.UserRepository;
import in.gov.aicte.approval.workflow.entity.WorkflowDefinition;
import in.gov.aicte.approval.workflow.entity.WorkflowStage;
import in.gov.aicte.approval.workflow.repository.WorkflowDefinitionRepository;
import in.gov.aicte.approval.workflow.repository.WorkflowStageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);


    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final WorkflowDefinitionRepository workflowRepository;
    private final WorkflowStageRepository stageRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStageHistoryRepository stageHistoryRepository;
    private final ObservationRepository observationRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final RequestedIntakeRepository intakeRepository;
    private final EvcScheduleRepository evcRepository;
    private final EvcMemberRepository evcMemberRepository;
    private final ComplianceItemRepository complianceRepository;
    private final NotificationRepository notificationRepository;
    private final EscalationRepository escalationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, InstitutionRepository institutionRepository, WorkflowDefinitionRepository workflowRepository, WorkflowStageRepository stageRepository, ApplicationRepository applicationRepository, ApplicationStageHistoryRepository stageHistoryRepository, ObservationRepository observationRepository, ApplicationDocumentRepository documentRepository, RequestedIntakeRepository intakeRepository, EvcScheduleRepository evcRepository, EvcMemberRepository evcMemberRepository, ComplianceItemRepository complianceRepository, NotificationRepository notificationRepository, EscalationRepository escalationRepository, AuditLogRepository auditLogRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.workflowRepository = workflowRepository;
        this.stageRepository = stageRepository;
        this.applicationRepository = applicationRepository;
        this.stageHistoryRepository = stageHistoryRepository;
        this.observationRepository = observationRepository;
        this.documentRepository = documentRepository;
        this.intakeRepository = intakeRepository;
        this.evcRepository = evcRepository;
        this.evcMemberRepository = evcMemberRepository;
        this.complianceRepository = complianceRepository;
        this.notificationRepository = notificationRepository;
        this.escalationRepository = escalationRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @Value("${app.seed-data.enabled:true}")
    private boolean seedDataEnabled;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialData() {
        if (!seedDataEnabled) {
            log.info("Data seeding is disabled.");
            return;
        }

        if (userRepository.count() > 0) {
            log.info("Database already contains data. Skipping initial seeding.");
            return;
        }

        log.info("Seeding initial AICTE Approval Management System dataset into PostgreSQL...");

        seedUsers();
        seedInstitutions();
        seedWorkflows();
        seedApplications();
        seedEvcSchedules();
        seedCompliance();
        seedNotifications();
        seedEscalations();
        seedAuditLogs();

        log.info("Database seeding completed successfully.");
    }

    private void seedUsers() {
        String encodedPass = passwordEncoder.encode("demoPassword123");

        List<User> users = List.of(
                User.builder()
                        .id("USR-001")
                        .name("Shri Vikramaditya Rao")
                        .email("admin@demo.gov.in")
                        .passwordHash(encodedPass)
                        .role("ADMIN")
                        .department("National Informatics & AICTE HQ")
                        .region("All Regions (National HQ)")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&fit=crop&q=80")
                        .phone("+91 11 2958 1001")
                        .lastLogin("2026-10-24 10:15 AM")
                        .build(),
                User.builder()
                        .id("USR-002")
                        .name("Dr. Suresh Kumar Nair")
                        .email("officer@demo.gov.in")
                        .passwordHash(encodedPass)
                        .role("REGIONAL_OFFICER")
                        .department("Regional Approval & Scrutiny")
                        .region("South-Western (Bangalore)")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&fit=crop&q=80")
                        .phone("+91 80 2235 4410")
                        .lastLogin("2026-10-24 09:30 AM")
                        .build(),
                User.builder()
                        .id("USR-003")
                        .name("Dr. Rajesh Sharma")
                        .email("bureau@demo.gov.in")
                        .passwordHash(encodedPass)
                        .role("BUREAU_OFFICER")
                        .department("Policy & Institutional Approvals Bureau")
                        .region("HQ New Delhi")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&fit=crop&q=80")
                        .phone("+91 11 2958 1205")
                        .lastLogin("2026-10-23 04:45 PM")
                        .build(),
                User.builder()
                        .id("USR-004")
                        .name("Prof. (Dr.) Ananya Sen")
                        .email("committee@demo.gov.in")
                        .passwordHash(encodedPass)
                        .role("EVC_MEMBER")
                        .department("Expert Visit & Physical Inspection Panel")
                        .region("National Pool (Southern/Eastern)")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&fit=crop&q=80")
                        .phone("+91 94330 18273")
                        .lastLogin("2026-10-24 11:00 AM")
                        .build(),
                User.builder()
                        .id("USR-005")
                        .name("Smt. Priya Varma")
                        .email("compliance@demo.gov.in")
                        .passwordHash(encodedPass)
                        .role("COMPLIANCE_REVIEWER")
                        .department("Legal Compliance & Document Verification Cell")
                        .region("HQ New Delhi")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&fit=crop&q=80")
                        .phone("+91 11 2958 1340")
                        .lastLogin("2026-10-24 08:50 AM")
                        .build(),
                User.builder()
                        .id("USR-006")
                        .name("Dr. R. Ramanathan")
                        .email("college@demo.edu.in")
                        .passwordHash(encodedPass)
                        .role("COLLEGE_REP")
                        .department("Institutional Administration")
                        .region("South-Western (Bangalore)")
                        .institutionName("Vivekananda Institute of Technology, Bangalore")
                        .institutionCode("1-34981275")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&fit=crop&q=80")
                        .phone("+91 98450 71829")
                        .lastLogin("2026-10-24 12:10 PM")
                        .build()
        );

        userRepository.saveAll(users);
    }

    private void seedInstitutions() {
        List<Institution> insts = List.of(
                Institution.builder().code("1-34981275").name("Vivekananda Institute of Technology, Bangalore").region("South-Western").state("Karnataka").address("Kumbalgodu, Kengeri, Bengaluru, Karnataka 560074").contactEmail("principal@vitb.ac.in").contactPhone("+91 80 2843 7696").build(),
                Institution.builder().code("1-10492811").name("Maharashtra Institute of Technology & Engineering, Pune").region("Western").state("Maharashtra").address("Paud Road, Kothrud, Pune, Maharashtra 411038").contactEmail("director@miteng.edu.in").contactPhone("+91 20 3027 3400").build(),
                Institution.builder().code("1-29401928").name("Coimbatore Institute of Engineering & Technology, Coimbatore").region("Southern").state("Tamil Nadu").address("Narasipuram, Coimbatore, Tamil Nadu 641109").contactEmail("office@ciet.edu.in").contactPhone("+91 422 297 0701").build(),
                Institution.builder().code("1-84019231").name("Delhi Technological & Management Institute, New Delhi").region("Northern").state("Delhi NCR").address("Plot 12, Institutional Area, Dwarka, New Delhi 110075").contactEmail("registrar@dtmi.edu.in").contactPhone("+91 11 4500 2300").build(),
                Institution.builder().code("1-51209384").name("Heritage College of Technology, Kolkata").region("Eastern").state("West Bengal").address("Chowbaga Road, Anandapur, Kolkata, West Bengal 700107").contactEmail("principal@heritageit.edu").contactPhone("+91 33 6627 0600").build(),
                Institution.builder().code("1-93041920").name("Bhopal National Institute of Applied Sciences, Bhopal").region("Central").state("Madhya Pradesh").address("Airport Bypass Road, Gandhi Nagar, Bhopal, MP 462036").contactEmail("admissions@bnias.ac.in").contactPhone("+91 755 273 5400").build()
        );
        institutionRepository.saveAll(insts);
    }

    private void seedWorkflows() {
        WorkflowDefinition wfFull = WorkflowDefinition.builder()
                .id("WF-FULL")
                .name("Scrutiny + EVC + SAC/SHC (Comprehensive Pathway)")
                .code("SCRUTINY_EVC_SAC_SHC")
                .description("Applicable for New Institution, Increase in Intake, or Significant Change in Site")
                .version("2026.2.1")
                .effectiveDate(LocalDate.of(2026, 4, 1))
                .isDefault(true)
                .rulesJson("{\"allowReturnForDeficiency\":true,\"maxDeficiencyCycles\":3,\"deficiencyResolutionDays\":7,\"escalationThresholdDays\":14}")
                .build();
        workflowRepository.save(wfFull);

        List<WorkflowStage> stagesFull = List.of(
                WorkflowStage.builder().id("STG-01-F").workflow(wfFull).name("Application Submission").code("SUBMISSION").stageOrder(1).targetDays(3).roleAllowed("COLLEGE_REP").build(),
                WorkflowStage.builder().id("STG-02-F").workflow(wfFull).name("Document Scrutiny").code("SCRUTINY").stageOrder(2).targetDays(7).roleAllowed("REGIONAL_OFFICER").build(),
                WorkflowStage.builder().id("STG-03-F").workflow(wfFull).name("EVC Physical Inspection").code("EVC").stageOrder(3).targetDays(10).roleAllowed("EVC_MEMBER").build(),
                WorkflowStage.builder().id("STG-04-F").workflow(wfFull).name("SAC / SHC Hearing Committee").code("SAC_SHC").stageOrder(4).targetDays(5).roleAllowed("BUREAU_OFFICER").build(),
                WorkflowStage.builder().id("STG-05-F").workflow(wfFull).name("Executive Council Final Decision").code("FINAL_APPROVAL").stageOrder(5).targetDays(5).roleAllowed("ADMIN").build()
        );
        stageRepository.saveAll(stagesFull);

        WorkflowDefinition wfScrutinyEvc = WorkflowDefinition.builder()
                .id("WF-SCRUTINY-EVC")
                .name("Scrutiny + EVC (Standard Pathway)")
                .code("SCRUTINY_EVC")
                .description("Applicable for Introduction of New Technical Courses or Additional Divisions")
                .version("2026.1.4")
                .effectiveDate(LocalDate.of(2026, 4, 1))
                .isDefault(false)
                .rulesJson("{\"allowReturnForDeficiency\":true,\"maxDeficiencyCycles\":2,\"deficiencyResolutionDays\":7,\"escalationThresholdDays\":12}")
                .build();
        workflowRepository.save(wfScrutinyEvc);

        WorkflowDefinition wfOnlyScrutiny = WorkflowDefinition.builder()
                .id("WF-ONLY-SCRUTINY")
                .name("Only Scrutiny (Fast-Track EoA)")
                .code("ONLY_SCRUTINY")
                .description("Routine Extension of Approval (EoA) without intake variations or compliance infringements")
                .version("2026.1.0")
                .effectiveDate(LocalDate.of(2026, 1, 15))
                .isDefault(false)
                .rulesJson("{\"allowReturnForDeficiency\":true,\"maxDeficiencyCycles\":1,\"deficiencyResolutionDays\":5,\"escalationThresholdDays\":10}")
                .build();
        workflowRepository.save(wfOnlyScrutiny);
    }

    private void seedApplications() {
        // App 1: Vivekananda Institute of Technology
        Application app1 = Application.builder()
                .id("AICTE-2026-SW-8901")
                .institutionName("Vivekananda Institute of Technology, Bangalore")
                .institutionCode("1-34981275")
                .applicationType("Increase in Intake / New Course")
                .programme("Engineering & Technology (UG & PG)")
                .region("South-Western")
                .state("Karnataka")
                .workflowId("WF-FULL")
                .currentStage("SCRUTINY")
                .status("DEFICIENCY_NOTIFIED")
                .priority("HIGH")
                .assignedOfficer("Dr. Suresh Kumar Nair")
                .officerRole("Regional Officer")
                .submissionDate(LocalDate.of(2026, 10, 5))
                .stageStartDate(LocalDate.of(2026, 10, 14))
                .nextDeadline(LocalDate.of(2026, 10, 26))
                .deficiencyCount(1)
                .missingDocCount(1)
                .deficiencyReason("Land Lease Deed registered validity document missing Annexure IV endorsement; FDR lien letter pending renewal.")
                .build();
        applicationRepository.save(app1);

        stageHistoryRepository.saveAll(List.of(
                ApplicationStageHistory.builder().application(app1).stage("Application Submission").status("COMPLETED").date(LocalDate.of(2026, 10, 5)).note("Submitted online via institutional portal by Principal").build(),
                ApplicationStageHistory.builder().application(app1).stage("Fee Verification").status("COMPLETED").date(LocalDate.of(2026, 10, 6)).note("Scrutiny fee ₹1,50,000 received via Bharatkosh").build(),
                ApplicationStageHistory.builder().application(app1).stage("Document Scrutiny").status("IN_PROGRESS").date(LocalDate.of(2026, 10, 18)).note("Deficiency letter issued; College response awaited").build()
        ));

        observationRepository.save(Observation.builder()
                .id("OBS-101")
                .application(app1)
                .date(LocalDate.of(2026, 10, 18))
                .officer("Dr. Suresh Kumar Nair")
                .stage("SCRUTINY")
                .status("DEFICIENT")
                .remarks("Land lease deed submitted does not show municipal boundary survey verification map. Registered deed is valid, but encumbrance certificate of last 30 years is required.")
                .build());

        documentRepository.saveAll(List.of(
                ApplicationDocument.builder().id("DOC-101").application(app1).title("Land Registered Lease Deed (30 Years)").type("PDF").size("4.2 MB").status("ACTION_REQUIRED").uploadDate(LocalDate.of(2026, 10, 5)).build(),
                ApplicationDocument.builder().id("DOC-102").application(app1).title("Fire Safety Certificate by State Fire Service").type("PDF").size("1.8 MB").status("VERIFIED").uploadDate(LocalDate.of(2026, 10, 5)).build(),
                ApplicationDocument.builder().id("DOC-103").application(app1).title("Architect Completion & Barrier-Free Certificate").type("PDF").size("3.1 MB").status("VERIFIED").uploadDate(LocalDate.of(2026, 10, 5)).build(),
                ApplicationDocument.builder().id("DOC-104").application(app1).title("AICTE Prescribed Undertaking on Anti-Ragging").type("PDF").size("820 KB").status("VERIFIED").uploadDate(LocalDate.of(2026, 10, 6)).build()
        ));

        intakeRepository.saveAll(List.of(
                RequestedIntake.builder().application(app1).course("B.Tech in Artificial Intelligence & Data Science").currentIntake(60).proposedIntake(120).build(),
                RequestedIntake.builder().application(app1).course("B.Tech in Computer Science & Engineering").currentIntake(180).proposedIntake(240).build()
        ));

        // App 2: Maharashtra Institute of Technology & Engineering
        Application app2 = Application.builder()
                .id("AICTE-2026-W-4102")
                .institutionName("Maharashtra Institute of Technology & Engineering, Pune")
                .institutionCode("1-10492811")
                .applicationType("New Technical Institution")
                .programme("Engineering & Technology")
                .region("Western")
                .state("Maharashtra")
                .workflowId("WF-FULL")
                .currentStage("EVC")
                .status("EVC_SCHEDULED")
                .priority("HIGH")
                .assignedOfficer("Prof. (Dr.) Ananya Sen")
                .officerRole("EVC Committee Lead")
                .submissionDate(LocalDate.of(2026, 9, 15))
                .stageStartDate(LocalDate.of(2026, 10, 10))
                .nextDeadline(LocalDate.of(2026, 10, 22))
                .deficiencyCount(0)
                .missingDocCount(0)
                .build();
        applicationRepository.save(app2);

        stageHistoryRepository.saveAll(List.of(
                ApplicationStageHistory.builder().application(app2).stage("Application Submission").status("COMPLETED").date(LocalDate.of(2026, 9, 15)).note("New institution charter submitted").build(),
                ApplicationStageHistory.builder().application(app2).stage("Document Scrutiny").status("COMPLETED").date(LocalDate.of(2026, 10, 2)).note("Cleared without deficiencies").build(),
                ApplicationStageHistory.builder().application(app2).stage("EVC Physical Inspection").status("IN_PROGRESS").date(LocalDate.of(2026, 10, 12)).note("Committee visit scheduled; visit report overdue").build()
        ));

        documentRepository.saveAll(List.of(
                ApplicationDocument.builder().id("DOC-201").application(app2).title("Society/Trust Registration Deed").type("PDF").size("5.1 MB").status("VERIFIED").uploadDate(LocalDate.of(2026, 9, 15)).build(),
                ApplicationDocument.builder().id("DOC-202").application(app2).title("Campus Master Plan & Geo-coordinates Map").type("PDF").size("8.4 MB").status("VERIFIED").uploadDate(LocalDate.of(2026, 9, 15)).build()
        ));

        intakeRepository.saveAll(List.of(
                RequestedIntake.builder().application(app2).course("B.Tech Computer Engineering").currentIntake(0).proposedIntake(120).build(),
                RequestedIntake.builder().application(app2).course("B.Tech Robotics and Automation").currentIntake(0).proposedIntake(60).build()
        ));

        // App 3: Coimbatore Institute of Engineering & Technology
        Application app3 = Application.builder()
                .id("AICTE-2026-S-3209")
                .institutionName("Coimbatore Institute of Engineering & Technology, Coimbatore")
                .institutionCode("1-29401928")
                .applicationType("Extension of Approval (EoA)")
                .programme("Engineering, Management & MCA")
                .region("Southern")
                .state("Tamil Nadu")
                .workflowId("WF-ONLY-SCRUTINY")
                .currentStage("SCRUTINY")
                .status("IN_REVIEW")
                .priority("NORMAL")
                .assignedOfficer("Smt. Priya Varma")
                .officerRole("Compliance Reviewer")
                .submissionDate(LocalDate.of(2026, 10, 12))
                .stageStartDate(LocalDate.of(2026, 10, 14))
                .nextDeadline(LocalDate.of(2026, 10, 29))
                .deficiencyCount(0)
                .missingDocCount(0)
                .build();
        applicationRepository.save(app3);

        // App 4: Delhi Technological & Management Institute
        Application app4 = Application.builder()
                .id("AICTE-2026-N-7612")
                .institutionName("Delhi Technological & Management Institute, New Delhi")
                .institutionCode("1-84019231")
                .applicationType("Increase in Intake / New Course")
                .programme("Management & Computer Applications")
                .region("Northern")
                .state("Delhi NCR")
                .workflowId("WF-SCRUTINY-EVC")
                .currentStage("SAC_SHC")
                .status("SAC_HEARING")
                .priority("HIGH")
                .assignedOfficer("Dr. Rajesh Sharma")
                .officerRole("Bureau Officer")
                .submissionDate(LocalDate.of(2026, 8, 20))
                .stageStartDate(LocalDate.of(2026, 10, 8))
                .nextDeadline(LocalDate.of(2026, 10, 27))
                .deficiencyCount(2)
                .missingDocCount(0)
                .build();
        applicationRepository.save(app4);

        // App 5: Heritage College of Technology, Kolkata
        Application app5 = Application.builder()
                .id("AICTE-2026-E-1588")
                .institutionName("Heritage College of Technology, Kolkata")
                .institutionCode("1-51209384")
                .applicationType("Extension of Approval (EoA)")
                .programme("Engineering & Technology")
                .region("Eastern")
                .state("West Bengal")
                .workflowId("WF-ONLY-SCRUTINY")
                .currentStage("FINAL_APPROVAL")
                .status("PENDING_APPROVAL")
                .priority("NORMAL")
                .assignedOfficer("Dr. Rajesh Sharma")
                .officerRole("Bureau Officer")
                .submissionDate(LocalDate.of(2026, 9, 22))
                .stageStartDate(LocalDate.of(2026, 10, 16))
                .nextDeadline(LocalDate.of(2026, 10, 31))
                .deficiencyCount(0)
                .missingDocCount(0)
                .build();
        applicationRepository.save(app5);

        // App 6: Bhopal National Institute
        Application app6 = Application.builder()
                .id("AICTE-2026-C-9021")
                .institutionName("Bhopal National Institute of Applied Sciences, Bhopal")
                .institutionCode("1-93041920")
                .applicationType("New Technical Institution")
                .programme("Polytechnic & Diploma Engineering")
                .region("Central")
                .state("Madhya Pradesh")
                .workflowId("WF-FULL")
                .currentStage("SCRUTINY")
                .status("IN_REVIEW")
                .priority("HIGH")
                .assignedOfficer("Dr. Suresh Kumar Nair")
                .officerRole("Regional Officer")
                .submissionDate(LocalDate.of(2026, 10, 1))
                .stageStartDate(LocalDate.of(2026, 10, 8))
                .nextDeadline(LocalDate.of(2026, 10, 25))
                .deficiencyCount(0)
                .missingDocCount(2)
                .build();
        applicationRepository.save(app6);

        // App 7: Chandigarh Polytechnic
        Application app7 = Application.builder()
                .id("AICTE-2026-NW-6530")
                .institutionName("Chandigarh Polytechnic Institute, Mohali")
                .institutionCode("1-77192038")
                .applicationType("Extension of Approval (EoA)")
                .programme("Engineering & Technology")
                .region("North-Western")
                .state("Punjab")
                .workflowId("WF-ONLY-SCRUTINY")
                .currentStage("FINAL_APPROVAL")
                .status("APPROVED")
                .priority("NORMAL")
                .assignedOfficer("Dr. Rajesh Sharma")
                .officerRole("Bureau Officer")
                .submissionDate(LocalDate.of(2026, 8, 10))
                .stageStartDate(LocalDate.of(2026, 9, 1))
                .nextDeadline(LocalDate.of(2026, 9, 25))
                .deficiencyCount(0)
                .missingDocCount(0)
                .build();
        applicationRepository.save(app7);

        // App 8: Hyderabad Premier Engineering College
        Application app8 = Application.builder()
                .id("AICTE-2026-SC-5511")
                .institutionName("Hyderabad Premier Engineering College, Hyderabad")
                .institutionCode("1-44910283")
                .applicationType("Increase in Intake / New Course")
                .programme("Engineering & Technology")
                .region("South-Central")
                .state("Telangana")
                .workflowId("WF-SCRUTINY-EVC")
                .currentStage("EVC")
                .status("EVC_PENDING_REPORT")
                .priority("HIGH")
                .assignedOfficer("Prof. (Dr.) Ananya Sen")
                .officerRole("EVC Committee Member")
                .submissionDate(LocalDate.of(2026, 9, 10))
                .stageStartDate(LocalDate.of(2026, 10, 5))
                .nextDeadline(LocalDate.of(2026, 10, 21))
                .deficiencyCount(1)
                .missingDocCount(0)
                .build();
        applicationRepository.save(app8);
    }

    private void seedEvcSchedules() {
        Application app2 = applicationRepository.findById("AICTE-2026-W-4102").orElse(null);
        Application app1 = applicationRepository.findById("AICTE-2026-SW-8901").orElse(null);
        Application app8 = applicationRepository.findById("AICTE-2026-SC-5511").orElse(null);
        Application app6 = applicationRepository.findById("AICTE-2026-C-9021").orElse(null);

        if (app2 != null) {
            EvcSchedule sched1 = EvcSchedule.builder()
                    .id("EVC-2026-001")
                    .application(app2)
                    .institutionName("Maharashtra Institute of Technology & Engineering, Pune")
                    .region("Western")
                    .visitType("Physical Inspection (New Campus)")
                    .status("DELAYED")
                    .schedulingDeadline(LocalDate.of(2026, 10, 20))
                    .proposedDate(LocalDate.of(2026, 10, 22))
                    .mode("PHYSICAL")
                    .conflictStatus("NONE")
                    .reportStatus("PENDING_UPLOAD")
                    .observations("Physical inspection was delayed due to regional heavy monsoon travel advisories. Need rescheduling.")
                    .geoTaggedPhotosCount(0)
                    .build();
            evcRepository.save(sched1);

            evcMemberRepository.saveAll(List.of(
                    EvcMember.builder().schedule(sched1).name("Prof. (Dr.) Ananya Sen").role("Chairman / Academic Expert").affiliation("IIT Bombay (Retd.)").phone("+91 94330 18273").build(),
                    EvcMember.builder().schedule(sched1).name("Dr. Kailash Purohit").role("Architectural Expert").affiliation("Council of Architecture Nominee").phone("+91 98220 54129").build(),
                    EvcMember.builder().schedule(sched1).name("Shri Amit Deshmukh").role("Regional Officer Nominee").affiliation("AICTE Western Regional Office").phone("+91 22 2285 1022").build()
            ));
        }

        if (app1 != null) {
            EvcSchedule sched2 = EvcSchedule.builder()
                    .id("EVC-2026-002")
                    .application(app1)
                    .institutionName("Vivekananda Institute of Technology, Bangalore")
                    .region("South-Western")
                    .visitType("Physical Inspection (Intake Expansion)")
                    .status("PENDING_ASSIGNMENT")
                    .schedulingDeadline(LocalDate.of(2026, 10, 30))
                    .mode("PHYSICAL")
                    .conflictStatus("NONE")
                    .reportStatus("NOT_SCHEDULED")
                    .observations("Application undergoing scrutiny deficiency resolution; to be queued for committee formation upon clearance.")
                    .geoTaggedPhotosCount(0)
                    .build();
            evcRepository.save(sched2);
        }

        if (app8 != null) {
            EvcSchedule sched3 = EvcSchedule.builder()
                    .id("EVC-2026-003")
                    .application(app8)
                    .institutionName("Hyderabad Premier Engineering College, Hyderabad")
                    .region("South-Central")
                    .visitType("Surprise / Infrastructure Verification")
                    .status("INSPECTION_COMPLETED")
                    .schedulingDeadline(LocalDate.of(2026, 10, 18))
                    .proposedDate(LocalDate.of(2026, 10, 19))
                    .completionDate(LocalDate.of(2026, 10, 19))
                    .mode("PHYSICAL")
                    .conflictStatus("NONE")
                    .reportStatus("REPORT_SUBMITTED")
                    .observations("Physical verification of 4 dedicated computer labs and 1Gbps leased line completed satisfactorily. Bio-metric attendance log verified.")
                    .geoTaggedPhotosCount(18)
                    .build();
            evcRepository.save(sched3);

            evcMemberRepository.saveAll(List.of(
                    EvcMember.builder().schedule(sched3).name("Prof. (Dr.) Ananya Sen").role("Chairman").affiliation("IIT Bombay (Retd.)").build(),
                    EvcMember.builder().schedule(sched3).name("Dr. G. Venkat Rao").role("Subject Expert (Cyber Security)").affiliation("Osmania University").build()
            ));
        }

        if (app6 != null) {
            EvcSchedule sched4 = EvcSchedule.builder()
                    .id("EVC-2026-004")
                    .application(app6)
                    .institutionName("Bhopal National Institute of Applied Sciences, Bhopal")
                    .region("Central")
                    .visitType("Physical Inspection (Polytechnic)")
                    .status("SCHEDULED")
                    .schedulingDeadline(LocalDate.of(2026, 10, 28))
                    .proposedDate(LocalDate.of(2026, 10, 27))
                    .mode("PHYSICAL")
                    .conflictStatus("NONE")
                    .reportStatus("VISIT_UPCOMING")
                    .observations("Travel itinerary and campus visit agenda circulated to institution management.")
                    .geoTaggedPhotosCount(0)
                    .build();
            evcRepository.save(sched4);

            evcMemberRepository.saveAll(List.of(
                    EvcMember.builder().schedule(sched4).name("Dr. V. K. Aggarwal").role("Chairman").affiliation("MANIT Bhopal").build(),
                    EvcMember.builder().schedule(sched4).name("Prof. Meenakshi Soni").role("State DTE Nominee").affiliation("Govt. Polytechnic MP").build()
            ));
        }
    }

    private void seedCompliance() {
        List<ComplianceItem> items = List.of(
                ComplianceItem.builder()
                        .id("CMP-2026-001")
                        .institutionName("Vivekananda Institute of Technology, Bangalore")
                        .institutionCode("1-34981275")
                        .region("South-Western")
                        .requirementType("Lease Document Validity")
                        .documentName("Registered Campus Land Lease Deed (30 Years)")
                        .documentType("PDF")
                        .fileSize("4.2 MB")
                        .issueDate(LocalDate.of(1997, 11, 15))
                        .expiryDate(LocalDate.of(2026, 11, 15))
                        .dueDate(LocalDate.of(2026, 11, 1))
                        .status("EXPIRING_SOON")
                        .verificationStatus("VERIFIED")
                        .assignedReviewer("Smt. Priya Varma")
                        .version("1.0")
                        .submissionDate(LocalDate.of(2026, 9, 10))
                        .notes("30-year lease from Karnataka Industrial Areas Development Board (KIADB) expiring. Extension renewal deed required before next academic session.")
                        .build(),
                ComplianceItem.builder()
                        .id("CMP-2026-002")
                        .institutionName("Vivekananda Institute of Technology, Bangalore")
                        .institutionCode("1-34981275")
                        .region("South-Western")
                        .requirementType("Time-bound Undertaking")
                        .documentName("Faculty 7th Central Pay Commission (CPC) Implementation Undertaking")
                        .documentType("PDF")
                        .fileSize("1.5 MB")
                        .issueDate(LocalDate.of(2026, 8, 1))
                        .dueDate(LocalDate.of(2026, 10, 20))
                        .status("OVERDUE")
                        .verificationStatus("PENDING_SUBMISSION")
                        .assignedReviewer("Dr. Suresh Kumar Nair")
                        .version("0.9 (Draft)")
                        .notes("Undertaking on stamped paper stating 7th CPC scale implementation for all Assistant Professors within 60 days.")
                        .build(),
                ComplianceItem.builder()
                        .id("CMP-2026-003")
                        .institutionName("Maharashtra Institute of Technology & Engineering, Pune")
                        .institutionCode("1-10492811")
                        .region("Western")
                        .requirementType("Statutory Safety Certificate")
                        .documentName("Maharashtra State Fire Safety & Evacuation NOC")
                        .documentType("PDF")
                        .fileSize("2.8 MB")
                        .issueDate(LocalDate.of(2025, 10, 30))
                        .expiryDate(LocalDate.of(2026, 10, 30))
                        .dueDate(LocalDate.of(2026, 10, 25))
                        .status("PENDING_VERIFICATION")
                        .verificationStatus("PENDING_VERIFICATION")
                        .assignedReviewer("Smt. Priya Varma")
                        .version("2.0")
                        .submissionDate(LocalDate.of(2026, 10, 22))
                        .notes("Renewal certificate uploaded by college; awaiting reviewer verification stamp.")
                        .build(),
                ComplianceItem.builder()
                        .id("CMP-2026-004")
                        .institutionName("Delhi Technological & Management Institute, New Delhi")
                        .institutionCode("1-84019231")
                        .region("Northern")
                        .requirementType("Financial Compliance")
                        .documentName("AICTE Joint Fixed Deposit Receipt (FDR) Lien Letter")
                        .documentType("PDF")
                        .fileSize("1.1 MB")
                        .issueDate(LocalDate.of(2018, 5, 10))
                        .expiryDate(LocalDate.of(2026, 12, 31))
                        .dueDate(LocalDate.of(2026, 11, 30))
                        .status("UPCOMING")
                        .verificationStatus("VERIFIED")
                        .assignedReviewer("Dr. Rajesh Sharma")
                        .version("1.0")
                        .submissionDate(LocalDate.of(2026, 8, 15))
                        .notes("State Bank of India confirmed lien mark in favor of AICTE HQ for ₹1,00,00,000.")
                        .build(),
                ComplianceItem.builder()
                        .id("CMP-2026-005")
                        .institutionName("Heritage College of Technology, Kolkata")
                        .institutionCode("1-51209384")
                        .region("Eastern")
                        .requirementType("Academic Norms")
                        .documentName("Anti-Ragging Committee Constitution & National Helpline Compliance")
                        .documentType("PDF")
                        .fileSize("950 KB")
                        .issueDate(LocalDate.of(2026, 7, 1))
                        .expiryDate(LocalDate.of(2027, 6, 30))
                        .dueDate(LocalDate.of(2026, 7, 15))
                        .status("VERIFIED")
                        .verificationStatus("VERIFIED")
                        .assignedReviewer("Smt. Priya Varma")
                        .version("1.0")
                        .submissionDate(LocalDate.of(2026, 7, 10))
                        .notes("Complete squad list, squad vehicle contact, and CCTV coverage map verified.")
                        .build(),
                ComplianceItem.builder()
                        .id("CMP-2026-006")
                        .institutionName("Bhopal National Institute of Applied Sciences, Bhopal")
                        .institutionCode("1-93041920")
                        .region("Central")
                        .requirementType("Land and Infrastructure")
                        .documentName("Khasra / Khatoni Revenue Records and Non-Encumbrance Certificate")
                        .documentType("PDF")
                        .fileSize("8.3 MB")
                        .issueDate(LocalDate.of(2026, 9, 1))
                        .dueDate(LocalDate.of(2026, 10, 24))
                        .status("PENDING_VERIFICATION")
                        .verificationStatus("PENDING_VERIFICATION")
                        .assignedReviewer("Dr. Suresh Kumar Nair")
                        .version("1.0")
                        .submissionDate(LocalDate.of(2026, 10, 23))
                        .notes("Document uploaded for revenue sub-division confirmation.")
                        .build(),
                ComplianceItem.builder()
                        .id("CMP-2026-007")
                        .institutionName("Coimbatore Institute of Engineering & Technology, Coimbatore")
                        .institutionCode("1-29401928")
                        .region("Southern")
                        .requirementType("Barrier Free Environment")
                        .documentName("PWD Certificate for Persons with Disabilities (Divyangjan) Access")
                        .documentType("PDF")
                        .fileSize("3.1 MB")
                        .issueDate(LocalDate.of(2026, 1, 10))
                        .expiryDate(LocalDate.of(2029, 1, 10))
                        .dueDate(LocalDate.of(2026, 2, 15))
                        .status("VERIFIED")
                        .verificationStatus("VERIFIED")
                        .assignedReviewer("Smt. Priya Varma")
                        .version("1.0")
                        .submissionDate(LocalDate.of(2026, 2, 1))
                        .notes("Ramps, lifts, disabled-friendly restrooms, and Braille signage verified.")
                        .build()
        );
        complianceRepository.saveAll(items);
    }

    private void seedNotifications() {
        List<Notification> notifs = List.of(
                Notification.builder().id("NOTIF-001").category("APPLICATION_OVERDUE").urgency("CRITICAL").title("EVC Visit Overdue - AICTE-2026-W-4102").message("Inspection for Maharashtra Institute of Technology & Engineering, Pune was scheduled for 2026-10-22 and is currently overdue.").entityType("APPLICATION").entityId("AICTE-2026-W-4102").timestamp("2026-10-23 09:30 AM").isRead(false).recipientRole("REGIONAL_OFFICER").link("/applications/AICTE-2026-W-4102").build(),
                Notification.builder().id("NOTIF-002").category("LEASE_EXPIRY").urgency("HIGH").title("Land Lease Deed Expiring in 22 Days").message("Registered 30-year lease for Vivekananda Institute of Technology, Bangalore expires on 2026-11-15. Renewal undertaking needed.").entityType("COMPLIANCE").entityId("CMP-2026-001").timestamp("2026-10-24 08:00 AM").isRead(false).recipientRole("COMPLIANCE_REVIEWER").link("/compliance").build(),
                Notification.builder().id("NOTIF-003").category("DEFICIENCY_RETURNED").urgency("HIGH").title("Scrutiny Deficiency Issued - AICTE-2026-SW-8901").message("Annexure IV boundary survey map missing in submitted Land Lease Deed. Clarification requested from institution Principal.").entityType("APPLICATION").entityId("AICTE-2026-SW-8901").timestamp("2026-10-18 03:15 PM").isRead(false).recipientRole("COLLEGE_REP").link("/applications/AICTE-2026-SW-8901").build(),
                Notification.builder().id("NOTIF-004").category("ESCALATION").urgency("CRITICAL").title("Level 2 Escalation: Overdue EVC Scheduling").message("Application AICTE-2026-SC-5511 report has exceeded 48 hours post physical inspection without report upload. Escalated to Bureau Officer.").entityType("ESCALATION").entityId("ESC-2026-001").timestamp("2026-10-22 04:30 PM").isRead(false).recipientRole("BUREAU_OFFICER").link("/evc").build(),
                Notification.builder().id("NOTIF-005").category("COMPLIANCE_RECEIVED").urgency("NORMAL").title("New Compliance Submission Received").message("Khasra Revenue records uploaded by Bhopal National Institute of Applied Sciences. Awaiting scrutiny officer verification.").entityType("COMPLIANCE").entityId("CMP-2026-006").timestamp("2026-10-23 02:40 PM").isRead(true).recipientRole("COMPLIANCE_REVIEWER").link("/compliance").build(),
                Notification.builder().id("NOTIF-006").category("EVC_REMINDER").urgency("NORMAL").title("Upcoming EVC Visit: Bhopal Polytechnic").message("Physical inspection scheduled for 2026-10-27 by Dr. V. K. Aggarwal panel. Logistics confirmed.").entityType("EVC").entityId("EVC-2026-004").timestamp("2026-10-21 11:20 AM").isRead(true).recipientRole("EVC_MEMBER").link("/evc").build()
        );
        notificationRepository.saveAll(notifs);
    }

    private void seedEscalations() {
        List<Escalation> escs = List.of(
                Escalation.builder().id("ESC-2026-001").entityId("AICTE-2026-SC-5511").institutionName("Hyderabad Premier Engineering College").level("LEVEL_2").levelTitle("Bureau Head Escalation").recipient("Dr. Rajesh Sharma (Approval Bureau Head)").reason("EVC Physical inspection report upload delayed past SLA threshold (> 48 hours).").triggeredAt("2026-10-22 04:30 PM").status("ACTIVE").build(),
                Escalation.builder().id("ESC-2026-002").entityId("AICTE-2026-W-4102").institutionName("Maharashtra Institute of Technology & Engineering").level("LEVEL_1").levelTitle("Regional Officer Alert").recipient("Dr. Suresh Kumar Nair (Regional Officer)").reason("EVC inspection date breached target deadline by 2 days.").triggeredAt("2026-10-23 09:30 AM").status("ACTIVE").build()
        );
        escalationRepository.saveAll(escs);
    }

    private void seedAuditLogs() {
        List<AuditLog> audits = List.of(
                AuditLog.builder().id("AUD-001").timestamp("2026-10-23 09:30 AM").userName("System Auto-Engine").role("SYSTEM").entityId("AICTE-2026-W-4102").action("ESCALATION_TRIGGERED").previousState("SCHEDULED").newState("DELAYED").reason("Target EVC inspection date breached by 24 hours without completion submission.").ipAddress("10.200.4.1 (Internal Worker)").build(),
                AuditLog.builder().id("AUD-002").timestamp("2026-10-22 04:30 PM").userName("System Auto-Engine").role("SYSTEM").entityId("AICTE-2026-SC-5511").action("ESCALATION_TRIGGERED").previousState("INSPECTION_COMPLETED").newState("REPORT_OVERDUE").reason("Inspection report upload time exceeded SLA threshold of 48 hours.").ipAddress("10.200.4.1 (Internal Worker)").build(),
                AuditLog.builder().id("AUD-003").timestamp("2026-10-18 03:15 PM").userName("Dr. Suresh Kumar Nair").role("REGIONAL_OFFICER").entityId("AICTE-2026-SW-8901").action("RETURN_FOR_DEFICIENCY").previousState("SCRUTINY_IN_PROGRESS").newState("DEFICIENCY_NOTIFIED").reason("Land lease deed missing Annexure IV boundary verification stamp. FDR lien renewal notice issued.").ipAddress("14.139.128.45").build(),
                AuditLog.builder().id("AUD-004").timestamp("2026-10-16 02:00 PM").userName("Dr. Rajesh Sharma").role("BUREAU_OFFICER").entityId("AICTE-2026-E-1588").action("STAGE_ADVANCED").previousState("SCRUTINY").newState("FINAL_APPROVAL").reason("Scrutiny cleared with 100% compliance. Forwarded for Executive Council final signoff.").ipAddress("14.139.120.12").build(),
                AuditLog.builder().id("AUD-005").timestamp("2026-10-12 11:20 AM").userName("Dr. Suresh Kumar Nair").role("REGIONAL_OFFICER").entityId("AICTE-2026-W-4102").action("STAGE_ADVANCED").previousState("SCRUTINY").newState("EVC").reason("Document scrutiny passed without deficiencies. Routed to Expert Visit Committee panel.").ipAddress("14.139.128.45").build(),
                AuditLog.builder().id("AUD-006").timestamp("2026-10-05 10:14 AM").userName("Dr. R. Ramanathan").role("COLLEGE_REP").entityId("AICTE-2026-SW-8901").action("APPLICATION_SUBMITTED").previousState("DRAFT").newState("SUBMITTED").reason("Application for Intake Expansion in AI/DS and CSE courses lodged along with Bharathkosh fee receipt.").ipAddress("49.206.12.88").build()
        );
        auditLogRepository.saveAll(audits);
    }
}
