package com.cardif.b2ccustomerauth.resetPassword;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.cardif.b2ccustomerauth.auth.EmailRequestDTO;

import com.cardif.b2ccustomerauth.auth.RegisterRequest;
import com.cardif.b2ccustomerauth.config.JwtService;
import com.cardif.b2ccustomerauth.user.User;
import com.cardif.b2ccustomerauth.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.log4j.Log4j2;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
@Service
@Log4j2
public class ResetPasswordService {
	
	
	 @Value("${application.security.jwt.emailMsUrl}")
	  private String EMAIL_MICROSERVICE_URL;
	 
	@Autowired
	  private  RestTemplate restTemplate;
	  @Autowired
	  private  ObjectMapper objectMapper;
	  
	  @Autowired
	  private  JwtService jwtService;
	  
	  @Autowired
	  private  	UserRepository  userRepository;
	  
	  @Autowired
	  private PasswordEncoder passwordEncoder;
	
	  public String createPasswordResetTokenForUser(User user) {
		  
		    
		String token=  jwtService.generateResetPasswordToken(user);		
		   return token;
	  
	  }
	  
	  
	  public String  validatePasswordResetToken(String token)
	  {
			return  jwtService.isTokenExpired(token) ? "Le token de réinitialisation de mot de passe a expiré."
		            : !jwtService.validateToken(token) ? "Le token de réinitialisation de mot de passe est invalid."
		            : null;
	  }
	  
	  
	  public void changeUserPassword(User user, String password) {
		    user.setPassword(passwordEncoder.encode(password));
                 userRepository.save(user);
		}
	  
	  
	  public Optional<User>  getUserByPasswordResetToken(String token) {
		 String userName=jwtService.extractUsername(token);
		 
		 Optional<User> user = userRepository.findByEmailIgnoreCase(userName);
  	    
  	   
		  return user;
		  
	  }
	  
	      
	  
	 public void sendResetTokenEmail(ResetPasswordContextDTO context,User user) throws JsonProcessingException {
		 try{
		  EmailResetPasswordRequestDTO emailRequest = EmailResetPasswordRequestDTO.builder()
				  .to(user.getEmail())
				  .subject("CARDIF EL DJAZAIR : Email de changement mot de passe")
				  .templateName("resetPasswordTemplate")
				  .textFields(context)
				  .build();
		   objectMapper.writeValueAsString(emailRequest);
		    log.info(objectMapper.writeValueAsString(emailRequest));
	        restTemplate.postForEntity(EMAIL_MICROSERVICE_URL, emailRequest, Void.class);
	    } catch (Exception e) {
	    	log.info(e);
	    	
	    	throw new RuntimeException("Erreur lors de l'envoi d'email", e);
	    }
			
		}

}
