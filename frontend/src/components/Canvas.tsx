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
  IconImageInPicture,
  IconPolaroid,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Konva from "konva";
import React, { useEffect, useRef, useState } from "react";
import {
  Image as ReactImage,
  Layer as ReactLayer,
  Stage,
  Transformer,
} from "react-konva";
import { ModalType } from "../pages/Ornament";
import BrushOptions from "./BrushOptions";
import { default as ColorPalette } from "./ColorPalette";

const Canvas = ({
  savePainting,
  activeModal,
  setActiveModal,
}: {
  savePainting: (data: string) => void;
  activeModal: ModalType;
  setActiveModal: React.Dispatch<React.SetStateAction<ModalType>>;
}) => {
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
      resetRef.current();
    }
    clearCanvas();
  };

  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const backgroundColor =
    computedColorScheme === "light" ? "#e9ecef" : "#141414";

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
    if (!canvas) return;

    if (tool === "colorPicker") {
      pickColor(e);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasPainting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentImageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blankCanvas = document.createElement("canvas");
    blankCanvas.width = canvas.width;
    blankCanvas.height = canvas.height;
    const blankCtx = blankCanvas.getContext("2d");
    if (!blankCtx) return;

    blankCtx.fillStyle = backgroundColor;
    blankCtx.fillRect(0, 0, canvas.width, canvas.height);
    const blankImageData = blankCtx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const hasDrawing = !currentImageData.data.every(
      (val, i) => val === blankImageData.data[i]
    );

    if (!hasDrawing && imageLayers.length === 0) {
      console.error("Canvas is empty. Nothing to save.");
      return;
    }

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext("2d");
    if (!finalCtx) return;

    if (imageLayers.length > 0 && stageRef.current) {
      const stageDataURL = stageRef.current.toDataURL({
        mimeType: "image/png",
      });
      const stageImage = new Image();
      stageImage.onload = () => {
        finalCtx.drawImage(stageImage, 0, 0);

        finalCtx.drawImage(canvas, 0, 0);
        exportFinalImage(finalCanvas);
      };
      stageImage.src = stageDataURL;
    } else {
      exportFinalImage(canvas);
    }
  };

  const exportFinalImage = (canvasToExport: HTMLCanvasElement) => {
    const stage = new Konva.Stage({
      container: document.createElement("div"),
      width: canvasToExport.width,
      height: canvasToExport.height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const image = new Konva.Image({
      image: canvasToExport,
      x: 0,
      y: 0,
      width: canvasToExport.width,
      height: canvasToExport.height,
    });
    layer.add(image);
    layer.draw();

    const dataURL = stage.toDataURL({
      mimeType: "image/png",
      quality: 1,
      pixelRatio: 2,
    });

    stage.destroy();

    savePainting(dataURL);
  };

  const cursorStyle = {
    width: tool === "brush" ? `${brushSize}px` : "24px",
    height: tool === "brush" ? `${brushSize}px` : "24px",
    borderRadius: tool === "brush" ? "50%" : "0",
    border: tool === "brush" ? "2px solid white" : "none",
    backgroundColor: tool === "brush" ? color : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute" as const,
    pointerEvents: "none" as const,
    transform: "translate(-50%, -50%)",
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + window.scrollX;
    const y = e.clientY - rect.top + window.scrollY;

    setCursorPosition({ x, y });
  };

  const handleFileInput = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.crossOrigin = "anonymous";
      img.onload = () => {
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

        const x = (400 - width) / 2;
        const y = (400 - height) / 2;

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
                opened={activeModal === "clear-canvas"}
                onClose={() => setActiveModal(null)}
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
                <Stack mb="md">
                  <Text>Jesteś pewien, że chcesz wyczyścić całą bombkę?</Text>
                </Stack>
                <Group mt="xl" w="100%" justify="space-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveModal(null)}
                  >
                    Anuluj
                  </Button>
                  <Button
                    variant="filled"
                    color="red"
                    onClick={() => {
                      clearCanvas();
                      clearFile();
                      setActiveModal(null);
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
