package com.stayease.controller;

import com.stayease.dto.request.AuthDtos;
import com.stayease.dto.response.ResponseDtos;
import com.stayease.entity.User;
import com.stayease.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.AuthResponse>> register(
            @Valid @RequestBody AuthDtos.RegisterRequest request) {
        ResponseDtos.AuthResponse auth = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDtos.ApiResponse.success(auth, "Registration successful"));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.AuthResponse>> login(
            @Valid @RequestBody AuthDtos.LoginRequest request) {
        ResponseDtos.AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(auth));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.AuthResponse>> refresh(
            @Valid @RequestBody AuthDtos.RefreshTokenRequest request) {
        ResponseDtos.AuthResponse auth = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(auth));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke tokens")
    public ResponseEntity<ResponseDtos.ApiResponse<Void>> logout(
            @RequestHeader("Authorization") String authHeader,
            @AuthenticationPrincipal User currentUser) {
        String token = authHeader.substring(7);
        authService.logout(token, currentUser.getId());
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info")
    public ResponseEntity<ResponseDtos.ApiResponse<ResponseDtos.UserResponse>> me(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ResponseDtos.ApiResponse.success(ResponseDtos.UserResponse.from(currentUser)));
    }
}
