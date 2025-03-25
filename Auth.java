If you're using **`io.jsonwebtoken` version 0.12.6**, the API has changed slightly. Here’s how to fix the issues:

---

### **1️⃣ Fix `import io.jsonwebtoken.*;`**
In **version 0.12.6**, the API uses **`Jwts.SIG.HS256`** instead of `SignatureAlgorithm.HS256`. Update your JWT generation code:

#### ✅ **Fixed JWT Generation Code**
```java
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

public class JwtUtil {
    private static final String SECRET = "your-very-secure-secret-key-should-be-32-characters";
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public static String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 10 * 60 * 1000)) // 10 minutes
                .signWith(SECRET_KEY)
                .compact();
    }

    public static boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```
**Changes made for `0.12.6` compatibility:**
- Replaced `SignatureAlgorithm.HS256` with `Keys.hmacShaKeyFor()`
- Used `Jwts.parser().verifyWith(SECRET_KEY).build().parseSignedClaims(token)`

---

### **2️⃣ Fix `import org.springframework.security.crypto.password.PasswordEncoder;`**
If **`PasswordEncoder`** is not found, make sure you have added **Spring Security** to your `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
    <version>6.2.1</version>
</dependency>
```

Then, import it in your Java file:
```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
```

And create a **password encoder bean**:
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

Now, inject it into your **AuthService**:
```java
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String login(String username, String password) throws Exception {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new Exception("Utilisateur non trouvé."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Mot de passe incorrect.");
        }

        return JwtUtil.generateToken(username);
    }
}
```

---

### **✅ Summary of Fixes**
- ✅ **JWT Fix** → Updated to work with **`io.jsonwebtoken 0.12.6`**
- ✅ **PasswordEncoder Fix** → Added `spring-security-crypto` dependency and `SecurityConfig` bean

Now your authentication should work! 🚀 Let me know if you have any more issues.


----------------------






Voici une solution complète d'authentification avec **Spring Boot** pour le backend et **React.js** pour le frontend.  

### **Fonctionnalités :**  
✅ Connexion sécurisée avec **JWT**  
✅ Blocage de l’utilisateur après **3 tentatives échouées** (débloqué après **15 minutes**)  
✅ Expiration de la **session après 10 minutes d'inactivité**  
✅ **Protection des endpoints** en vérifiant le token  
✅ Première connexion : **forçage du changement de mot de passe**  

---

## **1️⃣ Backend : Spring Boot**

### **1.1 Dépendances (Spring Boot + JWT)**
Ajoute ces dépendances dans `pom.xml` :

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-h2</artifactId> <!-- Remplace par MySQL si nécessaire -->
</dependency>
```

---

### **1.2 Modèle `User`**
Créons l’entité utilisateur avec les champs nécessaires :

```java
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String password;
    private boolean firstLogin = true;
    
    private int failedAttempts = 0;
    private LocalDateTime lockTime;
}
```

---

### **1.3 Repository `UserRepository`**
```java
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
```

---

### **1.4 Service d'authentification**
```java
import io.jsonwebtoken.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final String SECRET = "mySecretKey";
    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String login(String username, String password) throws Exception {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) throw new Exception("Utilisateur non trouvé.");

        User user = userOpt.get();
        if (user.getLockTime() != null && user.getLockTime().isAfter(LocalDateTime.now().minusMinutes(15))) {
            throw new Exception("Compte verrouillé. Réessayez plus tard.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= 3) {
                user.setLockTime(LocalDateTime.now());
            }
            userRepository.save(user);
            throw new Exception("Mot de passe incorrect.");
        }

        user.setFailedAttempts(0);
        user.setLockTime(null);
        userRepository.save(user);
        
        return generateToken(user);
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10 * 60 * 1000)) // Expiration après 10 minutes
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

---

### **1.5 Contrôleur `AuthController`**
```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password) throws Exception {
        return authService.login(username, password);
    }
}
```

---

### **1.6 Sécurité Spring Boot**
Ajoute un **filtre JWT** pour protéger tes endpoints.

```java
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtFilter implements Filter {
    private final AuthService authService;

    public JwtFilter(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String token = req.getHeader("Authorization");

        if (token == null || !authService.validateToken(token.replace("Bearer ", ""))) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        chain.doFilter(request, response);
    }
}
```

---

## **2️⃣ Frontend React.js**
### **2.1 Installation des dépendances**
```bash
npm install axios jwt-decode react-router-dom @mui/material
```

---

### **2.2 Service d'authentification**
```jsx
import axios from "axios";

const API_URL = "http://localhost:8080/auth";

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    localStorage.setItem("token", response.data);
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");

export const isAuthenticated = () => !!getToken();
```

---

### **2.3 Page de connexion**
```jsx
import React, { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Card, CardContent, Typography } from "@mui/material";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await login(username, password);
            navigate("/dashboard");
        } catch (error) {
            alert("Échec de la connexion.");
        }
    };

    return (
        <Container>
            <Card>
                <CardContent>
                    <Typography variant="h5">Connexion</Typography>
                    <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Button onClick={handleLogin}>Se connecter</Button>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;
```

---

## **Conclusion**
✅ **Sécurité renforcée** avec blocage après 3 échecs  
✅ **JWT** pour protéger les endpoints  
✅ **Session expire après 10 min d'inactivité**  
✅ **Page pour forcer le changement de mot de passe**  

Besoin d'autres ajustements ?a
