import axios from "axios";
import { baseURL } from "../assets/baseURL";

const getAuthHeaders = (token: string | null) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export const loginAdmin = async (credentials: {
    username: string;
    password: string;
}) => {
    const response = await axios.post(`${baseURL}/admin/login/`, credentials);
    return response.data; // Assuming the response includes the token
};

export const logoutAdmin = async (token: string | null) => {
    const headers = getAuthHeaders(token);
    await axios.post(`${baseURL}/admin/logout/`, {}, headers);
};
