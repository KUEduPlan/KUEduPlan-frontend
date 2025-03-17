import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import OpenPlanTable from '../components/OpenPlanTable';

// Sample data for courses
const initialCourses = [
  {
    code: '01219114-60',
    name: 'Computer Programming I',
    faculty: 'Software and Knowledge Engineering',
    sem1: true,
    sem2: false,
  },
  {
    code: '01219115-65',
    name: 'Computer Programming II',
    faculty: 'Software and Knowledge Engineering',
    sem1: true,
    sem2: false,
  },
  {
    code: '01214113-60',
    name: 'Computer Programming',
    faculty: 'Computer Engineering',
    sem1: true,
    sem2: true,
  },
];

const OpenPlanSettingPage: React.FC = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'code' | 'name'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  // Handle department filter change
  const handleDepartmentFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setDepartmentFilter(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle sorting
  const handleSort = (field: 'code' | 'name') => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);

    const sortedCourses = [...courses].sort((a, b) => {
      if (a[field] < b[field]) return isAsc ? -1 : 1;
      if (a[field] > b[field]) return isAsc ? 1 : -1;
      return 0;
    });

    setCourses(sortedCourses);
  };

  // Filter and search courses
  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchText.toLowerCase()) ||
        course.code.toLowerCase().includes(searchText.toLowerCase());
      const matchesDepartment =
        departmentFilter.length === 0 || departmentFilter.includes(course.faculty);
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      if (sortField === 'code') {
        return sortOrder === 'asc' ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
      } else {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });

  // Unique faculties for filter dropdown
  const faculties = Array.from(new Set(courses.map((course) => course.faculty)));

  return (
    <Box sx={{ padding: '80px' }}>
      <Typography variant="h5" sx={{ marginBottom: '20px' }}>
        Open Plan Settings
      </Typography>

      {/* Filters and Search Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: '20px',
          gap: 2,
        }}
      >
        {/* Department Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Faculty</InputLabel>
          <Select
            multiple
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
            label="Faculty"
            renderValue={(selected) => selected.join(', ')}
          >
            {faculties.map((faculty) => (
              <MenuItem key={faculty} value={faculty}>
                {faculty}
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
          sx={{ flexGrow: 1, maxWidth: 400, marginLeft: 'auto' }}
        />
      </Box>

      {/* OpenPlanTable */}
      <OpenPlanTable rows={filteredCourses} />
    </Box>
  );
};

export default OpenPlanSettingPage;