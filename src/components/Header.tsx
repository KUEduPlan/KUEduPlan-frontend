import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../state/store";
import { logout } from "../state/actions";
import Swal from "sweetalert2";

const Header: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.curriculum);
  const loggedInStudentId = useSelector(
    (state: RootState) => state.curriculum.loggedInStudentId
  );
  const role = useSelector((state: RootState) => state.curriculum.role);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You will be logged out of the system.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#256E65",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, logout!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await dispatch(logout()).unwrap();
        Swal.fire({
          title: "Logged out!",
          text: "You have been successfully logged out.",
          icon: "success",
          confirmButtonColor: "#256E65",
        }).then(() => {
          navigate("/login");
        });
      }
    } catch (error: any) {
      console.error(
        "Logout failed:",
        error.message || "An unknown error occurred"
      );
      Swal.fire({
        title: "Error!",
        text: error.message || "Logout failed. Please try again.",
        icon: "error",
        confirmButtonColor: "#256E65",
      });
    }
  };

  console.log("Logged in student ID:", loggedInStudentId);

  return (
    <AppBar position="static" sx={{ backgroundColor: "#256E65" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          KU EduPlan
        </Typography>
        <Box sx={{ display: "flex", gap: "20px" }}>
          {loggedInStudentId ? (
            <>
              {/* Show "Distribution" only for curriculum_admin */}
              {role === "curriculum_admin" && (
                <Typography
                  component={Link}
                  to="/distribution"
                  sx={{ color: "white", textDecoration: "none" }}
                >
                  Distribution
                </Typography>
              )}

              {/* Show "Student List" for curriculum_admin */}
              {role === "curriculum_admin" && (
                <Typography
                  component={Link}
                  to="/openplan-setting"
                  sx={{ color: "white", textDecoration: "none" }}
                >
                  Plan Setting
                </Typography>
              )}

              {/* Show "Student List" for advisor */}
              {role === "advisor" && (
                <Typography
                  component={Link}
                  to="/student-list"
                  sx={{ color: "white", textDecoration: "none" }}
                >
                  Student List
                </Typography>
              )}

              {/* Show "Logout" for all roles */}
              <Typography
                onClick={handleLogout}
                sx={{
                  color: "white",
                  textTransform: "none",
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Logout
              </Typography>
              <Typography sx={{ color: "white" }}>
                {userInfo.username}
              </Typography>
              {/* TODO: Display logged-in user info */}
            </>
          ) : (
            <>
              {/* Show "Login" if not logged in */}
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
