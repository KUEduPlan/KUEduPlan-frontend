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
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
          <Typography variant="body2" display="inline" sx={{ fontSize: '16px' }}>
            Year 60 Curriculum
          </Typography>
          <Checkbox disabled />
          <Typography variant="body2" display="inline" sx={{ fontSize: '16px' }}>
            Year 65 Curriculum
          </Typography>
        </Box>
        <TextField size="small" placeholder="Search" />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }} />
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>
                <TableSortLabel
                  active={orderBy === 'code'}
                  direction={orderBy === 'code' ? order : 'asc'}
                  onClick={() => handleSort('code')}
                  hideSortIcon={false}
                >
                  Course Code
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                  hideSortIcon={false}
                >
                  Course Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>Sem1</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>Sem2</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>
                <TableSortLabel
                  active={orderBy === 'f'}
                  direction={orderBy === 'f' ? order : 'asc'}
                  onClick={() => handleSort('f')}
                  hideSortIcon={false}
                >
                  F
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>
                <TableSortLabel
                  active={orderBy === 'wn'}
                  direction={orderBy === 'wn' ? order : 'asc'}
                  onClick={() => handleSort('wn')}
                  hideSortIcon={false}
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
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      cursor: 'pointer',
                      color: 'green',
                      textDecoration: 'none',
                      fontSize: '16px', // Increase font size
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                    onClick={() => navigate(`/course-details/${row.code}`)}
                  >
                    {row.code}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '16px' }}>{row.name}</TableCell>
                <TableCell sx={{ fontSize: '16px' }}>{row.sem1 ? '✔' : ''}</TableCell>
                <TableCell sx={{ fontSize: '16px' }}>{row.sem2 ? '✔' : ''}</TableCell>
                <TableCell sx={{ fontSize: '16px' }}>{row.f}</TableCell>
                <TableCell sx={{ fontSize: '16px' }}>{row.wn}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" sx={{ marginTop: '10px', display: 'block', fontSize: '14px' }}>
        Note: Click on checkbox to assume that this course is available next semester without conflicts for all academic year.
      </Typography>
    </Box>
  );
};

export default DeferCoursesTable;