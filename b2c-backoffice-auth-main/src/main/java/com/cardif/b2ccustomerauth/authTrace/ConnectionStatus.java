package com.cardif.b2ccustomerauth.authTrace;

import java.util.Set;


import lombok.AllArgsConstructor;


public enum ConnectionStatus {
	SUCCESS("Success"),
    FAILED("Failed");
	
	 private final String value;

	    ConnectionStatus(String value) {
	        this.value = value;
	    }

	    public String getValue() {
	        return value;
	    }

    

}
