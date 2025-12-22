import { Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import { ornamentPositions } from "../config/ornamentSpots";

const dataDir = path.join(__dirname, "../data");

export const getTreeData = (req: Request, res: Response): void => {
  const ornamentsPath = path.join(dataDir, "ornaments.json");

  fs.readJson(ornamentsPath)
    .then((ornaments: Record<string, any>) => {
      const response = Object.entries(ornaments).map(([username, data]) => {
        const { id, ornamentData } = data;
        const position = ornamentPositions[id];
        return {
          username,
          canvasData: ornamentData,
          position,
        };
      });

      res.status(200).json(response);
    })
    .catch(() => res.status(500).send("Error retrieving tree data."));
};
