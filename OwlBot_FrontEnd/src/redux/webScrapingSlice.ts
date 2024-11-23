// src/redux/webScrapingSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { scheduleWebScraping } from "../api/webScrapingApi";

interface WebScrapingState {
    frequency: number; // Ensure frequency is explicitly typed as a number
    loading: boolean;
    success: boolean | null;
    error: string | null;
}

const initialState: WebScrapingState = {
    frequency: 0,
    loading: false,
    success: null,
    error: null,
};

// Async thunk to schedule web scraping
export const submitWebScrapingSchedule = createAsyncThunk(
    "webScraping/schedule",
    async (
        data: { frequency: number; token: string | null },
        { rejectWithValue }
    ) => {
        try {
            const response = await scheduleWebScraping(
                data.frequency,
                data.token
            );
            return response;
        } catch (error:any) {
            return rejectWithValue(error.response?.data || "Scheduling failed");
        }
    }
);

const webScrapingSlice = createSlice({
    name: "webScraping",
    initialState,
    reducers: {
        setFrequency: (state, action) => {
            state.frequency = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitWebScrapingSchedule.pending, (state) => {
                state.loading = true;
                state.success = null;
                state.error = null;
            })
            .addCase(submitWebScrapingSchedule.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(submitWebScrapingSchedule.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload as string;
            });
    },
});

export const { setFrequency } = webScrapingSlice.actions;

export default webScrapingSlice.reducer;
