import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../state/store";
// import { logout } from "../state/actions"; // Add a logout action

const Header: React.FC = () => {
  const studentInfo = useSelector(
    (state: RootState) => state.curriculum.studentInfo
  );
  const student = studentInfo?.[0];
  const loggedInStudentId = useSelector(
    (state: any) => state.curriculum.loggedInStudentId
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Clear the logged-in state
    // dispatch(logout());
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#256E65" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          KU EduPlan
        </Typography>
        <Box sx={{ display: "flex", gap: "20px" }}>
          {loggedInStudentId ? (
            <>
              <Typography
                component={Link}
                to="/"
                sx={{ color: "white", textDecoration: "none" }}
              >
                Plan
              </Typography>
              <Typography
                component={Link}
                to="/distribution"
                sx={{ color: "white", textDecoration: "none" }}
              >
                Distribution
              </Typography>
              <Typography
                component={Link}
                to="/course-details"
                sx={{ color: "white", textDecoration: "none" }}
              >
                Course Details
              </Typography>
              {/* <Button
                onClick={handleLogout}
                sx={{ color: "white", textTransform: "none" }}
              >
                Logout
              </Button> */}
              <Typography sx={{ color: "white" }}>
                {loggedInStudentId} {student?.StdFirstName}{" "}
                {student?.StdLastName}
              </Typography>
            </>
          ) : (
            <>
              <Typography
                component={Link}
                to="/login"
                sx={{ color: "white", textDecoration: "none" }}
              >
                Login
              </Typography>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
