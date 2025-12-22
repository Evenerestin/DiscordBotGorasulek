"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const discord_js_1 = require("discord.js");
const express_1 = __importDefault(require("express"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const dataDir = path_1.default.join(__dirname, "../../../data");
const sessionsPath = path_1.default.join(dataDir, "sessions.json");
const app = (0, express_1.default)();
// Middleware to parse JSON request bodies
app.use(express_1.default.json());
// Authenticate session endpoint
app.post("/api/authenticate-session", (req, res) => {
    const { username, sessionId } = req.body;
    console.log("EOEOEOEOEOOE", sessionsPath);
    fs_extra_1.default.readJson(sessionsPath)
        .then((sessions) => {
        const session = sessions[username];
        if (session && session.sessionId === sessionId) {
            res.status(200).send("Session authenticated.");
        }
        else {
            res.status(403).send("Invalid session.");
        }
    })
        .catch((err) => {
        console.error("Error authenticating session:", err);
        res.status(500).send("Error authenticating session.");
    });
});
const registerCommands = async (clientId, guildId, token) => {
    const rest = new discord_js_1.REST({ version: "10" }).setToken(token);
    try {
        console.log("Started refreshing application (/) commands.");
        await rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, guildId), {
            body: [
                {
                    name: "bombka",
                    description: "Generate a link to the painting website.",
                },
                {
                    name: "tree",
                    description: "Display the current Christmas tree.",
                },
                {
                    name: "hang-ornament",
                    description: "Hang an ornament on the tree.",
                },
                {
                    name: "my-ornaments",
                    description: "List your saved ornaments.",
                },
            ],
        });
        console.log("Successfully reloaded application (/) commands.");
    }
    catch (error) {
        console.error("Error registering commands:", error);
    }
};
exports.registerCommands = registerCommands;
exports.default = app;
