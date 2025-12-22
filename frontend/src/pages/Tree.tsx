import { Badge, Box, Button, Image, Modal, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconZoomIn } from "@tabler/icons-react";
import axios from "axios";
import React, { useMemo, useRef, useState } from "react";
import snowVideo from "/snow.mov";

interface Ornament {
  id: number;
  username: string;
  ornamentData: string;
  position: {
    top: string;
    left: string;
  };
  color?: string;
}

export default function Tree() {
  const [opened, { open, close }] = useDisclosure(false);
  const treeRef = useRef<HTMLDivElement>(null);
  const [ornaments, setOrnaments] = useState<Ornament[]>([]);

  const getOrnamentColor = (id: number): string => {
    const colors = ["red", "green", "blue", "yellow"];
    return colors[id % 4];
  };

  const getOrnamentBorderColor = (id: number): string => {
    const darkColors = ["#e03131", "#2f9e44", "#1971c2", "#f59f00"];
    return darkColors[id % 4];
  };

  useMemo(() => {
    const fetchOrnamentData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/get-ornaments"
        );
        console.log(response.data);
        if (Array.isArray(response.data)) {
          setOrnaments(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching ornament data:", error);
      }
    };

    fetchOrnamentData();
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
        <Button
          onClick={open}
          color="#4278ad"
          variant="light"
          leftSection={<IconZoomIn size={18} />}
        >
          Powiększ
        </Button>
        <div
          ref={treeRef}
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <Image
            src="treebase.png"
            alt="Gorasul Logo"
            radius="md"
            style={{
              maxHeight: "80vh",
              width: "auto",
              maxWidth: "90vw",
            }}
          />
          {ornaments.map((ornament, index) => {
            return (
              ornament.ornamentData && (
                <Stack
                  key={index}
                  justify="center"
                  align="center"
                  pos="absolute"
                  top={`${ornament.position?.top}%`}
                  left={`${ornament.position?.left}%`}
                  gap={5}
                >
                  <Badge size="xs" color={getOrnamentColor(ornament.id)}>
                    {ornament.username}
                  </Badge>
                  <img
                    src={ornament.ornamentData}
                    alt={`Bombka ${ornament.username}`}
                    style={{
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      border: `3px solid ${getOrnamentBorderColor(
                        ornament.id
                      )}`,
                      backgroundColor:
                        "light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-7))",
                    }}
                  />
                </Stack>
              )
            );
          })}
        </div>
      </Box>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        size="xl"
        styles={{
          content: {
            backgroundColor: "transparent",
            border: "none",
          },
          body: {
            backgroundColor: "transparent",
            scrollbarWidth: "thin",
          },
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "100%",
            height: "auto",
            position: "relative",
          }}
        >
          <Image
            src="public/treebase.png"
            alt="Gorasul Logo"
            radius="md"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
          {ornaments.map((ornament, index) => {
            return (
              ornament.ornamentData && (
                <Stack
                  key={index}
                  justify="center"
                  align="center"
                  pos="absolute"
                  top={`${ornament.position?.top}%`}
                  left={`${ornament.position?.left}%`}
                  gap={5}
                >
                  <Badge size="xs" color={getOrnamentColor(ornament.id)}>
                    {ornament.username}
                  </Badge>
                  <img
                    src={ornament.ornamentData}
                    alt={`Bombka ${ornament.username}`}
                    style={{
                      borderRadius: "50%",
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      border: `3px solid ${getOrnamentBorderColor(
                        ornament.id
                      )}`,
                      backgroundColor:
                        "light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-7))",
                    }}
                  />
                </Stack>
              )
            );
          })}
        </div>
      </Modal>
    </Box>
  );
}
