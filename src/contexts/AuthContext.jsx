import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        api.interceptors.request.use(
            (config) => {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const { token } = JSON.parse(storedUser);
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("user");
                    setUser(null);
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        );
    }, [navigate]);

    const login = async (credentials) => {
        try {
            const response = await api.post("/api/v1/auth/login", credentials);
            const userData = response.data;

            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            toast({
                title: "Connexion réussie",
                description: "Vous êtes maintenant connecté",
            });

            navigate("/dashboard");
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
            await api.post("/api/v1/auth/logout");
            localStorage.removeItem("user");
            setUser(null);
            navigate("/login");
        } catch (error) {
            // Gérer l'erreur silencieusement pour ne pas bloquer la déconnexion
            console.error("Erreur de déconnexion :", error);
            localStorage.removeItem("user");
            setUser(null);
            navigate("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);