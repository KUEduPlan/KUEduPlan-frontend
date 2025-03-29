import React, { useEffect, useState, useMemo } from "react";
import { AppDispatch, RootState } from "../state/store";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  TableSortLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchDistributionList, fetchCourseDetail } from "../state/actions";
import ClearIcon from "@mui/icons-material/Clear";
import Swal from "sweetalert2";

interface Row {
  code: string;
  name: string;
  sem1: boolean;
  sem2: boolean;
  f: string | number;
}

const DeferCoursesTable: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const distributionList = useSelector(
    (state: RootState) => state.distribution?.list || []
  );

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Row>("code");
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  // Initialize rows from distribution list
  useEffect(() => {
    const initialRows: Row[] = distributionList.map((course: any) => ({
      code: course.CID,
      name: course.CNAME,
      sem1: false,
      sem2: false,
      f: course.StdGotF || "No data",
    }));
    setRows(initialRows);
  }, [distributionList]);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchDistributionList());
  }, [dispatch]);

  // Filter and sort rows
  const filteredRows = useMemo(() => {
    let result = [...rows];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (row) =>
          row.code.toLowerCase().includes(lowerCaseSearchTerm) ||
          row.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Apply sorting
    return result.sort((a, b) => {
      const isAsc = order === "asc";
      if (a[orderBy] < b[orderBy]) return isAsc ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return isAsc ? 1 : -1;
      return 0;
    });
  }, [rows, searchTerm, order, orderBy]);

  // Event handlers
  const handleSort = (property: keyof Row) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleCourseClick = (courseCode: string, courseName: string) => {
    dispatch(fetchCourseDetail(courseCode))
      .unwrap()
      .then((result) => {
        if (result === "Subject had no data") {
          Swal.fire({
            title: "Sorry",
            text: "This course has no data",
            icon: "error",
            confirmButtonText: "OK",
          });
        } else {
          navigate(`/course-details/${courseCode}`, {
            state: { courseName }
          });
        }
      })
      .catch((error) =>
        console.error("Failed to fetch course details:", error)
      );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search by course code or name"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: "400px" }}
          InputProps={{
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
                <TableSortLabel
                  active={orderBy === "code"}
                  direction={orderBy === "code" ? order : "asc"}
                  onClick={() => handleSort("code")}
                >
                  Course Code
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleSort("name")}
                >
                  Course Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
                <TableSortLabel
                  active={orderBy === "f"}
                  direction={orderBy === "f" ? order : "asc"}
                  onClick={() => handleSort("f")}
                >
                  Number of F students
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, index) => (
              <TableRow key={`${row.code}-${index}`} hover>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: "pointer",
                    color: "green",
                    "&:hover": { textDecoration: "underline" },
                    fontSize: "16px",
                  }}
                  onClick={() => handleCourseClick(row.code, row.name)}
                >
                  {row.code}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontSize: "16px" }}>{row.name}</TableCell>
              <TableCell sx={{ fontSize: "16px" }}>{row.f}</TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredRows.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",
            color: "text.secondary",
          }}
        >
          <Typography>No courses found matching your search</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DeferCoursesTable;
