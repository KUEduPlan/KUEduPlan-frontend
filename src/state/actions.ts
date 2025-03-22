import { createAsyncThunk } from '@reduxjs/toolkit';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
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

    // Use SEM or REGISTERSEM to determine the semester
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
      semester: semester, // Add semester information for debugging
    });
  });

  return Object.keys(groupedData).map((year) => ({
    year,
    semesters: [1, 2].map((semester) => ({
      semester,
      subjects: groupedData[year][semester] || [], // Ensure both semesters are present
    })),
  }));
};

export const fetchStudyPlan = createAsyncThunk(
  'curriculum/fetchStudyPlan',
  async (studentId: number, { rejectWithValue }) => {
    try {
      // const studentDataResponse = await fetch(`${API_BASE_URL}/student_data/${studentId}`);
      const studentDataResponse = await fetch(`${API_BASE_URL}/student_data/6410545541`);
      if (!studentDataResponse.ok) {
        throw new Error(`Failed to fetch student data: ${studentDataResponse.statusText}`);
      }
      const studentData = await studentDataResponse.json();
      const planId = studentData[0].PlanID;
      console.log('student data:', studentData);
      console.log('Plan ID:', planId);

      // const studyPlanResponse = await fetch(`${API_BASE_URL}/open_plan/${studentId}`, {
      const studyPlanResponse = await fetch(`${API_BASE_URL}/open_plan/6410545541`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Plan_ID: planId }),
      });

      if (!studyPlanResponse.ok) {
        throw new Error(`Failed to fetch study plan: ${studyPlanResponse.statusText}`);
      }

      const data = await studyPlanResponse.json();
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
      console.log("API response data simulate:", data);
      // hardcode logic
      data[data.length - 1].YEAR = 68;
      data[data.length - 1].SEM = 2;
      console.log("API response data:", data);
      return data;
    } catch (error: any) {
      console.error("Error in submitDropFailCourses:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOpenPlanTable = createAsyncThunk(
  'openPlan/fetchOpenPlanTable',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const studentDataResponse = await fetch(`${API_BASE_URL}/student_data/${studentId}`);
      if (!studentDataResponse.ok) {
        throw new Error(`Failed to fetch student data: ${studentDataResponse.statusText}`);
      }
      const studentData = await studentDataResponse.json();
      const planId = studentData[0].PlanID;

      if (!planId) {
        throw new Error('Plan_ID not found in student data');
      }

      const openPlanResponse = await fetch(`${API_BASE_URL}/open_plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Plan_ID: planId }),
      });

      if (!openPlanResponse.ok) {
        throw new Error(`Failed to fetch open plan data: ${openPlanResponse.statusText}`);
      }

      const data = await openPlanResponse.json();

      const courseMap = new Map<string, any>();
      data.forEach((course: any) => {
        const { CID, CNAME, GID, GNAME, ALLOWYEAR, OPENSEM } = course;

        if (!courseMap.has(CID)) {
          courseMap.set(CID, {
            code: CID,
            name: CNAME,
            group: GNAME,
            sem1: false,
            sem2: false,
            Plan_ID: planId,
            CID,
            CNAME,
            GID,
            GNAME,
            ALLOWYEAR,
          });
        }

        const courseData = courseMap.get(CID);
        if (OPENSEM === 1) {
          courseData.sem1 = true;
        } else if (OPENSEM === 2) {
          courseData.sem2 = true;
        }
      });

      const mappedData = Array.from(courseMap.values());

      return mappedData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleSemester = createAsyncThunk(
  'openPlan/toggleSemester',
  async (
    { row, semester, isChecked }: { row: any; semester: 'sem1' | 'sem2'; isChecked: boolean },
    { rejectWithValue }
  ) => {
    try {
      const endpoint = isChecked ? '/added_course_open_plan' : '/removed_course_open_plan';
      const requestBody = {
        Plan_ID: row.Plan_ID,
        CID: row.CID,
        CNAME: row.CNAME,
        GID: row.GID,
        GNAME: row.GNAME,
        ALLOWYEAR: row.ALLOWYEAR,
        OPENSEM: semester === 'sem1' ? 1 : 2,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle semester: ${response.statusText}`);
      }

      const responseData = await response.json();
      return { row, semester, isChecked, response: responseData };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdvisorData = createAsyncThunk(
  'advisor/fetchAdvisorData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/advior_data`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch advisor data');
      }

      const data = await response.json();

      console.log('Advisor data:', data);

      const advisorData = data.map((advisor: any) => ({
        advisor_code: advisor.advisor_code,
        first_name_th: advisor.first_name_th,
        last_name_th: advisor.last_name_th,
        plan_id: advisor.plan_id,
      }));

      return advisorData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStudentList = createAsyncThunk(
  'advisor/fetchStudentList',
  async (advisorCode: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/advisee_list_data/${advisorCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ advisor_code: advisorCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student list');
      }

      const data = await response.json();

      const studentList = data.map((student: any) => ({
        id: student.StdID,
        name: student.StdFirstName,
        surname: student.StdLastName,
        year: student.StdRegisterYear,
      }));

      return studentList;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);