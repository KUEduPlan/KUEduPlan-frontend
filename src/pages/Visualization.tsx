import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  fetchStudentData,
  fetchStudyPlan,
  fetchPrerequisiteCourses,
  submitDropFailCourses,
} from "../state/actions";
import { AppDispatch } from "../state/store";
import "./visualization.css";
import Swal from "sweetalert2";

const nodeWidth = 200;
const nodeHeight = 100;

const generateRandomPastelColor = (existingColors: string[]) => {
  let color;
  do {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70;
    const lightness = 85;
    color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } while (existingColors.includes(color));
  return color;
};

const getSemesterColors = (numYears: number) => {
  const colors = [
    "#DDFFF6",
    "#D6F1FF",
    "#CCC9FF",
    "#EFD3FF",
    "#FFB4CF",
    "#BAF8FD",
    "#FFD7AF",
    "#EAD1DC",
    "#C3CB6E",
  ];

  const existingColors = [...colors];
  for (let i = colors.length / 2; i < numYears; i++) {
    colors.push(generateRandomPastelColor(existingColors));
    colors.push(generateRandomPastelColor(existingColors));
  }

  return colors;
};

const VisualizationPage: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const dispatch: AppDispatch = useDispatch();

  const curriculum = useSelector((state: any) => state.curriculum.years);
  const studentInfo = useSelector((state: any) => state.curriculum.studentInfo);
  const prerequisites = useSelector(
    (state: any) => state.curriculum.prerequisites
  );
  const loading = useSelector((state: any) => state.curriculum.loading);
  const error = useSelector((state: any) => state.curriculum.error);

  // console.log("curri", curriculum);
  // console.log("std info", studentInfo);
  // console.log("pre info", prerequisites);

  const numYears = curriculum.length;
  const semesterColors = getSemesterColors(numYears);

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [focusNode, setFocusNode] = useState<string | null>(null);
  const [isAnyCheckboxSelected, setIsAnyCheckboxSelected] = useState(false);
  const [dropFailCourses, setDropFailCourses] = useState<any[]>([]);
  const [semesterDropStatus, setSemesterDropStatus] = useState<{
    [key: string]: boolean;
  }>({});
  // const [isCourseSimulated, setIsCourseSimulated] = useState(false);
  const loggedInStudentId = useSelector((state: any) => state.curriculum.loggedInStudentId);


  const STUDENTID = loggedInStudentId

  useEffect(() => {
    const fetchInitialData = async (studentId: number) => {
      try {
        await dispatch(fetchStudentData(studentId)).unwrap();
        await dispatch(fetchStudyPlan(studentId)).unwrap();
        await dispatch(fetchPrerequisiteCourses(studentId)).unwrap();
        console.log("All data fetched successfully!");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    console.log("Type of loggedInStudentId:", typeof loggedInStudentId);
  
    if (loggedInStudentId) {
      const studentId = parseInt(loggedInStudentId, 10);
      console.log("Type of studentId type:", typeof studentId);
      console.log("Student ID:", studentId);
      if (!isNaN(studentId)) {
        fetchInitialData(studentId);
      } else {
        console.error("Invalid student ID:", loggedInStudentId);
      }
    }
  }, [dispatch, loggedInStudentId]);

  const getNodePosition = (node: any) => {
    const x = node.level * nodeWidth * 2 + nodeWidth / 2;
    const y = node.layer * nodeHeight * 1.75 + 150;
    return [x, y];
  };

  // Extract nodes and edges from curriculum data
  const extractNodesAndEdges = () => {
    console.log("Extracting nodes and edges...");
    if (!curriculum || curriculum.length === 0) {
      console.warn("Curriculum is empty or undefined.");
      return;
    }
  
    const extractedNodes: any[] = [];
    const extractedEdges: any[] = [];
  
    curriculum.forEach((year: any, yearIndex: number) => {
      if (!year.semesters) {
        console.warn(`Year ${year.year} has no semesters.`);
        return;
      }
  
      // Always process two semesters (1 and 2)
      [1, 2].forEach((semesterIndex) => {
        const semester = year.semesters.find(
          (sem: any) => parseInt(sem.semester, 10) === semesterIndex
        );
  
        if (!semester || !semester.subjects || semester.subjects.length === 0) {
          // If the semester has no courses, skip adding nodes but keep the level increment
          return;
        }
  
        semester.subjects.forEach((subject: any, layer: number) => {
          // Check if the semester is dropped
          const isSemesterDropped = dropFailCourses.some(
            (course) =>
              course.Year === year.year &&
              course.Sem === semester.semester &&
              course.Type === "Dropped"
          );
  
          // If the semester is dropped, move the course to the next semester
          const adjustedSemesterIndex = isSemesterDropped
            ? semesterIndex + 1
            : semesterIndex;
  
          // Calculate the level based on the year and semester
          const level = yearIndex * 2 + (adjustedSemesterIndex - 1);
  
          // // Special case: If subject.code is 01219499 and isSimulated is true, set level to 9
          // const subjectLevel =
          //   isCourseSimulated && String(subject.code) === "01219499" ? 9 : level;
  
          extractedNodes.push({
            id: subject.code,
            level,
            layer,
            subject: subject.name,
            grade: subject.grade,
            prerequisites: subject.prerequisites,
            color: semesterColors[yearIndex * 2 + (adjustedSemesterIndex - 1)],
            year: year.year,
            semesterIndex: adjustedSemesterIndex,
          });
        });
      });
    });
  
    if (prerequisites && prerequisites.length > 0) {
      prerequisites.forEach((relation: any) => {
        extractedEdges.push({
          source: relation.prerequisite.id,
          target: relation.current.id,
        });
      });
    } else {
      console.warn("No prerequisites data available.");
    }
  
    console.log("Extracted nodes:", extractedNodes);
    console.log("Extracted edges:", extractedEdges);
  
    setNodes(extractedNodes);
    setEdges(extractedEdges);
  };

  // Handle node click to focus on prerequisites and dependents
  const handleNodeClick = (nodeId: string) => {
    if (focusNode === nodeId) {
      setFocusNode(null);
      return;
    }

    setFocusNode(nodeId);
  };

  const resetView = async () => {
    try {
      setFocusNode(null);
      setDropFailCourses([]);
      setIsAnyCheckboxSelected(false);

      // setIsCourseSimulated(false);

      // Fetch the original study plan
      await dispatch(fetchStudyPlan(STUDENTID)).unwrap();
      console.log("Study plan reset to original state.");

      // Show success modal
      Swal.fire({
        title: "Reset Successful!",
        text: "The study plan has been reset to its original state.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Failed to reset view:", error);

      // Show error modal
      Swal.fire({
        title: "Reset Failed",
        text: "An error occurred while resetting the study plan. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDropSemester = (yearIndex: number, semesterIndex: number) => {
    const semester = curriculum[yearIndex].semesters[semesterIndex];

    // Check if all courses in the semester are already dropped
    const allDropped = semester.subjects.every((subject: any) =>
      dropFailCourses.some(
        (course) => course.CID === subject.code && course.Type === "Dropped"
      )
    );

    // Get all courses in the semester that can be dropped
    const updatedCourses = semester.subjects
      .filter((subject: any) => subject.grade === "-") // Only include courses with grade "-"
      .map((subject: any) => ({
        CID: subject.code,
        Year: curriculum[yearIndex].year,
        Sem: semester.semester,
        Type: "Dropped",
      }));

    if (allDropped) {
      // If all courses are already dropped, uncheck the semester and all courses
      const updatedDropFailCourses = dropFailCourses.filter(
        (course) =>
          !updatedCourses.some(
            (updatedCourse: { CID: any }) => updatedCourse.CID === course.CID
          )
      );
      setDropFailCourses(updatedDropFailCourses);
      setIsAnyCheckboxSelected(updatedDropFailCourses.length > 0);
    } else {
      const updatedDropFailCourses = [
        ...dropFailCourses.filter(
          (course) =>
            !updatedCourses.some(
              (updatedCourse: { CID: any }) => updatedCourse.CID === course.CID
            )
        ),
        ...updatedCourses,
      ];
      setDropFailCourses(updatedDropFailCourses);
      setIsAnyCheckboxSelected(updatedDropFailCourses.length > 0);
    }
  };

  // Handle individual course fail/withdraw toggle
  const handleCourseToggle = (nodeId: string, type: "Failed" | "Dropped") => {
    const updatedCourse = nodes.find((node) => node.id === nodeId);

    if (!updatedCourse) {
      console.error(`Course with ID ${nodeId} not found.`);
      return;
    }

    // Update the nodes state
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            fail: type === "Failed" ? !node.fail : false,
            withdraw: type === "Dropped" ? !node.withdraw : false,
          }
        : node
    );
    setNodes(updatedNodes);

    // Update dropFailCourses state
    setDropFailCourses((prev) => {
      const filteredPrev = prev.filter((course) => course.CID !== nodeId);

      if (
        (type === "Failed" && !updatedCourse.fail) ||
        (type === "Dropped" && !updatedCourse.withdraw)
      ) {
        console.log("Sem on toggle checkbox:", updatedCourse.semesterIndex);
        const updatedDropFailCourses = [
          ...filteredPrev,
          {
            CID: nodeId,
            Year: updatedCourse.year,
            Sem: updatedCourse.semesterIndex,
            Type: type,
          },
        ];
        setIsAnyCheckboxSelected(updatedDropFailCourses.length > 0);
        return updatedDropFailCourses;
      }

      setIsAnyCheckboxSelected(filteredPrev.length > 0);
      return filteredPrev;
    });
  };

  // Handle "SIMULATE" button click
  const handleSimulate = async () => {
    try {
      console.log("Starting simulation...");

      const formattedCourses = dropFailCourses.map((course) => {
        const courseNode = nodes?.find((node) => node.id === course.CID);
        return {
          CID: course.CID,
          CName: courseNode ? courseNode.subject : "Unknown",
          Year: parseInt(course.Year, 10),
          Sem: parseInt(course.Sem, 10),
          Type: course.Type,
        };
      });

      console.log("Formatted courses:", formattedCourses);

      const response = await dispatch(
        submitDropFailCourses({
          studentId: STUDENTID,
          courses: formattedCourses,
        })
      ).unwrap();

      console.log("Simulation response received:", response);
      setDropFailCourses([]);
      setIsAnyCheckboxSelected(false);

      // setIsCourseSimulated(true)

      // Show success modal
      Swal.fire({
        title: "Simulation Successful!",
        text: "The simulation has been completed successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Failed to submit drop/fail courses:", error);

      // Show error modal
      Swal.fire({
        title: "Simulation Failed",
        text: "An error occurred during the simulation. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const renderNodes = (svg: any) => {
    svg.selectAll(".node").remove();
  
    curriculum.forEach((year: any, yearIndex: number) => {
      // Always render two semesters (1 and 2) for each year
      [1, 2].forEach((semesterIndex) => {
        const semester = year.semesters.find(
          (sem: any) => parseInt(sem.semester, 10) === semesterIndex
        );
  
        if (!semester || !semester.subjects || semester.subjects.length === 0) {
          // If the semester has no courses, skip rendering nodes
          return;
        }
  
        semester.subjects.forEach((subject: any, layer: number) => {
          const subjectNode = nodes.find((node) => node.id === subject.code);
          if (!subjectNode) {
            console.warn(`Node for subject ${subject.code} not found.`);
            return;
          }
  
          const [x, y] = getNodePosition(subjectNode);
  
          const nodeGroup = svg
            .append("g")
            .attr("class", "node")
            .attr("transform", `translate(${x}, ${y})`)
            .attr("filter", "url(#shadow)")
            .on("click", () => handleNodeClick(subjectNode.id));
  
          // Draw rectangles for nodes
          nodeGroup
            .append("rect")
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", () => {
              if (!focusNode) return subjectNode.color;
              if (focusNode === subjectNode.id) return "#FFD700"; // Highlight clicked node
              const isRelated =
                edges.some(
                  (e) =>
                    e.source === subjectNode.id && e.target === focusNode
                ) ||
                edges.some(
                  (e) =>
                    e.target === subjectNode.id && e.source === focusNode
                );
              return isRelated ? subjectNode.color : "#D3D3D3"; // Gray out unrelated nodes
            })
            .attr("opacity", () =>
              focusNode && focusNode !== subjectNode.id ? 0.5 : 1
            )
            .attr("filter", "url(#shadow)");
  
          // Add course code
          nodeGroup
            .append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("font-size", "14px")
            .attr("font-family", "Prompt, Arial, sans-serif")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text(subjectNode.id);
  
          // Add course name
          nodeGroup
            .append("foreignObject")
            .attr("x", 10)
            .attr("y", 30)
            .attr("width", nodeWidth - 20)
            .attr("height", nodeHeight - 50)
            .append("xhtml:div")
            .style("font-size", "13px")
            .style("font-family", "Prompt, Arial, sans-serif")
            .style("color", "gray")
            .style("overflow", "hidden")
            .style("text-overflow", "ellipsis")
            .style("white-space", "normal")
            .style("word-wrap", "break-word")
            .text(subjectNode.subject);
  
          // Add grade
          nodeGroup
            .append("text")
            .attr("x", nodeWidth - 10)
            .attr("y", 15)
            .attr("font-size", "14px")
            .attr("font-family", "Prompt, Arial, sans-serif")
            .attr("font-weight", "bold")
            .attr("fill", () =>
              subjectNode.grade === "F" ? "red" : "gray"
            )
            .attr("text-anchor", "end")
            .text(() => (subjectNode.grade ? subjectNode.grade : ""));
  
          // Add F and W/N checkboxes
          const checkboxGroup = nodeGroup
            .append("foreignObject")
            .attr("x", 10)
            .attr("y", nodeHeight + 5)
            .attr("width", nodeWidth - 20)
            .attr("height", 30)
            .append("xhtml:div")
            .style("display", () =>
              subjectNode.grade === "-" ? "flex" : "none"
            )
            .style("justify-content", "space-between");
  
          // Add F checkbox
          checkboxGroup
            .append("label")
            .style("display", "flex")
            .style("align-items", "center")
            .html(() => {
              const isFailed = dropFailCourses.some(
                (course) =>
                  course.CID === subjectNode.id && course.Type === "Failed"
              );
              return `
                <input type="checkbox" ${isFailed ? "checked" : ""} />
                F
              `;
            })
            .on("click", (event: any) => {
              event.stopPropagation();
            })
            .on("change", () => {
              handleCourseToggle(subjectNode.id, "Failed");
            });
  
          // Add W/N checkbox
          checkboxGroup
            .append("label")
            .style("display", "flex")
            .style("align-items", "center")
            .html(() => {
              const isDropped = dropFailCourses.some(
                (course) =>
                  course.CID === subjectNode.id && course.Type === "Dropped"
              );
              return `
                <input type="checkbox" ${isDropped ? "checked" : ""} />
                W/N
              `;
            })
            .on("click", (event: any) => {
              event.stopPropagation();
            })
            .on("change", () => {
              handleCourseToggle(subjectNode.id, "Dropped");
            });
        });
      });
    });
  };

  // Render edges
  const renderEdges = (svg: any) => {
    const linkGen = d3
      .linkHorizontal()
      .x((d: any) => d[0])
      .y((d: any) => d[1]);

    svg.selectAll(".edge").remove();

    svg
      .selectAll(".edge")
      .data(edges)
      .join("path")
      .attr("class", "edge")
      .attr("d", (d: any) => {
        const sourceNode = nodes.find((n) => n.id === d.source);
        const targetNode = nodes.find((n) => n.id === d.target);
        if (!sourceNode || !targetNode) return null;

        const sourcePos = getNodePosition(sourceNode);
        const targetPos = getNodePosition(targetNode);

        return linkGen({
          source: [sourcePos[0] + nodeWidth, sourcePos[1] + nodeHeight / 2],
          target: [targetPos[0], targetPos[1] + nodeHeight / 2],
        });
      })
      .attr("fill", "none")
      .attr("stroke", (d: any) => {
        if (!focusNode) return "none";
        if (focusNode === d.source) {
          const targetNode = nodes.find((n) => n.id === d.target);
          return targetNode ? targetNode.color : "gray";
        }
        if (focusNode === d.target) {
          const sourceNode = nodes.find((n) => n.id === d.source);
          return sourceNode ? sourceNode.color : "gray";
        }
        return "none";
      })
      .attr("stroke-width", 3);
  };

  // Render year and semester labels with checkboxes
  const renderLabels = (svg: any) => {
    if (!curriculum || curriculum.length === 0) {
      console.warn("Curriculum is empty or undefined.");
      return;
    }
  
    if (!nodes || nodes.length === 0) {
      console.warn("Nodes are empty or undefined.");
      return;
    }
  
    if (!svg || svg.empty()) {
      console.error("SVG reference is null or not found.");
      return;
    }
  
    // Remove existing labels and backgrounds
    svg.selectAll(".semester-label").remove();
    svg.selectAll(".semester-background").remove();
    svg.selectAll(".year-background").remove();
  
    curriculum.forEach((year: any, yearIndex: number) => {
      const yearX = yearIndex * nodeWidth * 4;
      const yearY = 50;
      const yearWidth = nodeWidth * 4;
      const yearHeight = 50;
  
      // Add dark-gray background for year labels
      svg
        .append("rect")
        .attr("class", "year-background")
        .attr("x", yearX)
        .attr("y", yearY - 50)
        .attr("width", yearWidth)
        .attr("height", yearHeight)
        .attr("fill", "#E0E0E0");
  
      // Add year label
      svg
        .append("text")
        .attr("x", yearX + yearWidth / 2)
        .attr("y", yearY - 20)
        .attr("font-size", "16px")
        .attr("font-family", "Prompt, Arial, sans-serif")
        .attr("font-weight", "bold")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text(`ปีการศึกษา 25${year.year}`);
  
      // Always render two semesters (1 and 2)
      [1, 2].forEach((semesterIndex) => {
        const semester = year.semesters.find(
          (sem: any) => parseInt(sem.semester, 10) === semesterIndex
        );
  
        const x = (yearIndex * 2 + (semesterIndex - 1)) * nodeWidth * 2;
        const y = 100;
        const semesterWidth = nodeWidth * 2;
        const semesterHeight = nodes.length * nodeHeight * 1.75 + 150;
  
        // Add alternating background color for semesters
        svg
          .append("rect")
          .attr("class", "semester-background")
          .attr("x", x)
          .attr("y", y - 50)
          .attr("width", semesterWidth)
          .attr("height", semesterHeight)
          .attr("fill", semesterIndex % 2 === 0 ? "#E8E8E8" : "#E0E0E0") // Semester 1: dark gray, Semester 2: light gray
          .attr("opacity", 0.5);
  
        if (!semester || !semester.subjects || semester.subjects.length === 0) {
          // If the semester has no courses, skip rendering nodes but keep the background
          return;
        }
  
        const hasDroppableCourses = semester.subjects.some(
          (subject: any) => subject.grade === "-"
        );
  
        if (!hasDroppableCourses) {
          return;
        }
  
        // Add semester checkbox
        const checkboxGroup = svg
          .append("foreignObject")
          .attr("x", x + semesterWidth / 2 - 75)
          .attr("y", y - 20)
          .attr("width", 150)
          .attr("height", 30)
          .append("xhtml:div")
          .style("display", "flex")
          .style("align-items", "center")
          .style("justify-content", "center");
  
        if (!checkboxGroup || checkboxGroup.empty()) {
          console.error("Failed to create checkbox group.");
          return;
        }
  
        // Use React state to determine the `checked` state
        const isChecked = semester.subjects.every((subject: any) =>
          dropFailCourses.some(
            (course) => course.CID === subject.code && course.Type === "Dropped"
          )
        );
  
        // Add semester label and checkbox
        checkboxGroup
          .append("label")
          .style("display", "flex")
          .style("align-items", "center")
          .html(
            `<input type="checkbox" ${
              isChecked ? "checked" : ""
            } /> Drop Semester`
          )
          .on("change", () => {
            handleDropSemester(yearIndex, semesterIndex - 1);
          });
      });
    });
  };

  const isSimulated = useSelector((state: any) => state.curriculum.isSimulated);

  // useEffect(() => {
  //   if (curriculum.length > 0) {
  //     console.log("isCourseSimulated updated:", isCourseSimulated);
  //     extractNodesAndEdges(); // Call extractNodesAndEdges after isCourseSimulated updates
  //   }
  // }, [isCourseSimulated, curriculum]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    renderLabels(svg);
    renderNodes(svg);
    renderEdges(svg);
  }, [dropFailCourses, focusNode, isSimulated]);

  useEffect(() => {
    if (curriculum.length > 0) {
      console.log("Curriculum data for rendering nodes:", curriculum);
      extractNodesAndEdges();
    }

    if (prerequisites.length === 0) {
      console.warn("No prerequisites data available.");
    }
  }, [curriculum, prerequisites]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "shadow");
    filter
      .append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-color", "#000")
      .attr("flood-opacity", 0.2);

    renderLabels(svg);
    renderNodes(svg);
    renderEdges(svg);

    const maxY = d3.max(nodes, (node: any) => {
      const [, y] = getNodePosition(node);
      return y + nodeHeight + 50;
    });

    svg.attr("height", maxY || 500);
  }, [nodes, edges, focusNode]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h4"
        fontFamily={"Prompt, Arial, sans-serif"}
        fontWeight={"bold"}
        gutterBottom
      >
        Plan and Visualize
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {studentInfo.code} {studentInfo.name}
      </Typography>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 2,
          padding: 3,
          backgroundColor: "#F9F9F9",
          height: "80vh",
          overflow: "auto",
          whiteSpace: "nowrap",
        }}
      >
        <svg
          ref={svgRef}
          width={curriculum.length * nodeWidth * 4}
          height={nodes.length * nodeHeight * 1.75 + 200}
          style={{ border: "1px solid #ccc" }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          marginTop: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={resetView}
          sx={{ backgroundColor: "#256E65", color: "#fff" }}
        >
          Reset View
        </Button>
        <Button
          variant="contained"
          disabled={!isAnyCheckboxSelected}
          sx={{
            backgroundColor: isAnyCheckboxSelected ? "#256E65" : "#ccc",
            color: "#fff",
          }}
          onClick={handleSimulate}
        >
          Simulate
        </Button>
      </Box>
    </Box>
  );
};

export default VisualizationPage;
