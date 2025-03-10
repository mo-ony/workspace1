package com.cardif.b2ccustomerauth.authTrace;


import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
 

 
@Slf4j
@Component
public class AuthenticationSuccessListener implements ApplicationListener<AuthenticationSuccessEvent> {
    @Autowired
    private HttpServletRequest request;
    
    @Autowired
    private LoginAttemptService loginAttemptService;
 
    @Override
    public void onApplicationEvent(AuthenticationSuccessEvent event) {
    	 LocalDateTime currentDateTime = LocalDateTime.now();
        //get the X-Forwarded-For header so that we know if the request is from a proxy
        final String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null){
        	String email= event.getAuthentication().getName();
        	ConnectionTrace connexion =ConnectionTrace.builder()
        	.attemptDate(currentDateTime)
        	.userEmail(email)
        	.status(ConnectionStatus.SUCCESS)
        	.userIpAddress(request.getRemoteAddr())
        	.build();
           
        	
        	
        	loginAttemptService.saveAttemps(connexion);
        	
            //no proxy
            log.error("Successful login attempt for {} from {}", event.getAuthentication().getName(), request.getRemoteAddr());
        } else {
        	String email= event.getAuthentication().getName();
        	ConnectionTrace connexion =ConnectionTrace.builder()
        	.attemptDate(currentDateTime)
        	.userEmail(email)
        	.status(ConnectionStatus.SUCCESS)
        	.userIpAddress(request.getRemoteAddr())
        	.build();
           
        	
        	
        	loginAttemptService.saveAttemps(connexion);
        	
            //from proxy
            log.error("Successful login attempt for {} from {}", event.getAuthentication().getName(), xfHeader.split(",")[0]);
        }
    }
}