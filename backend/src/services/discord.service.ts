import { REST, Routes } from "discord.js";
import { URL } from "url";
import { v4 as uuidv4 } from "uuid"; // Import UUID for sessionId generation

// Function to generate a link with userId and sessionId
const generateLink = (userId: string, sessionId: string): string => {
  const baseUrl = "https://example.com/painting"; // Replace with your actual base URL
  const url = new URL(baseUrl);
  url.pathname += `/${userId}/${sessionId}`;
  return url.toString();
};

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
          name: "my-ornament",
          description: "List your saved ornaments.",
        },
      ],
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
};

export const handleBombkaCommand = (interaction: any): void => {
  const userId = interaction.user.id;
  const sessionId = uuidv4();

  const link = generateLink(userId, sessionId);

  interaction.reply({
    content: `Here is your link: ${link}`,
    ephemeral: true,
  });
};
