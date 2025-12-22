import fs from "fs-extra";
import path from "path";
import { ornamentPositions } from "../config/ornamentSpots"; // Removed incorrect OrnamentPositions import

const dataDir = path.join(__dirname, "../data");
const ornamentsPath = path.join(dataDir, "ornaments.json");
const sessionsPath = path.join(dataDir, "sessions.json");
const positionsPath = path.join(dataDir, "positions.json");

export const saveOrnamentData = async (
  username: string,
  sessionId: string,
  ornamentData: string,
  id: number // Ensure id is a number
): Promise<void> => {
  const sessions = await fs.readJson(sessionsPath);
  const session = sessions[username];

  console.log("Validating session for username:", username);
  console.log("Provided sessionId:", sessionId);
  console.log("Sessions data:", sessions);
  console.log("Validating sessionId:", sessionId);

  if (!session || session.sessionId !== sessionId) {
    console.error("Session validation failed for username:", username);
    throw new Error("Invalid username or session ID.");
  }

  let ornaments: Array<{
    id: number;
    username: string;
    position?: any;
    ornamentData: string;
  }> = await fs.readJson(ornamentsPath).catch(() => []);
  if (!Array.isArray(ornaments)) {
    ornaments = [];
  }

  // Load positions and pick one based on ornament ID
  let position: any = null;
  try {
    const positions: Array<{ top: number; left: number }> = await fs.readJson(
      positionsPath
    );
    if (Array.isArray(positions) && positions.length > 0) {
      // Use modulo to cycle through positions if there are more ornaments than positions
      const positionIndex = id % positions.length;
      position = positions[positionIndex];
    }
  } catch (err) {
    console.warn("Could not load positions file, saving without position");
  }

  // Find the smallest available ID
  const usedIds = ornaments.map((ornament) => ornament.id);
  let newId = 1;
  while (usedIds.includes(newId)) {
    newId++;
  }

  const newOrnament = { id: newId, username, position, ornamentData };

  const existingIndex = ornaments.findIndex(
    (ornament: { username: string }) => ornament.username === username
  );
  if (existingIndex !== -1) {
    ornaments[existingIndex] = newOrnament;
  } else {
    ornaments.push(newOrnament);
  }

  await fs.writeJson(ornamentsPath, ornaments);
};

export const getOrnamentsData = async (): Promise<
  Array<{
    id: number;
    username: string;
    position?: any;
    ornamentData: string;
  }>
> => {
  const ornaments = await fs.readJson(ornamentsPath).catch(() => []);

  if (!Array.isArray(ornaments)) {
    return [];
  }

  return ornaments;
};
