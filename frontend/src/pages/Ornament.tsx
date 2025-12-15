import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Canvas from "../components/Canvas";

export default function Ornament() {
  const [opened, { open, close }] = useDisclosure(false);
  const { username, id } = useParams();
  const [canvasData, setCanvasData] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{
    title: string;
    text: string;
  }>({
    title: "Wyczyścić płótno?",
    text: "Jesteś pewien, że chcesz wyczyścić całą bombkę?",
  });

  const saveOrnament = async () => {
    if (!canvasData) {
      setModalContent({
        title: "Nie udało się zapisać",
        text: "Brak danych o bombce do zapisania.",
      });
      open();
      return;
    }

    console.log("Sending ornament data:", canvasData); // Debugging log

    const response = await fetch("http://localhost:3000/api/save-ornament", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        sessionId: id,
        ornamentData: canvasData,
      }),
    });

    if (response.ok) {
      setModalContent({
        title: "Zapisano pomyślnie",
        text: "Bombka została zapisana pomyślnie. Możesz ją znaleźć na Gorasuloince!",
      });
      open();
      return;
    } else {
      setModalContent({
        title: "Nie udało się zapisać",
        text: "Niestety nie udało się zapisać bombki, proszę spróbować ponownie później.",
      });
      open();
    }
  };

  return (
    <Stack justify="center" ta="center">
      <Stack mx={50} ta="center" gap={0}>
        <Title
          tt="uppercase"
          style={{
            color:
              "light-dark(var(--mantine-color-red-9), var(--mantine-color-red-5))",
            fontSize: "62px",
            fontWeight: 900,
            letterSpacing: "2px",
          }}
        >
          Ozdób swoją bombkę!
        </Title>
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
          {username}
        </Title>
      </Stack>
      <Canvas
        savePainting={(data) => {
          console.log("Data received from Canvas:", data); // Debugging log
          setCanvasData(data);
          const ornamentId = `ornament-${Math.floor(Math.random() * 22)}`; // Generate a valid ID based on ornamentPositions indices
          console.log("Payload sent to backend:", {
            username,
            sessionId: id,
            ornamentData: data,
            id: ornamentId,
          }); // Debugging log
          fetch("http://localhost:3000/api/save-ornament", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              sessionId: id,
              ornamentData: data,
              id: ornamentId, // Include the ID in the payload
            }),
          })
            .then((response) => {
              if (response.ok) {
                setModalContent({
                  title: "Zapisano pomyślnie",
                  text: "Bombka została zapisana pomyślnie. Możesz ją znaleźć na Gorasuloince!",
                });
                open(); // Only open modal on success
              } else {
                setModalContent({
                  title: "Nie udało się zapisać",
                  text: "Niestety nie udało się zapisać bombki, proszę spróbować ponownie później.",
                });
              }
            })
            .catch((error) => {
              console.error("Error saving ornament:", error);
            });
          open();
        }}
      />
      <Modal
        opened={opened}
        onClose={close}
        size="md"
        title={
          <Text
            tt="uppercase"
            style={{
              lineHeight: 1,
              color:
                "light-dark(var(--mantine-color-red-9), var(--mantine-color-red-5))",
              fontSize: "48px",
              fontWeight: 900,
              letterSpacing: "2px",
            }}
          >
            {modalContent.title}
          </Text>
        }
        centered
      >
        <Stack gap="xl" mb="md">
          <Text>{modalContent.text}</Text>
        </Stack>
        <Group mt="xl" w="100%" justify="space-between">
          <Link to="/">
            <Button variant="outline" onClick={close}>
              Strona główna
            </Button>
          </Link>
          <Link to="/gorasuloinka">
            <Button
              variant="filled"
              color="red"
              onClick={() => {
                setCanvasData(null); // Clear canvas data
                close();
              }}
            >
              Gorasuloinka
            </Button>
          </Link>
        </Group>
      </Modal>
    </Stack>
  );
}
