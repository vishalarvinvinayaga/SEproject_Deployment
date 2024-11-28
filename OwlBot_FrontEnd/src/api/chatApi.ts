// import axios from "axios";

// export const sendChatMessage = async (user_input: string) => {
//     const response = await axios.post("http://localhost:8000/api/query/", {
//         user_input,
//     });
//     return response.data;
// };

// export const fetchChatMessages = async () => {
//     const response = await axios.get("/api/chat");
//     return response.data;
// };

import axios from "axios";

export const sendChatMessage = async (user_input: string) => {
    const response = await axios.post(
        "http://localhost:8000/api/query/",
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
            "http://localhost:8000/api/api/reset-session/",
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