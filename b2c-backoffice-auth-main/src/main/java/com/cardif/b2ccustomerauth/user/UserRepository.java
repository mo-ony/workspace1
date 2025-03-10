package com.cardif.b2ccustomerauth.user;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;


public interface UserRepository extends JpaRepository<User, Integer> {

	Optional<User> findByEmailIgnoreCase(@Param("email") String email);
    boolean existsByEmailIgnoreCase(@Param("email") String email);
   
	  
	  
	  
	  /**
	   * Updates the `failedAttempt` field for a specific user identified by their email address.
	   * 
	   * This method likely uses a JPQL update query to modify the user's record in the database.
	   *
	   * @param failedAttempt The new value for the `failedAttempt` field, potentially tracking unsuccessful login attempts.
	   * @param email The email address of the user whose attempt count needs to be updated.
	   */
	    @Query(value="UPDATE User u SET u.failedAttempt =:failedAttempt  where LOWER(u.email) = LOWER(:email)")
	    @Modifying()
	    public void updateFailedAttempts(int failedAttempt, String email);
	    
	    /**
	     * Finds users where the `locked` field is true and the `lockedAt` timestamp is before the provided date.
	     * 
	     * @param AccountNonLocked False to search for locked users.
	     * @param lockedAtBefore The date/time before which locked users should be retrieved.
	     * @return A list of locked users.
	     */
	   
	    @Query("SELECT u FROM User u WHERE u.accountNonLocked = false AND u.lockedAt < :lockedAtBefore")
	    List<User> findAccountNonLockedByFalseAndLockedAtBefore(LocalDateTime lockedAtBefore);
	    
	    
	    @Query(value="UPDATE User u SET u.lastConnectionAttempt =:date  where  u.email =:email")
	    @Modifying()
	    public void updateLastAttemptConnexion(LocalDateTime date ,String email );
	    
	    
	    @Query("SELECT u FROM User u WHERE  u.lastConnectionAttempt < :lastConnectionAttempt")
	    List<User> findUserWithFailedAttemp(LocalDateTime lastConnectionAttempt);
	    
	    
}

         
  
     
