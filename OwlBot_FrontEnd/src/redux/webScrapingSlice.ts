import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    scheduleWebScraping,
    removeWebScrapingTask,
    fetchScheduledTasks,
} from "../api/webScrapingApi";

interface WebScrapingState {
    taskType: string;
    runDate: string | null;
    cronExpression: object | null;
    loading: boolean;
    success: boolean | null;
    error: string | null;
    tasks: { job_id: string; next_run_time: string | null }[];
}

const initialState: WebScrapingState = {
    taskType: "one_time", // Default task type
    runDate: null,
    cronExpression: null,
    loading: false,
    success: null,
    error: null,
    tasks: [],
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

// Async thunk to fetch tasks
export const fetchTasks = createAsyncThunk(
    "webScraping/fetchTasks",
    async (token: string | null, { rejectWithValue }) => {
        try {
            return await fetchScheduledTasks(token);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Failed to fetch tasks"
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
            .addCase(submitWebScrapingSchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const newTask = {
                    job_id: action.payload.job_id || "Unknown Task",
                    next_run_time: action.payload.next_run_time || null,
                };
                state.tasks = [...state.tasks, newTask];
            })
            .addCase(submitWebScrapingSchedule.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload as string;
            })
            .addCase(deleteWebScrapingTask.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteWebScrapingTask.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.tasks = state.tasks.filter(
                    (task) => task.job_id !== action.meta.arg.jobId
                );
            })
            .addCase(deleteWebScrapingTask.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload as string;
            })
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setTaskDetails } = webScrapingSlice.actions;

export default webScrapingSlice.reducer;
