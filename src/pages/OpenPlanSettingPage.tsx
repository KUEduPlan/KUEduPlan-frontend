import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import OpenPlanTable from "../components/OpenPlanTable";
import { useAppDispatch, useAppSelector } from "../state/store";
import {
  fetchOpenPlanTable,
  toggleSemester,
  resetOpenPlan,
} from "../state/actions";
import Swal from "sweetalert2";

const OpenPlanSettingPage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [groupFilter, setGroupFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<"code" | "name" | "group">("code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [lostCourses, setLostCourses] = useState<any[]>([]);
  const [isLoadingLostCourses, setIsLoadingLostCourses] = useState(false);

  const {
    data: courses,
    loading,
    error,
  } = useAppSelector((state) => state.openPlan);
  const dispatch = useAppDispatch();
  const { planId, accessToken } = useAppSelector((state) => state.curriculum);
  const role = useAppSelector((state) => state.curriculum.role);

  console.log("Plan ID:", planId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch regular courses
        await dispatch(fetchOpenPlanTable());

        // Fetch lost courses if we have a planId
        if (planId) {
          setIsLoadingLostCourses(true);
          const response = await fetch(
            "http://127.0.0.1:8000/open_plan_lost_sub",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ Plan_ID: planId }), // Corrected field name
            }
          );

          if (response.ok) {
            const data = await response.json();
            setLostCourses(data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingLostCourses(false);
      }
    };

    fetchData();
  }, [dispatch, planId, accessToken]);

  const handleResetPlan = async () => {
    if (!planId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Plan ID not available",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will reset all semester selections!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Reset Plan",
    });

    if (!result.isConfirmed) return;

    try {
      // Reset the plan
      await dispatch(resetOpenPlan(planId)).unwrap();

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Reset Complete!",
        text: "The plan has been reset to default settings.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh data
      await dispatch(fetchOpenPlanTable());

      const response = await fetch("http://127.0.0.1:8000/open_plan_lost_sub", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ Plan_ID: planId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLostCourses(data);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: error.message || "Could not reset the plan",
      });
    }
  };

  const uniqueGroups = Array.from(
    new Set([
      ...courses.map((course) => course.group),
      ...lostCourses.map((course) => course.group_name),
    ])
  ).filter(Boolean);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleGroupFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setGroupFilter(typeof value === "string" ? value.split(",") : value);
  };

  const handleSort = (field: "code" | "name" | "group") => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const handleToggleSemester = async (
    row: any,
    semester: "sem1" | "sem2",
    isChecked: boolean
  ) => {
    try {
      await dispatch(toggleSemester({ row, semester, isChecked })).unwrap();
    } catch (error) {
      console.error("Failed to toggle semester:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update semester selection",
      });
    }
  };

  const filteredCourses = [
    ...courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchText.toLowerCase()) ||
        course.code.toLowerCase().includes(searchText.toLowerCase());
      const matchesGroup =
        groupFilter.length === 0 || groupFilter.includes(course.group);
      return matchesSearch && matchesGroup;
    }),
    ...lostCourses.map((lostCourse) => ({
      code: lostCourse.subject_code,
      name: lostCourse.subject_name,
      group: lostCourse.group_name,
      sem1: false,
      sem2: false,
      Plan_ID: planId || 0,
      CID: lostCourse.subject_code,
      CNAME: lostCourse.subject_name,
      GID: lostCourse.group_no,
      GNAME: lostCourse.group_name,
      ALLOWYEAR: lostCourse.class_year,
      isLostCourse: true,
    })),
  ].sort((a, b) => {
    if (sortField === "code") {
      return sortOrder === "asc"
        ? a.code.localeCompare(b.code)
        : b.code.localeCompare(a.code);
    } else if (sortField === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === "group") {
      return sortOrder === "asc"
        ? a.group.localeCompare(b.group)
        : b.group.localeCompare(a.group);
    }
    return 0;
  });

  if (loading || isLoadingLostCourses) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: "20px" }}>
        Error: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ padding: "80px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Open Plan Settings
        </Typography>

        <Button
          variant="contained"
          color="error"
          onClick={handleResetPlan}
          disabled={loading}
        >
          Reset Plan
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: "20px",
          gap: 2,
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Group</InputLabel>
          <Select
            multiple
            value={groupFilter}
            onChange={handleGroupFilterChange}
            label="Group"
            renderValue={(selected) => selected.join(", ")}
          >
            {uniqueGroups.map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search by course name or code"
          value={searchText}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, maxWidth: 400, marginLeft: "auto" }}
        />
      </Box>

      <OpenPlanTable
        rows={filteredCourses}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onToggleSemester={handleToggleSemester}
      />

      <Box>
        {role === "curriculum_admin" && (
          <Button
            variant="contained"
            onClick={() => window.history.back()}
            sx={{
              backgroundColor: "#256E65",
              color: "#fff",
              marginTop: 4,
            }}
          >
            Back
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OpenPlanSettingPage;
