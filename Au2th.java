To secure your **backend endpoints** and make sure your **frontend React app** sends the authentication token correctly, follow these steps:

---

## **1️⃣ Secure the `/save` Endpoint in Spring Boot**
In your **Spring Boot backend**, secure your endpoints by requiring authentication.  

### **✅ Add Security Configuration (`SecurityConfig.java`)**
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/register").permitAll()  // Allow public access to login/register
                .anyRequest().authenticated()  // Secure all other endpoints
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### **✅ Create the JWT Authentication Filter**
This filter extracts the **JWT token** from requests and validates it.

```java
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private static final String SECRET = "your-very-secure-secret-key-should-be-32-characters";
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = request.getHeader("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        token = token.substring(7); // Remove "Bearer " prefix
        String username = Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        chain.doFilter(request, response);
    }
}
```

### **✅ Secure the `/save` Endpoint**
Modify your controller to **require authentication** and extract the `user_id` from the token.

```java
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MyController {
    @PostMapping("/save")
    public String saveData(@RequestBody SaveRequest request) {
        // Get authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();  // Get user from token

        // Save with user info
        return "Data saved by " + username;
    }
}

class SaveRequest {
    private String data;
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}
```

---

## **2️⃣ Send JWT Token in Frontend (React)**
### **✅ Store JWT Token on Login**
Modify your **login request** to save the token in **localStorage**.

```javascript
const handleLogin = async () => {
  const response = await fetch("http://localhost:8080/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const { token } = await response.json();
    localStorage.setItem("jwt", token); // Store token
  } else {
    alert("Invalid credentials");
  }
};
```

### **✅ Send Authenticated Request to `/save`**
Modify the API call to **send the JWT token** in the request headers.

```javascript
const handleSave = async () => {
  const token = localStorage.getItem("jwt");

  const response = await fetch("http://localhost:8080/api/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Attach token
    },
    body: JSON.stringify({ data: "some data" }),
  });

  const result = await response.text();
  console.log(result);
};
```

---

## **3️⃣ Auto Logout After 10 Minutes of Inactivity**
To **auto logout after 10 minutes**, add an **idle timeout tracker** in React.

```javascript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.removeItem("jwt");
        alert("Session expired, please log in again.");
        navigate("/login");
      }, 10 * 60 * 1000); // 10 min
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer(); // Start timer on load

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [navigate]);
};

export default useAutoLogout;
```

Call `useAutoLogout();` in your main **`App.js`** component.

```javascript
import useAutoLogout from "./useAutoLogout";

function App() {
  useAutoLogout(); // Auto logout after 10 min

  return (
    <div>
      <h1>Welcome</h1>
    </div>
  );
}

export default App;
```

---

## **🎯 Summary of What We Did**
✅ **Backend Security**
- Used **Spring Security** to protect endpoints
- Implemented **JWT Authentication**
- Secured `/save` to get `user_id` from the token

✅ **Frontend Auth Integration**
- Stored JWT token after login
- Sent the token in **`Authorization`** headers
- Implemented **Auto Logout after 10 min of inactivity**

---

Now your **React frontend** and **Spring Boot backend** are securely connected! 🚀 Let me know if you need more details.
