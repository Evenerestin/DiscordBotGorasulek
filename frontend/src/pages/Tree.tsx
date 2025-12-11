import { Box, Center, Image, Text, Title } from "@mantine/core";
import axios from "axios";
import React from "react";
import snowVideo from "../assets/snow.mov";

// const fetchChristmasTree = async () => {
//   try {
//     const response = await axios.get("/api/christmas-tree");
//     return response.data.imageUrl;
//   } catch (error) {
//     console.error("Failed to fetch Christmas tree:", error);
//     return null;
//   }
// };

export default function Tree() {
  //   const imageUrl = await fetchChristmasTree();

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
            position: "fixed", // Changed to fixed to ensure it covers the entire viewport
            top: 0,
            left: 0,
            width: "100vw", // Ensures it spans the full width of the viewport
            height: "100vh", // Ensures it spans the full height of the viewport
            objectFit: "cover",
          }}
        />
      </Box>
      <Box
        style={{
          position: "relative", // Ensures the second box is positioned on top of the video
          zIndex: 1, // Places it above the video
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          height: "100vh",
          justifyContent: "center",
        }}
      >
        <Title
          //   tt="uppercase"
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
      </Box>
      {/* <Center style={{ height: "80vh" }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Christmas Tree"
            style={{ maxHeight: "80vh" }}
          />
        ) : (
          <Text>Failed to load Christmas Tree</Text>
        )}
      </Center> */}
    </Box>
  );
}
