import {createContext, useContext, useState} from "react";
import PropTypes from "prop-types";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {toast} from "@/hooks/use-toast";

class AuthService {
    static createAPI() {
        return axios.create({
            baseURL: 'http://localhost:8080',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    static getUserFromStorage() {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    }

    static async fetchLocationsTree(api) {
        try {
            const response = await api.get("/api/v1/locations/tree");
            console.log(response.data)
            localStorage.setItem('locationsHierarchy', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des locations:', error);
            return null;
        }
    }

    static clearStorage() {
        sessionStorage.removeItem('user');
        localStorage.removeItem('locationsHierarchy');
    }
}

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({children}) => {
    const navigate = useNavigate();

    // Correction : Initialisation différée pour éviter l'erreur de contexte de stockage
    const [user, setUser] = useState(() => AuthService.getUserFromStorage() || null);
    const [api] = useState(() => AuthService.createAPI());

    const handleAuthError = (error) => {
        toast({
            title: "Erreur de connexion",
            description: error.response?.data?.error || "Une erreur est survenue",
            variant: "destructive",
        });
    };

    const login = async (credentials) => {
        try {
            const response = await api.post("/api/v1/auth/login", credentials);
            const userData = response.data;

            sessionStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            await AuthService.fetchLocationsTree(api);

            navigate("/");
        } catch (error) {
            handleAuthError(error);
        }
    };

    const logout = async () => {
        try {
            await api.post("/api/v1/auth/logout");
        } finally {
            AuthService.clearStorage();
            setUser(null);
            navigate("/login");
        }
    };

    // Intercepteur pour gérer les erreurs 401 et rediriger vers la connexion
    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401 || error.response?.status === 403) {
                AuthService.clearStorage();
                setUser(null);
                navigate("/login");
            }
            return Promise.reject(error);
        }
    );

    return (
        <AuthContext.Provider value={{user, login, logout, api}}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
