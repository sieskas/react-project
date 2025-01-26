// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import LoginForm from "@/pages/LoginForm.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";
import { MENU_ITEMS } from "@/config/menuConfig.js";

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

// Fonction pour extraire toutes les routes depuis `menuConfig.js`
const generateRoutes = () => {
    return MENU_ITEMS.flatMap(item => {
        const routes = [];

        // Ajouter la route principale si elle a un `component`, sinon 404
        if (item.path) {
            routes.push({
                path: item.path,
                component: item.component || NotFoundPage, // Fallback 404 si pas de component
                role: item.role,
            });
        }

        // Ajouter les sous-menus avec la même logique
        if (item.subMenu) {
            routes.push(
                ...item.subMenu.map(sub => ({
                    path: sub.path,
                    component: sub.component || NotFoundPage, // Fallback 404
                    role: sub.role,
                }))
            );
        }

        return routes;
    });
};

export default function AppRoutes() {
    return (
        <Routes>
            {/* Route de connexion */}
            <Route path="/login" element={<LoginForm />} />

            {/* Routes dynamiques */}
            {generateRoutes().map(({ path, component: Component, role }) => (
                <Route
                    key={path}
                    path={path}
                    element={role === "ALL" ? <Component /> : <PrivateRoute><Component /></PrivateRoute>}
                />
            ))}

            {/* Route 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
