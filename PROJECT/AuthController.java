
package com.smartqueue.backend.controller;

import com.smartqueue.backend.dto.AuthResponse;
import com.smartqueue.backend.dto.LoginRequest;
import com.smartqueue.backend.dto.RegisterRequest;
import com.smartqueue.backend.entity.Organization;
import com.smartqueue.backend.repository.OrganizationRepository;
import com.smartqueue.backend.repository.QueueAdminRepository;
import com.smartqueue.backend.security.AppUserDetails;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OrganizationRepository organizationRepository;
    private final QueueAdminRepository queueAdminRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthController(
            OrganizationRepository organizationRepository,
            QueueAdminRepository queueAdminRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager
    ) {
        this.organizationRepository = organizationRepository;
        this.queueAdminRepository = queueAdminRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    // Get CSRF token before making POST, PUT or DELETE requests.
    @GetMapping("/csrf")
    public CsrfToken getCsrfToken(CsrfToken csrfToken) {
        return csrfToken;
    }

    // Register a new organization owner.
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        String username = request.username().trim();

        if (organizationRepository.existsByOwnerUsername(username)
                || queueAdminRepository.existsByUsername(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username is already taken"
            );
        }

        Organization organization = new Organization(
                request.organizationName().trim(),
                username,
                passwordEncoder.encode(request.password())
        );

        Organization saved = organizationRepository.save(organization);

        return new AuthResponse(
                saved.getOwnerUsername(),
                "OWNER",
                saved.getId(),
                null
        );
    }

    // Login for either an organization owner or a queue admin.
    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username().trim(),
                        request.password()
                )
        );

        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        securityContextRepository.saveContext(
                context,
                httpRequest,
                httpResponse
        );

        AppUserDetails user =
                (AppUserDetails) authentication.getPrincipal();

        return new AuthResponse(
                user.getUsername(),
                user.getRole(),
                user.getOrganizationId(),
                user.getQueueId()
        );
    }

    // Get the currently logged-in account.
    @GetMapping("/me")
    public AuthResponse currentUser(Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof AppUserDetails user)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Not logged in"
            );
        }

        return new AuthResponse(
                user.getUsername(),
                user.getRole(),
                user.getOrganizationId(),
                user.getQueueId()
        );
    }

    // Logout and invalidate the browser session.
    @PostMapping("/logout")
    public void logout(HttpServletRequest request) {

        SecurityContextHolder.clearContext();

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }
    }
}
