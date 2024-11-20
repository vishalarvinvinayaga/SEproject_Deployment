// src/api/adminApi.ts
import axios from "axios";

const API_URL = "http://localhost:8000/api/admin"; // Replace with your API endpoint

const getAuthHeaders = (token: string | null) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export const loginAdmin = async (credentials: {
    username: string;
    password: string;
}) => {
    const response = await axios.post(`${API_URL}/login/`, credentials);
    return response.data; // Assuming the response includes the token
};

export const logoutAdmin = async (token: string | null) => {
    const headers = getAuthHeaders(token);
    await axios.post(`${API_URL}/logout/`, {}, headers);
};
