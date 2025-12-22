import { Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import {
  getOrnamentsData,
  saveOrnamentData,
} from "../services/ornament.service";

const ornamentsPath = path.join(__dirname, "../data/ornaments.json");

export const saveOrnament = (req: Request, res: Response): void => {
  const { username, sessionId, ornamentData } = req.body;

  // Validate required fields
  if (!username || !sessionId || !ornamentData) {
    res
      .status(400)
      .json({
        error: "Missing required fields: username, sessionId, or ornamentData",
      });
    return;
  }

  fs.readJson(ornamentsPath)
    .then((ornaments: Array<{ id: number }>) => {
      const usedIds = ornaments.map((ornament) => ornament.id);
      const maxId = Math.max(0, ...usedIds);
      const newId = maxId + 1; // Pick the first available ID

      return saveOrnamentData(username, sessionId, ornamentData, newId);
    })
    .then(() => {
      res.status(200).json({ message: "Ornament saved successfully." });
    })
    .catch((error) => {
      console.error("Error in saveOrnament:", error);
      if (error.message === "Invalid username or session ID.") {
        res.status(403).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "An error occurred while saving the ornament." });
      }
    });
};

export const getOrnaments = (_req: Request, res: Response): void => {
  getOrnamentsData()
    .then((ornaments) => {
      res.status(200).json(ornaments);
    })
    .catch((error) => {
      console.error("Error in getOrnaments:", error);
      res.status(500).send("An error occurred while fetching ornaments.");
    });
};
