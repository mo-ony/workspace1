package com.cardif.b2ccustomerauth.resetPassword;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResetPasswordContextDTO {
	private String firstname;
	private String lastname;
	private String urlPartener;
	private String ResetPasswordURL;
	

}

    
