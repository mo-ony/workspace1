package com.cardif.b2ccustomerauth.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import com.cardif.b2ccustomerauth.config.JwtService;
import com.cardif.b2ccustomerauth.token.Token;
import com.cardif.b2ccustomerauth.token.TokenRepository;
import com.cardif.b2ccustomerauth.token.TokenType;


import com.cardif.b2ccustomerauth.user.User;
import com.cardif.b2ccustomerauth.user.UserRepository;
import com.cardif.b2ccustomerauth.util.CookieUtils;

import io.jsonwebtoken.io.IOException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;


import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.exc.StreamWriteException;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
public class AuthenticationService {
	
	
	
	 @Value("${application.security.jwt.emailMsUrl}")
	  private String EMAIL_MICROSERVICE_URL;
	 
	 
	  @Autowired
	  private  UserRepository repository;
	  @Autowired
	  private  TokenRepository tokenRepository;
	  @Autowired
	  private PasswordEncoder passwordEncoder;
	  @Autowired
	  private  JwtService jwtService;
	
	  @Autowired
	  private  AuthenticationManager authenticationManager;
	  
	  @Autowired
	  private UserDetailsService userDetailsService;
	 
	  
	  @Transactional
	  public AuthenticationResponse register(RegisterRequest request) throws JsonProcessingException {
		  // Vérifie si l'e-mail existe déjà dans la base de données
		    if (repository.existsByEmailIgnoreCase(request.getEmail())) {
		        log.error("Erreur d'enregistrement : L'e-mail existe déjà.");
		        throw new RuntimeException("L'e-mail existe déjà.");
		    }
		    try
		    {
		    	
			    var user = User.builder()
			        .firstname(request.getFirstname())
			        .lastname(request.getLastname())
			        .email(request.getEmail())
			        .failedAttempt(0)
			        .enabled(true)
			        .accountNonLocked(true)
			        .password(passwordEncoder.encode(request.getPassword()))
			        .role(request.getRole())
			        
			        
			        .build();
			    
			    log.info(user.getEmail()+user.getPassword());
			    var savedUser = repository.save(user);
			    var jwtToken = jwtService.generateToken(user);
			    var refreshToken = jwtService.generateRefreshToken(user);
			    
			    saveUserToken(savedUser, jwtToken);
			   
			    return AuthenticationResponse.builder()
			        .accessToken(jwtToken)
			            .refreshToken(refreshToken)
			        .build();
				
			} catch (Exception e) {
				    log.error(e.getMessage());
			        throw new RuntimeException(e.getMessage());
			}
		   
		  }
	  
	
	  public AuthenticationResponse authenticate(AuthenticationRequest request, HttpServletResponse response) {
		    log.info("Starting authentication process for: {}", request.email);
		    try {
		        // Step 1: Converts the request to an Authentication object
		        Authentication auth = new UsernamePasswordAuthenticationToken(
		            request.getEmail(),
		            request.getPassword()
		        );           
		        authenticationManager.authenticate(auth);
		        SecurityContextHolder.getContext().setAuthentication(auth);

		        log.info("Authenticated user: {}", request.getEmail());
		        var user = repository.findByEmailIgnoreCase(request.getEmail())
		            .orElseThrow(() -> new RuntimeException("User not found"));
		        var jwtToken = jwtService.generateToken(user);
		        var refreshToken = jwtService.generateRefreshToken(user);

		        revokeAllUserTokens(user);
		        saveUserToken(user, jwtToken);

		        // Add tokens to cookies
		        CookieUtils.addCookie(response, "accessToken", jwtToken);
		        CookieUtils.addCookie(response, "refreshToken", refreshToken);

		        return AuthenticationResponse.builder()
		            .accessToken(jwtToken)
		            .refreshToken(refreshToken)
		            .build();
		    } catch (LockedException e) {
		        log.error("Authentication failed: {}", e.getMessage());
		        throw new RuntimeException(e.getMessage());
		    } catch (AuthenticationException e) {
		        log.error("Invalid username or password: {}", e.getMessage());
		        throw new RuntimeException("Invalid username or password.");
		    } catch (Exception e) {
		        log.error("Error during authentication: {}", e.getMessage());
		        throw new RuntimeException(e);
		    }
		}

	private void saveUserToken(User user, String jwtToken) {
		var token = Token.builder()
	      .user(user)
	        .token(jwtToken)
	        .tokenType(TokenType.BEARER)
	        .expired(false)
	        .revoked(false)
	        .build();
	    tokenRepository.save(token);
		
	}


	private void revokeAllUserTokens(User user) {
		   var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
		    if (validUserTokens.isEmpty())
		      return;
		    validUserTokens.forEach(token -> {
		      token.setExpired(true);
		      token.setRevoked(true);
		    });
		    tokenRepository.saveAll(validUserTokens);
		
	}
	public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException, StreamWriteException, DatabindException, java.io.IOException {
	    final String refreshToken = CookieUtils.getCookieValue(request, "refreshToken");
	    final String userEmail;
	    if (refreshToken == null) {
	        return;
	    }
	    userEmail = jwtService.extractUsername(refreshToken);
	    if (userEmail != null) {
	        var user = this.repository.findByEmailIgnoreCase(userEmail)
	            .orElseThrow(() -> new RuntimeException("User not found"));
	        if (jwtService.isTokenValid(refreshToken, user)) {
	            var accessToken = jwtService.generateToken(user);
	            revokeAllUserTokens(user);
	            saveUserToken(user, accessToken);

	            // Add new access token to cookies
	            CookieUtils.addCookie(response, "accessToken", accessToken);
	            // Optionally, update the refresh token cookie as well
	            CookieUtils.addCookie(response, "refreshToken", refreshToken);

	            // Optionally remove this line to prevent tokens from being sent in response body
	            // var authResponse = AuthenticationResponse.builder()
	            //     .accessToken(accessToken)
	            //     .refreshToken(refreshToken)
	            //     .build();
	            // new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
	        }
	    }
	}


	
	public Boolean verifyToken(HttpServletRequest request) {
	    log.info("service verifyToken is starting...");
	    String token = CookieUtils.getCookieValue(request, "accessToken");
	    if (token != null && jwtService.validateToken(token)) {
	        var userEmail = jwtService.extractUsername(token);
	        if (userEmail != null) {
	            var user = this.repository.findByEmailIgnoreCase(userEmail)
	                .orElseThrow(() -> new RuntimeException("User not found"));
	            try {
	                return jwtService.isTokenValid(token, user);
	            } catch (Exception e) {
	                log.error("Token validation error: {}", e.getMessage());
	                return false;
	            }
	        }
	    }
	    return false;
	}
	  
	

}
