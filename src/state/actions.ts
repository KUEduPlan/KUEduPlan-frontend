import { createAsyncThunk } from "@reduxjs/toolkit";
import { CurriculumState } from "../state/curriculumSlice";
import { group } from "console";

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_BASE_URL = "http://localhost:8000";

export const login = createAsyncThunk(
  "auth/login",
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const loginResponse = await fetch(`${API_BASE_URL}/eduplan/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!loginResponse.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const loginData = await loginResponse.json();
      console.log("Login response:", loginData);

      const protectedResponse = await fetch(`${API_BASE_URL}/protected`, {
        headers: {
          Authorization: `Bearer ${loginData.access_token}`,
        },
      });

      if (!protectedResponse.ok) {
        throw new Error("Failed to fetch protected user data.");
      }

      const protectedData = await protectedResponse.json();
      console.log("Protected response:", protectedData);

      return {
        username: loginData.username,
        accessToken: loginData.access_token,
        tokenType: loginData.token_type,
        role: protectedData.role,
        planId: protectedData.plan_id,
      };
    } catch (error: any) {
      console.error("Error during login:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      if (!curriculum.accessToken) {
        throw new Error("Access token not found. Please log in again.");
      }

      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${curriculum.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      return null;
    } catch (error: any) {
      console.error("Error during logout:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch student data
export const fetchStudentData = createAsyncThunk(
  "curriculum/fetchStudentData",
  async (studentId: number | null, { rejectWithValue, getState }) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      if (!curriculum.accessToken) {
        throw new Error("Access token not found. Please log in again.");
      }

      if (!studentId) {
        if (!curriculum.username) {
          throw new Error("Username not found. Please log in again.");
        }
        studentId = parseInt(curriculum.username.replace("b", ""), 10);
      }

      console.log("Fetching student data for studentId:", studentId);

      const response = await fetch(
        `${API_BASE_URL}/student_data/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${curriculum.accessToken}`,
          },
        }
      );

      console.log("Student data response:", response);

      if (!response.ok) {
        throw new Error("Failed to fetch student data");
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
    console.log("Course year:", course.YEAR);
    let year = course.YEAR;

    // Use SEM or REGISTERSEM to determine the semester
    const semester = course.SEM || course.REGISTERSEM;
    const grade = course.GRADE === "Undefined" ? "-" : course.GRADE;

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
      group: course.GNAME,
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
  "curriculum/fetchStudyPlan",
  async (studentId: number, { rejectWithValue, getState }) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      const studentDataResponse = await fetch(
        `${API_BASE_URL}/student_data/6410545541`,
        {
          headers: {
            Authorization: `Bearer ${curriculum.accessToken}`,
          },
        }
      );
      if (!studentDataResponse.ok) {
        throw new Error(
          `Failed to fetch student data: ${studentDataResponse.statusText}`
        );
      }
      const studentData = await studentDataResponse.json();
      const planId = studentData[0].PlanID;
      console.log("student data:", studentData);
      console.log("Plan ID:", planId);

      const studyPlanResponse = await fetch(
        `${API_BASE_URL}/open_plan/6410545541`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${curriculum.accessToken}`,
          },
          body: JSON.stringify({ Plan_ID: planId }),
        }
      );

      if (!studyPlanResponse.ok) {
        throw new Error(
          `Failed to fetch study plan: ${studyPlanResponse.statusText}`
        );
      }

      const data = await studyPlanResponse.json();
      // const uniqueData = data

      console.log("Unique data:", data);

      return transformStudyPlan(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPrerequisiteCourses = createAsyncThunk(
  "curriculum/fetchPrerequisiteCourses",
  async (studentId: number, { rejectWithValue, getState }) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      const response = await fetch(`${API_BASE_URL}/pre_course/${studentId}`, {
        headers: {
          Authorization: `Bearer ${curriculum.accessToken}`,
        },
      });
      console.log("Prerequisite API response:", response);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch prerequisite courses: ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log("Prerequisite data:", data);

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
      console.error("Error fetching prerequisites:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const submitDropFailCourses = createAsyncThunk(
  "curriculum/submitDropFailCourses",
  async (
    { studentId, courses }: { studentId: number; courses: any[] },
    { rejectWithValue, getState }
  ) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      const planId = curriculum.planId;

      const requestBody = {
        StdID: studentId.toString(),
        Plan_ID: planId,
        Courses: courses.map((course) => ({
          CID: course.CID,
          CName: course.CName || "Unknown",
          Year: parseInt(course.Year, 10),
          Sem: parseInt(course.Sem, 10),
          Type: course.Type,
        })),
      };

      console.log("Request body being sent to API:", requestBody);

      const response = await fetch(
        `${API_BASE_URL}/open_plan/submit_drop_fail_course/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${curriculum.accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("API error response:", errorResponse);
        throw new Error(
          `Failed to submit drop/fail courses: ${response.statusText}`
        );
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

export const fetchOpenPlanTable = createAsyncThunk(
  "openPlan/fetchOpenPlanTable",
  async (studentId: string, { rejectWithValue, getState }) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      const studentDataResponse = await fetch(
        `${API_BASE_URL}/student_data/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${curriculum.accessToken}`,
          },
        }
      );
      if (!studentDataResponse.ok) {
        throw new Error(
          `Failed to fetch student data: ${studentDataResponse.statusText}`
        );
      }
      const studentData = await studentDataResponse.json();
      const planId = studentData[0].PlanID;

      if (!planId) {
        throw new Error("Plan_ID not found in student data");
      }

      const openPlanResponse = await fetch(`${API_BASE_URL}/open_plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${curriculum.accessToken}`,
        },
        body: JSON.stringify({ Plan_ID: planId }),
      });

      if (!openPlanResponse.ok) {
        throw new Error(
          `Failed to fetch open plan data: ${openPlanResponse.statusText}`
        );
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
  "openPlan/toggleSemester",
  async (
    {
      row,
      semester,
      isChecked,
    }: { row: any; semester: "sem1" | "sem2"; isChecked: boolean },
    { rejectWithValue, getState }
  ) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      const endpoint = isChecked
        ? "/added_course_open_plan"
        : "/removed_course_open_plan";
      const requestBody = {
        Plan_ID: row.Plan_ID,
        CID: row.CID,
        CNAME: row.CNAME,
        GID: row.GID,
        GNAME: row.GNAME,
        ALLOWYEAR: row.ALLOWYEAR,
        OPENSEM: semester === "sem1" ? 1 : 2,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${curriculum.accessToken}`,
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
  "advisor/fetchAdvisorData",
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log("fetchAdvisorData thunk triggered");
      const { curriculum } = getState() as { curriculum: CurriculumState };
      console.log("Redux state in fetchAdvisorData:", curriculum);

      const advisorCode = curriculum.username?.replace("b", "");
      console.log("Advisor code from advisor data:", advisorCode);

      if (!advisorCode) {
        throw new Error("Advisor code not found in username.");
      }

      const response = await fetch(
        `${API_BASE_URL}/advisor_data/${advisorCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${curriculum.accessToken}`,
          },
          body: JSON.stringify({ advisor_code: advisorCode }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch advisor data");
      }

      const data = await response.json();
      console.log("Advisor data:", data);
      console.log("advisor first name:", data.first_name_th);

      // Return the data as an array
      return [
        {
          advisor_code: data.advisor_code,
          first_name_th: data.first_name_th,
          last_name_th: data.last_name_th,
          plan_id: data.plan_id,
        },
      ];
    } catch (error: any) {
      console.error("Error in fetchAdvisorData:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStudentList = createAsyncThunk(
  "advisor/fetchStudentList",
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log("fetchStudentList thunk triggered");
      const { curriculum } = getState() as { curriculum: CurriculumState };
      console.log("Redux state in fetchStudentList:", curriculum);

      const advisorCode = curriculum.username?.replace("b", "");
      console.log("Advisor code:", advisorCode);

      if (!advisorCode) {
        throw new Error("Advisor code not found in username.");
      }

      const response = await fetch(
        `${API_BASE_URL}/advisee_list_data/${advisorCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${curriculum.accessToken}`,
          },
          body: JSON.stringify({ advisor_code: advisorCode }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student list");
      }

      const data = await response.json();
      console.log("Student list data:", data);

      return data.map((student: any) => ({
        id: student.StdID,
        name: student.StdFirstName,
        surname: student.StdLastName,
        year: student.StdRegisterYear,
      }));
    } catch (error: any) {
      console.error("Error in fetchStudentList:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDistributionList = createAsyncThunk(
  "distribution/fetchDistributionList",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      const response = await fetch(`${API_BASE_URL}/distribution_course`, {
        headers: {
          Authorization: `Bearer ${curriculum.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch distribution list");
      }

      const data = await response.json();
      console.log("Distribution data:", data);

      const mappedData = data.map((course: any) => ({
        CID: course.CID,
        CNAME: course.CNAME,
        StdGotF: course.F || "No data",
      }));

      return mappedData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseDetail = createAsyncThunk(
  "course/fetchCourseDetail",
  async (courseCode: string, { rejectWithValue, getState }) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      if (!curriculum.accessToken) {
        throw new Error("Access token not found. Please log in again.");
      }

      const planId = curriculum.planId;

      const response = await fetch(
        `${API_BASE_URL}/sub_dis_cid/${courseCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${curriculum.accessToken}`,
          },
          body: JSON.stringify({ Plan_ID: planId }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch course details: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetOpenPlan = createAsyncThunk(
  "openPlan/resetOpenPlan",
  async (planId: number, { rejectWithValue, getState }) => {
    try {
      const { curriculum } = getState() as { curriculum: CurriculumState };

      const response = await fetch(`${API_BASE_URL}/reset_open_plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${curriculum.accessToken}`,
        },
        body: JSON.stringify({ Plan_ID: planId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reset open plan: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
