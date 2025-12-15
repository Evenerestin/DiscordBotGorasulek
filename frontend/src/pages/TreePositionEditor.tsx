import { Badge, Box, Image, Stack, Title } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";

const TreePositionEditor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [treeDimensions, setTreeDimensions] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const treeRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (treeRef.current && circleRef.current) {
        const treeRect = treeRef.current.getBoundingClientRect();
        const x = event.clientX - treeRect.left;
        const y = event.clientY - treeRect.top;

        // Ensure the circle stays within the tree boundaries
        if (x >= 0 && x <= treeRect.width && y >= 0 && y <= treeRect.height) {
          setPosition({ x, y });
          circleRef.current.style.left = `${x}px`;
          circleRef.current.style.top = `${y}px`;
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const bubbleData = [
    { username: "Tina", color: "gray", top: "76%", left: "24%" },
    { username: "Janusz", color: "gray", top: "74%", left: "49%" },
    { username: "Menel", color: "gray", top: "78%", left: "75%" },
    { username: "Paul", color: "orange", top: "65%", left: "57%" },
    { username: "Oscar", color: "purple", top: "60%", left: "33%" },
    { username: "Leo", color: "blue", top: "52%", left: "62%" },
    { username: "Ivy", color: "brown", top: "47%", left: "40%" },
    { username: "Hank", color: "teal", top: "40%", left: "55%" },
    { username: "Frank", color: "orange", top: "24%", left: "52%" },
    { username: "Jack", color: "gray", top: "36%", left: "36%" },
    { username: "Alice", color: "red", top: "12%", left: "43%" },
    { username: "Steve", color: "brown", top: "73%", left: "66%" },
    { username: "Mona", color: "green", top: "54%", left: "28%" },
    { username: "Eve", color: "purple", top: "28%", left: "44%" },
    { username: "Rose", color: "teal", top: "70%", left: "35%" },
    { username: "Nina", color: "yellow", top: "55%", left: "53%" },
    { username: "Karen", color: "red", top: "60%", left: "70%" },
    { username: "Quinn", color: "pink", top: "68%", left: "20%" },
    { username: "Grace", color: "pink", top: "34%", left: "60%" },
    { username: "David", color: "yellow", top: "23%", left: "36%" },
    { username: "Charlie", color: "green", top: "18%", left: "47%" },
    { username: "Bob", color: "blue", top: "15%", left: "53%" },
  ];

  return (
    <Stack align="center" justify="center">
      <Title
        style={{
          color: "#4278ad",
          fontSize: "32px",
          fontWeight: 900,
          letterSpacing: "5px",
          fontFamily: "'Playwrite NO', sans-serif",
        }}
      >
        Tree Position Editor
      </Title>
      <div
        ref={treeRef}
        style={{
          position: "relative",
          display: "inline-block", // Adjust border to fit the image
          border: "2px solid #ccc",
        }}
      >
        <Image
          src="src/assets/treebase.png"
          alt="Gorasul Logo"
          radius="md"
          style={{
            height: "80vh",
            width: "auto",
            maxWidth: "90vw",
          }}
        />
        {bubbleData.map((bubble, index) => (
          <Stack
            key={index}
            justify="center"
            align="center"
            pos="absolute"
            top={bubble.top}
            left={bubble.left}
            gap={5}
          >
            <Badge size="xs">{bubble.username}</Badge>
            <Box
              bg={bubble.color}
              w={35}
              h={35}
              style={{ borderRadius: "100%" }}
            ></Box>
          </Stack>
        ))}
        {/* <div
          ref={circleRef}
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "red",
            transform: "translate(-50%, -50%)",
          }}
        ></div> */}
      </div>
      <div>
        <p>
          Current Position: X: {Math.round(position.x)}, Y:{" "}
          {Math.round(position.y)}
        </p>
      </div>
    </Stack>
  );
};

export default TreePositionEditor;
