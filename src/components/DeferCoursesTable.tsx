import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  Box,
  TextField,
  TableSortLabel,
} from '@mui/material';

interface Row {
  code: string;
  name: string;
  sem1: boolean;
  sem2: boolean;
  f: number;
  wn: number;
}

const DeferCoursesTable: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([
    { code: '01219114-60', name: 'Computer Programming I', sem1: true, sem2: false, f: 20, wn: 7 },
    { code: '01219114-65', name: 'Computer Programming I', sem1: true, sem2: false, f: 24, wn: 4 },
    { code: '01219116-60', name: 'Computer Programming II', sem1: true, sem2: true, f: 28, wn: 3 },
  ]);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof Row>('code');

  const handleSort = (property: keyof Row) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

    const sortedRows = [...rows].sort((a, b) => {
      if (a[property] < b[property]) return isAsc ? -1 : 1;
      if (a[property] > b[property]) return isAsc ? 1 : -1;
      return 0;
    });

    setRows(sortedRows);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Box>
          <Checkbox disabled />
          <Typography variant="body2" display="inline">
            Year 60 Curriculum
          </Typography>
          <Checkbox disabled />
          <Typography variant="body2" display="inline">
            Year 65 Curriculum
          </Typography>
        </Box>
        <TextField size="small" placeholder="Search" />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#f5f5f5' }} />
              <TableCell sx={{ backgroundColor: '#f5f5f5' }}>
                <TableSortLabel
                  active={orderBy === 'code'}
                  direction={orderBy === 'code' ? order : 'asc'}
                  onClick={() => handleSort('code')}
                  hideSortIcon={false}
                  // sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  Course Code
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5' }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                  hideSortIcon={false}
                  // sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  Course Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5' }}>Sem1</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5' }}>Sem2</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5' }}>
                <TableSortLabel
                  active={orderBy === 'f'}
                  direction={orderBy === 'f' ? order : 'asc'}
                  onClick={() => handleSort('f')}
                  hideSortIcon={false}
                  // sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  F
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5' }}>
                <TableSortLabel
                  active={orderBy === 'wn'}
                  direction={orderBy === 'wn' ? order : 'asc'}
                  onClick={() => handleSort('wn')}
                  hideSortIcon={false}
                  // sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  W/N
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.sem1 ? '✔' : ''}</TableCell>
                <TableCell>{row.sem2 ? '✔' : ''}</TableCell>
                <TableCell>{row.f}</TableCell>
                <TableCell>{row.wn}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" sx={{ marginTop: '10px', display: 'block' }}>
        Note: Click on checkbox to assume that this course is available next semester without conflicts for all academic year.
      </Typography>
    </Box>
  );
};

export default DeferCoursesTable;