import { Card, ColorPicker, Group, Stack, Text } from "@mantine/core";
import React, { useState } from "react";

interface ColorPaletteProps {
  color: string;
  setColor: (color: string) => void;
}

export default function ColorPalette({ color, setColor }: ColorPaletteProps) {
  const [value, setValue] = useState<string>("#ffffff");

  const handleChange = (newColor: string) => {
    setValue(newColor);
    setColor(newColor);
  };

  return (
    <Stack justify="center" gap="md">
      <ColorPicker
        format="rgb"
        value={value}
        onChange={handleChange}
        swatchesPerRow={8}
        withPicker={false}
        fullWidth
        swatches={[
          "rgb(101,4,12)",
          "rgb(123,28,14)",
          "rgb(44,59,52)",
          "rgb(53,83,68)",
          "rgb(42,92,48)",
          "rgb(111,57,30)",
          "rgb(182,110,48)",
          "rgb(207,169,98)",
          "rgb(149,30,38)",
          "rgba(227, 77, 87, 1)",
          "rgb(90,158,35)",
          "rgb(106,128,64)",
          "rgb(118,155,108)",
          "rgb(237,191,40)",
          "rgba(255, 234, 120)",
          "rgba(255, 248, 207)",
          "rgb(174,7,11)",
          "rgb(222,36,28)",
          "rgb(238,80,56)",
          "rgb(46,71,113)",
          "rgb(65,171,206)",
          "rgb(65,115,196)",
          "rgb(27,118,160)",
          "rgb(153,178,224)",
        ]}
      />
      <ColorPicker
        format="rgba"
        size="sm"
        value={color}
        fullWidth
        onChange={handleChange}
      />
    </Stack>
  );
}
