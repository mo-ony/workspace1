Le problème ici vient de l’utilisation d’une variable locale `inactivityTimer` dans ton composant React. Cette variable est redéfinie à chaque rendu, donc `clearTimeout(inactivityTimer)` et `setTimeout(...)` ne se comportent pas comme prévu.

Pour résoudre ce souci, il faut **stocker le timer dans une `ref`** qui garde sa valeur entre les rendus. Voici la version corrigée :

---

### ✅ **Solution : utiliser `useRef` pour le timer**


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import axios from "axios";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [user, setUser] = useState(token ? jwtDecode(token) : null);
    const navigate = useNavigate();

    const inactivityTimerRef = useRef(null); // Timer stocké dans une ref

    const login = async (username, password) => {
        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", { username, password });
            const { accessToken, firstTimeLogin } = res.data;

            setToken(accessToken);
            localStorage.setItem("token", accessToken);
            setUser(jwtDecode(accessToken));

            resetInactivityTimer(); // Réinitialise le timer après connexion

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
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        navigate("/login");
    };

    const resetInactivityTimer = () => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        inactivityTimerRef.current = setTimeout(() => {
            alert("Session expirée ! Vous allez être déconnecté.");
            logout();
        }, 10 * 60 * 1000); // 10 minutes
    };

    useEffect(() => {
        // Réinitialiser le timer au chargement si token existe
        if (token) resetInactivityTimer();

        const events = ["mousemove", "keydown", "click"];
        events.forEach(event => window.addEventListener(event, resetInactivityTimer));

        return () => {
            events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [token]); // Important : dépend du token

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
```

---

### ✅ Résultat :
- Le timer est bien réinitialisé à chaque mouvement/saisie/clic.
- La session expire **seulement après 10 minutes d’inactivité réelle**.
- Le timer n’est pas recréé à chaque rendu.

Tu veux aussi que le token soit automatiquement rafraîchi avant expiration ?
