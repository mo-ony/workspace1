package com.cardif.b2ccustomerauth.resetPassword;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.cardif.b2ccustomerauth.auth.AuthenticationController;
import com.cardif.b2ccustomerauth.user.User;
import com.cardif.b2ccustomerauth.user.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
@RestController
@RequestMapping("/v1/b2c/auth")

//@CrossOrigin("http://localhost:5173")
public class ResetPasswordController {
	
	   @Autowired
	    private UserRepository userRepository;
	   
	   @Autowired
	    private ResetPasswordService resetPasswordService;
	   
	 
	
	
	   
	   @PostMapping("/reset-password")
	    public ResponseEntity<String> initiatePasswordReset(@RequestBody ResetPasswodRequest  request, HttpServletRequest httpRequest) {
		   String appFrontUrl = httpRequest.getHeader("Origin");
		   
		   try {
	        	
	        	log.info(request.getEmail());
	            User user = userRepository.findByEmailIgnoreCase(request.getEmail()).orElseThrow(
	            		() -> new UsernameNotFoundException("Nom d'utilisateur invalide."));
	     	    
	     	   
	     	    
	     	   String token =  resetPasswordService.createPasswordResetTokenForUser(user);
	     	   
	     	   ResetPasswordContextDTO context = ResetPasswordContextDTO.builder()
	     			   .firstname(user.getFirstname())
	     			   .lastname(user.getLastname())
	     			  
	     			  .ResetPasswordURL(appFrontUrl+ "/v1/b2c/auth/valid-password-token?token=" + token+"&appFront=" + appFrontUrl)
	     			   .urlPartener(appFrontUrl)
	     			   .build();
	     	   resetPasswordService.sendResetTokenEmail(context,user);
	            return ResponseEntity.ok("Password reset instructions sent to your email.");
	        } catch (Exception e) {
	            return ResponseEntity.badRequest().body(e.getMessage());
	        }
	    }
	   
	  
	   
	   @GetMapping("/valid-password-token")
	    public ResponseEntity<String> validPasswordToken(@RequestParam("token") String token, @RequestParam("appFront") String appFrontUrl) {
	        String result = resetPasswordService.validatePasswordResetToken(token);
	        if (result != null) {
	        	String encodedErrorMessage = URLEncoder.encode(result, StandardCharsets.UTF_8);
	            // Rediriger vers une page pour modifier le mot de passe si le résultat est null
	            return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY).header("Location", appFrontUrl+"/auth/forgot-password?error=" + encodedErrorMessage).build();
	        } else {
	            // Rediriger vers une page de changement de mot de passe si le résultat est différent de null
	            return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY).header("Location", appFrontUrl+"/auth/change-password?token="+token).build();
	        }
	    }

	  
	   @PostMapping("/change-password")
	   public ResponseEntity<String>  savePassword(@RequestBody PasswordDto passwordDto) {
		   
		   log.info(passwordDto.getToken());

		   String result = resetPasswordService.validatePasswordResetToken(passwordDto.getToken());

	       if(result != null) {
	    	   return ResponseEntity.badRequest().body(result);
	           
	       }

	     Optional<User>  user = resetPasswordService.getUserByPasswordResetToken(passwordDto.getToken());
	       if(user.isPresent()) {
	    	   resetPasswordService.changeUserPassword(user.get(), passwordDto.getPassword());
	           return ResponseEntity.ok().body("Le mot de passe a été changé avec succès.");
	       } else {
	    	   return ResponseEntity.badRequest().body("username invalid ");
	       }
	   }
	
}
