import { createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:8000';

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Username: username, Password: password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      let studentId = await response.text();
      studentId = studentId.replace(/"/g, "");
      console.log('Cleaned student ID:', studentId);
      return studentId;
    } catch (error: any) {
      console.error('Error during login:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch student data
export const fetchStudentData = createAsyncThunk(
  'curriculum/fetchStudentData',
  async (studentId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student_data/${studentId}`);
      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Transform the study plan data
const transformStudyPlan = (studyPlan: any[]) => {
  const groupedData: { [key: string]: any } = {};

  studyPlan.forEach((course) => {
    console.log('Course year:', course.YEAR);
    let year = course.YEAR.toString().length === 4
      ? course.YEAR.toString().slice(-2)
      : course.YEAR;

    // HARD CODE (NEED TO DELETE AFTER FIX)
    if (year === 68) {
      year = 67;
    }

    if (year === 69) {
      year = 68;
    }

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
      grade: grade,
      name: course.CNAME,
    });
  });

  return Object.keys(groupedData).map((year) => ({
    year,
    semesters: Object.keys(groupedData[year]).map((semester) => ({
      semester,
      subjects: groupedData[year][semester],
    })),
  }));
};

export const fetchStudyPlan = createAsyncThunk(
  'curriculum/fetchStudyPlan',
  async (studentId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/study_plan/${studentId}`);
      console.log('plan response', response);
      if (!response.ok) {
        throw new Error(`Failed to fetch study plan: ${response.statusText}`);
      }
      const data = await response.json();

      const uniqueData = data.filter((course: any, index: number, self: any[]) => {
        return index === self.findIndex((c) => c.CID === course.CID);
      });

      console.log('Unique data:', uniqueData);

      return transformStudyPlan(uniqueData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPrerequisiteCourses = createAsyncThunk(
  'curriculum/fetchPrerequisiteCourses',
  async (studentId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pre_course/${studentId}`);
      console.log('Prerequisite API response:', response);

      if (!response.ok) {
        throw new Error(`Failed to fetch prerequisite courses: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Prerequisite data:', data);

      // Filter out duplicate sets
      const uniqueData = Array.from(
        new Set(
          data.map((item: any) =>
            JSON.stringify({
              prerequisite: item.PrerequisiteCourse,
              current: item.CurrentCourse,
            })
          )
        )
      ).map((item: any) => JSON.parse(item));

      return uniqueData.map((item: any) => ({
        prerequisite: {
          id: item.prerequisite.ID,
          name: item.prerequisite.Name,
          allowedYear: item.prerequisite.AllowedYear,
          openSemester: item.prerequisite.OpenSemester,
        },
        current: {
          id: item.current.ID,
          name: item.current.Name,
          allowedYear: item.current.AllowedYear,
          openSemester: item.current.OpenSemester,
        },
      }));
    } catch (error: any) {
      console.error('Error fetching prerequisites:', error);
      return rejectWithValue(error.message);
    }
  }
);


export const submitDropFailCourses = createAsyncThunk(
  'curriculum/submitDropFailCourses',
  async ({ studentId, courses }: { studentId: number; courses: any[] }, { rejectWithValue }) => {
    try {
      const requestBody = {
        StdID: studentId,
        Courses: courses,
      };

      console.log("Request body being sent to API:", requestBody);

      const response = await fetch(`${API_BASE_URL}/submit_drop_fail_course/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("API error response:", errorResponse);
        throw new Error(`Failed to submit drop/fail courses: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API response data:", data);
      return data;
    } catch (error: any) {
      console.error("Error in submitDropFailCourses:", error);
      return rejectWithValue(error.message);
    }
  }
);
