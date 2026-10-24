package in.gov.aicte.approval.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token obtained from /api/v1/auth/login")))
                .info(new Info()
                        .title("AICTE Approval Management System API")
                        .description("Centralized REST API for All India Council for Technical Education Approval Workflow Automation, Compliance Monitoring, and Alert Management System.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("AICTE Approval Bureau")
                                .email("approval-portal@aicte-india.org")
                                .url("https://www.aicte-india.org"))
                        .license(new License()
                                .name("AICTE e-Governance Portal Prototype")
                                .url("https://www.aicte-india.org")));
    }
}
