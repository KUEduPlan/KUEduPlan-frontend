import { createSlice } from '@reduxjs/toolkit';
import { fetchStudentData, fetchStudyPlan } from './actions';

interface Subject {
  fail: boolean;
  withdraw: boolean;
}

interface Semester {
  dropped: boolean;
  subjects: Subject[];
}

interface Year {
  semesters: Semester[];
}

interface CurriculumState {
  studentInfo: Record<string, any>;
  years: Year[];
  loading: boolean;
  error: string | null;
}

export const initialState: CurriculumState = {
  studentInfo: {},
  years: [],
  loading: false,
  error: null,
};

const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState,
  reducers: {
    toggleFail: (state, action) => {
      const { yearIndex, semesterIndex, subjectIndex } = action.payload;
      const subject =
        state.years[yearIndex].semesters[semesterIndex].subjects[subjectIndex];
      subject.fail = !subject.fail;
    },
    toggleWithdraw: (state, action) => {
      const { yearIndex, semesterIndex, subjectIndex } = action.payload;
      const subject =
        state.years[yearIndex].semesters[semesterIndex].subjects[subjectIndex];
      subject.withdraw = !subject.withdraw;
    },
    toggleDropSemester: (state, action) => {
      const { yearIndex, semesterIndex } = action.payload;
      const semester = state.years[yearIndex].semesters[semesterIndex];
      semester.dropped = !semester.dropped;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentData.fulfilled, (state, action) => {
        state.loading = false;
        state.studentInfo = action.payload;
      })
      .addCase(fetchStudentData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(fetchStudyPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudyPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.years = action.payload.map((year: any) => ({
          ...year,
          semesters: year.semesters.map((semester: any) => ({
            ...semester,
            dropped: semester.dropped ?? false,
          })),
        }));
      })
      .addCase(fetchStudyPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { toggleFail, toggleWithdraw, toggleDropSemester } = curriculumSlice.actions;
export const curriculumReducer = curriculumSlice.reducer;