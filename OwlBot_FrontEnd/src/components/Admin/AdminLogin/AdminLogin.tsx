import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { adminLogin } from "../../../redux/adminSlice";
import { Container, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../redux/store";

const AdminLogin = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Clear any existing errors before login attempt

        try {
            // Attempt to log in and unwrap the result to handle the response
            await dispatch(adminLogin({ username, password })).unwrap();
            navigate("/admin/dashboard");
            // Handle successful login (e.g., redirecting to a dashboard)
        } catch (err) {
            // Ensure the error is properly typed and captured
            setError(err instanceof Error ? err.message : "Login failed");
        }
    };

    return (
        <div style={styles.pageContainer}>
            <Container style={styles.formContainer}>
                <h2>
                    <Link to="/OwlBot" style={{ color: "black" }}>
                        OwlBot
                    </Link>{" "}
                    Admin
                </h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    {error && <p className="text-danger">{error}</p>}
                    <div style={styles.buttonContainer}>
                        <Button variant="primary" type="submit">
                            Login
                        </Button>
                    </div>
                </Form>
            </Container>
        </div>
    );
};

const styles = {
    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f9fa", // Optional: background color
    },
    formContainer: {
        width: "100%",
        maxWidth: "400px", // Adjust width as needed
        padding: "2rem",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "center",
        marginTop: "1rem",
    },
};

export default AdminLogin;
