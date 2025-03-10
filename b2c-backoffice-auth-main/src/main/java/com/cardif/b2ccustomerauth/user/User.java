package com.cardif.b2ccustomerauth.user;

import java.util.Date;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.cardif.b2ccustomerauth.token.Token;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "op_users")
public class User implements UserDetails {

	  @Id
	  @GeneratedValue
	  private Integer id;
	  private String firstname;
	  private String lastname;
	  private String email;
	  private String password;
	  private boolean enabled;
	     
	    @Column(name = "account_non_locked")
	    private boolean accountNonLocked;
	     
	    @Column(name = "failed_attempt")
	    private int failedAttempt;
	  
	    
	    @Temporal(TemporalType.TIMESTAMP)
	    @Column(name = "last_connection_attempt", columnDefinition = "TIMESTAMP",nullable = true)
	    private LocalDateTime lastConnectionAttempt;
	    
	    @Temporal(TemporalType.TIMESTAMP)
	    @Column(name = "lock_at", columnDefinition = "TIMESTAMP",nullable = true)
	    private LocalDateTime lockedAt;
	  
	  

	  @Enumerated(EnumType.STRING)
	  private Role role;
 
	  @OneToMany(mappedBy = "user" )
	  private List<Token> tokens;

	
	  @Override
	  public String getPassword() {
	    return password;
	  }

	  @Override
	  public String getUsername() {
	    return email;
	  }

	  @Override
	  public boolean isAccountNonExpired() {
	    return true;
	  }

	  @Override
	  public boolean isAccountNonLocked() {
	    return accountNonLocked;
	  }

	  @Override
	  public boolean isCredentialsNonExpired() {
	    return true;
	  }

	  @Override
	  public boolean isEnabled() {
	    return enabled;
	  }

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
		return null;
	}
}
