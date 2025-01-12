import { createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://127.0.0.1:8000';

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
    const year = course.YEAR;
    const semester = course.REGISTERSEM;

    if (!groupedData[year]) {
      groupedData[year] = {};
    }

    if (!groupedData[year][semester]) {
      groupedData[year][semester] = [];
    }

    groupedData[year][semester].push({
      code: course.CID,
      grade: course.GRADE,
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

// Fetch study plan and transform it
export const fetchStudyPlan = createAsyncThunk(
  'curriculum/fetchStudyPlan',
  async (studentId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/study_plan/${studentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch study plan: ${response.statusText}`);
      }
      const data = await response.json();
      return transformStudyPlan(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);