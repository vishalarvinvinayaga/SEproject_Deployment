import "./App.css";
import AdminDashboard from "./components/Admin/AdminDashboard/AdminDashBoard";
import AdminLogin from "./components/Admin/AdminLogin/AdminLogin";
import ChatBot from "./components/ChatBot/ChatBot";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<ChatBot />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
