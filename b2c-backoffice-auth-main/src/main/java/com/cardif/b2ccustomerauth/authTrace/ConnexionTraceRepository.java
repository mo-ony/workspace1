package com.cardif.b2ccustomerauth.authTrace;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface ConnexionTraceRepository extends JpaRepository<ConnectionTrace, Long> {
	
	
	@Query("SELECT COUNT(*) FROM ConnectionTrace c WHERE c.userEmail = :email " +
	           "AND c.status = 'FAILED' AND c.attemptDate >= :startTime ")
	    int countFailedConnectionsForUserLast5Minutes(@Param("email") String userEmail,
	                                                  @Param("startTime") LocalDateTime startTime);

}
