import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchCourseDetail } from "../state/actions";

interface CourseDetailState {
  data: any;
  loading: boolean;
  error: string | null;
}

const initialState: CourseDetailState = {
  data: null,
  loading: false,
  error: null,
};

const courseDetailSlice = createSlice({
  name: "courseDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCourseDetail.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(
        fetchCourseDetail.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export default courseDetailSlice.reducer;
