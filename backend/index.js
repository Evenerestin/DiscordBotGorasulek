require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  EmbedBuilder,
  AttachmentBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const config = require("./config.json");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from the frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// Serve static images
app.use("/images", express.static(path.join(__dirname, "images")));

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
fs.ensureDirSync(dataDir);

// Function to generate tree image
async function generateTreeImage() {
  try {
    const canvas = createCanvas(800, 1000);
    const ctx = canvas.getContext("2d");

    // Load base tree image
    const imagePath = path.join(__dirname, "images", "treebase.png");
    console.log(`Loading image from: ${imagePath}`);

    const treeImg = await loadImage(imagePath);
    ctx.drawImage(treeImg, 0, 0, canvas.width, canvas.height);

    return canvas.toBuffer();
  } catch (error) {
    console.error("Error generating tree image:", error);

    if (error.message.includes("Unsupported image type")) {
      console.error(
        "The image type is unsupported. Please ensure the file is a valid PNG or JPEG."
      );
    } else {
      console.error("An unexpected error occurred while loading the image.");
    }

    return null;
  }
}

// Endpoints
app.post("/api/save-painting", (req, res) => {
  const { userId, painting } = req.body;
  const ornamentsPath = path.join(dataDir, "ornaments.json");

  fs.readJson(ornamentsPath)
    .then((ornaments) => {
      ornaments[userId] = ornaments[userId] || [];
      ornaments[userId].push(painting);
      return fs.writeJson(ornamentsPath, ornaments);
    })
    .then(() => res.status(200).send("Painting saved successfully."))
    .catch((err) => res.status(500).send("Error saving painting."));
});

app.get("/api/tree", (req, res) => {
  const treePath = path.join(dataDir, "tree.json");

  fs.readJson(treePath)
    .then((tree) => res.status(200).json(tree))
    .catch(() => res.status(500).send("Error retrieving tree data."));
});

// Endpoint to save or override ornaments
app.post("/api/save-ornament", (req, res) => {
  const { username, sessionId, ornamentData } = req.body;
  const ornamentsPath = path.join(dataDir, "ornaments.json");
  const sessionsPath = path.join(dataDir, "sessions.json");

  // Read session data to validate username and sessionId
  fs.readJson(sessionsPath)
    .then((sessions) => {
      const session = sessions[username];

      if (!session || session.sessionId !== sessionId) {
        return res.status(403).send("Invalid username or session ID.");
      }

      // If valid, overwrite the ornament
      return fs.readJson(ornamentsPath).then((ornaments) => {
        ornaments[username] = [ornamentData]; // Replace the user's ornament data
        return fs.writeJson(ornamentsPath, ornaments);
      });
    })
    .then(() => res.status(200).send("Ornament saved successfully."))
    .catch((err) => {
      console.error("Error saving ornament:", err);
      res.status(500).send("Error saving ornament.");
    });
});

// Endpoint to authenticate session ID
app.post("/api/authenticate-session", (req, res) => {
  const { username, sessionId } = req.body;
  const sessionsPath = path.join(dataDir, "sessions.json");

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

// Discord Bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Register commands
const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

// Replace hardcoded values with environment variables
const rest = new REST({ version: "10" }).setToken(token);
(async () => {
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
    console.error(error);
  }
})();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "bombka") {
    const guildMember = interaction.member; // Get the guild member object
    const serverUsername = guildMember
      ? guildMember.displayName
      : interaction.user.username; // Use server nickname if available
    const sessionId = require("uuid").v4(); // Generate a unique session ID

    const link = `http://localhost:5173/bombka/${encodeURIComponent(
      serverUsername
    )}/${sessionId}`;

    await interaction.reply(`🎨 Your painting session link: ${link}`);
  } else if (commandName === "tree") {
    await interaction.deferReply();

    try {
      const imageBuffer = await generateTreeImage();
      if (!imageBuffer) {
        return await interaction.editReply("Error generating tree image.");
      }

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
      await interaction.editReply("Error generating tree image.");
    }
  } else if (commandName === "hang-ornament") {
    await interaction.reply("Feature coming soon!");
  } else if (commandName === "my-ornaments") {
    await interaction.reply("Feature coming soon!");
  }
});

client.on("ready", async () => {
  const guild = client.guilds.cache.get(config.guildId);
  let channel = guild.channels.cache.find((ch) => ch.name === "christmas-tree");

  if (!channel) {
    channel = await guild.channels.create({
      name: "christmas-tree", // Ensure the name field is explicitly set
      type: ChannelType.GuildText, // Use the correct ChannelType enum
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.SendMessages], // Updated to use PermissionsBitField.Flags
        },
      ],
    });
    console.log("Created 'christmas-tree' channel.");
  }

  setInterval(async () => {
    if (channel) {
      try {
        const imageBuffer = await generateTreeImage();
        if (!imageBuffer) {
          console.error("Failed to generate tree image.");
          return;
        }

        const messages = await channel.messages.fetch({ limit: 1 });
        const lastMessage = messages.first();

        const attachment = new AttachmentBuilder(imageBuffer, {
          name: "christmas-tree.png",
        });

        if (lastMessage) {
          await lastMessage.edit({
            content: "🎄 Current Christmas Tree 🎄",
            files: [attachment],
          });
        } else {
          await channel.send({
            content: "🎄 Current Christmas Tree 🎄",
            files: [attachment],
          });
        }
      } catch (error) {
        console.error("Error updating tree image:", error);
      }
    }
  }, 60000); // Update every 60 seconds
});

client.login(token);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
