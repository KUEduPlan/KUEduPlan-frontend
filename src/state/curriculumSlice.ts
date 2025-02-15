import { createSlice } from "@reduxjs/toolkit";
import {
  fetchStudentData,
  fetchStudyPlan,
  fetchPrerequisiteCourses,
  submitDropFailCourses,
  login,
} from "./actions";

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
  prerequisites: any[];
  loading: boolean;
  error: string | null;
  isSimulated: boolean;
  loggedInStudentId: string | null;
}

export const initialState: CurriculumState = {
  studentInfo: {},
  years: [],
  prerequisites: [],
  loading: false,
  error: null,
  isSimulated: false,
  loggedInStudentId: null, // Default to null
};

const transformResponseToYears = (courses: any[]) => {
  const groupedData: { [key: string]: any } = {};

  courses.forEach((course) => {
    const year = course.YEAR.toString();
    const semester = course.SEM || course.REGISTERSEM;
    const grade = course.GRADE === "Undefinded" ? "-" : course.GRADE;

    if (!groupedData[year]) {
      groupedData[year] = {};
    }

    if (!groupedData[year][semester]) {
      groupedData[year][semester] = [];
    }

    groupedData[year][semester].push({
      code: course.CID,
      name: course.CNAME,
      grade: grade,
    });
  });

  return Object.keys(groupedData).map((year) => ({
    year,
    semesters: Object.keys(groupedData[year]).map((semester) => ({
      semester,
      subjects: groupedData[year][semester],
      dropped: false,
    })),
  }));
};

const curriculumSlice = createSlice({
  name: "curriculum",
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
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.loggedInStudentId = action.payload; // Store the student ID
        console.log("Student ID stored in Redux:", action.payload); // Debugging
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
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
    builder.addCase(fetchStudyPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder
      .addCase(fetchStudyPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.years = action.payload.map((year: any) => ({
          ...year,
          semesters: year.semesters.map((semester: any) => ({
            ...semester,
            dropped: semester.dropped ?? false,
          })),
        }));
        state.isSimulated = false;
      })
      .addCase(fetchStudyPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(fetchPrerequisiteCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrerequisiteCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.prerequisites = action.payload;
      })
      .addCase(fetchPrerequisiteCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder.addCase(submitDropFailCourses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder
      .addCase(submitDropFailCourses.fulfilled, (state, action) => {
        console.log("Submit Drop/Fail Courses Response:", action.payload);
        state.loading = false;

        if (Array.isArray(action.payload)) {
          state.years = transformResponseToYears(action.payload);
        } else {
          console.error("Unexpected response format:", action.payload);
          state.error = "Unexpected response format from the server.";
        }

        state.isSimulated = true; // Set to true after simulation
      })
      .addCase(submitDropFailCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { toggleFail, toggleWithdraw, toggleDropSemester } =
  curriculumSlice.actions;
export const curriculumReducer = curriculumSlice.reducer;
