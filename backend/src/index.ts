import express from "express";
import cors from "cors";
import { Client, GatewayIntentBits } from "discord.js";
import { getTreeData } from "./controllers/treeController";
import { saveOrnament } from "./controllers/ornamentController";
import { registerCommands } from "./services/discordService";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.get("/api/tree", getTreeData);
app.post("/api/save-ornament", saveOrnament);

// Discord Bot Setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_BOT_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId = process.env.DISCORD_GUILD_ID!;

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

registerCommands(clientId, guildId, token);

client.login(token);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
