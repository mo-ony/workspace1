// Copyright 2023-2024 Nuba Tek S.A.S.
// All rights reserved.

package com.cardif.b2ccustomerauth.util;

import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;



public class KeystoreUtils {

	public static String retrieveKeyFromKeystore(String keystorePath,
			String keystorePassword, String alias) {

		try {
			KeyStore keystore = KeyStore.getInstance("PKCS12");

			try (FileInputStream fis = new FileInputStream(keystorePath)) {
				keystore.load(fis, keystorePassword.toCharArray());
			}
			//
			// Récupérer une clé simple du keystore
			byte[] key = keystore.getKey(alias, keystorePassword.toCharArray())
					.getEncoded();
			// CardifB2cMsPaiementApplication.logger.info("key is: " + new
			// String(key, StandardCharsets.UTF_8));
			return new String(key, StandardCharsets.UTF_8);

		} catch (Exception e) {
			e.printStackTrace();

			return null;
		}
	}

}
