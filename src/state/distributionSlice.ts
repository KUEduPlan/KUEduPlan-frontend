import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchDistributionList } from "../state/actions";

interface DistributionState {
  list: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DistributionState = {
  list: [],
  loading: false,
  error: null,
};

const distributionSlice = createSlice({
  name: "distribution",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistributionList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDistributionList.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchDistributionList.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch distribution list";
      });
  },
});

export default distributionSlice.reducer;
