package com.cardif.b2ccustomerauth.authTrace;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.cardif.b2ccustomerauth.user.User;
import com.cardif.b2ccustomerauth.user.UserRepository;

import jakarta.transaction.Transactional;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@EnableScheduling
public class UserUnlockService {
	
	 @Autowired
	    private UserRepository userRepository;

	    
	 
	 @Scheduled(fixedRate = 60000) // Vérifier toutes les minutes (ajuster selon vos besoins)  
	 public void unlockExpiredLockouts() {
	    	log.info("je m'exucute");
	        LocalDateTime unlockBefore = LocalDateTime.now().minusMinutes(15);
	        log.info(unlockBefore);
	        List<User> lockedUsers = userRepository.findAccountNonLockedByFalseAndLockedAtBefore(unlockBefore);
	        log.info(lockedUsers.size());
	        for (User user : lockedUsers) {
	        	log.info(user.getEmail());
	            user.setAccountNonLocked(true);
	            user.setFailedAttempt(0);
	            userRepository.save(user);
	        }
	    }
	 

	 @Scheduled(fixedRate = 60000)
	 public void resetExpiredFaileAttempts() {
	    	log.info("je m'exucute");
	        LocalDateTime unlockBefore = LocalDateTime.now().minusMinutes(5);
	        log.info(unlockBefore);
	        List<User> Users = userRepository.findUserWithFailedAttemp(unlockBefore);
	        log.info(Users.size());
	        for (User user : Users) {
	        	log.info(user.getEmail());
	            user.setFailedAttempt(0);
	            userRepository.save(user);
	        }
	    }
	 
	 
	  
	    

}
