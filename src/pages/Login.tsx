import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { login } from "../state/actions";
import logo from "../pics/logo.png";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await (dispatch as any)(login({ username, password })).unwrap();

      // Show success modal
      Swal.fire({
        title: "Login Successful!",
        text: "Welcome to KU EduPlan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/visualization");
      });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);

      // Show error modal
      Swal.fire({
        title: "Login Failed",
        text: err.message || "Invalid credentials. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f3f4f6",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "stretch",
          padding: { xs: 2, md: 4 },
        }}
      >
        {/* Login Section */}
        <Box
          sx={{
            flex: 1.2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ maxWidth: "36rem", width: "100%" }}>
            {/* Title Section */}
            <Box sx={{ marginBottom: 6 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#77aa65" }}
              >
                KASETSART UNIVERSITY
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.2,
                  marginBottom: 2,
                }}
              >
                Smart planning,
                <br />
                Brighter futures
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: "1.2rem", color: "#6b7280" }}
              >
                Welcome to KU EduPlan
              </Typography>
            </Box>

            {/* Login Form */}
            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              {/* Nontri Account Input */}
              <Box sx={{ width: "100%", marginBottom: 4 }}>
                <Typography
                  component="label"
                  htmlFor="nontri-account"
                  sx={{
                    display: "block",
                    marginBottom: 1,
                    fontSize: "1rem",
                    color: "#4b5563",
                  }}
                >
                  Nontri Account
                </Typography>
                <TextField
                  id="nontri-account"
                  name="account"
                  type="text"
                  required
                  fullWidth
                  placeholder="e.g. b64xxxxxxxx, regxxx"
                  variant="outlined"
                  size="medium"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ fontSize: "1rem" }}
                />
              </Box>

              {/* Password Input */}
              <Box sx={{ width: "100%", marginBottom: 4 }}>
                <Typography
                  component="label"
                  htmlFor="password"
                  sx={{
                    display: "block",
                    marginBottom: 1,
                    fontSize: "1rem",
                    color: "#4b5563",
                  }}
                >
                  Password
                </Typography>
                <TextField
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  fullWidth
                  placeholder="Password"
                  variant="outlined"
                  size="medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ fontSize: "1rem" }}
                />
              </Box>

              {/* Error Message */}
              {error && (
                <Typography color="error" sx={{ marginBottom: 2 }}>
                  {error}
                </Typography>
              )}

              {/* Submit Button */}
              <Box sx={{ width: "100%" }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: "#28615c",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: 600,
                    padding: "1rem 1.5rem",
                    borderRadius: "0.5rem",
                    "&:hover": {
                      backgroundColor: "#047857",
                    },
                  }}
                >
                  Log In with KU ALL
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Logo Section */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f3f4f6",
          }}
        >
          <Box
            sx={{
              width: { xs: "300px", md: "600px" },
              height: { xs: "300px", md: "600px" },
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={logo}
              alt="KU EduPlan Logo"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
