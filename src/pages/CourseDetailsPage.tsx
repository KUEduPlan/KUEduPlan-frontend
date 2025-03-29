import React, { useState, useEffect } from "react";
import { Box, Typography, Checkbox, Button } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchCourseDetail } from "../state/actions";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../state/store";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CourseDetail {
  CID: string;
  Ineligible: number;
  Eligible: number;
}

type CourseDetailsResponse = {
  [year: string]: CourseDetail;
};

const CourseDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { courseCode } = useParams<{ courseCode: string }>();
  const location = useLocation();
  const courseName = location.state?.courseName || "";
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const userInfo = useSelector((state: RootState) => state.curriculum);

  const originalCourseDetails = useSelector(
    (state: RootState) => state.courseDetail.data
  ) as CourseDetailsResponse | null;
  const [displayCourseDetails, setDisplayCourseDetails] =
    useState<CourseDetailsResponse | null>(null);
  const [eligibleData, setEligibleData] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    if (courseCode) {
      dispatch(fetchCourseDetail(courseCode));
    }
  }, [courseCode, dispatch]);

  // Initialize states when originalCourseDetails changes
  useEffect(() => {
    if (originalCourseDetails) {
      const initialData: { [key: string]: boolean } = {};
      Object.keys(originalCourseDetails).forEach((year) => {
        initialData[year] = false;
      });
      setEligibleData(initialData);
      setDisplayCourseDetails(originalCourseDetails);
    }
  }, [originalCourseDetails]);

  const allChecked = originalCourseDetails 
    ? Object.keys(eligibleData).length > 0 && 
      Object.values(eligibleData).every(val => val)
    : false;

  const handleCheckAllChange = async () => {
    if (!originalCourseDetails || !courseCode || !userInfo.planId) return;

    const newCheckedState = !allChecked;
    const newEligibleData: { [key: string]: boolean } = {};
    const years = Object.keys(originalCourseDetails);

    years.forEach(year => {
      newEligibleData[year] = newCheckedState;
    });
    setEligibleData(newEligibleData);

    try {
      if (newCheckedState) {
        const response = await fetch(
          `${API_BASE_URL}/allow_sub_dis_cid/${courseCode}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userInfo.accessToken}`,
            },
            body: JSON.stringify({ Plan_ID: userInfo.planId }),
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Expected JSON response");
        }

        const updatedDetails = await response.json();
        setDisplayCourseDetails(updatedDetails);
      } else {
        setDisplayCourseDetails(originalCourseDetails);
      }
    } catch (error) {
      console.error("Error updating course eligibility:", error);
      setEligibleData(prev => {
        const revertedState: { [key: string]: boolean } = {};
        years.forEach(year => {
          revertedState[year] = !newCheckedState;
        });
        return revertedState;
      });
    }
  };

  const handleCheckboxChange = async (year: string) => {
    const newCheckedState = !eligibleData[year];
    setEligibleData((prev) => ({ ...prev, [year]: newCheckedState }));

    if (courseCode && userInfo.planId) {
      try {
        if (newCheckedState) {
          // Toggled ON - fetch updated data for this specific year
          const response = await fetch(
            `${API_BASE_URL}/allow_sub_dis_cid/${courseCode}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.accessToken}`,
              },
              body: JSON.stringify({ Plan_ID: userInfo.planId }),
            }
          );

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Expected JSON response");
          }

          const updatedDetails = await response.json();

          // Update only the specific year's data in the display
          setDisplayCourseDetails((prev) => ({
            ...prev,
            [year]: updatedDetails[year],
          }));
        } else {
          // Toggled OFF - revert this year's data to original
          setDisplayCourseDetails((prev) => {
            if (!prev || !originalCourseDetails) return prev;
            return {
              ...prev,
              [year]: originalCourseDetails[year] || prev[year],
            };
          });
        }
      } catch (error) {
        console.error("Error updating course eligibility:", error);
        // Revert checkbox state on error
        setEligibleData((prev) => ({ ...prev, [year]: !newCheckedState }));
      }
    }
  };

  // Prepare chart data
  const chartData = {
    labels: Object.keys(displayCourseDetails || {}).map(
      (year) => `${year} (Year ${parseInt(year) % 100})`
    ),
    datasets: [
      {
        label: "Eligible to enroll",
        data: Object.values(displayCourseDetails || {}).map(
          (detail) => detail.Eligible
        ),
        backgroundColor: "#256E65",
      },
      {
        label: "Ineligible to enroll",
        data: Object.values(displayCourseDetails || {}).map(
          (detail) => detail.Ineligible
        ),
        backgroundColor: "#A9A9A9",
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          font: {
            family: "Prompt, Arial, sans-serif",
            size: 14,
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: "Number of Students",
          font: {
            family: "Prompt, Arial, sans-serif",
            size: 14,
          },
        },
        ticks: {
          font: {
            family: "Prompt, Arial, sans-serif",
            size: 12,
          },
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Student Academic Year",
          font: {
            family: "Prompt, Arial, sans-serif",
            size: 14,
          },
        },
        ticks: {
          font: {
            family: "Prompt, Arial, sans-serif",
            size: 12,
          },
        },
      },
    },
  };

  return (
    <Box sx={{ padding: "80px" }}>
      <Typography variant="h5" sx={{ marginBottom: "20px", textAlign: "left" }}>
        Distribution
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: "20px", textAlign: "left" }}>
        {courseCode} -{" "}{courseName}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <Box sx={{ flex: 2, height: "700px" }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="body1" sx={{ marginBottom: "10px" }}>
            Assume this course is available next semester without conflicts for:
          </Typography>
          <Box>
            <Checkbox
              checked={allChecked}
              indeterminate={!allChecked && Object.values(eligibleData).some(val => val)}
              onChange={handleCheckAllChange}
            />
            <Typography variant="body2" display="inline">
              Check all years
            </Typography>
          </Box>
          {displayCourseDetails &&
            Object.keys(displayCourseDetails).map((year) => (
              <Box key={year}>
                <Checkbox
                  checked={eligibleData[year] || false}
                  onChange={() => handleCheckboxChange(year)}
                />
                <Typography variant="body2" display="inline">
                  Year {parseInt(year) % 100}
                </Typography>
              </Box>
            ))}
        </Box>
      </Box>
      <Button
        variant="contained"
        style={{
          backgroundColor: "#256E65",
        }}
        sx={{ marginTop: "20px" }}
        onClick={() => window.history.back()}
      >
        Back
      </Button>
    </Box>
  );
};

export default CourseDetailsPage;