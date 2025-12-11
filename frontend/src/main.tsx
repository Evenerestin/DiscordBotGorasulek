import {
  createTheme,
  MantineColorsTuple,
  MantineProvider,
  useComputedColorScheme,
} from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const theme = createTheme({
  primaryColor: "red",
  primaryShade: {
    light: 9,
    dark: 5,
  },
  colors: {
    red: [
      "#feecec",
      "#f7d4d4",
      "#f3a4a3",
      "#f17170",
      "#ef4844",
      "#ee3129",
      "#ee261c",
      "#d41c12",
      "#bd150e",
      "#750606",
    ],
  },
  fontFamily: "Montserrat, sans-serif",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
