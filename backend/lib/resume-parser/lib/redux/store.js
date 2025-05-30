import { configureStore } from "@reduxjs/toolkit";
import resumeReducer from "lib/redux/resumeSlice";
import settingsReducer from "lib/redux/settingsSlice";
export var store = configureStore({
    reducer: {
        resume: resumeReducer,
        settings: settingsReducer,
    },
});
