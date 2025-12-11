import { Badge } from "@mantine/core";
import React from "react";

export default function Username({ username }: { username: string }) {
  return (
    <Badge
      size="xl"
      variant="gradient"
      gradient={{ from: "blue", to: "cyan", deg: 90 }}
    >
      {username}
    </Badge>
  );
}
