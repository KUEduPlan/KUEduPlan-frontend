import React from "react";
import { Typography, Box } from "@mui/material";

const NotFoundPage: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Typography variant="h4">404 - Page Not Found</Typography>
        </Box>
  );
};

export default NotFoundPage;