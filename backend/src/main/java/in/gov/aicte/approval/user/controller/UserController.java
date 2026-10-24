package in.gov.aicte.approval.user.controller;

import in.gov.aicte.approval.auth.dto.UserDto;
import in.gov.aicte.approval.common.dto.PageResponse;
import in.gov.aicte.approval.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "AICTE Official and User account management endpoints")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping
    @Operation(summary = "Get all users list")
    public ResponseEntity<PageResponse<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(PageResponse.of(users, users.size(), 0, Math.max(users.size(), 1)));
    }

    @PostMapping
    @Operation(summary = "Create a new user account")
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDto));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update user account status (ACTIVE/INACTIVE)")
    public ResponseEntity<UserDto> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "ACTIVE");
        return ResponseEntity.ok(userService.updateUserStatus(id, status));
    }
}
