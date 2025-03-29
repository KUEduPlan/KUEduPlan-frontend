import React, { useRef, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";

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
  isLostCourse?: boolean;
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
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const { accessToken } = useSelector((state: any) => state.curriculum);

  const lostCourseCache = useRef<Map<string, boolean>>(new Map());

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

  const handleToggle = async (
    row: Row,
    semester: "sem1" | "sem2",
    isChecked: boolean
  ) => {
    const rowKey = `${row.code}-${row.Plan_ID}`;

    if (loadingStates[rowKey]) return;

    setLoadingStates((prev) => ({ ...prev, [rowKey]: true }));

    try {
      await onToggleSemester(row, semester, isChecked);

      if (!row.isLostCourse && !isChecked) {
        const cacheKey = `${row.code}-${row.Plan_ID}`;

        if (
          lostCourseCache.current.has(cacheKey) &&
          lostCourseCache.current.get(cacheKey)
        ) {
          await onToggleSemester(row, semester, !isChecked);
          showCannotRemoveWarning();
          return;
        }

        const currentRow = rows.find(
          (r) => r.code === row.code && r.Plan_ID === row.Plan_ID
        );

        if (currentRow && !currentRow.sem1 && !currentRow.sem2) {
          const response = await fetch(
            "http://127.0.0.1:8000/open_plan_lost_sub",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                subject_code: row.code,
                Plan_ID: row.Plan_ID,
              }),
            }
          );

          if (!response.ok) throw new Error("Failed to check course status");

          const data = await response.json();
          if (data?.length > 0) {
            lostCourseCache.current.set(cacheKey, true);

            await Promise.all([
              onToggleSemester(row, "sem1", true),
              onToggleSemester(row, "sem2", true),
            ]);

            showCannotRemoveWarning();
          } else {
            lostCourseCache.current.set(cacheKey, false);
          }
        }
      }
    } catch (error) {
      console.error("Error handling toggle:", error);
      await onToggleSemester(row, semester, !isChecked);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [rowKey]: false }));
    }
  };

  const showCannotRemoveWarning = () => {
    Swal.fire({
      title: "Cannot Remove Course",
      text: "This course is required in the curriculum and cannot be removed.",
      icon: "warning",
      confirmButtonText: "OK",
    });
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
              <TableSortLabel
                active={sortField === "code"}
                direction={sortField === "code" ? sortOrder : "asc"}
                onClick={() => onSort("code")}
              >
                Course Code
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ backgroundColor: "#f5f5f5", fontSize: "16px" }}>
              <TableSortLabel
                active={sortField === "name"}
                direction={sortField === "name" ? sortOrder : "asc"}
                onClick={() => onSort("name")}
              >
                Course Name
              </TableSortLabel>
            </TableCell>
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
          {rows.map((row, index) => {
            const rowKey = `${row.code}-${row.Plan_ID}`;
            const isLoading = loadingStates[rowKey] || false;

            return (
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
                    onChange={(e) =>
                      handleToggle(row, "sem1", e.target.checked)
                    }
                    disabled={isLoading}
                    color="primary"
                  />
                </TableCell>
                <TableCell sx={{ fontSize: "16px" }}>
                  <Checkbox
                    checked={row.sem2}
                    onChange={(e) =>
                      handleToggle(row, "sem2", e.target.checked)
                    }
                    disabled={isLoading}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OpenPlanTable;
