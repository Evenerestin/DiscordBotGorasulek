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

// Serve static frontend files from the built directory
const frontendDistPath = path.join(__dirname, "frontend/dist");

// Check if the build exists
if (fs.existsSync(frontendDistPath)) {
  console.log(`Serving frontend from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
} else {
  console.warn(`Warning: Frontend build not found at ${frontendDistPath}`);
  console.warn("Run 'npm run build' to create the frontend build");
}

// For SPA routing: send index.html for any non-API route
app.get("/*", (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith("/api")) {
    return next();
  }

  // Only serve index.html if the build exists
  if (fs.existsSync(frontendDistPath)) {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  } else {
    res.status(404).send("Frontend not built. Run 'npm run build'.");
  }
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

    const sessionsPath = path.join(__dirname, "data/sessions.json");
    const sessions = await fs.readJson(sessionsPath).catch(() => ({}));

    // Update the session ID for the user
    sessions[serverUsername] = { sessionId };

    // Write the updated sessions back to the file
    await fs.writeJson(sessionsPath, sessions);

    const link = `/bombka/${encodeURIComponent(serverUsername)}/${sessionId}`;

    await interaction.reply({
      content: `🎨 Link do twojej sesji generatora: ${link}`,
      ephemeral: true, // Make the reply visible only to the user
    });
  }

  if (commandName === "tree") {
    await interaction.deferReply();

    try {
      const imageBuffer = Buffer.from("..."); // Replace with actual image data

      const attachment = new AttachmentBuilder(imageBuffer, {
        name: "christmas-tree.png",
      });

      const embed = new EmbedBuilder()
        .setTitle("🎄 Current Christmas Tree 🎄")
        .setImage("attachment://christmas-tree.png")
        .setColor(0x2ecc40)
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
        files: [attachment],
      });
    } catch (error) {
      console.error("Error in /tree command:", error);
    }
  }

  if (commandName === "moja-bombka") {
    await interaction.reply("Feature coming soon!");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Serving frontend from: ${frontendDistPath}`);
});
