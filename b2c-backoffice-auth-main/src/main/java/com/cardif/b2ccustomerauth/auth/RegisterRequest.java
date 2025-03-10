package com.cardif.b2ccustomerauth.auth;


import com.cardif.b2ccustomerauth.user.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
	
	
	  @NotBlank
	  private String firstname;
	  @NotBlank
	  private String lastname;
	  
	  @Email
	  private String email;
	  private String password;
	  
	  
	  private Role role;
	  
	 

}
