// Main Discord Bot Entry Point
// File: index.js

// Load environment variables first
require("dotenv").config();

const { DiscordBotFramework, UtilityPlugin } = require("./discord-framework");

// Import plugins
const ModerationPlugin = require("./plugins/moderation");
const ServerStatsPlugin = require("./plugins/serverstats");

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
    console.log("📦 Loading plugins...");

    // Load built-in utility plugin
    const utilityPlugin = new UtilityPlugin(bot);
    bot.plugins.set(utilityPlugin.name, utilityPlugin);
    console.log(`✅ Loaded plugin: ${utilityPlugin.name}`);

    // Load moderation plugin
    const moderationPlugin = new ModerationPlugin(bot);
    await moderationPlugin.initialize();
    bot.plugins.set(moderationPlugin.name, moderationPlugin);

    // Register moderation commands
    moderationPlugin.commands.forEach((cmd) => {
      bot.commands.set(cmd.name, { ...cmd, plugin: moderationPlugin.name });
    });

    // Register moderation events
    moderationPlugin.events.forEach((event) => {
      bot.events.set(`${moderationPlugin.name}_${event.name}`, event);
      bot.client.on(event.name, event.handler.bind(moderationPlugin));
    });
    console.log(
      `✅ Loaded plugin: ${moderationPlugin.name} (${moderationPlugin.commands.length} commands)`
    );

    // Load server stats plugin
    const serverStatsPlugin = new ServerStatsPlugin(bot);
    await serverStatsPlugin.initialize();
    bot.plugins.set(serverStatsPlugin.name, serverStatsPlugin);

    // Register server stats commands
    serverStatsPlugin.commands.forEach((cmd) => {
      bot.commands.set(cmd.name, { ...cmd, plugin: serverStatsPlugin.name });
    });

    // Register server stats events
    serverStatsPlugin.events.forEach((event) => {
      bot.events.set(`${serverStatsPlugin.name}_${event.name}`, event);
      bot.client.on(event.name, event.handler.bind(serverStatsPlugin));
    });
    console.log(
      `✅ Loaded plugin: ${serverStatsPlugin.name} (${serverStatsPlugin.commands.length} commands)`
    );

    console.log(
      `✅ All plugins loaded successfully! Total: ${bot.plugins.size} plugins, ${bot.commands.size} commands`
    );
  } catch (error) {
    console.error("❌ Failed to load plugins:", error);
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

    // Load plugins
    await loadPlugins();

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
