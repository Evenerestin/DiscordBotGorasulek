import { REST, Routes } from "discord.js";
import express from "express";
import fs from "fs-extra";
import path from "path";
import { URL } from "url";
import { v4 as uuidv4 } from "uuid"; // Import UUID for sessionId generation

const dataDir = path.join(__dirname, "../../../data");
const sessionsPath = path.join(dataDir, "sessions.json");
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Authenticate session endpoint
app.post("/api/authenticate-session", (req, res) => {
  const { username, sessionId } = req.body;
  console.log("EOEOEOEOEOOE", sessionsPath);

  fs.readJson(sessionsPath)
    .then((sessions) => {
      const session = sessions[username];

      if (session && session.sessionId === sessionId) {
        res.status(200).send("Session authenticated.");
      } else {
        res.status(403).send("Invalid session.");
      }
    })
    .catch((err) => {
      console.error("Error authenticating session:", err);
      res.status(500).send("Error authenticating session.");
    });
});

export const registerCommands = async (
  clientId: string,
  guildId: string,
  token: string
): Promise<void> => {
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
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
  } catch (error) {
    console.error("Error registering commands:", error);
  }
};

export default app;
