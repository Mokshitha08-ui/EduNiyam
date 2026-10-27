package in.gov.aicte.approval.compliance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DocumentVerificationService {

    private final ObjectMapper objectMapper;

    @Value("${app.ocr.provider:local-pdf-text}")
    private String ocrProvider;

    @Value("${app.ai.provider:none}")
    private String aiProvider;

    @Value("${app.ai.api-key:}")
    private String aiApiKey;

    public DocumentVerificationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public static class AnalysisResult {
        private final String ocrStatus;
        private final String ocrExtractedJson;
        private final String aiAdvisoryJson;

        public AnalysisResult(String ocrStatus, String ocrExtractedJson, String aiAdvisoryJson) {
            this.ocrStatus = ocrStatus;
            this.ocrExtractedJson = ocrExtractedJson;
            this.aiAdvisoryJson = aiAdvisoryJson;
        }

        public String getOcrStatus() { return ocrStatus; }
        public String getOcrExtractedJson() { return ocrExtractedJson; }
        public String getAiAdvisoryJson() { return aiAdvisoryJson; }
    }

    public AnalysisResult analyzeDocument(
            byte[] fileBytes,
            String fileName,
            String documentType,
            String requirementOrTitle,
            String submittedInstitutionName,
            String submittedInstitutionCode,
            LocalDate submittedIssueDate,
            LocalDate submittedExpiryDate) {

        Map<String, Object> ocrMap = new LinkedHashMap<>();
        Map<String, String> extractedFields = new LinkedHashMap<>();
        String ocrStatus;
        boolean readableTextFound = false;
        String rawExtractedText = "";

        if ("none".equalsIgnoreCase(ocrProvider) || "disabled".equalsIgnoreCase(ocrProvider)) {
            ocrStatus = "PROVIDER_NOT_CONFIGURED";
            ocrMap.put("provider", "none");
            ocrMap.put("status", ocrStatus);
            ocrMap.put("readableTextFound", false);
            ocrMap.put("message", "OCR provider is disabled via configuration (OCR_PROVIDER=none). Manual inspection required.");
            ocrMap.put("extractedFields", extractedFields);
        } else if (fileBytes == null || fileBytes.length == 0) {
            ocrStatus = "NO_BINARY_CONTENT";
            ocrMap.put("provider", ocrProvider);
            ocrMap.put("status", ocrStatus);
            ocrMap.put("readableTextFound", false);
            ocrMap.put("message", "No binary document stream uploaded for local text extraction; metadata-only record.");
            ocrMap.put("extractedFields", extractedFields);
        } else {
            String rawContent = new String(fileBytes, StandardCharsets.ISO_8859_1);
            boolean isPdf = rawContent.startsWith("%PDF") || (fileName != null && fileName.toLowerCase().endsWith(".pdf"));
            boolean isImage = (fileName != null && (fileName.toLowerCase().endsWith(".png") || fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")))
                    || "IMAGE".equalsIgnoreCase(documentType);

            if (isPdf && rawContent.contains("/Encrypt")) {
                ocrStatus = "PASSWORD_PROTECTED";
                ocrMap.put("provider", ocrProvider);
                ocrMap.put("status", ocrStatus);
                ocrMap.put("readableTextFound", false);
                ocrMap.put("message", "Document is password-protected or encrypted (/Encrypt dictionary detected). Text extraction cannot proceed.");
                ocrMap.put("extractedFields", extractedFields);
            } else if (isImage) {
                ocrStatus = "SCANNED_IMAGE_NO_OCR_ENGINE";
                ocrMap.put("provider", ocrProvider);
                ocrMap.put("status", ocrStatus);
                ocrMap.put("readableTextFound", false);
                ocrMap.put("message", "Raster image uploaded. External optical character recognition engine (e.g., Tesseract) is not configured; no fields fabricated.");
                ocrMap.put("extractedFields", extractedFields);
            } else {
                rawExtractedText = extractReadableText(rawContent, isPdf);
                if (rawExtractedText.length() < 10) {
                    ocrStatus = "UNREADABLE_OR_SCANNED_PDF";
                    ocrMap.put("provider", ocrProvider);
                    ocrMap.put("status", ocrStatus);
                    ocrMap.put("readableTextFound", false);
                    ocrMap.put("message", "No uncompressed text layer found in document stream (likely scanned image PDF). Manual review required.");
                    ocrMap.put("extractedFields", extractedFields);
                } else {
                    readableTextFound = true;
                    ocrStatus = "EXTRACTED";
                    parseStructuredFields(rawExtractedText, extractedFields);
                    ocrMap.put("provider", ocrProvider);
                    ocrMap.put("status", ocrStatus);
                    ocrMap.put("readableTextFound", true);
                    ocrMap.put("characterCount", rawExtractedText.length());
                    ocrMap.put("textSnippet", rawExtractedText.length() > 280 ? rawExtractedText.substring(0, 280) + "..." : rawExtractedText);
                    ocrMap.put("message", "Text layer extracted from document stream.");
                    ocrMap.put("extractedFields", extractedFields);
                }
            }
        }
        ocrMap.put("analyzedAt", LocalDateTime.now().toString());

        // 2. Deterministic Validation Checks
        List<Map<String, String>> deterministicFlags = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Check 2a: Missing required metadata fields
        List<String> missingMeta = new ArrayList<>();
        if (submittedInstitutionCode == null || submittedInstitutionCode.isBlank()) missingMeta.add("institutionCode");
        if (submittedInstitutionName == null || submittedInstitutionName.isBlank()) missingMeta.add("institutionName");
        if (submittedIssueDate == null) missingMeta.add("issueDate");
        boolean requiresExpiry = requirementOrTitle != null && (
                requirementOrTitle.toLowerCase().contains("lease") ||
                requirementOrTitle.toLowerCase().contains("safety") ||
                requirementOrTitle.toLowerCase().contains("noc") ||
                requirementOrTitle.toLowerCase().contains("fdr") ||
                requirementOrTitle.toLowerCase().contains("certificate"));
        if (requiresExpiry && submittedExpiryDate == null) {
            missingMeta.add("expiryDate");
        }

        if (!missingMeta.isEmpty()) {
            deterministicFlags.add(flag(
                    "MISSING_METADATA",
                    "WARNING",
                    "Missing recommended metadata fields: " + String.join(", ", missingMeta),
                    "Submitted metadata is missing: " + String.join(", ", missingMeta)
            ));
        } else {
            deterministicFlags.add(flag(
                    "REQUIRED_METADATA_PRESENT",
                    "PASSED",
                    "All core metadata fields (Institution, Issue Date" + (requiresExpiry ? ", Expiry Date" : "") + ") are recorded.",
                    "Institution: " + submittedInstitutionCode
            ));
        }

        // Check 2b: Date validity & expiry checks
        if (submittedIssueDate != null && submittedExpiryDate != null && submittedExpiryDate.isBefore(submittedIssueDate)) {
            deterministicFlags.add(flag(
                    "INVALID_DATE_RANGE",
                    "FLAGGED",
                    "Submitted Expiry Date precedes Issue Date.",
                    "Issue Date: " + submittedIssueDate + ", Expiry Date: " + submittedExpiryDate
            ));
        } else if (submittedExpiryDate != null) {
            if (submittedExpiryDate.isBefore(today)) {
                deterministicFlags.add(flag(
                        "DOCUMENT_EXPIRED",
                        "FLAGGED",
                        "Document validity has expired prior to today (" + today + ").",
                        "Expiry Date: " + submittedExpiryDate
                ));
            } else if (!submittedExpiryDate.isAfter(today.plusDays(30))) {
                deterministicFlags.add(flag(
                        "EXPIRING_WITHIN_30_DAYS",
                        "WARNING",
                        "Document expires within 30 days; renewal required soon.",
                        "Expiry Date: " + submittedExpiryDate
                ));
            } else {
                deterministicFlags.add(flag(
                        "VALIDITY_WINDOW_ACTIVE",
                        "PASSED",
                        "Document expiry date is valid and more than 30 days in the future.",
                        "Expiry Date: " + submittedExpiryDate
                ));
            }
        }

        // Check 2c: Cross-check OCR extracted fields against submitted metadata when OCR extracted text
        if (readableTextFound && !extractedFields.isEmpty()) {
            String extInst = extractedFields.get("institutionName");
            if (extInst != null && submittedInstitutionName != null
                    && !submittedInstitutionName.toLowerCase().contains(extInst.toLowerCase())
                    && !extInst.toLowerCase().contains(submittedInstitutionName.toLowerCase())) {
                deterministicFlags.add(flag(
                        "INSTITUTION_NAME_MISMATCH",
                        "FLAGGED",
                        "Extracted institution name in document text does not match submitted institution metadata.",
                        "Extracted: '" + extInst + "' vs Submitted: '" + submittedInstitutionName + "'"
                ));
            }
            String extCode = extractedFields.get("institutionCode");
            if (extCode != null && submittedInstitutionCode != null && !extCode.equalsIgnoreCase(submittedInstitutionCode)) {
                deterministicFlags.add(flag(
                        "INSTITUTION_CODE_MISMATCH",
                        "FLAGGED",
                        "Extracted institution code does not match submitted institution code.",
                        "Extracted: '" + extCode + "' vs Submitted: '" + submittedInstitutionCode + "'"
                ));
            }
            String extExpiry = extractedFields.get("expiryDate");
            if (extExpiry != null && submittedExpiryDate != null && !extExpiry.equals(submittedExpiryDate.toString())) {
                deterministicFlags.add(flag(
                        "EXPIRY_DATE_MISMATCH",
                        "FLAGGED",
                        "Extracted expiry date in document text differs from submitted expiry date.",
                        "Extracted: '" + extExpiry + "' vs Submitted: '" + submittedExpiryDate + "'"
                ));
            }
        }

        // 3. AI-Assisted Advisory Status (Strictly Advisory, No Fabricated Confidence Scores)
        Map<String, Object> advisoryEnvelope = new LinkedHashMap<>();
        advisoryEnvelope.put("advisoryOnly", true);
        advisoryEnvelope.put("authoritativeHumanReviewRequired", true);
        advisoryEnvelope.put("deterministicChecks", deterministicFlags);

        boolean aiConfigured = aiProvider != null && !"none".equalsIgnoreCase(aiProvider)
                && !"disabled".equalsIgnoreCase(aiProvider)
                && aiApiKey != null && !aiApiKey.isBlank();

        Map<String, Object> aiSection = new LinkedHashMap<>();
        if (!aiConfigured) {
            aiSection.put("provider", "none");
            aiSection.put("status", "PROVIDER_NOT_CONFIGURED");
            aiSection.put("confidenceScore", null);
            aiSection.put("message", "External AI verification provider is not configured (AI_PROVIDER=none). Deterministic rule checks and local text extraction were executed. Authorised human reviewer decision is required.");
            aiSection.put("observations", Collections.emptyList());
        } else {
            aiSection.put("provider", aiProvider);
            aiSection.put("status", "PROVIDER_UNAVAILABLE_FALLBACK");
            aiSection.put("confidenceScore", null);
            aiSection.put("message", "External AI provider (" + aiProvider + ") outbound call skipped to preserve document confidentiality in local sandbox; deterministic checks applied. Manual review required.");
            aiSection.put("observations", Collections.emptyList());
        }
        advisoryEnvelope.put("aiService", aiSection);
        advisoryEnvelope.put("evaluatedAt", LocalDateTime.now().toString());

        try {
            String ocrJson = objectMapper.writeValueAsString(ocrMap);
            String advJson = objectMapper.writeValueAsString(advisoryEnvelope);
            return new AnalysisResult(ocrStatus, ocrJson, advJson);
        } catch (Exception e) {
            return new AnalysisResult("ERROR", "{}", "{}");
        }
    }

    private Map<String, String> flag(String checkName, String status, String reason, String evidence) {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("check", checkName);
        m.put("status", status);
        m.put("reason", reason);
        m.put("evidence", evidence);
        return m;
    }

    private String extractReadableText(String rawContent, boolean isPdf) {
        if (!isPdf) {
            String cleaned = rawContent.replaceAll("[^\\x20-\\x7E\\r\\n]", " ").replaceAll("\\s+", " ").trim();
            return cleaned;
        }
        StringBuilder sb = new StringBuilder();
        // Extract literal strings inside parentheses in PDF content streams: (...)
        Pattern parenPattern = Pattern.compile("\\(([^()\\\\]{3,200})\\)");
        Matcher m = parenPattern.matcher(rawContent);
        while (m.find()) {
            String token = m.group(1).replaceAll("[^\\x20-\\x7E]", " ").trim();
            if (!token.isEmpty() && !token.startsWith("PDF-") && !token.startsWith("Identity-H")) {
                sb.append(token).append(" ");
            }
        }
        if (sb.length() < 15) {
            // Check if plain text lines exist outside binary blocks
            String plain = rawContent.replaceAll("%PDF-[0-9.]+", "")
                    .replaceAll("(?s)obj.*?endobj", " ")
                    .replaceAll("[^\\x20-\\x7E\\r\\n]", " ")
                    .replaceAll("\\s+", " ")
                    .trim();
            if (plain.length() >= 15) {
                sb.append(plain);
            }
        }
        return sb.toString().replaceAll("\\s+", " ").trim();
    }

    private void parseStructuredFields(String text, Map<String, String> out) {
        Matcher instMatch = Pattern.compile("(?i)(?:Institution(?:\\s+Name)?|College(?:\\s+Name)?)\\s*[:\\-]\\s*([A-Za-z0-9 ,.&()-]{4,100}?)(?=\\s+(?:Institution Code|College ID|AICTE Code|AICTE ID|Document|Certificate|Issue|Expiry|Valid|Date|$))").matcher(text);
        if (instMatch.find()) {
            out.put("institutionName", instMatch.group(1).trim());
        }
        Matcher codeMatch = Pattern.compile("(?i)(?:Institution\\s+Code|College\\s+ID|AICTE\\s+ID|AICTE\\s+Code)\\s*[:\\-]?\\s*(1-[0-9]{7,10}|INST-[A-Za-z0-9-]+)").matcher(text);
        if (codeMatch.find()) {
            out.put("institutionCode", codeMatch.group(1).trim());
        }
        Matcher docNoMatch = Pattern.compile("(?i)(?:Document\\s+No|Certificate\\s+No|Ref(?:erence)?\\s+No|Deed\\s+No)\\s*[:\\-]?\\s*([A-Za-z0-9/\\-_]{4,40})").matcher(text);
        if (docNoMatch.find()) {
            out.put("documentNumber", docNoMatch.group(1).trim());
        }
        Matcher issueMatch = Pattern.compile("(?i)(?:Issue\\s+Date|Issued\\s+On|Date\\s+of\\s+Issue)\\s*[:\\-]?\\s*(20[0-9]{2}-[0-9]{2}-[0-9]{2}|19[0-9]{2}-[0-9]{2}-[0-9]{2})").matcher(text);
        if (issueMatch.find()) {
            out.put("issueDate", issueMatch.group(1).trim());
        }
        Matcher expMatch = Pattern.compile("(?i)(?:Expiry\\s+Date|Valid\\s+Until|Expires\\s+On|Date\\s+of\\s+Expiry)\\s*[:\\-]?\\s*(20[0-9]{2}-[0-9]{2}-[0-9]{2})").matcher(text);
        if (expMatch.find()) {
            out.put("expiryDate", expMatch.group(1).trim());
        }
    }
}
