package com.cardif.b2ccustomerauth.resetPassword;

import com.cardif.b2ccustomerauth.auth.EmailRequestDTO;
import com.cardif.b2ccustomerauth.auth.RegisterRequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class EmailResetPasswordRequestDTO {
	private String to;
    private String subject;
    private String templateName;
    private ResetPasswordContextDTO textFields;

}
