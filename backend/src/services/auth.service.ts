import { REST, Routes } from "discord.js";
import express from "express";
import fs from "fs-extra";
import path from "path";

const dataDir = path.join(__dirname, "../../../data");
const sessionsPath = path.join(dataDir, "sessions.json");
const app = express();

app.use(express.json());

app.post("/api/authenticate-session", (req, res) => {
  const { username, sessionId } = req.body;

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
      ],
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
};

export default app;
