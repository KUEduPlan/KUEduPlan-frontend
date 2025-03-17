import React, { useState } from "react";
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

// Sample data for students
const initialStudents = [
  {
    id: "64123456",
    name: "John",
    surname: "Doe",
    department: "Computer Science",
    year: 2,
  },
  {
    id: "64123457",
    name: "Jane",
    surname: "Smith",
    department: "Mathematics",
    year: 3,
  },
  {
    id: "64123458",
    name: "Alice",
    surname: "Johnson",
    department: "Physics",
    year: 1,
  },
  {
    id: "64123459",
    name: "Bob",
    surname: "Brown",
    department: "Computer Science",
    year: 4,
  },
];

const StudentListPage: React.FC = () => {
  const [students, setStudents] = useState(initialStudents);
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<"id" | "year">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<string[]>([]);

  const navigate = useNavigate();

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  // Handle sorting
  const handleSort = (field: "id" | "year") => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);

    const sortedStudents = [...students].sort((a, b) => {
      if (a[field] < b[field]) return isAsc ? -1 : 1;
      if (a[field] > b[field]) return isAsc ? 1 : -1;
      return 0;
    });

    setStudents(sortedStudents);
  };

  // Handle department filter change
  const handleDepartmentFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setDepartmentFilter(typeof value === "string" ? value.split(",") : value);
  };

  // Handle year filter change
  const handleYearFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setYearFilter(typeof value === "string" ? value.split(",") : value);
  };

  // Filter and search students
  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchText.toLowerCase()) ||
        student.surname.toLowerCase().includes(searchText.toLowerCase());
      const matchesDepartment =
        departmentFilter.length === 0 || departmentFilter.includes(student.department);
      const matchesYear =
        yearFilter.length === 0 || yearFilter.includes(student.year.toString());
      return matchesSearch && matchesDepartment && matchesYear;
    })
    .sort((a, b) => {
      if (sortField === "id") {
        return sortOrder === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      } else {
        return sortOrder === "asc" ? a.year - b.year : b.year - a.year;
      }
    });

  // Unique departments for filter dropdown
  const departments = Array.from(new Set(students.map((student) => student.department)));
  const years = Array.from(new Set(students.map((student) => student.year.toString())));

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
        {/* Department Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Department</InputLabel>
          <Select
            multiple // Enable multi-select
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
            label="Department"
            renderValue={(selected) => selected.join(", ")}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Year Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Year</InputLabel>
          <Select
            multiple // Enable multi-select
            value={yearFilter}
            onChange={handleYearFilterChange}
            label="Year"
            renderValue={(selected) => selected.join(", ")}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                Year {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search by name or surname"
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
                Department
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
                <TableSortLabel
                  active={sortField === "year"}
                  direction={sortField === "year" ? sortOrder : "asc"}
                  onClick={() => handleSort("year")}
                >
                  Year
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell sx={{ fontSize: "16px" }}>{student.id}</TableCell>
                <TableCell sx={{ fontSize: "16px" }}>{student.name}</TableCell>
                <TableCell sx={{ fontSize: "16px" }}>{student.surname}</TableCell>
                <TableCell sx={{ fontSize: "16px" }}>{student.department}</TableCell>
                <TableCell sx={{ fontSize: "16px" }}>Year {student.year}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentListPage;