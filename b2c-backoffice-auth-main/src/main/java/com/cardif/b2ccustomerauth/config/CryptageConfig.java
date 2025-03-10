package com.cardif.b2ccustomerauth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import com.cardif.b2ccustomerauth.util.CookieUtils;
import com.cardif.b2ccustomerauth.util.KeystoreUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;


@Component
public final class CryptageConfig {
	
	@Value("${keystore.cryptageFonction.path}")
	private String keyPath;
	
	private final String algorithme;
	private final String key;

	public CryptageConfig(@Value("${keystore.cryptageFonction.path}") String keyPath) {
	this.keyPath = keyPath;
	this.algorithme = KeystoreUtils.retrieveKeyFromKeystore(keyPath,System.getenv("KEYSTORE_PASSWORD"), "algorithmeName");
	this.key = KeystoreUtils.retrieveKeyFromKeystore(keyPath,System.getenv("KEYSTORE_PASSWORD"), "keyValue");
	CookieUtils.InitCookieUtils(algorithme, key.getBytes());
			}
	
	public String getAlgorithme() {
		return algorithme;
	}

	public String getKey() {
		return key;
	}
	
	
}