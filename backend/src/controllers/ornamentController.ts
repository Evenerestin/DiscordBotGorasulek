import { Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import { ornamentPositions } from "../config/ornamentSpots";

const dataDir = path.join(__dirname, "../data");

export const saveOrnament = (req: Request, res: Response): void => {
  const { username, sessionId, ornamentData, id } = req.body;
  const ornamentsPath = path.join(dataDir, "ornaments.json");
  const sessionsPath = path.join(dataDir, "sessions.json");

  fs.readJson(sessionsPath)
    .then((sessions: Record<string, { sessionId: string }>) => {
      const session = sessions[username];

      if (!session || session.sessionId !== sessionId) {
        res.status(403).send("Invalid username or session ID.");
        return Promise.reject();
      }

      return fs.readJson(ornamentsPath);
    })
    .then((ornaments: any[]) => {
      if (!Array.isArray(ornaments)) {
        ornaments = [];
      }

      const position = ornamentPositions[id];
      if (!position) {
        res.status(400).send("Invalid ornament ID.");
        return Promise.reject();
      }

      const existingIndex = ornaments.findIndex(
        (ornament) => ornament.username === username && ornament.id === id
      );
      const newOrnament = { id, username, position, ornamentData };

      if (existingIndex !== -1) {
        ornaments[existingIndex] = newOrnament;
      } else {
        ornaments.push(newOrnament);
      }

      return fs.writeJson(ornamentsPath, ornaments);
    })
    .then(() => {
      res.status(200).send("Ornament saved successfully.");
    })
    .catch(() => {
      // Handle errors silently after response is sent
    });
};
