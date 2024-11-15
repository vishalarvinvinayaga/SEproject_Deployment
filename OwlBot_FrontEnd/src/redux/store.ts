import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import adminReducer from "./adminSlice";
import webScrapingReducer from "./webScrapingSlice"

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        admin: adminReducer,
        webScraping: webScrapingReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
