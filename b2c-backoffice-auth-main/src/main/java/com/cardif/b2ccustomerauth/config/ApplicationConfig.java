package com.cardif.b2ccustomerauth.config;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import com.cardif.b2ccustomerauth.user.UserRepository;


@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
	
	@Autowired
	 private  UserRepository repository;

	  @Bean
	   UserDetailsService userDetailsService() {
	    return username -> repository.findByEmailIgnoreCase(username)
	        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
	  }

	  @Bean
	  AuthenticationProvider authenticationProvider() {
	    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
	    authProvider.setUserDetailsService(userDetailsService());
	    authProvider.setPasswordEncoder(passwordEncoder());
	    return authProvider;
	  }
	 
	
	
	  @Bean
	   AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
	    return config.getAuthenticationManager();
	  }

	
	 @Bean
	   PasswordEncoder passwordEncoder() {
	    return new BCryptPasswordEncoder();
	  }
	 
	 @Bean
	 RestTemplate restTemplate() {
		    return new RestTemplate();
		}
}
