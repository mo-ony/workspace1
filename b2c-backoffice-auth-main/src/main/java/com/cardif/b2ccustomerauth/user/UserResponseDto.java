package com.cardif.b2ccustomerauth.user;

import com.cardif.b2ccustomerauth.auth.AuthenticationResponse;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDto {
    
    private String username;
    private String firstName;
    private String lastName;
    private Role role;
   

}
