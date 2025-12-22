import { Button, Container, Group, Text, Title } from "@mantine/core";
import React from "react";
import { Link } from "react-router-dom";
import Illustration from "./Illustration";
import classes from "./NotFoundBackground.module.css";

export default function NotFoundBackground() {
  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <Illustration className={classes.image} />
        <div className={classes.content}>
          <Title className={classes.title}>Nic tu nie ma</Title>
          <Text
            c="dimmed"
            size="lg"
            ta="center"
            className={classes.description}
          >
            Strona, którą próbujesz otworzyć, nie istnieje. Być może wpisałeś
            błędny adres lub strona została przeniesiona pod inny adres URL.
          </Text>
          <Group justify="center">
            <Link to={`/`}>
              <Button size="md">Powrót na stronę główną</Button>
            </Link>
          </Group>
        </div>
      </div>
    </Container>
  );
}
