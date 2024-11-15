import axios from "axios";
import DummyChat from "../DummyChat.json"

export const sendChatMessage = async (message: string) => {
    const response = await axios.post("/api/chat", { message });
    return response.data;
};

// export const fetchChatMessages = async () => {
//     const response = await axios.get("/api/chat");
//     return response.data;
// };

export const fetchChatMessages = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(DummyChat);
        }, 1000);
    });
};