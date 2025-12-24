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
  id: number
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

  let position: any = null;
  let positions: Array<{ top: number; left: number }> = [];
  try {
    positions = await fs.readJson(positionsPath);
    if (Array.isArray(positions) && positions.length > 0) {
      const positionIndex = id - 1;
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
    newId = ornaments[existingIndex].id;
    position = ornaments[existingIndex].position;
    ornaments[existingIndex] = { id: newId, username, position, ornamentData };
  } else {
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
