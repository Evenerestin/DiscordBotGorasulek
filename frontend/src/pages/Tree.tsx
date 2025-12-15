import { Badge, Box, Center, Image, Stack, Text, Title } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { o } from "react-router/dist/development/index-react-server-client-CCjKYJTH";
import snowVideo from "../assets/snow.mov";

interface Ornament {
  id: string;
  username: string;
  imageData: string;
  position: {
    top: string;
    left: string;
  };
}

export default function Tree() {
  const treeRef = useRef<HTMLDivElement>(null);
  const [ornaments, setOrnaments] = useState<Ornament[]>([]);

  useEffect(() => {
    // Fetch ornament data from the backend
    axios
      .get("http://localhost:3000/api/tree") // Updated to match backend endpoint
      .then((response) => {
        // Directly set the ornaments array
        setOrnaments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching ornaments:", error);
        alert("Failed to load ornaments. Please try again later."); // User-friendly error message
      });
  }, []);

  return (
    <Box>
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "auto",
          height: "100vh",
          objectFit: "cover",
          overflow: "hidden",
        }}
      >
        <video
          src={snowVideo}
          autoPlay
          loop
          muted
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
          }}
        />
      </Box>
      <Box
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          height: "100vh",
          justifyContent: "center",
        }}
      >
        <Title
          style={{
            color: "#4278ad",
            fontSize: "32px",
            fontWeight: 900,
            letterSpacing: "5px",
            fontFamily: "'Playwrite NO', sans-serif",
          }}
        >
          Gorasuloinka
        </Title>
        <div
          ref={treeRef}
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <Image
            src="src/assets/treebase.png"
            alt="Gorasul Logo"
            radius="md"
            style={{
              maxHeight: "80vh",
              width: "auto",
              maxWidth: "90vw",
            }}
          />
          {ornaments.map((ornament) => {
            if (
              !ornament.position ||
              !ornament.position.top ||
              !ornament.position.left
            ) {
              console.warn("Invalid ornament position:", ornament);
              return null; // Skip rendering invalid ornaments
            }

            return (
              <Stack
                key={ornament.id}
                style={{
                  position: "absolute",
                  top: ornament.position.top,
                  left: ornament.position.left,
                }}
              >
                <Badge size="xs" color="red">
                  {ornament.username}
                </Badge>
                <Image
                  src={ornament.imageData}
                  alt={`Bombka: ${ornament.username}`}
                  radius="md"
                  style={{ width: "50px", height: "50px" }}
                />
              </Stack>
            );
          })}
        </div>
      </Box>
    </Box>
  );
}
