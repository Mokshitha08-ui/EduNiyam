package in.gov.aicte.approval.compliance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
        Integer pageCount = null;
        Double calibratedOcrConfidence = null;

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
            ocrMap.put("message", "No binary document stream uploaded for text extraction; metadata-only record.");
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
                ocrMap.put("message", "Document is password-protected or encrypted (/Encrypt dictionary detected). Text extraction cannot proceed without credentials.");
                ocrMap.put("extractedFields", extractedFields);
            } else if (isPdf) {
                // High-fidelity extraction using Apache PDFBox with fallback
                try (PDDocument pdDoc = Loader.loadPDF(fileBytes)) {
                    if (pdDoc.isEncrypted()) {
                        ocrStatus = "PASSWORD_PROTECTED";
                        ocrMap.put("provider", ocrProvider);
                        ocrMap.put("status", ocrStatus);
                        ocrMap.put("readableTextFound", false);
                        ocrMap.put("message", "PDF document is password-protected. Automated OCR extraction prohibited.");
                        ocrMap.put("extractedFields", extractedFields);
                    } else {
                        pageCount = pdDoc.getNumberOfPages();
                        PDFTextStripper stripper = new PDFTextStripper();
                        rawExtractedText = stripper.getText(pdDoc);
                        if (rawExtractedText == null || rawExtractedText.trim().length() < 10) {
                            // Fallback to direct stream token scanning
                            String fallbackText = extractReadableText(rawContent, true);
                            if (fallbackText != null && fallbackText.trim().length() >= 10) {
                                rawExtractedText = fallbackText;
                            }
                        }
                    }
                } catch (Exception e) {
                    // Gracefully fall back to internal stream parser for lightweight mock PDFs
                    rawExtractedText = extractReadableText(rawContent, true);
                }

                if (rawExtractedText != null && rawExtractedText.trim().length() >= 10) {
                    readableTextFound = true;
                    ocrStatus = "EXTRACTED";
                    rawExtractedText = rawExtractedText.trim();
                    parseStructuredFields(rawExtractedText, extractedFields);
                    calibratedOcrConfidence = calculateOcrConfidence(rawExtractedText);
                    if (pageCount != null) {
                        extractedFields.put("pageCount", String.valueOf(pageCount));
                    }
                    ocrMap.put("provider", ocrProvider);
                    ocrMap.put("status", ocrStatus);
                    ocrMap.put("readableTextFound", true);
                    ocrMap.put("characterCount", rawExtractedText.length());
                    if (pageCount != null) {
                        ocrMap.put("pageCount", pageCount);
                    }
                    ocrMap.put("confidenceScore", calibratedOcrConfidence);
                    ocrMap.put("textSnippet", rawExtractedText.length() > 320 ? rawExtractedText.substring(0, 320) + "..." : rawExtractedText);
                    ocrMap.put("message", "Text layer successfully extracted via PDFBox / OCR engine (" + rawExtractedText.length() + " characters).");
                    ocrMap.put("extractedFields", extractedFields);
                } else if (!"PASSWORD_PROTECTED".equals(ocrMap.get("status"))) {
                    ocrStatus = "UNREADABLE_OR_SCANNED_PDF";
                    ocrMap.put("provider", ocrProvider);
                    ocrMap.put("status", ocrStatus);
                    ocrMap.put("readableTextFound", false);
                    if (pageCount != null) {
                        ocrMap.put("pageCount", pageCount);
                    }
                    ocrMap.put("message", "No machine-readable text stream found in PDF (scanned image or raster format). Manual scrutiny required.");
                    ocrMap.put("extractedFields", extractedFields);
                } else {
                    ocrStatus = "PASSWORD_PROTECTED";
                }
            } else if (isImage) {
                // Image handling: Inspect dimensions
                int width = 0;
                int height = 0;
                try {
                    BufferedImage img = ImageIO.read(new ByteArrayInputStream(fileBytes));
                    if (img != null) {
                        width = img.getWidth();
                        height = img.getHeight();
                    }
                } catch (Exception ignored) {
                }

                // Without external OCR engine (like Tesseract/Vision API) configured,
                // raster images do not have an automated text extraction layer.
                ocrStatus = "SCANNED_IMAGE_NO_OCR_ENGINE";
                ocrMap.put("provider", ocrProvider);
                ocrMap.put("status", ocrStatus);
                ocrMap.put("readableTextFound", false);
                if (width > 0 && height > 0) {
                    ocrMap.put("imageResolution", width + "x" + height + " px");
                }
                ocrMap.put("message", "Raster image uploaded (" + (width > 0 ? width + "x" + height + " px" : "image") + "). External optical character recognition engine (e.g., Tesseract) is not configured; no fields fabricated.");
                ocrMap.put("extractedFields", extractedFields);
            } else {
                ocrStatus = "UNSUPPORTED_FORMAT";
                ocrMap.put("provider", ocrProvider);
                ocrMap.put("status", ocrStatus);
                ocrMap.put("readableTextFound", false);
                ocrMap.put("message", "Unsupported file format. Please upload PDF, PNG, JPG, or JPEG format documents.");
                ocrMap.put("extractedFields", extractedFields);
            }
        }
        ocrMap.put("analyzedAt", LocalDateTime.now().toString());

        // 2. Deterministic Verification & Requirements Checks (Features 45 & 46)
        List<Map<String, Object>> deterministicFlags = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Check 2a: Document text readability & sufficiency
        if (readableTextFound) {
            deterministicFlags.add(flag(
                    "DOCUMENT_TEXT_READABILITY",
                    "Text Readability & Extraction",
                    "PASSED",
                    "Machine-readable text stream successfully parsed (" + rawExtractedText.length() + " characters).",
                    "Extracted characters: " + rawExtractedText.length() + " chars",
                    "APH Norms — Machine-readable statutory filing",
                    calibratedOcrConfidence
            ));
        } else {
            deterministicFlags.add(flag(
                    "DOCUMENT_TEXT_READABILITY",
                    "Text Readability & Extraction",
                    "WARNING",
                    "Document does not contain machine-readable text (likely a scanned image copy). Manual scrutiny of document contents required.",
                    ocrMap.get("message") != null ? ocrMap.get("message").toString() : "No text extracted",
                    "APH Norms — Legible institutional evidence",
                    null
            ));
        }

        // Check 2b: Missing required metadata fields
        List<String> missingMeta = new ArrayList<>();
        if (submittedInstitutionCode == null || submittedInstitutionCode.isBlank()) missingMeta.add("institutionCode");
        if (submittedInstitutionName == null || submittedInstitutionName.isBlank()) missingMeta.add("institutionName");
        if (submittedIssueDate == null) missingMeta.add("issueDate");
        boolean requiresExpiry = requirementOrTitle != null && (
                requirementOrTitle.toLowerCase().contains("lease") ||
                requirementOrTitle.toLowerCase().contains("safety") ||
                requirementOrTitle.toLowerCase().contains("noc") ||
                requirementOrTitle.toLowerCase().contains("fdr") ||
                requirementOrTitle.toLowerCase().contains("fire") ||
                requirementOrTitle.toLowerCase().contains("certificate"));
        if (requiresExpiry && submittedExpiryDate == null) {
            missingMeta.add("expiryDate");
        }

        if (!missingMeta.isEmpty()) {
            deterministicFlags.add(flag(
                    "MISSING_METADATA",
                    "Mandatory Regulatory Metadata",
                    "WARNING",
                    "Missing recommended metadata fields: " + String.join(", ", missingMeta),
                    "Submitted metadata is missing: " + String.join(", ", missingMeta),
                    "AICTE APH Chapter VII Mandatory Document Metadata",
                    null
            ));
        } else {
            deterministicFlags.add(flag(
                    "REQUIRED_METADATA_PRESENT",
                    "Mandatory Regulatory Metadata",
                    "PASSED",
                    "All core metadata fields (Institution, Issue Date" + (requiresExpiry ? ", Expiry Date" : "") + ") are recorded.",
                    "Institution: " + submittedInstitutionCode + ", Issue Date: " + submittedIssueDate,
                    "AICTE APH Chapter VII Mandatory Document Metadata",
                    1.0
            ));
        }

        // Check 2c: Date validity & expiry checks
        LocalDate effectiveExpiryDate = submittedExpiryDate;
        boolean expiryFromExtractedText = false;
        if (effectiveExpiryDate == null && extractedFields.containsKey("expiryDate")) {
            try {
                effectiveExpiryDate = LocalDate.parse(extractedFields.get("expiryDate"));
                expiryFromExtractedText = true;
            } catch (Exception ignored) {
            }
        }

        if (submittedIssueDate != null && effectiveExpiryDate != null && effectiveExpiryDate.isBefore(submittedIssueDate)) {
            deterministicFlags.add(flag(
                    "INVALID_DATE_RANGE",
                    "Validity Window Consistency",
                    "FLAGGED",
                    "Document Expiry Date precedes Issue Date.",
                    "Issue Date: " + submittedIssueDate + ", Expiry Date: " + effectiveExpiryDate,
                    "AICTE Regulatory Calendar Norms",
                    1.0
            ));
        } else if (effectiveExpiryDate != null) {
            if (effectiveExpiryDate.isBefore(today)) {
                deterministicFlags.add(flag(
                        "DOCUMENT_EXPIRED",
                        "Document Validity & Expiry",
                        "FLAGGED",
                        "Document validity has expired prior to today (" + today + ")." + (expiryFromExtractedText ? " Detected from extracted document text." : "") + " Statutory approval requires active certificates.",
                        "Expiry Date: " + effectiveExpiryDate + " (Expired on " + effectiveExpiryDate + ")",
                        "AICTE APH Chapter VII — Valid Certificates Only",
                        1.0
                ));
            } else if (!effectiveExpiryDate.isAfter(today.plusDays(30))) {
                deterministicFlags.add(flag(
                        "EXPIRING_WITHIN_30_DAYS",
                        "Document Validity & Expiry",
                        "WARNING",
                        "Document expires within 30 days (" + effectiveExpiryDate + "); renewal required soon.",
                        "Expiry Date: " + effectiveExpiryDate,
                        "AICTE APH Chapter VII — Renewal Window Notice",
                        1.0
                ));
            } else {
                deterministicFlags.add(flag(
                        "VALIDITY_WINDOW_ACTIVE",
                        "Document Validity & Expiry",
                        "PASSED",
                        "Document expiry date is valid and active (" + effectiveExpiryDate + ").",
                        "Expiry Date: " + effectiveExpiryDate,
                        "AICTE APH Chapter VII — Active Validity",
                        1.0
                ));
            }
        }

        // Check 2d: Cross-check OCR extracted fields against submitted metadata
        if (readableTextFound && !extractedFields.isEmpty()) {
            String extInst = extractedFields.get("institutionName");
            if (extInst != null && submittedInstitutionName != null) {
                double similarity = computeNameSimilarity(extInst, submittedInstitutionName);
                if (similarity >= 0.70) {
                    deterministicFlags.add(flag(
                            "INSTITUTION_NAME_CONSISTENCY",
                            "Institution Name Verification",
                            "PASSED",
                            "Extracted institution name matches application records.",
                            "Extracted: '" + extInst + "' vs Registered: '" + submittedInstitutionName + "'",
                            "Institutional Ownership Verification",
                            Math.round(similarity * 100.0) / 100.0
                    ));
                } else {
                    deterministicFlags.add(flag(
                            "INSTITUTION_NAME_MISMATCH",
                            "Institution Name Verification",
                            "FLAGGED",
                            "Extracted institution name in document text does not match submitted institution metadata.",
                            "Extracted: '" + extInst + "' vs Submitted: '" + submittedInstitutionName + "'",
                            "Institutional Ownership Verification",
                            Math.round((1.0 - similarity) * 100.0) / 100.0
                    ));
                }
            }

            String extCode = extractedFields.get("institutionCode");
            if (extCode != null && submittedInstitutionCode != null) {
                if (extCode.equalsIgnoreCase(submittedInstitutionCode)) {
                    deterministicFlags.add(flag(
                            "INSTITUTION_CODE_CONSISTENCY",
                            "Institution Code / AICTE ID Verification",
                            "PASSED",
                            "Extracted institution code matches application records.",
                            "Extracted Code: " + extCode,
                            "AICTE Institutional Identification Norms",
                            1.0
                    ));
                } else {
                    deterministicFlags.add(flag(
                            "INSTITUTION_CODE_MISMATCH",
                            "Institution Code / AICTE ID Verification",
                            "FLAGGED",
                            "Extracted institution code does not match submitted institution code.",
                            "Extracted: '" + extCode + "' vs Submitted: '" + submittedInstitutionCode + "'",
                            "AICTE Institutional Identification Norms",
                            1.0
                    ));
                }
            }

            String extExpiry = extractedFields.get("expiryDate");
            if (extExpiry != null && submittedExpiryDate != null) {
                if (extExpiry.equals(submittedExpiryDate.toString())) {
                    deterministicFlags.add(flag(
                            "EXPIRY_DATE_CONSISTENCY",
                            "Document Text Expiry Consistency",
                            "PASSED",
                            "Extracted expiry date matches submitted metadata.",
                            "Document Date: " + extExpiry,
                            "Statutory Validity Verification",
                            1.0
                    ));
                } else {
                    deterministicFlags.add(flag(
                            "EXPIRY_DATE_MISMATCH",
                            "Document Text Expiry Consistency",
                            "FLAGGED",
                            "Extracted expiry date in document text differs from submitted expiry date.",
                            "Extracted: '" + extExpiry + "' vs Submitted: '" + submittedExpiryDate + "'",
                            "Statutory Validity Verification",
                            1.0
                    ));
                }
            }
        }

        // Check 2e: Page completeness check for multi-page deeds and reports
        if (pageCount != null && pageCount == 1) {
            boolean isMultiPageDoc = requirementOrTitle != null && (
                    requirementOrTitle.toLowerCase().contains("lease") ||
                    requirementOrTitle.toLowerCase().contains("deed") ||
                    requirementOrTitle.toLowerCase().contains("dpr") ||
                    requirementOrTitle.toLowerCase().contains("project report") ||
                    requirementOrTitle.toLowerCase().contains("master plan") ||
                    requirementOrTitle.toLowerCase().contains("audited"));
            if (isMultiPageDoc) {
                deterministicFlags.add(flag(
                        "PAGE_COMPLETENESS_CHECK",
                        "Document Page Count Completeness",
                        "WARNING",
                        "Statutory multi-page requirement (" + requirementOrTitle + ") contains only 1 page. Ensure all pages, schedules, and surveyor endorsements are included.",
                        "Total Pages Detected: 1",
                        "AICTE Document Submission Guidelines — Complete Page Scans",
                        null
                ));
            }
        }

        // Check 2f: Statutory seal and signature disclaimer (Guarding against false authenticity claims)
        deterministicFlags.add(flag(
                "STATUTORY_SEAL_AND_SIGNATURE_NOTICE",
                "Seal and Signature Verification Notice",
                "WARNING",
                "Digital signature and statutory wet ink seal cannot be verified automatically. Authorised AICTE officer must visually confirm seal authenticity and signatory designation.",
                "Automated check does not certify notary or executive wet seal authenticity.",
                "AICTE Procedural Handbook Chapter II Section 3",
                null
        ));

        // 3. AI-Assisted Advisory Status Envelope (Feature 46)
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

    private Map<String, Object> flag(String checkName, String title, String status, String reason, String evidence, String applicableRequirement, Double confidenceScore) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("check", checkName);
        m.put("title", title);
        m.put("status", status);
        m.put("reason", reason);
        m.put("evidence", evidence);
        m.put("applicableRequirement", applicableRequirement);
        m.put("confidenceScore", confidenceScore);
        return m;
    }

    private String extractReadableText(String rawContent, boolean isPdf) {
        if (!isPdf) {
            return rawContent.replaceAll("[^\\x20-\\x7E\\r\\n]", " ").replaceAll("\\s+", " ").trim();
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
        // Institution Name
        Matcher instMatch = Pattern.compile("(?i)(?:Institution(?:\\s+Name)?|College(?:\\s+Name)?|University(?:\\s+Name)?)\\s*[:\\-]\\s*([A-Za-z0-9 ,.&()-]{4,100}?)(?=\\s+(?:Institution Code|College ID|AICTE Code|AICTE ID|Document|Certificate|Issue|Expiry|Valid|Date|$|\r|\n))").matcher(text);
        if (instMatch.find()) {
            out.put("institutionName", instMatch.group(1).trim());
        }

        // Institution Code
        Matcher codeMatch = Pattern.compile("(?i)(?:Institution\\s+Code|College\\s+ID|AICTE\\s+ID|AICTE\\s+Code)\\s*[:\\-]?\\s*(1-[0-9]{7,10}|INST-[A-Za-z0-9-]+)").matcher(text);
        if (codeMatch.find()) {
            out.put("institutionCode", codeMatch.group(1).trim());
        }

        // Document Reference Number
        Matcher docNoMatch = Pattern.compile("(?i)(?:Document\\s+(?:No\\.?|Number)|Certificate\\s+(?:No\\.?|Number)|Ref(?:erence)?\\s+(?:No\\.?|Number)|Deed\\s+(?:No\\.?|Number)|Order\\s+(?:No\\.?|Number))\\s*[:\\-]?\\s*([A-Za-z0-9/\\-_]{4,50})").matcher(text);
        if (docNoMatch.find()) {
            out.put("documentNumber", docNoMatch.group(1).trim());
        }

        // Issue Date
        Matcher issueMatch = Pattern.compile("(?i)(?:Issue\\s+Date|Issued\\s+On|Date\\s+of\\s+Issue)\\s*[:\\-]?\\s*(20[0-9]{2}-[0-9]{2}-[0-9]{2}|19[0-9]{2}-[0-9]{2}-[0-9]{2}|[0-3]?[0-9][/-][0-1]?[0-9][/-]20[0-9]{2})").matcher(text);
        if (issueMatch.find()) {
            out.put("issueDate", normalizeDate(issueMatch.group(1).trim()));
        }

        // Expiry Date
        Matcher expMatch = Pattern.compile("(?i)(?:Expiry\\s+Date|Valid\\s+Until|Expires\\s+On|Date\\s+of\\s+Expiry)\\s*[:\\-]?\\s*(20[0-9]{2}-[0-9]{2}-[0-9]{2}|[0-3]?[0-9][/-][0-1]?[0-9][/-]20[0-9]{2})").matcher(text);
        if (expMatch.find()) {
            out.put("expiryDate", normalizeDate(expMatch.group(1).trim()));
        }
    }

    private String normalizeDate(String rawDate) {
        if (rawDate == null) return null;
        if (rawDate.matches("^20[0-9]{2}-[0-9]{2}-[0-9]{2}$") || rawDate.matches("^19[0-9]{2}-[0-9]{2}-[0-9]{2}$")) {
            return rawDate;
        }
        try {
            if (rawDate.contains("/")) {
                String[] parts = rawDate.split("/");
                if (parts.length == 3) {
                    return String.format("%04d-%02d-%02d", Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0]));
                }
            }
            if (rawDate.contains("-")) {
                String[] parts = rawDate.split("-");
                if (parts.length == 3 && parts[2].length() == 4) {
                    return String.format("%04d-%02d-%02d", Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0]));
                }
            }
        } catch (Exception ignored) {
        }
        return rawDate;
    }

    private double calculateOcrConfidence(String text) {
        if (text == null || text.isBlank()) return 0.0;
        int len = text.length();
        long alphaCount = text.chars().filter(Character::isLetterOrDigit).count();
        double alphaRatio = (double) alphaCount / len;

        // Regulatory keywords presence
        String lower = text.toLowerCase();
        String[] keywords = {"aicte", "approval", "council", "technical", "institution", "college", "certificate", "date", "valid", "fire", "safety", "land", "order"};
        int matches = 0;
        for (String kw : keywords) {
            if (lower.contains(kw)) matches++;
        }
        double keywordWeight = Math.min(1.0, (double) matches / 4.0);

        double score = (alphaRatio * 0.5) + (keywordWeight * 0.5);
        return Math.round(Math.min(0.99, Math.max(0.65, score)) * 100.0) / 100.0;
    }

    private double computeNameSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;
        String n1 = s1.toLowerCase().replaceAll("[^a-z0-9]", " ").replaceAll("\\s+", " ").trim();
        String n2 = s2.toLowerCase().replaceAll("[^a-z0-9]", " ").replaceAll("\\s+", " ").trim();
        if (n1.equals(n2) || n1.contains(n2) || n2.contains(n1)) return 1.0;

        Set<String> words1 = new HashSet<>(Arrays.asList(n1.split(" ")));
        Set<String> words2 = new HashSet<>(Arrays.asList(n2.split(" ")));
        words1.remove("of"); words1.remove("the"); words1.remove("and"); words1.remove("in");
        words2.remove("of"); words2.remove("the"); words2.remove("and"); words2.remove("in");

        if (words1.isEmpty() || words2.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        return (double) intersection.size() / Math.max(words1.size(), words2.size());
    }
}
