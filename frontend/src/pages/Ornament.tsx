import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import axios from "axios";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Canvas from "../components/Canvas";

export type ModalType =
  | "save-success"
  | "save-error"
  | "clear-file"
  | "clear-canvas"
  | null;

export default function Ornament() {
  const [opened, { open, close }] = useDisclosure(false);
  const { username, id } = useParams();
  const [ornamentId, setOrnamentId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const saveOrnament = async (data: string | null) => {
    if (!data) {
      setActiveModal("save-error");
      return;
    }

    try {
      const response = await axios.post("/api/save-ornament", {
        username,
        sessionId: id,
        ornamentData: data,
      });

      if (response.status === 200) {
        const result = response.data;
        setOrnamentId(result.ornamentId || result.id);
        setActiveModal("save-success");
        return;
      }
    } catch (error) {
      setActiveModal("save-error");
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
          saveOrnament(data);
        }}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
      <Modal
        opened={activeModal !== null}
        onClose={() => setActiveModal(null)}
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
            {activeModal === "save-success" && "Zapisano pomyślnie!"}
            {activeModal === "save-error" && "Nie udało się zapisać."}
            {activeModal === "clear-file" && "Wyczyścić płótno?"}
          </Text>
        }
        centered
      >
        {activeModal === "save-success" && (
          <>
            <Stack mb="md">
              <Text>
                Bombka została zapisana pomyślnie. Możesz ją teraz znaleźć na
                gorasuloince!
              </Text>
            </Stack>
            <Group mt="xl" w="100%" justify="space-between">
              <Link to="/">
                <Button variant="outline" onClick={() => setActiveModal(null)}>
                  Strona główna
                </Button>
              </Link>
              <Link to={`/gorasuloinka`}>
                <Button
                  variant="filled"
                  color="red"
                  onClick={() => setActiveModal(null)}
                >
                  Gorasuloinka
                </Button>
              </Link>
            </Group>
          </>
        )}

        {activeModal === "save-error" && (
          <>
            <Text>
              Niestety nie udało się zapisać bombki, proszę spróbować ponownie
              później.
            </Text>
          </>
        )}

        {activeModal === "clear-file" && (
          <>
            <Stack mb="md">
              <Text>Jesteś pewien, że chcesz wyczyścić całą bombkę?</Text>
            </Stack>
            <Group mt="xl" w="100%" justify="space-between">
              <Button variant="outline" onClick={() => setActiveModal(null)}>
                Anuluj
              </Button>
              <Button
                variant="filled"
                color="red"
                onClick={() => setActiveModal(null)}
              >
                Wyczyść
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </Stack>
  );
}

//   title: "Wyczyścić płótno?",
//     text: "Jesteś pewien, że chcesz wyczyścić całą bombkę?",
//   });
//   setModalContent({
//         title: "Nie udało się zapisać",
//         text: "Brak danych o bombce do zapisania.",
//       });
//       open();
//     setModalContent({
//           title: "Zapisano pomyślnie",
//           text: "Bombka została zapisana pomyślnie. Teraz możesz ją umieścić na choince!",
//         });
//       setModalContent({
//         title: "Nie udało się zapisać",
//         text: "Niestety nie udało się zapisać bombki, proszę spróbować ponownie później.",
//       });

// <Modal
//         opened={opened}
//         onClose={close}
//         size="md"
//         title={
//           <Text
//             tt="uppercase"
//             style={{
//               lineHeight: 1,
//               color:
//                 "light-dark(var(--mantine-color-red-9), var(--mantine-color-red-5))",
//               fontSize: "48px",
//               fontWeight: 900,
//               letterSpacing: "2px",
//             }}
//           >
//             {modalContent.title}
//           </Text>
//         }
//         centered
//       >

// <Group mt="xl" w="100%" justify="space-between">
//           <Link to="/">
//             <Button variant="outline" onClick={close}>
//               Strona główna
//             </Button>
//           </Link>
//           <Link to={`/gorasuloinka`}>
//             <Button variant="filled" color="red" onClick={close}>
//               Gorasuloinka
//             </Button>
//           </Link>
//         </Group>
