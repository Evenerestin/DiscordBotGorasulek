import "@mantine/core/styles.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import Ornament from "./pages/Ornament";
import Tree from "./pages/Tree";
import TreePositionEditor from "./pages/TreePositionEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/gorasuloinka" element={<Tree />} />
          <Route path="/test" element={<TreePositionEditor />} />
          <Route path="/bombka/:username/:id" element={<Ornament />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
