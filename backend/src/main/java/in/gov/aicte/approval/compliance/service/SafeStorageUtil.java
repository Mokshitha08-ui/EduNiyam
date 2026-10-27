package in.gov.aicte.approval.compliance.service;

import in.gov.aicte.approval.common.exception.BadRequestException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Locale;

/**
 * Utility for secure file storage, path traversal protection, and statutory PDF summary generation.
 */
public final class SafeStorageUtil {

    private SafeStorageUtil() {
    }

    public static String sanitizeFilename(String rawFilename) {
        if (rawFilename == null || rawFilename.isBlank()) {
            return "document.pdf";
        }
        String name = rawFilename.trim();
        if (name.contains("..")) {
            throw new BadRequestException("Invalid filename: path traversal characters ('..') are not allowed.");
        }
        if (name.contains("/") || name.contains("\\")) {
            int lastSlash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
            if (lastSlash >= 0) {
                name = name.substring(lastSlash + 1);
            }
        }
        String cleaned = name.replaceAll("[^a-zA-Z0-9._\\- ()]", "_");
        if (cleaned.isBlank() || cleaned.startsWith(".")) {
            return "document.pdf";
        }
        return cleaned;
    }

    public static String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) {
            return "";
        }
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    public static String storeBytes(String uploadDir, String subFolder, String entityId, String safeFileName, byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            return null;
        }
        String cleanSub = subFolder != null ? subFolder.replaceAll("[^a-zA-Z0-9_\\-]", "") : "docs";
        String cleanEntity = entityId != null ? entityId.replaceAll("[^a-zA-Z0-9_\\-]", "_") : "entity";
        String cleanFile = sanitizeFilename(safeFileName);

        Path baseDir = Paths.get(uploadDir != null && !uploadDir.isBlank() ? uploadDir : "./uploads/aicte-documents")
                .toAbsolutePath()
                .normalize();

        Path targetDir = baseDir.resolve(cleanSub).resolve(cleanEntity).normalize();
        if (!targetDir.startsWith(baseDir)) {
            throw new BadRequestException("Security violation: path traversal detected in storage path.");
        }

        Path targetFile = targetDir.resolve(cleanFile).normalize();
        if (!targetFile.startsWith(baseDir)) {
            throw new BadRequestException("Security violation: path traversal detected in target filename.");
        }

        try {
            Files.createDirectories(targetDir);
            Files.write(targetFile, bytes);
            return baseDir.relativize(targetFile).toString().replace('\\', '/');
        } catch (IOException e) {
            throw new BadRequestException("Failed to persist document file: " + e.getMessage());
        }
    }

    public static byte[] readStoredBytes(String uploadDir, String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return null;
        }
        if (storageKey.contains("..")) {
            throw new BadRequestException("Security violation: path traversal detected in storage key.");
        }
        Path baseDir = Paths.get(uploadDir != null && !uploadDir.isBlank() ? uploadDir : "./uploads/aicte-documents")
                .toAbsolutePath()
                .normalize();
        Path resolved = baseDir.resolve(storageKey).normalize();
        if (!resolved.startsWith(baseDir)) {
            throw new BadRequestException("Security violation: path traversal detected in resolved storage key.");
        }
        if (!Files.exists(resolved) || !Files.isRegularFile(resolved)) {
            return null;
        }
        try {
            return Files.readAllBytes(resolved);
        } catch (IOException e) {
            return null;
        }
    }

    public static byte[] generateStatutoryPdfSummary(
            String recordId,
            String documentName,
            String institutionName,
            String institutionCode,
            String requirementType,
            String version,
            String verificationStatus,
            LocalDate issueDate,
            LocalDate expiryDate,
            String remarks) {

        String textBlock = String.join("\n",
                "%PDF-1.4",
                "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
                "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
                "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj",
                "4 0 obj << /Length 512 >> stream",
                "BT /F1 11 Tf 50 720 Td",
                "(AICTE STATUTORY COMPLIANCE & DOCUMENT RECORD) Tj",
                "0 -20 Td (Document Reference ID: " + safePdfText(recordId) + ") Tj",
                "0 -16 Td (Document Name: " + safePdfText(documentName) + ") Tj",
                "0 -16 Td (Institution Name: " + safePdfText(institutionName) + ") Tj",
                "0 -16 Td (AICTE Code: " + safePdfText(institutionCode) + ") Tj",
                "0 -16 Td (Requirement Category: " + safePdfText(requirementType) + ") Tj",
                "0 -16 Td (Version: " + safePdfText(version) + " | Status: " + safePdfText(verificationStatus) + ") Tj",
                "0 -16 Td (Issue Date: " + (issueDate != null ? issueDate : "N/A") + ") Tj",
                "0 -16 Td (Valid Until: " + (expiryDate != null ? expiryDate : "N/A") + ") Tj",
                "0 -16 Td (Remarks: " + safePdfText(remarks) + ") Tj",
                "ET",
                "endstream endobj",
                "trailer << /Root 1 0 R >>",
                "%%EOF"
        );
        return textBlock.getBytes(StandardCharsets.UTF_8);
    }

    private static String safePdfText(String input) {
        if (input == null || input.isBlank()) return "N/A";
        return input.replace("(", "[").replace(")", "]").replace("\r", " ").replace("\n", " ");
    }
}
