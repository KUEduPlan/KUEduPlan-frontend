// import { configureStore, createSlice } from '@reduxjs/toolkit';

// export const initialState = {
//     studentInfo: {
//       code: '642222222',
//       name: 'Yearthree student',
//     },
//     years: [
//       {
//         year: 'First Year',
//         semesters: [
//           {
//             studied: true,
//             subjects: [
//               { code: '01219114-60', name: 'PROGRAMMING I', grade: 'F', fail: false, withdraw: false, prerequisites: [] },
//               { code: 'ENGLISH', name: 'ENGLISH', grade: 'A', fail: false, withdraw: false, prerequisites: [] },
//               { code: 'GENERAL EDUCATION', name: 'GENERAL EDUCATION', grade: 'A', fail: false, withdraw: false, prerequisites: [] },
//             ],
//           },
//           {
//             studied: true,
//             subjects: [
//               { code: '01204211-60', name: 'DISCRETE MATH', grade: 'B+', fail: false, withdraw: false, prerequisites: ['01219114-60'] },
//               { code: '01219116-60', name: 'PROGRAMMING II', grade: 'B', fail: false, withdraw: false, prerequisites: ['01219114-60'] },
//             ],
//           },
//         ],
//       },
//       {
//         year: 'Second Year',
//         semesters: [
//           {
//             studied: false,
//             subjects: [
//               { code: '01219217-60', name: 'DATA STRUCTURE & ALGORITHM I', grade: null, fail: false, withdraw: false, prerequisites: ['01219116-60'] },
//               { code: '01219217-60-1', name: 'DATA STRUCTURE & ALGORITHM I LAB', grade: null, fail: false, withdraw: false, prerequisites: ['01219116-60'] }, // ชื่อซ้ำแล้ว svg ไม่ render ซ้ำ
//               { code: '01219245-60', name: 'INDIVIDUAL SOFTWARE PROCESS', grade: null, fail: false, withdraw: false, prerequisites: [] },
//             ],
//           },
//           {
//             studied: false,
//             subjects: [
//               { code: '01219222-60', name: 'INTRO. TO COMPUTER SYSTEMS', grade: null, fail: false, withdraw: false, prerequisites: ['01204211-60'] },
//               { code: '01219223-60', name: 'COMPUTER SYSTEM LAB', grade: null, fail: false, withdraw: false, prerequisites: ['01204211-60'] },
//               { code: '01219266-60', name: 'KNOWLEDGE ENGINEERING AND KNOWLEDGE MANAGEMENT I', grade: null, fail: false, withdraw: false, prerequisites: ['01219116-60'] },
//               { code: '01219243-60', name: 'SOFTWARE SPECIFICATION AND DESIGN', grade: null, fail: false, withdraw: false, prerequisites: ['01219116-60'] },
//               { code: '01219231-60', name: 'DATABASE SYSTEM', grade: null, fail: false, withdraw: false, prerequisites: ['01219116-60'] },
//               { code: '01219218-60', name: 'DATA STRUCTURE AND ALGORITHM II', grade: null, fail: false, withdraw: false, prerequisites: ['01219217-60'] },
//             ],
//           },
//         ],
//       },
//       {
//         year: 'Third Year',
//         semesters: [
//           {
//             studied: false,
//             subjects: [
//               { code: '01219346-60', name: 'SOFTWARE PROCESS & PROJECT MANAGEMENT', grade: null, fail: false, withdraw: false, prerequisites: ['01219243-60'] },
//               { code: '01219345-60', name: 'SOFTWARE VERIFICATION AND VALIDATION', grade: null, fail: false, withdraw: false, prerequisites: ['01219243-60'] },
//               { code: '01219366-60', name: 'KNOWLEDGE ENGINEERING AND KNOWLEDGE MANAGEMENT II', grade: null, fail: false, withdraw: false, prerequisites: ['01219266-60'] },
//             ],
//           },
//           {
//             studied: false,
//             subjects: [
//               { code: '01219367-60', name: 'DATA ANALYTICS', grade: null, fail: false, withdraw: false, prerequisites: ['01219231-60'] },
//               { code: '01219325-60', name: 'SOFTWARE DEVELOPMENT SECURITY', grade: null, fail: false, withdraw: false, prerequisites: ['01219231-60'] },
//               { code: '01219382-60', name: 'INTERACTION DESIGN', grade: null, fail: false, withdraw: false, prerequisites: ['01219243-60'] },
//             ],
//           },
//         ],
//       },
//       {
//         year: 'Fourth Year',
//         semesters: [
//           {
//             studied: false,
//             subjects: [
//               { code: '01219449-60', name: 'PRINCIPLE OF SOFTWARE ARCHITECTURE', grade: null, fail: false, withdraw: false, prerequisites: ['01219346-60'] },
//             ],
//           },
//           {
//             studied: false,
//             subjects: [
//               { code: '01219490-60', name: 'CO-OPERATIVE EDUCATION', grade: null, fail: false, withdraw: false, prerequisites: ['01219346-60', '01219345-60'] },
//             ],
//           },
//         ],
//       },
//       {
//         year: 'Fifth Year',
//         semesters: [
//           {
//             studied: false,
//             subjects: [
//               { code: 'Test1', name: 'TEST COURSE 1', grade: null, fail: false, withdraw: false, prerequisites: ['01219346-60'] },
//             ],
//           },
//           {
//             studied: false,
//             subjects: [
//               { code: 'Test2', name: 'TEST COURSE 2', grade: null, fail: false, withdraw: false, prerequisites: ['01219346-60', '01219345-60'] },
//             ],
//           },
//         ],
//       },
//     ],
//   };

// // Create a slice
// const curriculumSlice = createSlice({
//     name: 'curriculum',
//     initialState,
//     reducers: {
//       toggleFail: (state, action) => {
//         const { yearIndex, semesterIndex, subjectIndex } = action.payload;
//         const subject =
//           state.years[yearIndex].semesters[semesterIndex].subjects[subjectIndex];
//         subject.fail = !subject.fail; // Toggle fail
//       },
//       toggleWithdraw: (state, action) => {
//         const { yearIndex, semesterIndex, subjectIndex } = action.payload;
//         const subject =
//           state.years[yearIndex].semesters[semesterIndex].subjects[subjectIndex];
//         subject.withdraw = !subject.withdraw; // Toggle withdraw
//       },
//       // toggleDropSemester: (state, action) => {
//       //   const { yearIndex, semesterIndex } = action.payload;
//       //   const semester = state.years[yearIndex].semesters[semesterIndex];
//       //   semester.dropped = !semester.dropped; // Toggle drop semester
//       // },
//     },
//   });
  
//   export const { toggleFail, toggleWithdraw } = curriculumSlice.actions;
//   export const curriculumReducer = curriculumSlice.reducer;

// export const store = configureStore({
//     reducer: {
//       curriculum: curriculumReducer,
//     },
//   });

// ver fetch from backend
import { configureStore } from '@reduxjs/toolkit';
import { curriculumReducer } from './curriculumSlice';

export const store = configureStore({
  reducer: {
    curriculum: curriculumReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;