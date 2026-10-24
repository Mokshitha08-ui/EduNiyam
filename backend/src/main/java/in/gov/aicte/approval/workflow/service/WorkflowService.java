package in.gov.aicte.approval.workflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.aicte.approval.common.exception.ResourceNotFoundException;
import in.gov.aicte.approval.workflow.dto.WorkflowDto;
import in.gov.aicte.approval.workflow.entity.WorkflowDefinition;
import in.gov.aicte.approval.workflow.repository.WorkflowDefinitionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkflowService {

    private final WorkflowDefinitionRepository workflowRepository;
    private final ObjectMapper objectMapper;

    public WorkflowService(WorkflowDefinitionRepository workflowRepository, ObjectMapper objectMapper) {
        this.workflowRepository = workflowRepository;
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
    public WorkflowDto updateConfig(String id, Map<String, Object> config) {
        WorkflowDefinition workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow", "id", id));

        try {
            workflow.setRulesJson(objectMapper.writeValueAsString(config));
            return WorkflowDto.fromEntity(workflowRepository.save(workflow));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize workflow configuration: " + e.getMessage());
        }
    }
}
