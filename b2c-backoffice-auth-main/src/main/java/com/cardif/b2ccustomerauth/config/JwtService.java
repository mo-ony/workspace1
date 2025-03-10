package com.cardif.b2ccustomerauth.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.cardif.b2ccustomerauth.user.User;

@Service
public class JwtService {
	
	  @Value("${application.security.jwt.secret-key}")
	  private String secretKey;
	  
	  @Value("${application.security.jwt.expiration}")
	  private long jwtExpiration;
	  
	  @Value("${application.security.jwt.refresh-token.expiration}")
	  private long refreshExpiration;
	  
	  @Value("${application.security.jwt.reset-password-token.expiration}")
	  private long resetPasswordExpiration;

	  public String extractUsername(String token) {
	    return extractClaim(token, Claims::getSubject);
	  }

	  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
	    final Claims claims = extractAllClaims(token);
	    return claimsResolver.apply(claims);
	  }

	  public String generateToken(User userDetails) {
	    return generateToken(new HashMap<>(), userDetails);
	  }

	  public String generateToken(
	      Map<String, Object> extraClaims,
	      User userDetails
	  ) {
	    return buildToken(extraClaims, userDetails, jwtExpiration);
	  }

	  public String generateRefreshToken(
	      UserDetails userDetails
	  ) {
	    return buildToken(new HashMap<>(), userDetails, refreshExpiration);
	  }
	  
	  public String generateResetPasswordToken(
		      UserDetails userDetails
		  ) {
		    return buildToken(new HashMap<>(), userDetails, resetPasswordExpiration);
		  }

	  private String buildToken(
	          Map<String, Object> extraClaims,
	          UserDetails userDetails,
	          long expiration
	  ) {
	    return Jwts
	            .builder()
	            .setClaims(extraClaims)
	            .setSubject(userDetails.getUsername())
	            .setIssuedAt(new Date(System.currentTimeMillis()))
	            .setExpiration(new Date(System.currentTimeMillis() + expiration))
	            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
	            .compact();
	  }

	  public boolean isTokenValid(String token, UserDetails userDetails) {
	    final String username = extractUsername(token);
	    return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
	  }

	  public boolean isTokenExpired(String token) {
		  
		  try {
			  return extractExpiration(token).before(new Date());
			
		} catch (ExpiredJwtException e) {
			return true;
		}
	   
	  }

	  private Date extractExpiration(String token) {
	    return extractClaim(token, Claims::getExpiration);
	  }

	  private Claims extractAllClaims(String token) {
	    return Jwts
	        .parserBuilder()
	        .setSigningKey(getSignInKey())
	        .build()
	        .parseClaimsJws(token)
	        .getBody();
	  }

	  private Key getSignInKey() {
	    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
	    return Keys.hmacShaKeyFor(keyBytes);
	  }
	  
	  public boolean validateToken(String token) {
			try {
				Jwts
		        .parserBuilder()
		        .setSigningKey(getSignInKey())
		        .build()
		        .parseClaimsJws(token);
				return true;
			}
			catch (Exception ex) {
				throw new AuthenticationCredentialsNotFoundException("JWT token is not valid " + token);
				//return false;
			}
		}
	  
	  public boolean hasRole(String token, String role) {
	      
	            // Parse the JWT token and extract its claims
	            Claims claims = Jwts.parserBuilder()
	    		        .setSigningKey(getSignInKey())
	    		        .build()
	                    .parseClaimsJws(token)
	                    .getBody();

	            // Check if the given role is available in the token's claims
	            return claims.get("role", String.class).equals(role);
	        
	    }
}
