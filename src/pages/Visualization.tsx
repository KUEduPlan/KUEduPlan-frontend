import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Button } from "@mui/material";
import "./visualization.css";
import { toggleDropSemester } from "../state/store";

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
      "#EFF5EC", // Year 1 Semester 1
      "#F5EACF", // Year 1 Semester 2
      "#CFEDF4", // Year 2 Semester 1
      "#F4DDCF", // Year 2 Semester 2
      "#E0CFF5", // Year 3 Semester 1
      "#D5FEF6", // Year 3 Semester 2
      "#F8E7F6", // Year 4 Semester 1
      "#C4D9FF", // Year 4 Semester 2
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
  const curriculum = useSelector((state: any) => state.curriculum.years);
  const studentInfo = useSelector((state: any) => state.curriculum.studentInfo);
  const numYears = curriculum.length;
  const semesterColors = getSemesterColors(numYears);
  const dispatch = useDispatch();

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [focusNode, setFocusNode] = useState<string | null>(null);
  const [isAnyCheckboxSelected, setIsAnyCheckboxSelected] = useState(false);

  // Helper function to calculate node positions
  const getNodePosition = (node: any) => {
    const x = node.level * nodeWidth * 2 + nodeWidth / 2;
    const y = node.layer * nodeHeight * 1.75 + 150;
    return [x, y];
  };

  // Extract nodes and edges from curriculum data
  const extractNodesAndEdges = () => {
    const extractedNodes: any[] = [];
    const extractedEdges: any[] = [];

    let level = 0;
    curriculum.forEach((year: any, yearIndex: number) => {
      year.semesters.forEach((semester: any, semesterIndex: number) => {
        semester.subjects.forEach((subject: any, layer: number) => {
          extractedNodes.push({
            id: subject.code,
            level,
            layer,
            subject: subject.name,
            grade: subject.grade,
            prerequisites: subject.prerequisites,
            color: semesterColors[yearIndex * 2 + semesterIndex],
            year: year.year,
            semesterIndex,
          });

          subject.prerequisites.forEach((prerequisite: string) => {
            extractedEdges.push({
              source: prerequisite,
              target: subject.code,
            });
          });
        });
        level++;
      });
    });

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

  const resetView = () => {
    setFocusNode(null);
  };

  const handleDropSemester = (yearIndex: number, semesterIndex: number) => {
    dispatch(toggleDropSemester({ yearIndex, semesterIndex }));
  };

  const handleFailToggle = (nodeId: string) => {
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId ? { ...node, fail: !node.fail } : node
    );
    setNodes(updatedNodes);
  
    // Check if any checkbox is selected
    const anySelected = updatedNodes.some((node) => node.fail || node.withdraw);
    setIsAnyCheckboxSelected(anySelected);
  };
  
  const handleWithdrawToggle = (nodeId: string) => {
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId ? { ...node, withdraw: !node.withdraw } : node
    );
    setNodes(updatedNodes);
  
    // Check if any checkbox is selected
    const anySelected = updatedNodes.some((node) => node.fail || node.withdraw);
    setIsAnyCheckboxSelected(anySelected);
  };

  const renderNodes = (svg: any) => {
    svg.selectAll(".node").remove();
  
    const nodeGroup = svg
      .selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", (d: any) => {
        const [x, y] = getNodePosition(d);
        return `translate(${x}, ${y})`;
      })
      .on("click", (event: any, d: any) => handleNodeClick(d.id));
  
    // Draw rectangles for nodes with shadow
    nodeGroup
      .append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", (d: any) => {
        if (!focusNode) return d.color;
        if (focusNode === d.id) return "#FFD700"; // Highlight clicked node
        const isRelated =
          edges.some((e) => e.source === d.id && e.target === focusNode) ||
          edges.some((e) => e.target === d.id && e.source === focusNode);
        return isRelated ? d.color : "#D3D3D3"; // Gray out unrelated nodes
      })
      .attr("opacity", (d: any) => (focusNode && focusNode !== d.id ? 0.5 : 1))
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
      .text((d: any) => d.id);
  
    // Add course name
    nodeGroup
      .append("foreignObject")
      .attr("x", 10)
      .attr("y", 30)
      .attr("width", nodeWidth - 20)
      .attr("height", nodeHeight - 50)
      .append("xhtml:div")
      .style("font-size", "12px")
      .style("font-family", "Prompt, Arial, sans-serif")
      .style("color", "gray")
      .style("overflow", "hidden")
      .style("text-overflow", "ellipsis")
      .style("white-space", "normal")
      .style("word-wrap", "break-word")
      .text((d: any) => d.subject);
  
    // Add grade
    nodeGroup
      .append("text")
      .attr("x", nodeWidth - 10)
      .attr("y", 15)
      .attr("font-size", "12px")
      .attr("font-family", "Prompt, Arial, sans-serif")
      .attr("font-weight", "bold")
      .attr("fill", (d: any) => (d.grade === "F" ? "red" : "gray"))
      .attr("text-anchor", "end")
      .text((d: any) => (d.grade ? d.grade : ""));
  
    // Add F and W/N checkboxes below the course box
    nodeGroup
      .append("foreignObject")
      .attr("x", 10)
      .attr("y", nodeHeight + 5)
      .attr("width", nodeWidth - 20)
      .attr("height", 30)
      .append("xhtml:div")
      .style("display", "flex")
      .style("justify-content", "flex-end")
      .style("gap", "5px")
      .style("align-items", "center")
      .style("font-size", "10px")
      .style("font-family", "Prompt, Arial, sans-serif")
      .html((d: any) => `
        <label style="display: flex; align-items: center;">
          <input type="checkbox" style="width: 12px; height: 12px; margin-right: 4px;" ${
            d.fail ? "checked" : ""
          } onchange="handleFailToggle('${d.id}')" />
          F
        </label>
        <label style="display: flex; align-items: center;">
          <input type="checkbox" style="width: 12px; height: 12px; margin-right: 4px;" ${
            d.withdraw ? "checked" : ""
          } onchange="handleWithdrawToggle('${d.id}')" />
          W/N
        </label>
      `);
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
        if (focusNode === d.target || focusNode === d.source) {
          const targetNode = nodes.find((n) => n.id === d.target);
          return targetNode ? targetNode.color : "gray";
        }
        return "none";
      })
      .attr("stroke-width", 2);
  };

  // Render year and semester labels with checkboxes
  const renderLabels = (svg: any) => {
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
        .text(year.year);
  
      year.semesters.forEach((semester: any, semesterIndex: number) => {
        const x = (yearIndex * 2 + semesterIndex) * nodeWidth * 2;
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
          .attr("fill", semesterIndex % 2 === 0 ? "#E0E0E0" : "#F5F5F5")
          .attr("opacity", 0.5);
  
        // Add semester checkbox
        svg
          .append("foreignObject")
          .attr("x", x + semesterWidth / 2 - 75)
          .attr("y", y - 20)
          .attr("width", 150)
          .attr("height", 30)
          .append("xhtml:div")
          .html(
            `<label><input type="checkbox" ${
              semester.dropped ? "checked" : ""
            } onchange="handleDropSemester(${yearIndex}, ${semesterIndex})" /> Drop Semester</label>`
          );
      });
    });
  };

  useEffect(() => {
    extractNodesAndEdges();
  }, [curriculum]);

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

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
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
            backgroundColor: isAnyCheckboxSelected ? "#1976d2" : "#ccc",
            color: "#fff",
            }}
            onClick={() => alert("Simulate button clicked!")}
        >
            Simulate
        </Button>
    </Box>
    </Box>
  );
};

export default VisualizationPage;