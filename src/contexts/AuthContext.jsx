import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (credentials) => {
        try {
            const response = await axios.post("http://localhost:8080/api/v1/auth/login", credentials, { withCredentials: true });
            const userData = response.data;

            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            toast({
                title: "Connexion réussie",
                description: "Vous êtes maintenant connecté",
            });

            setTimeout(() => navigate("/dashboard"), 0);
        } catch (error) {
            console.error("Erreur de connexion :", error);

            toast({
                title: "Erreur de connexion",
                description: error.response?.data?.error || "Une erreur est survenue",
                variant: "destructive",
            });
        }
    };

    const logout = async () => {
        try {
            await axios.post("http://localhost:8080/api/v1/auth/logout", {}, { withCredentials: true });
            localStorage.removeItem("user");
            setUser(null);
            setTimeout(() => navigate("/login"), 0);
        } catch (error) {
            console.error("Erreur de déconnexion :", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ Validation des props
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
