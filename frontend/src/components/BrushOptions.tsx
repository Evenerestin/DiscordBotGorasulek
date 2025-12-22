import { Card, ColorPicker, Group, Slider, Stack, Text } from "@mantine/core";
import React, { useState } from "react";

interface BrushOptionsProps {
  brushSize: number;
  setBrushSize: (size: number) => void;
}

const sizeLabels = [
  "Bardzo mały",
  "Mały",
  "Średni",
  "Duży",
  "Bardzo duży",
  "Ogromny",
];

export default function BrushOptions({
  brushSize,
  setBrushSize,
}: BrushOptionsProps) {
  const [value, setValue] = useState<number>(5);

  const handleChange = (newSize: number) => {
    setValue(newSize);
    setBrushSize(newSize);
  };

  return (
    <Stack justify="center" gap="md" pt="xl" px="xl">
      <Slider
        color="light-dark(var(--mantine-color-red-9), var(--mantine-color-red-5))"
        size="xl"
        labelAlwaysOn
        value={brushSize}
        onChange={setBrushSize}
        min={5}
        max={55}
        step={10}
        marks={[
          { value: 5 },
          { value: 15 },
          { value: 25 },
          { value: 35 },
          { value: 45 },
          { value: 55 },
        ]}
        label={sizeLabels[(brushSize - 5) / 10]}
      />
    </Stack>
  );
}
