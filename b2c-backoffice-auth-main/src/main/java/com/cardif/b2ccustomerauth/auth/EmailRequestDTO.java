package com.cardif.b2ccustomerauth.auth;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailRequestDTO {
	private String to;
    private String subject;
    private String templateName;
    private RegisterRequest textFields;
}
