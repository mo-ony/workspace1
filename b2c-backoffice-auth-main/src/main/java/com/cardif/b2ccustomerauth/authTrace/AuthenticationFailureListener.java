package com.cardif.b2ccustomerauth.authTrace;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.info.ProjectInfoProperties.Build;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.cardif.b2ccustomerauth.user.User;
import com.cardif.b2ccustomerauth.user.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
 

 
@Slf4j
@Component


public class AuthenticationFailureListener implements ApplicationListener<AuthenticationFailureBadCredentialsEvent> {
 
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private LoginAttemptService loginAttemptService;
    @Autowired
    private UserRepository repo;
    
   
    
    
 
    @Override
    public void onApplicationEvent(AuthenticationFailureBadCredentialsEvent event ) {
    	 LocalDateTime currentDateTime = LocalDateTime.now();
    
    	
    	
    	 final String xfHeader = request.getHeader("X-Forwarded-For");
         if (xfHeader == null){
        	 
        	 
         	String email= event.getAuthentication().getName();
        	User user=  repo.findByEmailIgnoreCase(email).orElseThrow(() -> new UsernameNotFoundException("Nom d'utilisateur ou mot de passe invalide."));
        	 
        	   if (user != null) {
        		
        		   loginAttemptService.saveLastAttempConnexion(currentDateTime,user);
    	            if (user.isEnabled() && user.isAccountNonLocked()) {
    	            	
    	                if (user.getFailedAttempt() < LoginAttemptService.MAX_FAILED_ATTEMPTS - 1) {
    	                	
    	                	loginAttemptService.increaseFailedAttempts(user);
    	                } else {
    	                	loginAttemptService.lock(user,currentDateTime);
    	                   throw new LockedException("Votre compte a été verrouillé en raison de 5 tentatives échouées. Il sera déverrouillé après 15 minutes");
    	                }
    	            } 
    	          
    	        }
   
         	
         	ConnectionTrace connexion =ConnectionTrace.builder()
         	.attemptDate(currentDateTime)
         	.userEmail(email)
         	.status(ConnectionStatus.FAILED)
         	.userIpAddress(request.getRemoteAddr())
         	.build();
            
         	
         	
         	loginAttemptService.saveAttemps(connexion);
         	
             //no proxy
             log.error("Failed login attempt for {} from {}", event.getAuthentication().getName(), request.getRemoteAddr());
         } else {
         	String email= event.getAuthentication().getName();
         	ConnectionTrace connexion =ConnectionTrace.builder()
         	.attemptDate(currentDateTime)
         	.userEmail(email)
         	.status(ConnectionStatus.FAILED)
         	.userIpAddress(request.getRemoteAddr())
         	.build();
            
         	
         	loginAttemptService.saveAttemps(connexion);
         	User user=  repo.findByEmailIgnoreCase(email).orElseThrow(() -> new UsernameNotFoundException("Nom d'utilisateur ou mot de passe invalide."));
        	loginAttemptService.saveLastAttempConnexion(currentDateTime,user);
        	   if (user != null) {
        		   
    	            if (user.isEnabled() && user.isAccountNonLocked()) {
    	       
    	                if (user.getFailedAttempt() < LoginAttemptService.MAX_FAILED_ATTEMPTS - 1) {
    	                	loginAttemptService.increaseFailedAttempts(user);
    	                } else {
    	                	loginAttemptService.lock(user,currentDateTime);
    	                   throw new LockedException("Votre compte a été verrouillé en raison de 5 tentatives échouées. Il sera déverrouillé après 15 minutes");
    	                }
    	            } 
    	             
    	        }
           
        	   log.error("failed login attempt for {} from {}", event.getAuthentication().getName(), xfHeader.split(",")[0]);
           
        }
         	
         	
         	
             //from proxy
            
         }
     
    
}