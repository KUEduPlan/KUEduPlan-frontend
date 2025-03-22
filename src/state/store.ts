import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { curriculumReducer } from './curriculumSlice';
import openPlanReducer from './openPlanSlice';
import advisorReducer from './advisorSlice';

export const store = configureStore({
  reducer: {
    curriculum: curriculumReducer,  
    openPlan: openPlanReducer,
    advisor: advisorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;