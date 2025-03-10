package com.cardif.b2ccustomerauth.authTrace;


import java.time.LocalDateTime;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import jakarta.transaction.Transactional;

import com.cardif.b2ccustomerauth.user.User;
import com.cardif.b2ccustomerauth.user.UserRepository;
import java.time.ZoneId;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@EnableTransactionManagement
public class LoginAttemptService {

	public static final int MAX_FAILED_ATTEMPTS = 5;
    
    private static final long LOCK_TIME_DURATION = 1 * 60 * 1000; // 15min
     
    @Autowired
    private UserRepository repo;
    
    @Autowired
    private  ConnexionTraceRepository connexionRepo;
     
     
    @Transactional
    public void increaseFailedAttempts(User user) {
    	log.info("increaseFailedAttempts");
    	String email= user.getEmail();
    	log.info(user.getId());
        int newFailAttempts = user.getFailedAttempt() + 1;
        
     
     repo.updateFailedAttempts(newFailAttempts, email);
        
        
    }
    @Transactional
    public void resetFailedAttempts(String email) {
      repo.updateFailedAttempts(0, email);
    }
   
    @Transactional
    public void lock(User user,  LocalDateTime date) {
        user.setAccountNonLocked(false);
        user.setLockedAt(date);
        repo.save(user);
    }
    
    @Transactional
    public void saveAttemps(ConnectionTrace connexion) {

         ConnectionTrace savedConnexion= connexionRepo.save(connexion);
        
    }
    @Transactional
    public void saveLastAttempConnexion(LocalDateTime date,User user){
    	repo.updateLastAttemptConnexion(date, user.getEmail());
    }
    

 
}