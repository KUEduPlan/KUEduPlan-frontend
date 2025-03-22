import { createSlice } from '@reduxjs/toolkit';
import { fetchOpenPlanTable, toggleSemester } from './actions';

interface Row {
  code: string;
  name: string;
  group: string;
  sem1: boolean;
  sem2: boolean;
  Plan_ID: number;
  CID: string;
  CNAME: string;
  GID: string;
  GNAME: string;
  ALLOWYEAR: number;
}

interface OpenPlanState {
  data: Row[];
  loading: boolean;
  error: string | null;
}

const initialState: OpenPlanState = {
  data: [],
  loading: false,
  error: null,
};

const openPlanSlice = createSlice({
  name: 'openPlan',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch open plan data
      .addCase(fetchOpenPlanTable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpenPlanTable.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.map((item: any) => ({
          code: item.code,
          name: item.name,
          group: item.group,
          sem1: item.sem1,
          sem2: item.sem2,
          Plan_ID: item.Plan_ID,
          CID: item.CID,
          CNAME: item.CNAME,
          GID: item.GID,
          GNAME: item.GNAME,
          ALLOWYEAR: item.ALLOWYEAR,
        }));
      })
      .addCase(fetchOpenPlanTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Toggle semester
      .addCase(toggleSemester.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleSemester.fulfilled, (state, action) => {
        const { row, semester, isChecked } = action.payload;
        const updatedData = state.data.map((course) =>
          course.code === row.code ? { ...course, [semester]: isChecked } : course
        );
        state.data = updatedData;
        state.loading = false;
      })
      .addCase(toggleSemester.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default openPlanSlice.reducer;