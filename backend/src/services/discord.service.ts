import { REST, Routes } from "discord.js";

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
