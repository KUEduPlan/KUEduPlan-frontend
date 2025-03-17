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
  TableSortLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Row {
  code: string;
  name: string;
  faculty: string; // New column
  sem1: boolean;
  sem2: boolean;
}

const OpenPlanTable: React.FC<{ rows: Row[] }> = ({ rows }) => {
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

  };

  const handleSemesterToggle = (index: number, semester: keyof Pick<Row, 'sem1' | 'sem2'>) => {
    const updatedRows = [...rows];
    updatedRows[index][semester] = !updatedRows[index][semester] as boolean;
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>
              <TableSortLabel
                active={orderBy === 'code'}
                direction={orderBy === 'code' ? order : 'asc'}
                onClick={() => handleSort('code')}
              >
                Course Code
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => handleSort('name')}
              >
                Course Name
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>
              Faculty
            </TableCell>
            <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>Semester 1</TableCell>
            <TableCell sx={{ backgroundColor: '#f5f5f5', fontSize: '16px' }}>Semester 2</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: 'pointer',
                    color: 'green',
                    textDecoration: 'none',
                    fontSize: '16px',
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
              <TableCell sx={{ fontSize: '16px' }}>{row.faculty}</TableCell>
              <TableCell sx={{ fontSize: '16px' }}>
                <Checkbox
                  checked={row.sem1}
                  onChange={() => handleSemesterToggle(index, 'sem1')}
                />
              </TableCell>
              <TableCell sx={{ fontSize: '16px' }}>
                <Checkbox
                  checked={row.sem2}
                  onChange={() => handleSemesterToggle(index, 'sem2')}
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