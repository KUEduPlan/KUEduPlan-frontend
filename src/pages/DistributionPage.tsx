import React from "react";
import { Box, Typography } from "@mui/material";
import DeferCoursesTable from "../components/DeferCoursesTable";

const DistributionPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ padding: "80px" }}>
        <Typography variant="h5" sx={{ marginBottom: "20px" }}>
          Distribution
        </Typography>
        <Typography
          variant="h6"
          sx={{ marginTop: "40px", marginBottom: "20px" }}
        >
          Table of defer courses
        </Typography>
        <Box sx={{ marginX: "100px" }}>
          <DeferCoursesTable />
        </Box>
      </Box>
    </Box>
  );
};

export default DistributionPage;
