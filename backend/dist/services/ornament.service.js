"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrnamentsData = exports.saveOrnamentData = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const dataDir = path_1.default.join(__dirname, "../../../data");
const ornamentsPath = path_1.default.join(dataDir, "ornaments.json");
const sessionsPath = path_1.default.join(dataDir, "sessions.json");
const positionsPath = path_1.default.join(dataDir, "positions.json");
const saveOrnamentData = async (username, sessionId, ornamentData, id // Ensure id is a number
) => {
    const sessions = await fs_extra_1.default.readJson(sessionsPath);
    const session = sessions[username];
    console.log("Validating session for username:", username);
    console.log("Provided sessionId:", sessionId);
    console.log("Sessions data:", sessions);
    console.log("Validating sessionId:", sessionId);
    if (!session || session.sessionId !== sessionId) {
        console.error("Session validation failed for username:", username);
        throw new Error("Invalid username or session ID.");
    }
    let ornaments = await fs_extra_1.default.readJson(ornamentsPath).catch(() => []);
    if (!Array.isArray(ornaments)) {
        ornaments = [];
    }
    // Load positions and pick one based on ornament ID
    let position = null;
    try {
        const positions = await fs_extra_1.default.readJson(positionsPath);
        if (Array.isArray(positions) && positions.length > 0) {
            // Use modulo to cycle through positions if there are more ornaments than positions
            const positionIndex = id % positions.length;
            position = positions[positionIndex];
        }
    }
    catch (err) {
        console.warn("Could not load positions file, saving without position");
    }
    // Find the smallest available ID
    const usedIds = ornaments.map((ornament) => ornament.id);
    let newId = 1;
    while (usedIds.includes(newId)) {
        newId++;
    }
    const newOrnament = { id: newId, username, position, ornamentData };
    const existingIndex = ornaments.findIndex((ornament) => ornament.username === username);
    if (existingIndex !== -1) {
        ornaments[existingIndex] = newOrnament;
    }
    else {
        ornaments.push(newOrnament);
    }
    await fs_extra_1.default.writeJson(ornamentsPath, ornaments);
};
exports.saveOrnamentData = saveOrnamentData;
const getOrnamentsData = async () => {
    const ornaments = await fs_extra_1.default.readJson(ornamentsPath).catch(() => []);
    if (!Array.isArray(ornaments)) {
        return [];
    }
    return ornaments;
};
exports.getOrnamentsData = getOrnamentsData;
