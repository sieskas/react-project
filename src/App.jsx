import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginForm from "@/pages/LoginForm";
import Dashboard from "@/components/Dashboard.jsx";

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LoginForm />} />
                    <Route path="/*" element={<Dashboard />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
