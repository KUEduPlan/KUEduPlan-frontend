import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";

const Header: React.FC = () => {
  const studentInfo = useSelector((state: RootState) => state.curriculum.studentInfo);
  const student = studentInfo?.[0];

  return (
    <AppBar position="static" sx={{ backgroundColor: "#256E65" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          KU EduPlan
        </Typography>
        <Box sx={{ display: "flex", gap: "20px" }}>
          <Typography component={Link} to="/" sx={{ color: "white", textDecoration: "none" }}>
            Plan
          </Typography>
          <Typography component={Link} to="/distribution" sx={{ color: "white", textDecoration: "none" }}>
            Distribution
          </Typography>
          <Typography component={Link} to="/login" sx={{ color: "white", textDecoration: "none" }}>
            Login
          </Typography>
          <Typography sx={{ color: "white" }}>Contact</Typography>
          <Typography sx={{ color: "white" }}>
            {student?.DID} {student?.NAME}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;