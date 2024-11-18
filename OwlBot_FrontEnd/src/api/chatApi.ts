import axios from "axios";

export const sendChatMessage = async (user_input: string) => {
    const response = await axios.post("http://localhost:8000/api/query/", {
        user_input,
    });
    return response.data;
};

// export const fetchChatMessages = async () => {
//     const response = await axios.get("/api/chat");
//     return response.data;
// };
