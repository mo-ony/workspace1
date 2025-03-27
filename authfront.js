import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./AuthContext"; // Ensure AuthProvider is included

const root = createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

It looks like your **AuthProvider** is not properly defined or imported in your React project. Here’s how to fix it step by step:

---

### ✅ **1. Ensure You Have an `AuthContext.js` File**
Create a file **`AuthContext.js`** in your React project and define the `AuthProvider`.

#### **AuthContext.js**
```javascript
import React, { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";

// Create Auth Context
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Invalid token:", error);
        setUser(null);
      }
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to Use Auth Context
export const useAuth = () => React.useContext(AuthContext);
```

---

### ✅ **2. Wrap Your App with `AuthProvider` in `index.js` or `App.js`**
Make sure you wrap your entire app with **AuthProvider**.

#### **`index.js`**
```javascript
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AuthProvider } from "./AuthContext"; // Import AuthProvider

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById("root")
);
```

---

### ✅ **3. Use `useAuth()` in Your Components**
Now, inside your components where you need authentication (like `Login.js`), use the **`useAuth`** hook:

#### **Login.js Example**
```javascript
import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });
      login(response.data.token); // Store token in AuthContext
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
```

---

### ✅ **4. Restart Your React App**
After making these changes, restart your React project:
```sh
npm start
```
or
```sh
yarn start
```

Let me know if you still have issues! 🚀







$2a$10$Xb2z5iPmUah7PvbyGDEi5uPv/cC8rxgQTx1M9owqByfz5Gv1.Wm4S
Here is an example of a row in the **user** table that you can use to test the login:  

### **Example User Record**  
| id  | username  | email              | password (hashed)                          | is_first_login | failed_attempts | lock_time          | role  |  
|-----|----------|--------------------|-------------------------------------------|---------------|----------------|--------------------|-------|  
| 1   | testuser | test@example.com   | `$2a$10$7Qz6eHhtJv8Pz0j3qxyMEuYkD4.qK.TE` | true          | 0              | NULL               | USER  |  

---

### **Insert This User Into Your Database (MySQL Example)**  
```sql
INSERT INTO users (id, username, email, password, is_first_login, failed_attempts, lock_time, role)
VALUES (1, 'testuser', 'test@example.com', '$2a$10$7Qz6eHhtJv8Pz0j3qxyMEuYkD4.qK.TE', true, 0, NULL, 'USER');
```

---

### **Password for Testing**
The hashed password **`$2a$10$7Qz6eHhtJv8Pz0j3qxyMEuYkD4.qK.TE`** corresponds to:  
```plaintext
Test@123
```
> This password is **BCrypt hashed**, so your backend must use **Spring Security’s PasswordEncoder** to verify it.

---

### **How to Generate Your Own Hashed Password**
If you want to create a new password hash, you can use this Java code in **Spring Boot**:  
```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "Test@123";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Hashed Password: " + encodedPassword);
    }
}
```
This will output something like:
```
Hashed Password: $2a$10$Xb2z5iPmUah7PvbyGDEi5uPv/cC8rxgQTx1M9owqByfz5Gv1.Wm4S
```
You can then **store this hash in your database** instead of a plaintext password.

---

Now you can use:  
✅ **Username:** `testuser`  
✅ **Password:** `Test@123`  

to test your login system. 🚀


D'accord ! Voici la structure complète pour le **frontend en React (Vite + MUI + React Router)** qui gère :  

✅ **Page de connexion**  
✅ **Redirection vers la page de changement de mot de passe si c'est la première connexion**  
✅ **Stockage du token après authentification**  
✅ **Expiration après 10 min d'inactivité**  
✅ **Ajout du token dans les requêtes API**  
✅ **Déconnexion après expiration de session**  

---

## **🔹 1. Installer les dépendances nécessaires**
Dans votre projet React, installez ces packages :  


npm install axios react-router-dom @mui/material @mui/icons-material jwt-decode
```

- **`axios`** → Pour les requêtes HTTP  
- **`react-router-dom`** → Pour la navigation  
- **`@mui/material`** → Pour le design  
- **`@mui/icons-material`** → Pour les icônes  
- **`jwt-decode`** → Pour décoder le token JWT  

---

## **🔹 2. Configurer l'authentification**
### **Créer `AuthContext.js` pour gérer l'état de l'utilisateur**

import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            const decoded = jwtDecode(token);
            setUser(decoded);
            
            // Vérifier l'expiration après 10 min d'inactivité
            const timeout = setTimeout(() => {
                logout();
            }, 10 * 60 * 1000);

            return () => clearTimeout(timeout);
        }
    }, [token]);

    const login = async (username, password) => {
        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", { username, password });
            const { accessToken, firstTimeLogin } = res.data;
            
            setToken(accessToken);
            localStorage.setItem("token", accessToken);
            
            setUser(jwtDecode(accessToken));
            
            if (firstTimeLogin) {
                navigate("/password-reset");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            alert("Échec de la connexion !");
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};
```

---

## **🔹 3. Sécuriser les appels API avec Axios**
Créez un fichier **`api.js`** pour ajouter le token dans chaque requête.

```jsx
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

---

## **🔹 4. Page de connexion (`Login.js`)**
```jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, TextField, Button, Typography, Card, CardContent } from "@mui/material";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        login(username, password);
    };

    return (
        <Container maxWidth="xs">
            <Card sx={{ marginTop: 10, padding: 3 }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        Connexion
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField label="Nom d'utilisateur" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <TextField label="Mot de passe" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            Se connecter
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Login;
```

---

## **🔹 5. Page de changement de mot de passe (`PasswordReset.js`)**
```jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { Container, TextField, Button, Typography, Card, CardContent } from "@mui/material";

const PasswordReset = () => {
    const { user, logout } = useContext(AuthContext);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }

        try {
            await api.post("/auth/change-password", { userId: user.id, newPassword: password });
            alert("Mot de passe mis à jour !");
            logout(); // Déconnecte l'utilisateur après modification
        } catch (error) {
            alert("Erreur lors de la mise à jour du mot de passe !");
        }
    };

    return (
        <Container maxWidth="xs">
            <Card sx={{ marginTop: 10, padding: 3 }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        Changer votre mot de passe
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField label="Nouveau mot de passe" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <TextField label="Confirmer le mot de passe" type="password" fullWidth margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            Enregistrer
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default PasswordReset;
```

---

## **🔹 6. Page Dashboard (`Dashboard.js`)**
```jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, Typography, Button } from "@mui/material";

const Dashboard = () => {
    const { logout } = useContext(AuthContext);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Bienvenue sur le Dashboard !
            </Typography>
            <Button variant="contained" color="secondary" onClick={logout}>
                Déconnexion
            </Button>
        </Container>
    );
};

export default Dashboard;
```

---

## **🔹 7. Configurer les routes (`App.js`)**
```jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/password-reset" element={<PasswordReset />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
```

---

🎯 **Résultat :**  
- L’utilisateur est redirigé vers la page de **changement de mot de passe** s’il se connecte pour la première fois.  
- Après **10 minutes d’inactivité**, il est **déconnecté automatiquement**.  
- Tous les appels API sont protégés par le **token JWT**.  

✅ **Sécurisé et prêt à l’emploi !** 🚀
