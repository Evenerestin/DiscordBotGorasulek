import {
  Box,
  Center,
  Image,
  Stack,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { IconChristmasTree, IconHome } from "@tabler/icons-react";
import React from "react";
import { Link, useLocation } from "react-router";
import classes from "./Navbar.module.css";

interface NavbarLinkProps {
  icon: typeof IconHome;
  label: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({
  icon: Icon,
  label,
  path,
  active,
  onClick,
}: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <Link
        to={path}
        className={classes.link}
        data-active={active || undefined}
      >
        <Icon size={20} stroke={1.5} />
      </Link>
    </Tooltip>
    // <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
    //   <UnstyledButton
    //     onClick={onClick}
    //     className={classes.link}
    //     data-active={active || undefined}
    //   >
    //     <Icon size={20} stroke={1.5} />
    //   </UnstyledButton>
    // </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome, label: "Strona główna", path: "/" },
  { icon: IconChristmasTree, label: "Gorasuloinka", path: "/gorasuloinka" },
];

export function Navbar() {
  const location = useLocation();

  const links = mockdata.map((link) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={location.pathname === link.path} // Check if the current path matches the link path
    />
  ));

  return (
    <nav className={classes.navbar} style={{ minHeight: "100vh" }}>
      <Center>
        <Image src="src/assets/gorasul-light.png" alt="Logo" radius="md" />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      {/* <Stack justify="center" gap={0}>
        <NavbarLink icon={IconSwitchHorizontal} label="Change account" />
        <NavbarLink icon={IconLogout} label="Logout" />
      </Stack> */}
    </nav>
  );
}
