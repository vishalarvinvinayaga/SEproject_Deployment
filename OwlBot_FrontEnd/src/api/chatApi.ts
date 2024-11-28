import axios from "axios";
import { baseURL } from "../assets/baseURL";

export const sendChatMessage = async (user_input: string) => {
    const response = await axios.post(
        `${baseURL}/query/`,
        {
            user_input,
        },
        {
            withCredentials: true, // Include cookies for session handling
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
};

export const resetSession = async () => {
    try {
        await axios.post(
            `${baseURL}/reset-session/`,
            {},
            {
                withCredentials: true, // Ensure cookies are sent for session handling
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error("Failed to reset session", error);
    }
};
