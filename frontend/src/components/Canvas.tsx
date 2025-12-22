import {
  ActionIcon,
  Box,
  Button,
  Card,
  FileButton,
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
  IconCheck,
  IconChevronRight,
  IconColorPicker,
  IconEraser,
  IconFile,
  IconImageInPicture,
  IconPolaroid,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import React, { useEffect, useRef, useState } from "react";
import {
  Image as ReactImage,
  Layer as ReactLayer,
  Stage,
  Transformer,
} from "react-konva";
import BrushOptions from "./BrushOptions";
import { default as ColorPalette } from "./ColorPalette";

const Canvas = ({ savePainting }: { savePainting: (data: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [opened, { open, close }] = useDisclosure(false);
  const [tool, setTool] = useState("brush");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [editMode, setEditMode] = useState(false);
  const resetRef = useRef<() => void>(null);
  const [imageLayers, setImageLayers] = useState<
    Array<{
      id: string;
      image: HTMLImageElement;
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  >([]);

  const clearFile = () => {
    setFile(null);
    setImageLayers([]);
    setEditMode(false);
    if (resetRef.current) {
      resetRef.current(); // Explicitly reset the FileButton
    }
    clearCanvas(); // Clear the canvas when the file is cleared
  };

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

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Check if context is null

    // Get the current canvas data
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create a fresh canvas with just the background to compare
    const blankCanvas = document.createElement("canvas");
    blankCanvas.width = canvas.width;
    blankCanvas.height = canvas.height;
    const blankCtx = blankCanvas.getContext("2d");
    if (!blankCtx) return;
    
    blankCtx.fillStyle = backgroundColor;
    blankCtx.fillRect(0, 0, canvas.width, canvas.height);
    const blankImageData = blankCtx.getImageData(0, 0, canvas.width, canvas.height);

    // Compare: if current data is different from blank, user has drawn something
    const hasDrawing = !currentImageData.data.every((val, i) => val === blankImageData.data[i]);
    
    if (!hasDrawing && imageLayers.length === 0) {
      console.error("Canvas is empty. Nothing to save.");
      return;
    }

    // Create a temporary canvas for combining all layers
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext("2d");
    if (!finalCtx) return;

    // First, draw the Konva stage (image layer) if it exists
    if (imageLayers.length > 0 && stageRef.current) {
      const stageDataURL = stageRef.current.toDataURL({
        mimeType: "image/png",
      });
      const stageImage = new Image();
      stageImage.onload = () => {
        finalCtx.drawImage(stageImage, 0, 0);
        // Then draw the canvas (drawing layer) on top
        finalCtx.drawImage(canvas, 0, 0);
        exportFinalImage(finalCanvas);
      };
      stageImage.src = stageDataURL;
    } else {
      // If no image layer, just use the canvas
      exportFinalImage(canvas);
    }
  };

  const exportFinalImage = (canvasToExport: HTMLCanvasElement) => {
    // Use Konva for better image export
    const stage = new Konva.Stage({
      container: document.createElement("div"),
      width: canvasToExport.width,
      height: canvasToExport.height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    // Create Konva image from the canvas
    const image = new Konva.Image({
      image: canvasToExport,
      x: 0,
      y: 0,
      width: canvasToExport.width,
      height: canvasToExport.height,
    });
    layer.add(image);
    layer.draw();

    // Export with Konva (better quality and options)
    const dataURL = stage.toDataURL({
      mimeType: "image/png",
      quality: 1,
      pixelRatio: 2, // Higher resolution export
    });

    // Clean up
    stage.destroy();

    savePainting(dataURL); // Call the savePainting function
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

  const handleFileInput = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Calculate dimensions to fit within canvas while maintaining aspect ratio
        const maxWidth = 250;
        const maxHeight = 250;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Position image at the center of the canvas
        const x = (400 - width) / 2;
        const y = (400 - height) / 2;

        // Only allow one image - replace the existing one
        setImageLayers([
          {
            id: `layer-${Date.now()}`,
            image: img,
            x,
            y,
            width,
            height,
          },
        ]);
      };
      img.onerror = () => {
        console.error("Failed to load image");
      };
    };
    reader.readAsDataURL(file);
  };

  const selectImage = () => {
    setEditMode(true);
    if (imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  };

  useEffect(() => {
    if (editMode && imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    } else if (!editMode && transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [editMode]);

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
        <div
          style={{
            position: "relative",
            display: "inline-block",
            width: 400,
            height: 400,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: editMode ? "auto" : "none",
              borderRadius: "50%",
              overflow: "hidden",
              width: 409,
              height: 409,
            }}
          >
            <Stage
              ref={stageRef}
              width={400}
              height={400}
              style={{
                position: "absolute",
                top: 5,
                left: 5,
              }}
            >
              <ReactLayer>
                {imageLayers.map((layer) => (
                  <React.Fragment key={layer.id}>
                    <ReactImage
                      ref={imageRef}
                      image={layer.image}
                      x={layer.x}
                      y={layer.y}
                      width={layer.width}
                      height={layer.height}
                      draggable={editMode}
                      onClick={(e) => {
                        if (transformerRef.current && editMode) {
                          transformerRef.current.nodes([e.target]);
                          transformerRef.current.getLayer().batchDraw();
                        }
                      }}
                    />
                  </React.Fragment>
                ))}
                <Transformer ref={transformerRef} visible={editMode} />
              </ReactLayer>
            </Stage>
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{
              border:
                "5px solid light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))",
              borderRadius: "50%",
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: editMode ? "none" : "auto",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          ></canvas>
        </div>
      </Box>
      <Stack justify="center" gap="lg">
        <Stack>
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
                      clearFile();
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
          <Group gap="xs">
            <FileButton
              resetRef={resetRef}
              onChange={(file) => {
                setFile(file);
                if (file) handleFileInput(file);
              }}
              accept="image/png,image/jpeg"
            >
              {(props) => (
                <Button
                  variant={file !== null ? "filled" : "outline"}
                  size="md"
                  leftSection={<IconPolaroid size={18} />}
                  {...props}
                >
                  {file ? file.name : "Wstaw obraz"}
                </Button>
              )}
            </FileButton>
            {file && (
              <>
                {!editMode ? (
                  <Button
                    onClick={selectImage}
                    variant="outline"
                    size="md"
                    leftSection={<IconImageInPicture size={18} />}
                  >
                    Edytuj
                  </Button>
                ) : (
                  <Button
                    onClick={() => setEditMode(false)}
                    variant="light"
                    size="md"
                    leftSection={<IconCheck size={18} />}
                  >
                    Gotowe
                  </Button>
                )}
                <ActionIcon
                  size={42}
                  disabled={!file}
                  color="red"
                  onClick={clearFile}
                >
                  <IconX size={18} />
                </ActionIcon>
              </>
            )}
          </Group>
        </Stack>
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
