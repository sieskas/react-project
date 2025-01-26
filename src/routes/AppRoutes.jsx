import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import LoginForm from "@/pages/LoginForm.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";
import { MENU_ITEMS } from "@/config/menuConfig.js";

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

const generateRoutes = () => {
    return MENU_ITEMS.flatMap(item => {
        const routes = [];

        if (item.path) {
            routes.push({
                path: item.path,
                component: item.component || NotFoundPage,
                role: item.role,
            });
        }

        if (item.subMenu) {
            routes.push(
                ...item.subMenu.map(sub => ({
                    path: sub.path,
                    component: sub.component || NotFoundPage,
                    role: sub.role,
                }))
            );
        }

        return routes;
    });
};

export default function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Redirection automatique depuis `/` vers `/login` si non connecté */}
            <Route path="/" element={user ? <Navigate to="/" /> : <Navigate to="/login" />} />

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
