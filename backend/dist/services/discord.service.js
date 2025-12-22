"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBombkaCommand = exports.registerCommands = void 0;
const discord_js_1 = require("discord.js");
const url_1 = require("url");
const uuid_1 = require("uuid"); // Import UUID for sessionId generation
// Function to generate a link with userId and sessionId
const generateLink = (userId, sessionId) => {
    const baseUrl = "https://example.com/painting"; // Replace with your actual base URL
    const url = new url_1.URL(baseUrl);
    url.pathname += `/${userId}/${sessionId}`;
    return url.toString();
};
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
                    name: "my-ornament",
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
const handleBombkaCommand = (interaction) => {
    const userId = interaction.user.id;
    const sessionId = (0, uuid_1.v4)();
    const link = generateLink(userId, sessionId);
    interaction.reply({
        content: `Here is your link: ${link}`,
        ephemeral: true,
    });
};
exports.handleBombkaCommand = handleBombkaCommand;
