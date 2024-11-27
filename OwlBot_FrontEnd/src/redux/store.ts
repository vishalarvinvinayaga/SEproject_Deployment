import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import adminReducer from "./adminSlice";
import webScrapingReducer from "./webScrapingSlice";
import fetchNewsReducer from "./fetchNewsSlice";

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        admin: adminReducer,
        webScraping: webScrapingReducer,
        news: fetchNewsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
