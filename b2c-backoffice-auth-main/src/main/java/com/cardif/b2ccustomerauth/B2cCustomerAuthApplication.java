package com.cardif.b2ccustomerauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.cardif.b2ccustomerauth.config.CryptageConfig;

@SpringBootApplication
public class B2cCustomerAuthApplication {

	@Autowired
	CryptageConfig cryptageConfig;
	
	public static void main(String[] args) {
		SpringApplication.run(B2cCustomerAuthApplication.class, args);
	}

}
