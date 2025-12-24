import fs from "fs-extra";
import path from "path";

const dataDir = path.join(__dirname, "../../../data");
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
      // Use the ornament ID directly to determine the position index
      const positionIndex = id - 1; // IDs start from 1, so subtract 1 for zero-based index
      if (positionIndex < positions.length) {
        position = positions[positionIndex];
      } else {
        console.warn("No available position for ornament ID:", id);
      }
    }
  } catch (err) {
    console.warn("Could not load positions file, saving without position");
  }

  const existingIndex = ornaments.findIndex(
    (ornament: { username: string }) => ornament.username === username
  );
  let newId = 1;

  if (existingIndex !== -1) {
    // If the ornament already exists, retain its ID and position
    newId = ornaments[existingIndex].id;
    position = ornaments[existingIndex].position;
    ornaments[existingIndex] = { id: newId, username, position, ornamentData };
  } else {
    // Assign a new ID and position
    const usedIds = ornaments.map((ornament) => ornament.id);
    while (usedIds.includes(newId)) {
      newId++;
    }
    if (Array.isArray(positions) && positions.length > 0) {
      const positionIndex = newId - 1;
      if (positionIndex < positions.length) {
        position = positions[positionIndex];
      } else {
        console.warn("No available position for ornament ID:", newId);
      }
    }
    ornaments.push({ id: newId, username, position, ornamentData });
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
