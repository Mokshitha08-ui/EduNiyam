package in.gov.aicte.approval.auth.dto;


public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private long expiresIn = 86400;
    private UserDto user;

    public AuthResponse() {
    }

    public AuthResponse(String token, String type, long expiresIn, UserDto user) {
        this.token = token;
        this.type = type;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public String getToken() {
        return this.token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getExpiresIn() {
        return this.expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public UserDto getUser() {
        return this.user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;
        private String type = "Bearer";
        private long expiresIn = 86400;
        private UserDto user;

        public Builder() {}

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public Builder type(String type) {
            this.type = type;
            return this;
        }

        public Builder expiresIn(long expiresIn) {
            this.expiresIn = expiresIn;
            return this;
        }

        public Builder user(UserDto user) {
            this.user = user;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(this.token, this.type, this.expiresIn, this.user);
        }
    }

}
