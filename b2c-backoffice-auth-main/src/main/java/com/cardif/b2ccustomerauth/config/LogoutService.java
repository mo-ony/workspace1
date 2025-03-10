package com.cardif.b2ccustomerauth.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;

import com.cardif.b2ccustomerauth.token.TokenRepository;
import com.cardif.b2ccustomerauth.util.CookieUtils; // Import CookieUtils

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {

    private final TokenRepository tokenRepository;

    
    
    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        // Extract token from cookies using CookieUtils
        String jwt = CookieUtils.getCookieValue(request, "accessToken");

        if (jwt != null) {
            var storedToken = tokenRepository.findByToken(jwt)
                .orElse(null);

            if (storedToken != null) {
                storedToken.setExpired(true);
                storedToken.setRevoked(true);
                tokenRepository.save(storedToken);
            }
        }

        // Clear authentication and security context
        SecurityContextHolder.clearContext();

        // Remove cookies if necessary using CookieUtils
        CookieUtils.removeCookie(response, "accessToken");
        CookieUtils.removeCookie(response, "refreshToken");
    }
}
