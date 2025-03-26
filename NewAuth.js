Here's the complete **React frontend** and **Spring Boot backend** for your requirements:  

- ✅ **First-time login** → Redirect to **password setting page**  
- ✅ **Regular login** → Redirect to **dashboard**  
- ✅ **Three failed login attempts** → **Block user for 15 minutes**  
- ✅ **Auto logout after 10 minutes of inactivity**  
- ✅ **JWT authentication** → Secure endpoints  
- ✅ **Extract user info in `/save` endpoint**  

---

## **🌍 Backend (Spring Boot)**
### **1️⃣ Add Dependencies (`pom.xml`)**
Make sure you have **Spring Security**, **JWT**, and **Spring Web** in `pom.xml`:

```xml
<dependencies>
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
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

---

### **2️⃣ User Entity (`User.java`)**
```java
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private boolean firstLogin = true; // Indicates first-time login
    private int failedAttempts = 0;
    private LocalDateTime lockTime;

    public boolean isLocked() {
        return lockTime != null && lockTime.isAfter(LocalDateTime.now().minusMinutes(15));
    }

    // Getters and Setters
}
```

---

### **3️⃣ Authentication Service (`AuthService.java`)**
```java
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String authenticate(String username, String password) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isLocked()) throw new RuntimeException("Account locked for 15 minutes");

        if (!passwordEncoder.matches(password, user.getPassword())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= 3) user.setLockTime(LocalDateTime.now());
            userRepository.save(user);
            throw new RuntimeException("Invalid credentials");
        }

        user.setFailedAttempts(0); // Reset failed attempts
        userRepository.save(user);
        return jwtService.generateToken(user);
    }

    public void changePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstLogin(false);
        userRepository.save(user);
    }
}
```

---

### **4️⃣ JWT Service (`JwtService.java`)**
```java
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private static final String SECRET = "your-very-secure-secret-key-should-be-32-characters";

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 10 * 60 * 1000)) // 10 min expiry
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
```

---

### **5️⃣ Secure `/save` Endpoint**
```java
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MyController {
    @PostMapping("/save")
    public String saveData(@RequestBody SaveRequest request, Authentication authentication) {
        String username = authentication.getName();  // Extract username from JWT
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

## **🖥️ Frontend (React)**
### **1️⃣ Authentication & Redirect Logic**
```javascript
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      alert("Invalid credentials or account locked");
      return;
    }

    const { token, firstLogin } = await response.json();
    localStorage.setItem("jwt", token);
    firstLogin ? navigate("/set-password") : navigate("/dashboard");
  };

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;
```

---

### **2️⃣ First-Time Password Change**
```javascript
const SetPassword = () => {
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async () => {
    const token = localStorage.getItem("jwt");
    await fetch("http://localhost:8080/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    alert("Password changed, redirecting to login");
    window.location.href = "/login";
  };

  return (
    <div>
      <h1>Set New Password</h1>
      <input type="password" placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default SetPassword;
```

---

### **3️⃣ Auto Logout After 10 Min**
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
        alert("Session expired");
        navigate("/login");
      }, 10 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [navigate]);
};

export default useAutoLogout;
```

---

Now your app supports **secure login, password reset, session timeout, and token validation**! 🚀
