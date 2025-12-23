import cors from "cors";
import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
} from "discord.js";
import dotenv from "dotenv";
import express from "express";
import fs from "fs-extra";
import path from "path";
import { getOrnaments, saveOrnament } from "./controllers/ornament.controller";
import { registerCommands } from "./services/discord.service";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: ["http://localhost:5173", "https://gorasul.pl"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.post("/api/save-ornament", saveOrnament);
app.get("/api/get-ornaments", getOrnaments);

const frontendDistPath = path.resolve(__dirname, "../../dist");
console.log("Resolved frontendDistPath:", frontendDistPath);

app.use(express.static(frontendDistPath));

// SPA fallback (must be AFTER static + API routes)
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith("/api")) {
    return next();
  }

  const indexHtml = path.join(frontendDistPath, "index.html");

  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  res.status(404).send("Frontend not built. Run 'npm run build'.");
});

// Discord Bot Setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_BOT_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId = process.env.DISCORD_GUILD_ID!;

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

registerCommands(clientId, guildId, token);

client.login(token);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "bombka") {
    const guildMember = interaction.member; // Get the guild member object
    const serverUsername =
      guildMember && "displayName" in guildMember
        ? guildMember.displayName
        : interaction.user.username; // Use server nickname if available
    const sessionId = require("uuid").v4(); // Generate a unique session ID

    const sessionsPath = path.join(__dirname, "../../data/sessions.json");
    const sessions = await fs.readJson(sessionsPath).catch(() => ({}));

    // Update the session ID for the user
    sessions[serverUsername] = { sessionId };

    // Write the updated sessions back to the file
    await fs.writeJson(sessionsPath, sessions);

    const link = `https://gorasul.pl/bombka/${encodeURIComponent(serverUsername)}/${sessionId}`;

    await interaction.reply({
      content: `🎨 Link do twojej sesji generatora: ${link}`,
      ephemeral: true, // Make the reply visible only to the user
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Serving frontend from: ${frontendDistPath}`);
});
