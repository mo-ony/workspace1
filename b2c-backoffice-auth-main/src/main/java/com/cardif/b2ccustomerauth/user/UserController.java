package com.cardif.b2ccustomerauth.user;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
@RequiredArgsConstructor
@Log4j2
@RestController
//@CrossOrigin("http://localhost:5173")
@RequestMapping("/v1/b2c/identity")
public class UserController {
	@Autowired
	private UserRepository userRepository;
	
	  @GetMapping("/user")
	  public ResponseEntity<UserResponseDto> getUser(@AuthenticationPrincipal UserDetails userDetails) {
		            
		  Optional<User> user = userRepository.findByEmailIgnoreCase(userDetails.getUsername()) ;
		  
		  
		  if(user.isPresent()) {
		  UserResponseDto userResponseDto = UserResponseDto.builder()
				  .username(user.get().getUsername())
				  .firstName(user.get().getFirstname())
				  .lastName(user.get().getLastname())
				  .role(user.get().getRole())				  
				  .build(	);
	        return new ResponseEntity<UserResponseDto>(userResponseDto ,HttpStatus.OK);
	    }
	  else {
		  
		  return new ResponseEntity( "utilisateur introuvable", HttpStatus.BAD_REQUEST);
	  }
		  
		  
		  
	  }  
	  
	  @GetMapping("/has-role")
      public boolean hasRole(@AuthenticationPrincipal UserDetails userDetails, @RequestParam Role role) {
         try { 
    	  Optional<User> user = userRepository.findByEmailIgnoreCase(userDetails.getUsername()) ;
		  
		  
		  if(user.isPresent()) {
		 
	        return user.get().getRole().equals(role);
	   
	    }
	  else {
		  
		 return false;
	  }
         }catch (Exception e) {
        	 return false;	
		}  
		 
      
	  }    

}
