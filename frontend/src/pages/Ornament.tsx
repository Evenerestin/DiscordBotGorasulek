import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Canvas from "../components/Canvas";

export default function Ornament() {
  const [opened, { open, close }] = useDisclosure(false);
  const { username, id } = useParams();
  const [ornamentId, setOrnamentId] = useState<string | null>(null);
  // const [canvasData, setCanvasData] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{
    title: string;
    text: string;
  }>({
    title: "Wyczyścić płótno?",
    text: "Jesteś pewien, że chcesz wyczyścić całą bombkę?",
  });
  [];

  const saveOrnament = async (data: string | null) => {
    if (!data) {
      setModalContent({
        title: "Nie udało się zapisać",
        text: "Brak danych o bombce do zapisania.",
      });
      open();
      return;
    }

    console.log("Sending ornament data:", data); // Debugging log

    const response = await fetch("http://localhost:3000/api/save-ornament", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        sessionId: id,
        ornamentData: data,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      setOrnamentId(result.ornamentId || result.id);
      setModalContent({
        title: "Zapisano pomyślnie",
        text: "Bombka została zapisana pomyślnie. Teraz możesz ją umieścić na choince!",
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
          saveOrnament(data); // Pass the data directly to saveOrnament
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
          <Link to={`/gorasuloinka`}>
            <Button variant="filled" color="red" onClick={close}>
              Gorasuloinka
            </Button>
          </Link>
        </Group>
      </Modal>
    </Stack>
  );
}
