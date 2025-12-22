import {
  Box,
  Center,
  Image,
  Title,
  useComputedColorScheme,
} from "@mantine/core";
import React from "react";

export default function Home() {
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <Center my="auto" mih="70vh">
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
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
          Gorasul
        </Title>
        <Image
          src={`gorasul-${computedColorScheme}.png`}
          alt="Gorasul Logo"
          radius="md"
          bg="light-dark(var(--mantine-color-red-9), var(--mantine-color-red-5))"
          style={{
            width: "300px",
            height: "auto",
          }}
        />
      </Box>
    </Center>
  );
}
