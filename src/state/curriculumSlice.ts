import { createSlice } from "@reduxjs/toolkit";
import {
  fetchStudentData,
  fetchStudyPlan,
  fetchPrerequisiteCourses,
  submitDropFailCourses,
  login,
  logout,
} from "./actions";
import { UserRole } from "../types/types";

interface Subject {
  fail: boolean;
  withdraw: boolean;
  code: string;
  name: string;
  grade: string;
}

interface Semester {
  dropped: boolean;
  subjects: Subject[];
}

interface Year {
  year: string;
  semesters: Semester[];
}

export interface CurriculumState {
  // Curriculum-related fields
  studentInfo: Record<string, any>;
  years: Year[];
  prerequisites: any[];
  loading: boolean;
  error: string | null;
  isSimulated: boolean;

  // Auth-related fields
  loggedIn: boolean;
  username: string | null;
  accessToken: string | null;
  tokenType: string | null;
  role: UserRole | null;
  planId: number | null;
  loggedInStudentId: string | null;
}

const initialState: CurriculumState = {
  // Curriculum-related fields
  studentInfo: {},
  years: [],
  prerequisites: [],
  loading: false,
  error: null,
  isSimulated: false,

  // Auth-related fields
  loggedIn: false,
  username: null,
  accessToken: null,
  tokenType: null,
  role: null,
  planId: null,
  loggedInStudentId: null,
};

const transformResponseToYears = (courses: any[]) => {
  const groupedData: { [key: string]: any } = {};

  courses.forEach((course) => {
    const year = course.YEAR.toString();
    const semester = course.SEM || course.REGISTERSEM;
    const grade = course.GRADE === "Undefined" ? "-" : course.GRADE;
    console.log("Grade", grade);

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
      fail: false,
      withdraw: false,
    });
  });

  return Object.keys(groupedData).map((year) => ({
    year,
    semesters: Object.keys(groupedData[year]).map((semester) => ({
      semester: parseInt(semester),
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
        state.loggedIn = true;
        state.username = action.payload.username;
        state.accessToken = action.payload.accessToken;
        state.tokenType = action.payload.tokenType;
        state.role = action.payload.role;
        state.planId = action.payload.planId;
        state.loggedInStudentId = action.payload.username.replace("b", "");
        console.log("Login successful. Stored data:", action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.loggedIn = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loggedIn = false;
        state.username = null;
        state.accessToken = null;
        state.tokenType = null;
        state.role = null;
        state.planId = null;
        state.loggedInStudentId = null;
        console.log("Logout successful.");
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error("Logout failed:", action.payload);
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

    builder
      .addCase(submitDropFailCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitDropFailCourses.fulfilled, (state, action) => {
        console.log("Submit Drop/Fail Courses Response:", action.payload);
        state.loading = false;

        if (Array.isArray(action.payload)) {
          state.years = transformResponseToYears(action.payload);
        } else {
          console.error("Unexpected response format:", action.payload);
          state.error = "Unexpected response format from the server.";
        }

        state.isSimulated = true;
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
