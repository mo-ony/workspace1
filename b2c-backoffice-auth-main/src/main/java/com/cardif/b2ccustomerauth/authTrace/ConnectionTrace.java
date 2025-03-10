package com.cardif.b2ccustomerauth.authTrace;

import java.time.LocalDateTime;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Builder;
import lombok.Data;

@Entity
@Table(name = "op_connection_trace")
@Data
@Builder
public class ConnectionTrace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;
    
    
    @Column(name = "user_ip_address", nullable = true)
    private String userIpAddress;

    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "attempt_date", columnDefinition = "TIMESTAMP",nullable = false)
    private LocalDateTime attemptDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ConnectionStatus status;

 

}


