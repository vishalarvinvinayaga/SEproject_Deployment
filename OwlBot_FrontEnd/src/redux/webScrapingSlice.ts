import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    scheduleWebScraping,
    removeWebScrapingTask,
} from "../api/webScrapingApi";

interface WebScrapingState {
    taskType: string;
    runDate: string | null;
    cronExpression: object | null;
    loading: boolean;
    success: boolean | null;
    error: string | null;
}

const initialState: WebScrapingState = {
    taskType: "one_time", // Default task type
    runDate: null,
    cronExpression: null,
    loading: false,
    success: null,
    error: null,
};

// Async thunk to schedule a task
export const submitWebScrapingSchedule = createAsyncThunk(
    "webScraping/schedule",
    async (
        data: {
            taskType: string;
            runDate: string | null;
            cronExpression: object | null;
            token: string | null;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await scheduleWebScraping(
                data.taskType,
                data.runDate,
                data.cronExpression,
                data.token
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Scheduling failed");
        }
    }
);

// Async thunk to remove a task
export const deleteWebScrapingTask = createAsyncThunk(
    "webScraping/remove",
    async (
        data: { jobId: string; token: string | null },
        { rejectWithValue }
    ) => {
        try {
            const response = await removeWebScrapingTask(
                data.jobId,
                data.token
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Task removal failed"
            );
        }
    }
);

const webScrapingSlice = createSlice({
    name: "webScraping",
    initialState,
    reducers: {
        setTaskDetails: (state, action) => {
            const { taskType, runDate, cronExpression } = action.payload;
            state.taskType = taskType;
            state.runDate = runDate;
            state.cronExpression = cronExpression;
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
            })
            .addCase(deleteWebScrapingTask.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteWebScrapingTask.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(deleteWebScrapingTask.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload as string;
            });
    },
});

export const { setTaskDetails } = webScrapingSlice.actions;

export default webScrapingSlice.reducer;
