import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider, useAuth} from "@/contexts/AuthContext";
import LoginForm from "@/pages/LoginForm";
import Dashboard from "@/components/Dashboard.jsx";

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();

    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;