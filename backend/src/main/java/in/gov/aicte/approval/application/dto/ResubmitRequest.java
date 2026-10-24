package in.gov.aicte.approval.application.dto;

import java.util.List;

public class ResubmitRequest {

    private String responseNotes;
    private List<String> documentIds;

    public ResubmitRequest() {
    }

    public ResubmitRequest(String responseNotes, List<String> documentIds) {
        this.responseNotes = responseNotes;
        this.documentIds = documentIds;
    }

    public String getResponseNotes() {
        return this.responseNotes;
    }

    public void setResponseNotes(String responseNotes) {
        this.responseNotes = responseNotes;
    }

    public List<String> getDocumentIds() {
        return this.documentIds;
    }

    public void setDocumentIds(List<String> documentIds) {
        this.documentIds = documentIds;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String responseNotes;
        private List<String> documentIds;

        public Builder() {}

        public Builder responseNotes(String responseNotes) {
            this.responseNotes = responseNotes;
            return this;
        }

        public Builder documentIds(List<String> documentIds) {
            this.documentIds = documentIds;
            return this;
        }

        public ResubmitRequest build() {
            return new ResubmitRequest(this.responseNotes, this.documentIds);
        }
    }

}
