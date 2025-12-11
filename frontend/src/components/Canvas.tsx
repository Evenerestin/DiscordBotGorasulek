import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBrush,
  IconChevronRight,
  IconColorPicker,
  IconEraser,
  IconTrash,
} from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import BrushOptions from "./BrushOptions";
import { default as ColorPalette } from "./ColorPalette";

const Canvas = ({ savePainting }: { savePainting: (data: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [opened, { open, close }] = useDisclosure(false);
  const [tool, setTool] = useState("brush");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const backgroundColor =
    computedColorScheme === "light" ? "#e9ecef" : "#141414";

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Check if canvas is null

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Check if context is null

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hexColor = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1]
      .toString(16)
      .padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`;
    setColor(hexColor);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Check if canvas is null

    if (tool === "colorPicker") {
      pickColor(e); // Call the pickColor function for the color picker tool
      return; // Prevent drawing
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Check if context is null

    ctx.strokeStyle = tool === "eraser" ? backgroundColor : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";

    const draw = (event: MouseEvent) => {
      ctx.lineTo(event.offsetX, event.offsetY);
      ctx.stroke();
    };

    const stopDrawing = () => {
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
    };

    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Check if canvas is null

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Check if context is null

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasPainting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Check if canvas is null

    const dataURL = canvas.toDataURL();
    console.log("Canvas Data URL:", dataURL); // Debugging log
    savePainting(dataURL); // Pass the canvas data to the parent component
  };

  const cursorStyle = {
    width: tool === "brush" ? `${brushSize}px` : "24px", // Adjust size for brush or other tools
    height: tool === "brush" ? `${brushSize}px` : "24px",
    borderRadius: tool === "brush" ? "50%" : "0", // Circle for brush, none for other tools
    border: tool === "brush" ? "2px solid white" : "none", // Border for brush only
    backgroundColor: tool === "brush" ? color : "transparent", // Color for brush only
    display: "flex", // Center the icons
    alignItems: "center",
    justifyContent: "center",
    position: "absolute" as const, // Explicitly cast to 'absolute'
    pointerEvents: "none" as const, // Correctly type pointerEvents
    transform: "translate(-50%, -50%)", // Center the cursor
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + window.scrollX; // Adjust for horizontal scroll
    const y = e.clientY - rect.top + window.scrollY; // Adjust for vertical scroll

    setCursorPosition({ x, y }); // Update cursor position relative to the canvas
  };

  useEffect(() => {
    const handleMouseMoveWindow = (e: MouseEvent) => {
      const cursor = document.getElementById("custom-cursor");
      if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMoveWindow);
    return () => {
      window.removeEventListener("mousemove", handleMouseMoveWindow);
    };
  }, []);

  return (
    <div>
      <div id="custom-cursor" style={cursorStyle}>
        {tool === "eraser" && (
          <IconEraser
            size={20}
            color="light-dark(var(--mantine-color-red-9), var(--mantine-color-red-5))"
          />
        )}
        {tool === "colorPicker" && (
          <IconColorPicker
            size={20}
            color="light-dark(var(--mantine-color-red-9), var(--mantine-color-red-5))"
          />
        )}
      </div>
      <Box my="xl">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{
            border:
              "5px solid light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))",
            borderRadius: "50%",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        ></canvas>
      </Box>
      <Stack justify="center" gap="lg">
        <Group w="100%" justify="space-between">
          <Group justify="center">
            <ActionIcon me="md" size={42} color="red" onClick={open}>
              <IconTrash size={18} />
            </ActionIcon>
            <Modal
              opened={opened}
              onClose={close}
              size="xs"
              title={
                <Title
                  tt="uppercase"
                  style={{
                    color:
                      "light-dark(var(--mantine-color-red-9), var(--mantine-color-red-5))",
                    fontSize: "32px",
                    fontWeight: 900,
                    letterSpacing: "2px",
                  }}
                >
                  Wyczyścić płótno?
                </Title>
              }
              centered
            >
              <Stack gap="xl" mb="md">
                <Text>Jesteś pewien, że chcesz wyczyścić całą bombkę?</Text>
              </Stack>
              <Group mt="xl" w="100%" justify="space-between">
                <Button variant="outline" onClick={close}>
                  Anuluj
                </Button>
                <Button
                  variant="filled"
                  color="red"
                  onClick={() => {
                    clearCanvas();
                    close();
                  }}
                >
                  Wyczyść
                </Button>
              </Group>
            </Modal>
            <Button
              onClick={() => setTool("brush")}
              variant={tool === "brush" ? "light" : "outline"}
              leftSection={<IconBrush size={18} />}
              size="md"
            >
              Pędzel
            </Button>
            <Button
              onClick={() => setTool("eraser")}
              variant={tool === "eraser" ? "light" : "outline"}
              leftSection={<IconEraser size={18} />}
              size="md"
            >
              Gumka
            </Button>
            <Button
              onClick={() => setTool("colorPicker")}
              variant={tool === "colorPicker" ? "light" : "outline"}
              leftSection={<IconColorPicker size={18} />}
              size="md"
            >
              Pobierz kolor
            </Button>
          </Group>
          <Button
            onClick={saveCanvasPainting}
            variant="filled"
            rightSection={<IconChevronRight size={18} />}
            size="md"
          >
            Zapisz
          </Button>
        </Group>
        <Card
          shadow="md"
          withBorder
          bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
          radius="md"
        >
          <BrushOptions brushSize={brushSize} setBrushSize={setBrushSize} />
        </Card>
        <Card
          shadow="md"
          withBorder
          bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
          radius="md"
        >
          <ColorPalette color={color} setColor={setColor} />
        </Card>
      </Stack>
    </div>
  );
};

export default Canvas;
