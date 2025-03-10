package com.cardif.b2ccustomerauth.auth;

import java.io.IOException;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cardif.b2ccustomerauth.config.CryptageConfig;
import com.cardif.b2ccustomerauth.config.JwtService;
import com.cardif.b2ccustomerauth.user.UserDao;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.cardif.b2ccustomerauth.util.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
@RestController
@RequestMapping("/v1/b2c/auth")
public class AuthenticationController {


	
    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
        @RequestBody RegisterRequest request
    ) {
        log.info("start register controller");
        try {
            return ResponseEntity.ok(service.register(request));
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<String> authenticate(
        @RequestBody AuthenticationRequest request,
        HttpServletResponse response
    ) {
    	
        log.info("start authenticate controller"); 
        try {
            AuthenticationResponse authResponse = service.authenticate(request, response);
            return ResponseEntity.ok("Authentication successful");
        } catch (Exception e) {
            log.error(e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/refresh-token")
    public void refreshToken(
        HttpServletRequest request,
        HttpServletResponse response
    ) throws IOException, JsonGenerationException, JsonMappingException, java.io.IOException {
        log.info("start refresh-token controller");
        service.refreshToken(request, response);
    }

    @GetMapping("/verify-token")
    public ResponseEntity<Boolean> verifyToken(HttpServletRequest request) {
        log.info("start verify-token controller");
        try {
            Boolean response = service.verifyToken(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Token verification error: {}", e.getMessage());
            return new ResponseEntity<>(false, HttpStatus.BAD_REQUEST);
        }
    }

    @Autowired
    private UserDao userDao;

    @GetMapping("/Email-token")
    public ResponseEntity<Object> GetEmailFromToken(HttpServletRequest request) {
        log.info("début de la méthode UserController.GetEmailFromToken");
        try {
        	String Token = CookieUtils.getCookieValue(request, "accessToken");
            Object response = userDao.findEmailFromToken(Token);
            log.info("fin de la méthode UserController.GetEmailFromToken");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.info("fin de la méthode UserController.GetEmailFromToken", e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
