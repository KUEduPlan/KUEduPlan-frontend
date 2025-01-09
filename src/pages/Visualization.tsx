import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { toggleFail, toggleWithdraw, toggleDropSemester } from "../state/store";
import "./visualization.css";
const VisualizationPage: React.FC = () => {
  const curriculum = useSelector((state: any) => state.curriculum.years);
  const studentInfo = useSelector((state: any) => state.curriculum.studentInfo);
  const dispatch = useDispatch();
  const svgRef = useRef<SVGSVGElement>(null);
  const semesterColors = [
    "#EFF5EC",
    "#F5EACF",
    "#CFEDF4",
    "#F4DDCF",
    "#E0CFF5",
    "#D5FEF6",
  ];
  const arrowColors = d3.schemeCategory10;
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous arrows
    const arrowData: any[] = [];
    // Collect prerequisite relationships
    curriculum.forEach((year: any, yearIndex: number) => {
      year.semesters.forEach((semester: any, semesterIndex: number) => {
        semester.subjects.forEach((subject: any, subjectIndex: number) => {
          if (subject.prerequisites) {
            subject.prerequisites.forEach((prerequisite: string) => {
              arrowData.push({
                from: prerequisite,
                to: subject.code,
              });
            });
          }
        });
      });
    });
    const colorMap: { [key: string]: string } = {};
    let colorIndex = 0;
    arrowData.forEach((link) => {
      if (!colorMap[link.from]) {
        colorMap[link.from] = arrowColors[colorIndex % arrowColors.length];
        colorIndex++;
      }
    });
    // Add transparent boxes to SVG for course areas
    curriculum.forEach((year: { semesters: any[] }, yearIndex: any) => {
      year.semesters.forEach((semester, semesterIndex) => {
        semester.subjects.forEach(
          (
            subject: {
              code:
                | string
                | number
                | boolean
                | readonly (string | number)[]
                | d3.ValueFn<
                    SVGRectElement,
                    unknown,
                    | string
                    | number
                    | boolean
                    | readonly (string | number)[]
                    | null
                  >
                | null;
            },
            subjectIndex: any
          ) => {
            const element = document.querySelector(
              `[data-code="${subject.code}"]`
            );
            if (element) {
              const rect = element.getBoundingClientRect();
              const svgRect = svgRef.current?.getBoundingClientRect();
              if (!svgRect) return;
              const x = rect.left - svgRect.left;
              const y = rect.top - svgRect.top;
              const width = rect.width;
              const height = rect.height;
              // Add a transparent rectangle to the SVG
              svg
                .append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "transparent")
                .attr("data-code", subject.code); // Add data attribute for reference
            }
          }
        );
      });
    });
    // Draw arrows with dynamic pathfinding
    arrowData.forEach((link) => {
      const fromElement = svg.select(`rect[data-code="${link.from}"]`);
      const toElement = svg.select(`rect[data-code="${link.to}"]`);
      if (!fromElement.empty() && !toElement.empty()) {
        const fromBox = (
          fromElement.node() as Element
        )?.getBoundingClientRect();
        const toBox = (toElement.node() as Element)?.getBoundingClientRect();
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect || !fromBox || !toBox) return;
        // Start and end points
        const x1 = fromBox.right - svgRect.left;
        const y1 = fromBox.top + fromBox.height / 2 - svgRect.top;
        const x2 = toBox.left - svgRect.left;
        const y2 = toBox.top + toBox.height / 2 - svgRect.top;
        // Calculate intermediate points dynamically
        const verticalGap = 80;
        const horizontalGap = 10;
        let midX1 = x1 + horizontalGap; // First horizontal move
        let midX2 = x2 - horizontalGap; // Second horizontal move (align with target)
        const midY = y1 + verticalGap; // Vertical move
        const buffer = 10;
        const isCrossingObstacle = (x: number, y: number) => {
          // Check if the point (x, y) is inside any course box (with buffer)
          return curriculum.some((year: { semesters: any[] }) =>
            year.semesters.some((semester) =>
              semester.subjects.some((subject: { code: any }) => {
                const element = document.querySelector(
                  `[data-code="${subject.code}"]`
                );
                if (element) {
                  const rect = element.getBoundingClientRect();
                  const boxX1 = rect.left - svgRect.left - buffer;
                  const boxY1 = rect.top - svgRect.top - buffer;
                  const boxX2 = rect.right - svgRect.left + buffer;
                  const boxY2 = rect.bottom - svgRect.top + buffer;
                  return x >= boxX1 && x <= boxX2 && y >= boxY1 && y <= boxY2;
                }
                return false;
              })
            )
          );
        };

        // Adjust the path to avoid obstacles
        let adjustedMidX1 = midX1;
        let adjustedMidY = midY;
        if (isCrossingObstacle(midX1, y1)) {
          adjustedMidX1 += horizontalGap; // Move further right
        }
        if (isCrossingObstacle(midX1, midY)) {
          adjustedMidY += verticalGap; // Move further down
        }

        // Draw the path
        const path = `M ${x1},${y1}
                  L ${adjustedMidX1},${y1}
                  L ${adjustedMidX1},${adjustedMidY}
                  L ${midX2},${adjustedMidY}
                  L ${midX2},${y2}
                  L ${x2},${y2}`;
        // log each line color path
        console.log("Color, path", colorMap[link.from], path);
        svg
          .append("path")
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", colorMap[link.from])
          .attr("stroke-width", 1.5)
          .attr("marker-end", "url(#arrowhead)");
      }
    });
    // Add arrowhead marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 7)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 Z")
      .attr("fill", "#000");
  }, [curriculum]);
  return (
    <Box sx={{ padding: 3 }}>
      {/* Title */}
      <Typography variant="h4" gutterBottom>
        Plan and Visualize
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {studentInfo.code} {studentInfo.name}
      </Typography>
      {/* Curriculum Grid */}
      <Grid container spacing={4} alignItems="stretch">
        {curriculum.map((year: any, yearIndex: number) => (
          <Grid item xs={12} sm={6} md={3} key={yearIndex}>
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 2,
                padding: 3,
                backgroundColor: "#F9F9F9",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {/* Year Title */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {year.year}
              </Typography>
              {/* Semesters */}
              <Box sx={{ display: "flex", gap: 4, flexGrow: 1 }}>
                {year.semesters.map((semester: any, semesterIndex: number) => (
                  <Box
                    key={semesterIndex}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {/* Drop Semester */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={semester.dropped || false}
                          color="default"
                          onChange={() =>
                            dispatch(
                              toggleDropSemester({
                                yearIndex,
                                semesterIndex,
                              })
                            )
                          }
                        />
                      }
                      label="Drop Semester"
                    />
                    {/* Subjects */}
                    {!semester.dropped &&
                      semester.subjects.map(
                        (subject: any, subjectIndex: number) => (
                          <Box
                            key={subjectIndex}
                            sx={{
                              marginBottom: 4,
                              marginRight: 2,
                            }}
                            data-code={subject.code}
                          >
                            <Paper
                              elevation={2}
                              sx={{
                                padding: 1.5,
                                backgroundColor:
                                  semesterColors[
                                    (yearIndex * 2 + semesterIndex) %
                                      semesterColors.length
                                  ],
                                borderRadius: 2,
                                position: "relative",
                              }}
                            >
                              {/* Course Grade */}
                              {subject.grade && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color:
                                      subject.grade === "F" ? "red" : "gray",
                                    fontWeight: "bold",
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                  }}
                                >
                                  {subject.grade}
                                </Typography>
                              )}
                              {/* Course Details */}
                              <Typography variant="body2" fontWeight="bold">
                                {subject.code}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {subject.name}
                              </Typography>
                            </Paper>
                          </Box>
                        )
                      )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      {/* SVG for Arrows */}
      <svg
        ref={svgRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
};

export default VisualizationPage;
