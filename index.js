// Main Discord Bot Entry Point
// File: index.js

// Load environment variables first
require("dotenv").config();

const { DiscordBotFramework, UtilityPlugin } = require("./discord-framework");

// Bot configuration from environment variables
const botConfig = {
  token: process.env.DISCORD_TOKEN,
  prefix: process.env.PREFIX || "!",
  port: parseInt(process.env.PORT) || 3000,
  theme: process.env.THEME || "blue",
  pluginsPath: process.env.PLUGINS_PATH || "./plugins",
};

console.log("🚀 Starting Mentat-Bot Framework...");

// Initialize the framework
const bot = new DiscordBotFramework(botConfig);

// Event handlers for bot lifecycle
bot.on("ready", () => {
  console.log("🎉 Mentat-Bot framework is fully ready!");
  console.log(`📝 Configuration UI: http://localhost:${botConfig.port}`);
  console.log(
    `🔧 Loaded ${bot.plugins.size} plugins with ${bot.commands.size} commands`
  );
});

bot.on("error", (error) => {
  console.error("❌ Bot framework error:", error);
});

// Load plugins manually (they will also auto-load from plugins directory)
async function loadPlugins() {
  try {
    console.log("📦 Loading built-in plugins...");

    // Load built-in utility plugin
    const utilityPlugin = new UtilityPlugin(bot);
    bot.plugins.set(utilityPlugin.name, utilityPlugin);
    console.log(`✅ Loaded plugin: ${utilityPlugin.name}`);

    console.log(`✅ Built-in plugins loaded successfully!`);
  } catch (error) {
    console.error("❌ Failed to load built-in plugins:", error);
  }
}

// Enhanced command tracking
bot.client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(bot.config.prefix))
    return;

  const args = message.content
    .slice(bot.config.prefix.length)
    .trim()
    .split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Track command usage for stats
  const serverStatsPlugin = bot.plugins.get("ServerStats");
  if (serverStatsPlugin && serverStatsPlugin.stats) {
    serverStatsPlugin.stats.commandsExecuted++;
  }
});

// Start web server immediately
function startWebServer() {
  try {
    const server = bot.app.listen(botConfig.port, () => {
      console.log(
        `🌐 Web server started on http://localhost:${botConfig.port}`
      );
      console.log(`📊 Dashboard: http://localhost:${botConfig.port}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${botConfig.port} is already in use. Try a different port.`
        );
      } else {
        console.error("❌ Web server error:", error);
      }
    });

    return server;
  } catch (error) {
    console.error("❌ Failed to start web server:", error);
  }
}

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down Mentat-Bot gracefully...");

  try {
    // Cleanup all plugins
    for (const [name, plugin] of bot.plugins) {
      if (plugin.cleanup) {
        await plugin.cleanup();
        console.log(`✅ Cleaned up plugin: ${name}`);
      }
    }

    // Destroy Discord client
    if (bot.client) {
      bot.client.destroy();
      console.log("✅ Discord client destroyed");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
});

// Initialize the bot
async function startBot() {
  try {
    console.log("🔧 Initializing Mentat-Bot Framework...");

    // Start web server first (so UI is available even if Discord fails)
    startWebServer();

    // Load plugins manually first
    await loadPlugins();

    // Then auto-load from plugins directory
    await bot.loadPlugins();

    // Initialize Discord connection
    if (botConfig.token) {
      console.log("🔌 Connecting to Discord...");
      await bot.initialize();
    } else {
      console.log("⚠️  No Discord token provided in .env file.");
      console.log("   Create a .env file with DISCORD_TOKEN=your_token_here");
      console.log(
        "   Web interface will work but bot won't connect to Discord."
      );
      bot.isReady = false;
    }
  } catch (error) {
    console.error("💥 Failed to start bot:", error);
    console.log(
      "🌐 Web interface may still be available at http://localhost:" +
        botConfig.port
    );
  }
}

// Start the bot
startBot();
