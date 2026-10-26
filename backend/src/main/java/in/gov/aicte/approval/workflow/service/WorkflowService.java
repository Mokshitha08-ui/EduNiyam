package in.gov.aicte.approval.workflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.aicte.approval.application.repository.ApplicationRepository;
import in.gov.aicte.approval.audit.entity.AuditLog;
import in.gov.aicte.approval.audit.repository.AuditLogRepository;
import in.gov.aicte.approval.common.exception.BadRequestException;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.workflow.dto.WorkflowCreateRequest;
import in.gov.aicte.approval.workflow.dto.WorkflowDto;
import in.gov.aicte.approval.workflow.dto.WorkflowStageDto;
import in.gov.aicte.approval.workflow.dto.WorkflowUpdateRequest;
import in.gov.aicte.approval.workflow.entity.WorkflowDefinition;
import in.gov.aicte.approval.workflow.entity.WorkflowStage;
import in.gov.aicte.approval.workflow.repository.WorkflowDefinitionRepository;
import in.gov.aicte.approval.workflow.repository.WorkflowStageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorkflowService {

    private final WorkflowDefinitionRepository workflowRepository;
    private final WorkflowStageRepository stageRepository;
    private final ApplicationRepository applicationRepository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    private static final DateTimeFormatter AUDIT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    public WorkflowService(
            WorkflowDefinitionRepository workflowRepository,
            WorkflowStageRepository stageRepository,
            ApplicationRepository applicationRepository,
            AuditLogRepository auditLogRepository,
            ObjectMapper objectMapper) {
        this.workflowRepository = workflowRepository;
        this.stageRepository = stageRepository;
        this.applicationRepository = applicationRepository;
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<WorkflowDto> getAllWorkflows() {
        return workflowRepository.findAll().stream()
                .map(WorkflowDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowDto getWorkflowById(String id) {
        WorkflowDefinition workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow", "id", id));
        return WorkflowDto.fromEntity(workflow);
    }

    @Transactional
    public WorkflowDto createWorkflow(WorkflowCreateRequest request, String username) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Workflow template name is required.");
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new BadRequestException("Workflow pathway code is required.");
        }

        String code = request.getCode().trim().toUpperCase().replaceAll("[^A-Z0-9_]", "_");
        if (workflowRepository.existsByCode(code)) {
            throw new BadRequestException("A workflow with code '" + code + "' already exists.");
        }

        if (request.getStages() == null || request.getStages().size() < 2) {
            throw new BadRequestException("A workflow template must define at least 2 stages (e.g. Submission and Review/Approval).");
        }

        // Validate stages
        validateStages(request.getStages());

        String id = request.getId() != null && !request.getId().isBlank() ? request.getId().trim() : ("WF-" + code);
        if (workflowRepository.existsById(id)) {
            id = "WF-" + code + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        }

        String rulesJson = null;
        if (request.getRules() != null && !request.getRules().isEmpty()) {
            try {
                rulesJson = objectMapper.writeValueAsString(request.getRules());
            } catch (Exception e) {
                throw new BadRequestException("Invalid rules format: " + e.getMessage());
            }
        }

        boolean isDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (isDefault) {
            clearOtherDefaults();
        }

        String status = (request.getStatus() != null && !request.getStatus().isBlank())
                ? request.getStatus().trim().toUpperCase()
                : "DRAFT";

        WorkflowDefinition wf = WorkflowDefinition.builder()
                .id(id)
                .name(request.getName().trim())
                .code(code)
                .description(request.getDescription())
                .version(request.getVersion() != null && !request.getVersion().isBlank() ? request.getVersion().trim() : "2026.1.0")
                .applicableApplicationTypes(request.getApplicableApplicationTypes())
                .effectiveDate(request.getEffectiveDate() != null ? request.getEffectiveDate() : LocalDate.now())
                .isDefault(isDefault)
                .status(status)
                .rulesJson(rulesJson)
                .build();

        List<WorkflowStage> stageEntities = new ArrayList<>();
        int order = 1;
        for (WorkflowStageDto stgDto : request.getStages()) {
            String stageId = "STG-" + id + "-" + order;
            WorkflowStage stg = WorkflowStage.builder()
                    .id(stageId)
                    .workflow(wf)
                    .name(stgDto.getName().trim())
                    .code(stgDto.getCode().trim().toUpperCase())
                    .stageOrder(order)
                    .targetDays(stgDto.getTargetDays() > 0 ? stgDto.getTargetDays() : 7)
                    .roleAllowed(stgDto.getRoleAllowed() != null ? stgDto.getRoleAllowed().trim() : "REGIONAL_OFFICER")
                    .isMandatory(stgDto.isMandatory())
                    .stageType(stgDto.getStageType() != null ? stgDto.getStageType().trim() : "SCRUTINY")
                    .permittedNextStages(stgDto.getPermittedNextStages())
                    .checklistJson(stgDto.getChecklistJson())
                    .build();
            stageEntities.add(stg);
            order++;
        }
        wf.setStages(stageEntities);

        WorkflowDefinition savedWf = workflowRepository.save(wf);

        recordAudit(id, username, "WORKFLOW_TEMPLATE_CREATED", "NONE", status,
                "Created new approval workflow template: " + savedWf.getName() + " (" + code + ")");

        return WorkflowDto.fromEntity(savedWf);
    }

    @Transactional
    public WorkflowDto updateWorkflow(String id, WorkflowUpdateRequest request, String username) {
        WorkflowDefinition wf = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow", "id", id));

        String prevVersion = wf.getVersion();
        boolean hasActiveApps = applicationRepository.existsByWorkflowId(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            wf.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            wf.setDescription(request.getDescription().trim());
        }
        if (request.getApplicableApplicationTypes() != null) {
            wf.setApplicableApplicationTypes(request.getApplicableApplicationTypes().trim());
        }
        if (request.getEffectiveDate() != null) {
            wf.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            wf.setStatus(request.getStatus().trim().toUpperCase());
        }
        if (request.getIsDefault() != null) {
            if (request.getIsDefault()) {
                clearOtherDefaults();
            }
            wf.setDefault(request.getIsDefault());
        }

        // Safe versioning: If applications already use this template and stages are updated, increment minor version
        if (request.getVersion() != null && !request.getVersion().isBlank()) {
            wf.setVersion(request.getVersion().trim());
        } else if (hasActiveApps && request.getStages() != null) {
            wf.setVersion(bumpVersion(wf.getVersion()));
        }

        if (request.getRules() != null) {
            try {
                wf.setRulesJson(objectMapper.writeValueAsString(request.getRules()));
            } catch (Exception e) {
                throw new BadRequestException("Invalid rules format: " + e.getMessage());
            }
        }

        // Update stages if provided
        if (request.getStages() != null && !request.getStages().isEmpty()) {
            validateStages(request.getStages());
            if (wf.getStages() == null) {
                wf.setStages(new ArrayList<>());
            } else {
                wf.getStages().clear();
            }

            int order = 1;
            for (WorkflowStageDto stgDto : request.getStages()) {
                String stageId = "STG-" + id + "-" + order + "-" + (System.currentTimeMillis() % 100000);
                WorkflowStage stg = WorkflowStage.builder()
                        .id(stageId)
                        .workflow(wf)
                        .name(stgDto.getName().trim())
                        .code(stgDto.getCode().trim().toUpperCase())
                        .stageOrder(order)
                        .targetDays(stgDto.getTargetDays() > 0 ? stgDto.getTargetDays() : 7)
                        .roleAllowed(stgDto.getRoleAllowed() != null ? stgDto.getRoleAllowed().trim() : "REGIONAL_OFFICER")
                        .isMandatory(stgDto.isMandatory())
                        .stageType(stgDto.getStageType() != null ? stgDto.getStageType().trim() : "SCRUTINY")
                        .permittedNextStages(stgDto.getPermittedNextStages())
                        .checklistJson(stgDto.getChecklistJson())
                        .build();
                wf.getStages().add(stg);
                order++;
            }
        }

        WorkflowDefinition saved = workflowRepository.save(wf);

        recordAudit(id, username, "WORKFLOW_TEMPLATE_UPDATED", prevVersion, saved.getVersion(),
                "Updated workflow template configuration. Active applications preserved.");

        return WorkflowDto.fromEntity(saved);
    }

    @Transactional
    public WorkflowDto activateWorkflow(String id, String username) {
        WorkflowDefinition wf = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow", "id", id));

        if (wf.getStages() == null || wf.getStages().size() < 2) {
            throw new BadRequestException("Incomplete configuration: Workflow template must define at least 2 stages before activation.");
        }

        for (WorkflowStage stg : wf.getStages()) {
            if (stg.getTargetDays() <= 0) {
                throw new BadRequestException("Incomplete configuration: Stage '" + stg.getName() + "' must have targetDays > 0.");
            }
            if (stg.getRoleAllowed() == null || stg.getRoleAllowed().isBlank()) {
                throw new BadRequestException("Incomplete configuration: Stage '" + stg.getName() + "' must specify an allowed officer role.");
            }
        }

        String prevStatus = wf.getStatus();
        wf.setStatus("ACTIVE");
        WorkflowDefinition saved = workflowRepository.save(wf);

        recordAudit(id, username, "WORKFLOW_ACTIVATED", prevStatus, "ACTIVE", "Workflow template activated for live routing.");
        return WorkflowDto.fromEntity(saved);
    }

    @Transactional
    public WorkflowDto deactivateWorkflow(String id, String username) {
        WorkflowDefinition wf = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow", "id", id));

        if (wf.isDefault()) {
            long activeDefaults = workflowRepository.findAll().stream()
                    .filter(w -> w.isDefault() && "ACTIVE".equalsIgnoreCase(w.getStatus()) && !w.getId().equals(id))
                    .count();
            if (activeDefaults == 0) {
                throw new BadRequestException("Cannot deactivate the primary default workflow without designating another active default template.");
            }
        }

        String prevStatus = wf.getStatus();
        wf.setStatus("INACTIVE");
        WorkflowDefinition saved = workflowRepository.save(wf);

        recordAudit(id, username, "WORKFLOW_DEACTIVATED", prevStatus, "INACTIVE", "Workflow template deactivated.");
        return WorkflowDto.fromEntity(saved);
    }

    @Transactional
    public WorkflowDto updateConfig(String id, Map<String, Object> config) {
        WorkflowDefinition workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow", "id", id));

        try {
            workflow.setRulesJson(objectMapper.writeValueAsString(config));
            return WorkflowDto.fromEntity(workflowRepository.save(workflow));
        } catch (Exception e) {
            throw new BadRequestException("Failed to serialize workflow configuration: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public String resolveWorkflowIdForApplicationType(String appType) {
        if (appType == null || appType.isBlank()) {
            return getDefaultWorkflowId();
        }

        String target = appType.trim().toLowerCase();
        List<WorkflowDefinition> allActive = workflowRepository.findAll().stream()
                .filter(w -> "ACTIVE".equalsIgnoreCase(w.getStatus()))
                .toList();

        for (WorkflowDefinition wf : allActive) {
            if (wf.getApplicableApplicationTypes() != null) {
                String[] types = wf.getApplicableApplicationTypes().split(",");
                for (String t : types) {
                    if (t.trim().equalsIgnoreCase(target) || target.contains(t.trim().toLowerCase())) {
                        return wf.getId();
                    }
                }
            }
        }

        return getDefaultWorkflowId();
    }

    private String getDefaultWorkflowId() {
        return workflowRepository.findAll().stream()
                .filter(w -> w.isDefault() && "ACTIVE".equalsIgnoreCase(w.getStatus()))
                .map(WorkflowDefinition::getId)
                .findFirst()
                .orElse("WF-FULL");
    }

    private void validateStages(List<WorkflowStageDto> stages) {
        Set<String> seenCodes = new HashSet<>();
        for (WorkflowStageDto stg : stages) {
            if (stg.getName() == null || stg.getName().isBlank()) {
                throw new BadRequestException("Each stage must have a valid descriptive name.");
            }
            if (stg.getCode() == null || stg.getCode().isBlank()) {
                throw new BadRequestException("Each stage must have a stage code identifier.");
            }
            String code = stg.getCode().trim().toUpperCase();
            if (!seenCodes.add(code)) {
                throw new BadRequestException("Duplicate stage code '" + code + "' in workflow configuration.");
            }
            if (stg.getTargetDays() <= 0) {
                throw new BadRequestException("Processing duration for stage '" + stg.getName() + "' must be at least 1 day.");
            }
            if (stg.getRoleAllowed() == null || stg.getRoleAllowed().isBlank()) {
                throw new BadRequestException("Responsible role for stage '" + stg.getName() + "' is mandatory.");
            }
        }
    }

    private void clearOtherDefaults() {
        List<WorkflowDefinition> defaults = workflowRepository.findAll().stream()
                .filter(WorkflowDefinition::isDefault)
                .toList();
        for (WorkflowDefinition d : defaults) {
            d.setDefault(false);
            workflowRepository.save(d);
        }
    }

    private String bumpVersion(String currentVersion) {
        if (currentVersion == null || currentVersion.isBlank()) return "2026.1.1";
        try {
            String[] parts = currentVersion.split("\\.");
            if (parts.length >= 3) {
                int patch = Integer.parseInt(parts[2]) + 1;
                return parts[0] + "." + parts[1] + "." + patch;
            }
        } catch (Exception ignored) {}
        return currentVersion + ".1";
    }

    private void recordAudit(String entityId, String user, String action, String prevState, String newState, String reason) {
        AuditLog auditLog = AuditLog.builder()
                .id("AUD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .timestamp(LocalDateTime.now().format(AUDIT_DATE_FORMAT))
                .userName(user != null ? user : "System Administrator")
                .role("ADMIN")
                .entityId(entityId)
                .action(action)
                .previousState(prevState)
                .newState(newState)
                .reason(reason)
                .ipAddress("127.0.0.1 (Workflow Service)")
                .build();
        auditLogRepository.save(auditLog);
    }
}
