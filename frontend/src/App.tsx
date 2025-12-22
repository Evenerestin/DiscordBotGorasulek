import "@mantine/core/styles.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import Ornament from "./pages/Ornament";
import Tree from "./pages/Tree";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/gorasuloinka" element={<Tree />} />
          <Route path="/bombka/:username/:id" element={<Ornament />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
