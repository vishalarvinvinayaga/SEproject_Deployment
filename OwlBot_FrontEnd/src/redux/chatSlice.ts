import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sendChatMessage } from "../api/chatApi"; // Assume you have a function to fetch messages

interface Message {
    sender: "bot" | "user";
    text: string;
}

interface ChatState {
    messages: Message[];
    loading: boolean;
    error: string | null;
}

const initialState: ChatState = {
    messages: [
        { sender: "bot", text: "Hello! How can I assist you today?" }
    ],
    loading: false,
    error: null,
};

// Async thunk to send a message to the backend
export const sendMessageToBackend = createAsyncThunk(
    "chat/sendMessage",
    async (message: string, { rejectWithValue }) => {
        try {
            const data = await sendChatMessage(message);
            return data.response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data.error || "Failed to send message"
            );
        }
    }
);

// Async thunk to fetch messages from the backend
// export const fetchMessagesFromBackend = createAsyncThunk(
//     "chat/fetchMessages",
//     async (_, { rejectWithValue }) => {
//         try {
//             const messages = await fetchChatMessages(); // API call to fetch messages
//             return messages;
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data || "Failed to fetch messages"
//             );
//         }
//     }
// );

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addUserMessage: (state, action) => {
            state.messages.push({ sender: "user", text: action.payload });
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendMessageToBackend.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessageToBackend.fulfilled, (state, action) => {
                state.loading = false;
                state.messages.push({ sender: "bot", text: action.payload });
            })
            .addCase(sendMessageToBackend.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // .addCase(fetchMessagesFromBackend.pending, (state) => {
            //     state.loading = true;
            //     state.error = null;
            // })
            // .addCase(fetchMessagesFromBackend.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.messages = action.payload;
            // })
            // .addCase(fetchMessagesFromBackend.rejected, (state, action) => {
            //     state.loading = false;
            //     state.error = action.payload as string;
            // });
    },
});

export const { addUserMessage } = chatSlice.actions;
export default chatSlice.reducer;
