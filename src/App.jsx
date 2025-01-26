import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SidebarMenu from "@/components/SidebarMenu";
import AppRoutes from "@/routes/AppRoutes";
import LoginForm from "@/pages/LoginForm";

const ProtectedApp = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Autoriser uniquement la page de login si l'utilisateur n'est pas connecté
    if (!user && location.pathname !== "/login") {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen">
            <SidebarMenu />
            <main className="flex-1 p-6 overflow-auto">
                <AppRoutes />
            </main>
        </div>
    );
};

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Route pour la page de connexion */}
                    <Route path="/login" element={<LoginForm />} />

                    {/* Routes protégées */}
                    <Route path="/*" element={<ProtectedApp />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
