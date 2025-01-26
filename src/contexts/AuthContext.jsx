import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

// Création de l'instance API
const createAPI = () => {
    const api = axios.create({
        baseURL: 'http://localhost:8080',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    });

    // Restauration du token si présent
    const user = sessionStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        if (userData.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }
    }

    return api;
};

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const navigate = useNavigate();
    const [api] = useState(createAPI);

    const login = async (credentials) => {
        try {
            const response = await api.post("/api/v1/auth/login", credentials);
            const userData = response.data;
            sessionStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            navigate("/");
        } catch (error) {
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
        } finally {
            sessionStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            navigate("/login");
        }
    };

    // Intercepteur pour gérer les 401
    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                sessionStorage.removeItem('user');
                delete api.defaults.headers.common['Authorization'];
                setUser(null);
                navigate("/login");
            }
            return Promise.reject(error);
        }
    );

    return (
        <AuthContext.Provider value={{ user, login, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};