import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  TableSortLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchCourseDetail } from "../state/actions";
import { AppDispatch } from "../state/store";
import { useDispatch } from "react-redux";

interface Row {
  code: string;
  name: string;
  group: string;
  sem1: boolean;
  sem2: boolean;
  Plan_ID: number;
  CID: string;
  CNAME: string;
  GID: string;
  GNAME: string;
  ALLOWYEAR: number;
}

interface OpenPlanTableProps {
  rows: Row[];
  sortField: "code" | "name" | "group";
  sortOrder: "asc" | "desc";
  onSort: (field: "code" | "name" | "group") => void;
  onToggleSemester: (
    row: Row,
    semester: "sem1" | "sem2",
    isChecked: boolean
  ) => void;
}

const OpenPlanTable: React.FC<OpenPlanTableProps> = ({
  rows,
  sortField,
  sortOrder,
  onSort,
  onToggleSemester,
}) => {
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  const handleCourseClick = (courseCode: string) => {
    dispatch(fetchCourseDetail(courseCode))
      .unwrap()
      .then((result: string) => {
        if (result === null) {
          Swal.fire({
            title: "Sorry",
            text: "This course has no data",
            icon: "error",
            confirmButtonText: "OK",
          });
        } else {
          navigate(`/course-details/${courseCode}`);
        }
      })
      .catch((error: any) =>
        console.error("Failed to fetch course details:", error)
      );
  };

  const handleToggle = (
    row: Row,
    semester: "sem1" | "sem2",
    isChecked: boolean
  ) => {
    const willBothBeFalse =
      (semester === "sem1" && !isChecked && !row.sem2) ||
      (semester === "sem2" && !isChecked && !row.sem1);

    if (willBothBeFalse) {
      Swal.fire({
        title: "Warning",
        text: "A course must be open in at least one semester. If you want to remove this semester, please allow the other semester first.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    } else {
      onToggleSemester(row, semester, isChecked);
    }
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {/* Course Code Column with Sorting */}
            <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
              <TableSortLabel
                active={sortField === "code"}
                direction={sortField === "code" ? sortOrder : "asc"}
                onClick={() => onSort("code")}
              >
                Course Code
              </TableSortLabel>
            </TableCell>

            {/* Course Name Column with Sorting */}
            <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
              <TableSortLabel
                active={sortField === "name"}
                direction={sortField === "name" ? sortOrder : "asc"}
                onClick={() => onSort("name")}
              >
                Course Name
              </TableSortLabel>
            </TableCell>

            {/* Group Column with Sorting */}
            <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
              <TableSortLabel
                active={sortField === "group"}
                direction={sortField === "group" ? sortOrder : "asc"}
                onClick={() => onSort("group")}
              >
                Group
              </TableSortLabel>
            </TableCell>

            <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
              Semester 1
            </TableCell>
            <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
              Semester 2
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: "pointer",
                    color: "green",
                    textDecoration: "none",
                    fontSize: "16px",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={() => handleCourseClick(row.code)}
                >
                  {row.code}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontSize: "16px" }}>{row.name}</TableCell>
              <TableCell sx={{ fontSize: "16px" }}>{row.group}</TableCell>
              <TableCell sx={{ fontSize: "16px" }}>
                <Checkbox
                  checked={row.sem1}
                  onChange={(e) => handleToggle(row, "sem1", e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ fontSize: "16px" }}>
                <Checkbox
                  checked={row.sem2}
                  onChange={(e) => handleToggle(row, "sem2", e.target.checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OpenPlanTable;