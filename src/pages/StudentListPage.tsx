import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { TableSortLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchAdvisorData, fetchStudentList } from "../state/actions";
import { RootState, AppDispatch } from "../state/store";

const StudentListPage: React.FC = () => {
  console.log("StudentListPage rendered");
  const dispatch = useDispatch<AppDispatch>();
  const advisorData = useSelector(
    (state: RootState) => state.advisor.advisorData
  );
  const studentList = useSelector(
    (state: RootState) => state.advisor.studentList
  );
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<"id" | "year">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [yearFilter, setYearFilter] = useState<string[]>([]);

  useEffect(() => {
    console.log("useEffect in StudentListPage triggered"); // Add this line
    console.log("Fetching advisor data...");
    dispatch(fetchAdvisorData())
      .unwrap()
      .then(() => {
        console.log("Advisor data fetched. Fetching student list...");
        dispatch(fetchStudentList());
      })
      .catch((error: any) => {
        console.error("Error fetching advisor data:", error);
      });
  }, [dispatch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search text:", event.target.value);
    setSearchText(event.target.value);
  };

  const handleSort = (field: "id" | "year") => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const handleYearFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setYearFilter(typeof value === "string" ? value.split(",") : value);
  };

  const filteredStudents = studentList
    .filter((student: any) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchText.toLowerCase()) ||
        student.surname.toLowerCase().includes(searchText.toLowerCase()) ||
        student.id.toLowerCase().includes(searchText.toLowerCase()); // Search by ID
      const matchesYear =
        yearFilter.length === 0 || yearFilter.includes(student.year.toString());
      return matchesSearch && matchesYear;
    })
    .sort((a: any, b: any) => {
      if (sortField === "id") {
        return sortOrder === "asc"
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id);
      } else {
        return sortOrder === "asc" ? a.year - b.year : b.year - a.year;
      }
    });

  const years = Array.from(
    new Set(studentList.map((student: any) => student.year.toString()))
  );

  const handleStudentClick = (studentId: string) => {
    navigate(`/visualization/${studentId}`);
  };

  return (
    <Box sx={{ padding: "80px" }}>
      <Typography variant="h5" sx={{ marginBottom: "20px" }}>
        Student List
      </Typography>

      {/* Filters and Search Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: "20px",
          gap: 2,
        }}
      >
        {/* Year Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Year</InputLabel>
          <Select
            multiple
            value={yearFilter}
            onChange={handleYearFilterChange}
            label="Year"
            renderValue={(selected) => selected.join(", ")}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search by name, surname, or ID"
          value={searchText}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, maxWidth: 400, marginLeft: "auto" }}
        />
      </Box>

      {/* Student Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
                <TableSortLabel
                  active={sortField === "id"}
                  direction={sortField === "id" ? sortOrder : "asc"}
                  onClick={() => handleSort("id")}
                >
                  Student ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
                Student Name
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
                Student Surname
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
                <TableSortLabel
                  active={sortField === "year"}
                  direction={sortField === "year" ? sortOrder : "asc"}
                  onClick={() => handleSort("year")}
                >
                  Registered academic year
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student: any) => (
              <TableRow key={student.id}>
                <TableCell
                  sx={{
                    fontSize: "16px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => handleStudentClick(student.id)}
                >
                  {student.id}
                </TableCell>
                <TableCell sx={{ fontSize: "16px" }}>{student.name}</TableCell>
                <TableCell sx={{ fontSize: "16px" }}>
                  {student.surname}
                </TableCell>
                <TableCell sx={{ fontSize: "16px" }}>{student.year}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentListPage;
