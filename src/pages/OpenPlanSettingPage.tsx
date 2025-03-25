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

  const {
    data: courses,
    loading,
    error,
  } = useAppSelector((state) => state.openPlan);
  const dispatch = useAppDispatch();
  const { planId } = useAppSelector((state) => state.curriculum);

  // TODO: Delete hardcode logic
  useEffect(() => {
    dispatch(fetchOpenPlanTable("6410545541"));
  }, [dispatch]);

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
      dispatch(fetchOpenPlanTable("6410545541"));
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: error.message || "Could not reset the plan",
      });
    }
  };

  const uniqueGroups = Array.from(
    new Set(courses.map((course) => course.group))
  );

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

  const handleToggleSemester = (
    row: any,
    semester: "sem1" | "sem2",
    isChecked: boolean
  ) => {
    dispatch(toggleSemester({ row, semester, isChecked }));
  };

  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchText.toLowerCase()) ||
        course.code.toLowerCase().includes(searchText.toLowerCase());
      const matchesGroup =
        groupFilter.length === 0 || groupFilter.includes(course.group);
      return matchesSearch && matchesGroup;
    })
    .sort((a, b) => {
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

  if (loading) {
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

  // Error state
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
        }}
      >
        <Typography variant="h5">Open Plan Settings</Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleResetPlan}
          disabled={loading}
        >
          Reset Plan
        </Button>
      </Box>

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
        {/* Group Filter */}
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

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search by course name or code"
          value={searchText}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, maxWidth: 400, marginLeft: "auto" }}
        />
      </Box>

      {/* OpenPlanTable */}
      <OpenPlanTable
        rows={filteredCourses}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onToggleSemester={handleToggleSemester}
      />
    </Box>
  );
};

export default OpenPlanSettingPage;
