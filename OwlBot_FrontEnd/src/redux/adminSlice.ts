// src/redux/adminSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAdmin, logoutAdmin } from "../api/adminApi";

const token = localStorage.getItem("token");

interface AdminState {
    isLoggedIn: boolean;
    token: string | null;
    username: string | null;
    error: string | null;
}

const initialState: AdminState = {
    isLoggedIn: token ? true : false,
    token: token || null,
    username: null,
    error: null,
};

// Async thunk for admin login
export const adminLogin = createAsyncThunk(
    "admin/login",
    async (
        credentials: { username: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const data = await loginAdmin(credentials);
            localStorage.setItem("token", data.token);
            return { token: data.token, username: data.username }; // Assuming the token is returned in response
        } catch (error) {
            return rejectWithValue(error.response?.data || "Login failed");
        }
    }
);

// Async thunk for admin logout
export const adminLogout = createAsyncThunk(
    "admin/logout",
    async (_, { getState }) => {
        const state = getState() as { admin: AdminState };
        const token = state.admin.token;

        if (token) {
            await logoutAdmin(token);
        }

        localStorage.removeItem("token");
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(adminLogin.fulfilled, (state, action) => {
                state.isLoggedIn = true;
                state.token = action.payload.token; // Save the JWT token
                state.username = action.payload.username;
                state.error = null;
            })
            .addCase(adminLogin.rejected, (state, action) => {
                state.isLoggedIn = false;
                state.error = action.payload as string;
                state.token = null;
                state.username = null;
            })
            .addCase(adminLogout.fulfilled, (state) => {
                state.isLoggedIn = false;
                state.token = null; // Clear the token on logout
                localStorage.removeItem("token");
                state.username = null;
                state.error = null;
            });
    },
});

export default adminSlice.reducer;
