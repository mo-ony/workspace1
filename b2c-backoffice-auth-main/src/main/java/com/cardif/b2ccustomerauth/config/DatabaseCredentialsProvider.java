package com.cardif.b2ccustomerauth.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cardif.b2ccustomerauth.util.KeystoreUtils;

import lombok.extern.log4j.Log4j2;

import javax.sql.DataSource;

@Log4j2
@Configuration
public class DatabaseCredentialsProvider {

	@Value("${keystore.database.path}")
	String keystoreDatabasePath;

	private final String username;
	private final String password;
	private final String url;

	public DatabaseCredentialsProvider(
			@Value("${keystore.database.path}") String keystoreDatabasePath) {
		this.keystoreDatabasePath = keystoreDatabasePath;
		this.username = KeystoreUtils.retrieveKeyFromKeystore(
				keystoreDatabasePath, System.getenv("KEYSTORE_PASSWORD"),
				"dbusername");
		this.password = KeystoreUtils.retrieveKeyFromKeystore(
				keystoreDatabasePath, System.getenv("KEYSTORE_PASSWORD"),
				"dbpassword");
		this.url = KeystoreUtils.retrieveKeyFromKeystore(keystoreDatabasePath,
				System.getenv("KEYSTORE_PASSWORD"), "dburl");
	}

	@Bean
	DataSource getDataSource() {


        long initialDelay = 30000; // 30 seconds
        
        double backoffMultiplier = 1.5;
        int maxAttempts = 3;
        int attempts = 0;

        long currentDelay = initialDelay;

        while (attempts < maxAttempts) {
            try {
                // Create the data source
                DataSource dataSource = DataSourceBuilder.create()
                        .url(url)
                        .username(username)
                        .password(password)
                        .build();

                // Validate the connection by attempting to get a connection
                if (dataSource.getConnection() != null) {
                    log.info("Successfully connected to the database.");
                    return dataSource;
                }
            } catch (Exception e) {
                // Log the creation failure and delay
                log.error("Failed to create the data source. Retrying in {} ms...", currentDelay, e);
                attempts++;
                try {
                    Thread.sleep(currentDelay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt(); // Restore interrupted status
                }

                // Increase the delay using the backoff multiplier
                currentDelay =  (long) (currentDelay * backoffMultiplier);
            }
            
        }
        throw new RuntimeException("Failed to connect to the database after " + maxAttempts + " attempts.");

		
	}


}