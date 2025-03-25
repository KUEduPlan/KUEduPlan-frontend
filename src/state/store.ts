import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { curriculumReducer } from "./curriculumSlice";
import openPlanReducer from "./openPlanSlice";
import advisorReducer from "./advisorSlice";
import courseDetailReducer from "./courseDetailSlice";
import distributionReducer from "./distributionSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, curriculumReducer);

export const store = configureStore({
  reducer: {
    curriculum: curriculumReducer,
    openPlan: openPlanReducer,
    advisor: advisorReducer,
    distribution: distributionReducer,
    courseDetail: courseDetailReducer,
  },
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
