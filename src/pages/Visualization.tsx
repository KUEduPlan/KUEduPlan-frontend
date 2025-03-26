import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
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
import { useParams } from "react-router-dom";
import { generateGroupColors } from "../utils/colorUtils";
import { ColorSchemeType, TimeStatus } from "../types/types";

const nodeWidth = 150;
const nodeHeight = 80;

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

const getCurrentBuddhistYear = (): string => {
  const gregorianYear = new Date().getFullYear();
  const buddhistYear = gregorianYear + 543 - 1; // Subtract 1 to get the academic year
  return buddhistYear.toString().slice(-2);
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

const timeColors = {
  past: "#D7F4E3",
  present: "#F3E8D9",
  future: "#FFE8E6",
};

const getTimeStatus = (
  courseYear: string,
  currentBuddhistYear: string
): TimeStatus => {
  const courseYearNum = parseInt(courseYear);
  const currentYearNum = parseInt(currentBuddhistYear);

  if (courseYearNum < currentYearNum) return "past";
  if (courseYearNum > currentYearNum) return "future";
  return "present";
};

const VisualizationPage: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const { studentId } = useParams<{ studentId: string }>();
  console.log("studentId", studentId);
  const dispatch: AppDispatch = useDispatch();

  const curriculum = useSelector((state: any) => state.curriculum.years);
  const studentInfo = useSelector((state: any) => state.curriculum.studentInfo);
  const prerequisites = useSelector(
    (state: any) => state.curriculum.prerequisites
  );
  const loading = useSelector((state: any) => state.curriculum.loading);
  const error = useSelector((state: any) => state.curriculum.error);
  const accessToken = useSelector((state: any) => state.curriculum.accessToken);
  const role = useSelector((state: any) => state.curriculum.role);
  const username = useSelector((state: any) => state.curriculum.username);
  const student = studentInfo?.[0];

  const numYears = curriculum.length;
  const semesterColors = getSemesterColors(numYears);

  const loggedInStudentId = useSelector((state: any) =>
    state.curriculum.username?.replace("b", "")
  );

  console.log("role", role);
  console.log("loggedInStudentId", loggedInStudentId);

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [focusNode, setFocusNode] = useState<string | null>(null);
  const [isAnyCheckboxSelected, setIsAnyCheckboxSelected] = useState(false);
  const [dropFailCourses, setDropFailCourses] = useState<any[]>([]);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorSchemeType>("normal");

  const STUDENTID = loggedInStudentId;

  useEffect(() => {
    if (!accessToken) {
      console.error("Access token not found. Please log in again.");
      return;
    }

    const fetchInitialData = async (studentId: number) => {
      try {
        console.log("studentId in try", studentId);
        await dispatch(fetchStudentData(studentId)).unwrap();
        await dispatch(fetchStudyPlan(studentId)).unwrap();
        await dispatch(fetchPrerequisiteCourses(studentId)).unwrap();
        console.log("All data fetched successfully!");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (role === "curriculum_admin" || role === "advisor") {
      if (studentId) {
        const parsedStudentId = parseInt(studentId, 10);
        console.log("parsedStudentId advisor", parsedStudentId);
        if (!isNaN(parsedStudentId)) {
          fetchInitialData(parsedStudentId);
        } else {
          console.error("Invalid student ID:", studentId);
        }
      }
    } else if (role === "student") {
      if (username) {
        const parsedStudentId = parseInt(username.replace("b", ""), 10);
        console.log("parsedStudentId student", parsedStudentId);
        if (!isNaN(parsedStudentId)) {
          fetchInitialData(parsedStudentId);
        } else {
          console.error("Invalid student ID:", username);
        }
      }
    }
  }, [dispatch, studentId, accessToken, role, username]);

  const groupColors = useMemo(() => {
    if (colorScheme === "group" && curriculum.length > 0) {
      console.log("Generating group colors...");
      const groups = new Set<string>();
      curriculum.forEach((year: { semesters: any[] }) => {
        year.semesters.forEach((semester) => {
          semester.subjects.forEach((subject: { group: string }) => {
            if (subject.group) {
              groups.add(subject.group);
            }
          });
        });
      });
      console.log("Generating colors for groups:", Array.from(groups));
      console.log(
        "Generated group colors:",
        generateGroupColors(Array.from(groups))
      );
      return generateGroupColors(Array.from(groups));
    }
    return {};
  }, [colorScheme, curriculum]);

  const handleColorSchemeChange = useCallback(
    (event: SelectChangeEvent<ColorSchemeType>) => {
      const newScheme = event.target.value as ColorSchemeType;
      console.log("Color scheme changed to:", newScheme);
      setColorScheme(newScheme);
    },
    []
  );

  useEffect(() => {
    console.log("Color scheme changed to:", colorScheme);
  }, [colorScheme]);

  const getNodePosition = (node: any) => {
    const x = node.level * nodeWidth * 2 + nodeWidth / 2;
    const y = node.layer * nodeHeight * 1.75 + 150;
    return [x, y];
  };

  const extractNodesAndEdges = () => {
    console.log("Extracting nodes and edges...");
    if (!curriculum || curriculum.length === 0) {
      console.warn("Curriculum is empty or undefined.");
      return;
    }

    const extractedNodes: any[] = [];
    const extractedEdges: any[] = [];
    const courseSemesterMap = new Map(); // Track course instances

    curriculum.forEach((year: any, yearIndex: number) => {
      if (!year.semesters) {
        console.warn(`Year ${year.year} has no semesters.`);
        return;
      }

      [1, 2].forEach((semesterIndex) => {
        const semester = year.semesters.find(
          (sem: any) => parseInt(sem.semester, 10) === semesterIndex
        );

        if (!semester || !semester.subjects || semester.subjects.length === 0) {
          return;
        }

        semester.subjects.forEach((subject: any, layer: number) => {
          const uniqueId = `${subject.code}-${year.year}-${semester.semester}`;

          if (!courseSemesterMap.has(subject.code)) {
            courseSemesterMap.set(subject.code, []);
          }
          courseSemesterMap.get(subject.code).push(uniqueId);

          const node = {
            id: uniqueId,
            originalId: subject.code,
            level: yearIndex * 2 + (semesterIndex - 1),
            layer,
            subject: subject.name,
            grade: subject.grade,
            group: subject.group,
            prerequisites: subject.prerequisites,
            color: semesterColors[yearIndex * 2 + (semesterIndex - 1)],
            year: year.year,
            semesterIndex: semesterIndex,
          };

          extractedNodes.push(node);
        });
      });
    });

    if (prerequisites && prerequisites.length > 0) {
      prerequisites.forEach((relation: any) => {
        const sourceInstances =
          courseSemesterMap.get(relation.prerequisite.id) || [];
        const targetInstances =
          courseSemesterMap.get(relation.current.id) || [];

        sourceInstances.forEach((sourceId: string) => {
          const sourceNode = extractedNodes.find((n) => n.id === sourceId);

          targetInstances.forEach((targetId: string) => {
            const targetNode = extractedNodes.find((n) => n.id === targetId);

            if (sourceNode && targetNode) {
              const sourceYear = sourceNode.year;
              const targetYear = targetNode.year;
              const sourceSem = sourceNode.semesterIndex;
              const targetSem = targetNode.semesterIndex;

              if (
                targetYear > sourceYear ||
                (targetYear === sourceYear && targetSem > sourceSem)
              ) {
                extractedEdges.push({
                  source: sourceId,
                  target: targetId,
                  originalSource: relation.prerequisite.id,
                  originalTarget: relation.current.id,
                });
              }
            }
          });
        });
      });
    }

    console.log("Extracted nodes:", extractedNodes);
    console.log("Extracted edges:", extractedEdges);

    setNodes(extractedNodes);
    setEdges(extractedEdges);
  };

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
      setIsSimulationMode(false);

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

  const handleCourseToggle = (nodeId: string, type: "Failed" | "Dropped") => {
    // Find the node in our nodes state
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      console.error(`Node with ID ${nodeId} not found`);
      return;
    }

    // Update the visual state (fail/withdraw indicators)
    const updatedNodes = nodes.map((n) =>
      n.id === nodeId
        ? {
            ...n,
            fail: type === "Failed" ? !n.fail : false,
            withdraw: type === "Dropped" ? !n.withdraw : false,
          }
        : n
    );
    setNodes(updatedNodes);

    // Update the drop/fail courses state (the code you asked about)
    setDropFailCourses((prev) => {
      // Filter out any existing entry for this specific course instance
      const filteredPrev = prev.filter(
        (course) =>
          !(
            course.CID === node.originalId &&
            course.Year === node.year &&
            course.Sem === node.semesterIndex
          )
      );

      // Determine if we're adding or removing
      const isAdding =
        (type === "Failed" && !node.fail) ||
        (type === "Dropped" && !node.withdraw);

      if (isAdding) {
        const updatedDropFailCourses = [
          ...filteredPrev,
          {
            CID: node.originalId,
            Year: node.year,
            Sem: node.semesterIndex,
            Type: type,
          },
        ];
        setIsAnyCheckboxSelected(updatedDropFailCourses.length > 0);
        return updatedDropFailCourses;
      }

      // If removing, just return the filtered list
      setIsAnyCheckboxSelected(filteredPrev.length > 0);
      return filteredPrev;
    });
  };

  // Handle "SIMULATE" button click
  const handleSimulate = async () => {
    try {
      console.log("Starting simulation...");
      setIsSimulationMode(true);

      const formattedCourses = dropFailCourses.map((course) => {
        const courseNode = nodes?.find(
          (node) => node.originalId === course.CID
        );
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
          studentId: role === "student" ? STUDENTID : studentId,
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
      setIsSimulationMode(false);

      // Show error modal
      Swal.fire({
        title: "Simulation Failed",
        text: "An error occurred during the simulation. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const renderNodes = useCallback(
    (svg: any) => {
      svg.selectAll(".node").remove();

      const currentBuddhistYear = getCurrentBuddhistYear();
      console.log("currentBuddhistYear", currentBuddhistYear);

      nodes.forEach((node) => {
        const [x, y] = getNodePosition(node);

        const nodeGroup = svg
          .append("g")
          .attr("class", "node")
          .attr("transform", `translate(${x}, ${y})`)
          .attr("filter", "url(#shadow)")
          .on("click", () => handleNodeClick(node.id));

        console.log("groupColors[node.group]", groupColors[node.group]);
        console.log("node.group", node.group);

        let nodeColor: string;
        switch (colorScheme) {
          case "group":
            nodeColor = groupColors[node.group] || "#FFFFFF";
            break;
          case "time":
            const timeStatus = getTimeStatus(node.year, currentBuddhistYear);
            console.log("timeStatus with node.year", timeStatus, node.year);
            nodeColor = timeColors[timeStatus as keyof typeof timeColors];
            break;
          default:
            nodeColor = node.color;
        }

        // Draw rectangle
        nodeGroup.append("rect");
        nodeGroup
          .append("rect")
          .attr("width", nodeWidth)
          .attr("height", nodeHeight)
          .attr("rx", 10)
          .attr("ry", 10)
          .attr("fill", () => {
            if (!focusNode) return nodeColor;
            if (focusNode === node.id) return "#FFD700";

            // Check if this node is related to the focused node through any edge
            const isRelated = edges.some(
              (e) =>
                (e.source === node.id && e.target === focusNode) ||
                (e.target === node.id && e.source === focusNode)
            );
            return isRelated ? nodeColor : "#D3D3D3";
          });

        // Add course code (show original ID without year/semester suffix)
        nodeGroup
          .append("text")
          .attr("x", 10)
          .attr("y", 20)
          .attr("font-size", "12px")
          .attr("font-family", "Prompt, Arial, sans-serif")
          .attr("font-weight", "bold")
          .attr("fill", "black")
          .text(node.originalId); // Show original course code

        // Add course name, grade, etc...
        // Add course name
        nodeGroup
          .append("foreignObject")
          .attr("x", 10)
          .attr("y", 30)
          .attr("width", nodeWidth - 20)
          .attr("height", nodeHeight - 50)
          .append("xhtml:div")
          .style("font-size", "11px")
          .style("font-family", "Prompt, Arial, sans-serif")
          .style("color", "gray")
          .style("overflow", "hidden")
          .style("text-overflow", "ellipsis")
          .style("white-space", "normal")
          .style("word-wrap", "break-word")
          .text(node.subject);

        // Add grade
        nodeGroup
          .append("text")
          .attr("x", nodeWidth - 10)
          .attr("y", 15)
          .attr("font-size", "12px")
          .attr("font-family", "Prompt, Arial, sans-serif")
          .attr("font-weight", "bold")
          .attr("fill", () => (node.grade === "F" ? "red" : "gray"))
          .attr("text-anchor", "end")
          .text(() => (node.grade ? node.grade : ""));

        if (node.grade === "-" && !isSimulationMode) {
          // Add F and W/N checkboxes
          const checkboxGroup = nodeGroup
            .append("foreignObject")
            .attr("x", 10)
            .attr("y", nodeHeight + 5)
            .attr("width", nodeWidth - 20)
            .attr("height", 30)
            .append("xhtml:div")
            .style("display", () => (node.grade === "-" ? "flex" : "none"))
            .style("justify-content", "space-between");

          // Add F checkbox
          checkboxGroup
            .append("label")
            .style("display", "flex")
            .style("align-items", "center")
            .html(() => {
              const isFailed = dropFailCourses.some(
                (course) =>
                  course.CID === node.originalId && course.Type === "Failed"
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
              handleCourseToggle(node.id, "Failed");
            });

          // Add W/N checkbox
          checkboxGroup
            .append("label")
            .style("display", "flex")
            .style("align-items", "center")
            .html(() => {
              const isDropped = dropFailCourses.some(
                (course) =>
                  course.CID === node.originalId && course.Type === "Dropped"
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
              handleCourseToggle(node.id, "Dropped");
            });
        }
      });
    },
    [
      nodes,
      groupColors,
      colorScheme,
      isSimulationMode,
      handleNodeClick,
      focusNode,
      edges,
      dropFailCourses,
      handleCourseToggle,
    ]
  );

  const renderEdges = useCallback(
    (svg: any) => {
      const linkGen = d3
        .linkHorizontal()
        .x((d: any) => d[0])
        .y((d: any) => d[1]);

      svg.selectAll(".edge").remove();

      const currentBuddhistYear = getCurrentBuddhistYear();

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

          const targetNode = nodes.find((n) => n.id === d.target);
          const sourceNode = nodes.find((n) => n.id === d.source);

          if (!targetNode || !sourceNode) return "none";

          if (focusNode === d.source) {
            // Determine target node color based on current scheme
            switch (colorScheme) {
              case "group":
                return groupColors[targetNode.group] || targetNode.color;
              case "time":
                const status = getTimeStatus(
                  targetNode.year,
                  currentBuddhistYear
                );
                return timeColors[status as keyof typeof timeColors];
              default:
                return targetNode.color;
            }
          }

          if (focusNode === d.target) {
            // Determine source node color based on current scheme
            switch (colorScheme) {
              case "group":
                return groupColors[sourceNode.group] || sourceNode.color;
              case "time":
                const status = getTimeStatus(
                  targetNode.year,
                  currentBuddhistYear
                );
                return timeColors[status as keyof typeof timeColors];
              default:
                return sourceNode.color;
            }
          }
          return "none";
        })
        .attr("stroke-width", 3);
    },
    [edges, nodes, focusNode, colorScheme, groupColors]
  );

  // Render year and semester labels with checkboxes
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

        console.log("Is simulation mode:", isSimulationMode);

        if (!isSimulationMode && hasDroppableCourses) {
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
              (course) =>
                course.CID === subject.code && course.Type === "Dropped"
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
        }
      });
    });
  };

  const isSimulated = useSelector((state: any) => state.curriculum.isSimulated);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    renderLabels(svg);
    renderNodes(svg);
    renderEdges(svg);
  }, [
    dropFailCourses,
    focusNode,
    isSimulated,
    renderNodes,
    renderEdges,
    renderLabels,
  ]);

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
  }, [nodes, edges, focusNode, renderEdges, renderNodes, renderLabels]);

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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ color: "black", fontSize: "1.2rem", padding: "5px" }}>
          {studentId} {student?.StdFirstName} {student?.StdLastName}
        </Typography>

        <FormControl sx={{ minWidth: 200, marginLeft: 2 }}>
          <InputLabel>Color Scheme</InputLabel>
          <Select
            value={colorScheme}
            label="Color Scheme"
            onChange={handleColorSchemeChange}
            inputProps={{ "aria-label": "Color scheme selection" }}
          >
            <MenuItem value="normal">Normal Mode</MenuItem>
            <MenuItem value="group">Group Mode</MenuItem>
            <MenuItem value="time">Time Mode</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
          justifyContent: "space-between",
          gap: 2,
          marginTop: 2,
        }}
      >
        <Box>
          {role === "advisor" && (
            <Button
              variant="contained"
              onClick={() => window.history.back()}
              sx={{ backgroundColor: "#256E65", color: "#fff" }}
            >
              Back
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
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
          {/* <Button
            variant="contained"
            onClick={exportToPDF}
            sx={{ backgroundColor: "#256E65", color: "#fff" }}
          >
            Export to PDF
          </Button> */}
        </Box>
      </Box>
    </Box>
  );
};

export default VisualizationPage;
