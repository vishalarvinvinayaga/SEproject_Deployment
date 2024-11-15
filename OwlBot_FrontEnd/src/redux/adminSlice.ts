// src/redux/adminSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAdmin, logoutAdmin } from "../api/adminApi";

const token = localStorage.getItem("token");

interface AdminState {
    isLoggedIn: boolean;
    token: string | null;
    error: string | null;
}

const initialState: AdminState = {
    isLoggedIn: token ? true : false,
    token: null,
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
            console.log(data.token);
            return data.token; // Assuming the token is returned in response
        } catch (error) {
            return rejectWithValue(error.response?.data || "Login failed");
        }
    }
);

// Async thunk for admin logout
export const adminLogout = createAsyncThunk("admin/logout", async () => {
    console.log("Attempting to log out...");
    localStorage.removeItem("token");
    // await logoutAdmin();
    console.log("Logout successful.");
});

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(adminLogin.fulfilled, (state, action) => {
                state.isLoggedIn = true;
                state.token = action.payload; // Save the JWT token
                state.error = null;
            })
            .addCase(adminLogin.rejected, (state, action) => {
                state.isLoggedIn = false;
                state.error = action.payload as string;
            })
            .addCase(adminLogout.fulfilled, (state) => {
                state.isLoggedIn = false;
                state.token = null; // Clear the token on logout
                localStorage.removeItem("token");
            });
    },
});

export default adminSlice.reducer;
