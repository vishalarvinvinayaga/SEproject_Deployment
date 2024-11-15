// src/api/adminApi.ts
import axios from "axios";

const API_URL = ""; // Replace with your API endpoint

const getAuthHeaders = (token: string | null) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export const loginAdmin = async (credentials: {
    username: string;
    password: string;
}) => {
    // const response = await axios.post(`${API_URL}/login`, credentials);
    // return response.data; // Assuming the response includes the token

    // Dummy credentials for testing
    const validUsername = "admin";
    const validPassword = "password";

    if (
        credentials.username === validUsername &&
        credentials.password === validPassword
    ) {
        // Return a dummy token on success
        return { token: "dummy-jwt-token" };
    } else {
        // Simulate a failed login attempt
        throw { response: { data: "Invalid credentials" } };
    }
};

export const logoutAdmin = async () => {
    await axios.post(`${API_URL}/logout`);
};

