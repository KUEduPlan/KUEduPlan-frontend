import { createSlice } from '@reduxjs/toolkit';
import { fetchAdvisorData, fetchStudentList } from '../state/actions';

interface AdvisorState {
  advisorData: any[];
  studentList: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AdvisorState = {
  advisorData: [],
  studentList: [],
  loading: false,
  error: null,
};

const advisorSlice = createSlice({
  name: 'advisor',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvisorData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvisorData.fulfilled, (state, action) => {
        state.loading = false;
        state.advisorData = action.payload;
      })
      .addCase(fetchAdvisorData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchStudentList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentList.fulfilled, (state, action) => {
        state.loading = false;
        state.studentList = action.payload;
      })
      .addCase(fetchStudentList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default advisorSlice.reducer;