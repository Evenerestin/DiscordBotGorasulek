import { AppShell, Box, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import { Outlet } from "react-router";
import { Navbar } from "../components/navigation/Navbar";
import ThemeButton from "../components/theme/ThemeButton";

export default function AppLayout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      navbar={{
        width: 79,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main bg="light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-9))">
        <Box mih="100vh" p="md" pb="xl">
          <Box pos="absolute" top={10} right={10} style={{ zIndex: 100 }}>
            <ThemeButton />
          </Box>
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
