"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const ornament_controller_1 = require("./controllers/ornament.controller");
const discord_service_1 = require("./services/discord.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3000;
// Middleware
app.use(express_1.default.json({ limit: "10mb" }));
// app.use((0, cors_1.default)({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
// }));
// Routes
app.post("/api/save-ornament", ornament_controller_1.saveOrnament);
app.get("/api/get-ornaments", ornament_controller_1.getOrnaments);
// Discord Bot Setup
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
client.once("clientReady", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});
(0, discord_service_1.registerCommands)(clientId, guildId, token);
client.login(token);
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand())
        return;
    const { commandName } = interaction;
    if (commandName === "bombka") {
        const guildMember = interaction.member; // Get the guild member object
        const serverUsername = guildMember && "displayName" in guildMember
            ? guildMember.displayName
            : interaction.user.username; // Use server nickname if available
        const sessionId = require("uuid").v4(); // Generate a unique session ID
        const sessionsPath = path_1.default.join(__dirname, "../../data/sessions.json");
        const sessions = await fs_extra_1.default.readJson(sessionsPath).catch(() => ({}));
        // Update the session ID for the user
        sessions[serverUsername] = { sessionId };
        // Write the updated sessions back to the file
        await fs_extra_1.default.writeJson(sessionsPath, sessions);
        const link = `https://gorasul.pl/bombka/${encodeURIComponent(serverUsername)}/${sessionId}`;
        await interaction.reply({
            content: `🎨 Link do twojej sesji generatora: ${link}`,
            ephemeral: true, // Make the reply visible only to the user
        });
    }
    if (commandName === "tree") {
        await interaction.deferReply();
        try {
            const imageBuffer = Buffer.from("..."); // Replace with actual image data
            const attachment = new discord_js_1.AttachmentBuilder(imageBuffer, {
                name: "christmas-tree.png",
            });
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("🎄 Current Christmas Tree 🎄")
                .setImage("attachment://christmas-tree.png")
                .setColor(0x2ecc40)
                .setTimestamp();
            await interaction.editReply({
                embeds: [embed],
                files: [attachment],
            });
        }
        catch (error) {
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
});
