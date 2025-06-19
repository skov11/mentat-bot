// Discord Bot Framework
// A modular framework for Discord bots with plugin system, configuration UI, and themes

const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
  ActivityType,
} = require("discord.js");
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const EventEmitter = require("events");

// Core Framework Class
class DiscordBotFramework extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      token: config.token || process.env.DISCORD_TOKEN,
      prefix: config.prefix || "!",
      port: config.port || 3000,
      theme: config.theme || "default",
      pluginsPath: config.pluginsPath || "./plugins",
      configPath: config.configPath || "./config.json",
      ...config,
    };

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    this.plugins = new Collection();
    this.commands = new Collection();
    this.events = new Collection();
    this.app = express();
    this.isReady = false;

    this.setupExpress();
    this.setupDiscordEvents();
  }

  // Initialize the framework
  async initialize() {
    try {
      await this.loadConfig();
      await this.loadPlugins();
      await this.client.login(this.config.token);
      this.startWebServer();

      console.log("✅ Discord Bot Framework initialized successfully!");
      this.emit("ready");
    } catch (error) {
      console.error("❌ Failed to initialize framework:", error);
      this.emit("error", error);
    }
  }

  // Load configuration from file
  async loadConfig() {
    try {
      const configData = await fs.readFile(this.config.configPath, "utf8");
      const fileConfig = JSON.parse(configData);
      this.config = { ...this.config, ...fileConfig };
    } catch (error) {
      console.log("📝 Creating default configuration file...");
      await this.saveConfig();
    }
  }

  // Save configuration to file
  async saveConfig() {
    try {
      await fs.writeFile(
        this.config.configPath,
        JSON.stringify(this.config, null, 2)
      );
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  }

  // Load all plugins
  async loadPlugins() {
    try {
      // Check if plugins directory exists
      try {
        await fs.access(this.config.pluginsPath);
      } catch (error) {
        console.log(
          `📂 Plugins directory '${this.config.pluginsPath}' not found, skipping auto-load`
        );
        return;
      }

      const pluginFiles = await fs.readdir(this.config.pluginsPath);
      const jsFiles = pluginFiles.filter((file) => file.endsWith(".js"));

      if (jsFiles.length === 0) {
        console.log("📦 No plugin files found in plugins directory");
        return;
      }

      for (const file of jsFiles) {
        await this.loadPlugin(file);
      }

      console.log(`📦 Auto-loaded ${this.plugins.size} plugins from directory`);
    } catch (error) {
      console.error("Failed to load plugins from directory:", error.message);
    }
  }

  // Load individual plugin
  async loadPlugin(filename) {
    try {
      const pluginPath = path.resolve(this.config.pluginsPath, filename);

      // Check if file exists
      try {
        await fs.access(pluginPath);
      } catch (error) {
        throw new Error(`Plugin file not found: ${pluginPath}`);
      }

      // Clear require cache to allow hot reloading
      delete require.cache[pluginPath];

      const PluginClass = require(pluginPath);
      const plugin = new PluginClass(this);

      // Validate plugin
      if (!plugin.name || !plugin.version) {
        throw new Error("Plugin must have name and version properties");
      }

      // Register plugin commands
      if (plugin.commands) {
        plugin.commands.forEach((cmd) => {
          this.commands.set(cmd.name, { ...cmd, plugin: plugin.name });
        });
      }

      // Register plugin events
      if (plugin.events) {
        plugin.events.forEach((event) => {
          this.events.set(`${plugin.name}_${event.name}`, event);
          this.client.on(event.name, event.handler.bind(plugin));
        });
      }

      // Initialize plugin
      if (plugin.initialize) {
        await plugin.initialize();
      }

      this.plugins.set(plugin.name, plugin);
      console.log(`✅ Loaded plugin: ${plugin.name} v${plugin.version}`);
    } catch (error) {
      console.error(`❌ Failed to load plugin ${filename}:`, error.message);
    }
  }

  // Unload plugin
  async unloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return false;

    // Remove commands
    this.commands.forEach((cmd, name) => {
      if (cmd.plugin === pluginName) {
        this.commands.delete(name);
      }
    });

    // Remove events
    this.events.forEach((event, key) => {
      if (key.startsWith(`${pluginName}_`)) {
        this.client.removeListener(event.name, event.handler);
        this.events.delete(key);
      }
    });

    // Cleanup plugin
    if (plugin.cleanup) {
      await plugin.cleanup();
    }

    this.plugins.delete(pluginName);
    return true;
  }

  // Setup Discord client events
  setupDiscordEvents() {
    this.client.once("ready", () => {
      console.log(`🤖 Bot is ready! Logged in as ${this.client.user.tag}`);
      this.client.user.setActivity("Framework Running", {
        type: ActivityType.Watching,
      });
      this.isReady = true;
    });

    this.client.on("messageCreate", async (message) => {
      if (message.author.bot || !message.content.startsWith(this.config.prefix))
        return;

      const args = message.content
        .slice(this.config.prefix.length)
        .trim()
        .split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = this.commands.get(commandName);
      if (!command) return;

      try {
        const plugin = this.plugins.get(command.plugin);
        await command.execute(message, args, this, plugin);
      } catch (error) {
        console.error("Command execution error:", error);
        message.reply("An error occurred while executing this command.");
      }
    });
  }

  // Setup Express server
  setupExpress() {
    // Basic middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Add CORS headers for development
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    // Health check endpoint (simple route first)
    this.app.get("/api/health", (req, res) => {
      res.json({ status: "ok", timestamp: Date.now() });
    });

    // API Routes with error handling
    this.app.get("/api/status", (req, res) => {
      try {
        const statusData = {
          status: this.isReady ? "online" : "offline",
          guilds: this.client.guilds ? this.client.guilds.cache.size : 0,
          users: this.client.users ? this.client.users.cache.size : 0,
          plugins: this.plugins.size,
          commands: this.commands.size,
          uptime: this.client.uptime || 0,
          timestamp: Date.now(),
        };
        res.json(statusData);
      } catch (error) {
        console.error("Status API error:", error);
        res
          .status(500)
          .json({ error: "Failed to get status", details: error.message });
      }
    });

    this.app.get("/api/config", (req, res) => {
      try {
        const safeConfig = { ...this.config };
        delete safeConfig.token; // Don't expose token
        res.json(safeConfig);
      } catch (error) {
        console.error("Config API error:", error);
        res
          .status(500)
          .json({ error: "Failed to get config", details: error.message });
      }
    });

    this.app.post("/api/config", async (req, res) => {
      try {
        const newConfig = { ...this.config, ...req.body };
        delete newConfig.token; // Prevent token changes via API

        // Validate config
        if (newConfig.port && (newConfig.port < 1 || newConfig.port > 65535)) {
          return res.status(400).json({ error: "Invalid port number" });
        }

        this.config = newConfig;
        await this.saveConfig();
        res.json({ success: true, config: newConfig });
      } catch (error) {
        console.error("Config save API error:", error);
        res
          .status(500)
          .json({ error: "Failed to save config", details: error.message });
      }
    });

    this.app.get("/api/plugins", (req, res) => {
      try {
        const pluginData = Array.from(this.plugins.values()).map((plugin) => ({
          name: plugin.name,
          version: plugin.version,
          description: plugin.description || "No description",
          enabled: plugin.enabled !== false,
          commands: plugin.commands ? plugin.commands.length : 0,
          events: plugin.events ? plugin.events.length : 0,
        }));
        res.json(pluginData);
      } catch (error) {
        console.error("Plugins API error:", error);
        res
          .status(500)
          .json({ error: "Failed to get plugins", details: error.message });
      }
    });

    this.app.post("/api/plugins/:pluginName/toggle", async (req, res) => {
      try {
        const pluginName = req.params.pluginName;
        const plugin = this.plugins.get(pluginName);

        if (!plugin) {
          return res.status(404).json({ error: "Plugin not found" });
        }

        plugin.enabled = !plugin.enabled;
        res.json({ enabled: plugin.enabled, name: pluginName });
      } catch (error) {
        console.error("Plugin toggle API error:", error);
        res
          .status(500)
          .json({ error: "Failed to toggle plugin", details: error.message });
      }
    });

    this.app.get("/api/commands", (req, res) => {
      try {
        const commandData = Array.from(this.commands.values()).map(
          (command) => ({
            name: command.name,
            description: command.description || "No description",
            plugin: command.plugin || "Unknown",
          })
        );
        res.json(commandData);
      } catch (error) {
        console.error("Commands API error:", error);
        res
          .status(500)
          .json({ error: "Failed to get commands", details: error.message });
      }
    });

    this.app.post("/api/plugins/:pluginName/config", async (req, res) => {
      try {
        const pluginName = req.params.pluginName;
        const plugin = this.plugins.get(pluginName);

        if (!plugin) {
          return res.status(404).json({ error: "Plugin not found" });
        }

        // Store plugin configuration
        if (!plugin.config) {
          plugin.config = {};
        }

        // Update plugin config with new values
        Object.assign(plugin.config, req.body);

        // Call plugin's config update method if it exists
        if (typeof plugin.updateConfig === "function") {
          await plugin.updateConfig(plugin.config);
        }

        // Save to main config file
        if (!this.config.plugins) {
          this.config.plugins = {};
        }
        this.config.plugins[pluginName] = plugin.config;
        await this.saveConfig();

        res.json({ success: true, config: plugin.config });
      } catch (error) {
        console.error("Plugin config API error:", error);
        res.status(500).json({
          error: "Failed to save plugin config",
          details: error.message,
        });
      }
    });

    this.app.get("/api/plugins/:pluginName/config", (req, res) => {
      try {
        const pluginName = req.params.pluginName;
        const plugin = this.plugins.get(pluginName);

        if (!plugin) {
          return res.status(404).json({ error: "Plugin not found" });
        }

        const config = plugin.config || {};
        res.json(config);
      } catch (error) {
        console.error("Plugin config get API error:", error);
        res.status(500).json({
          error: "Failed to get plugin config",
          details: error.message,
        });
      }
    });

    this.app.get("/api/themes", (req, res) => {
      try {
        const themes = ["default", "atreides", "harkonnen"];
        res.json(themes);
      } catch (error) {
        console.error("Themes API error:", error);
        res
          .status(500)
          .json({ error: "Failed to get themes", details: error.message });
      }
    });

    // Serve the main UI
    this.app.get("/", (req, res) => {
      try {
        res.sendFile(path.join(__dirname, "web", "index.html"));
      } catch (error) {
        console.error("Error serving main UI:", error);
        res.status(500).send("Error loading web interface");
      }
    });

    // Static files (put this after API routes to avoid conflicts)
    this.app.use(express.static(path.join(__dirname, "web")));

    // 404 handler for API routes
    this.app.use("/api/*", (req, res) => {
      res.status(404).json({ error: "API endpoint not found", path: req.path });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error("Express error:", error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    });
  }

  // Start web server
  startWebServer() {
    this.app.listen(this.config.port, () => {
      console.log(
        `🌐 Web interface available at http://localhost:${this.config.port}`
      );
    });
  }

  // Create embed with theme colors
  createEmbed(options = {}) {
    const themeColors = {
      default: 0x5865f2,
      atreides: 0x1e40af, // House Atreides blue
      harkonnen: 0xdc2626, // House Harkonnen red
    };

    const embed = new EmbedBuilder()
      .setColor(themeColors[this.config.theme] || themeColors.default)
      .setTimestamp();

    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.fields) embed.addFields(options.fields);
    if (options.footer) embed.setFooter(options.footer);

    return embed;
  }
}

// Base Plugin Class
class BasePlugin {
  constructor(framework) {
    this.framework = framework;
    this.name = "BasePlugin";
    this.version = "1.0.0";
    this.description = "Base plugin class";
    this.enabled = true;
    this.commands = [];
    this.events = [];
    this.config = {};
  }

  async initialize() {
    // Load plugin config if it exists
    if (
      this.framework.config.plugins &&
      this.framework.config.plugins[this.name]
    ) {
      this.config = this.framework.config.plugins[this.name];
    }
    // Override in plugins
  }

  async cleanup() {
    // Override in plugins
  }

  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log(`Configuration updated: ${JSON.stringify(newConfig)}`);
    // Override in plugins for custom config handling
  }

  getConfig(key, defaultValue = null) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  setConfig(key, value) {
    this.config[key] = value;
  }

  log(message) {
    console.log(`[${this.name}] ${message}`);
  }

  error(message) {
    console.error(`[${this.name}] ${message}`);
  }
}

// Example Plugin: Utility Commands
class UtilityPlugin extends BasePlugin {
  constructor(framework) {
    super(framework);
    this.name = "Utility";
    this.version = "1.0.0";
    this.description = "Basic utility commands";

    this.commands = [
      {
        name: "ping",
        description: "Check bot latency",
        execute: this.pingCommand.bind(this),
      },
      {
        name: "help",
        description: "Show available commands",
        execute: this.helpCommand.bind(this),
      },
      {
        name: "info",
        description: "Bot information",
        execute: this.infoCommand.bind(this),
      },
    ];
  }

  async pingCommand(message) {
    const embed = this.framework.createEmbed({
      title: "🏓 Pong!",
      description: `Latency: ${
        Date.now() - message.createdTimestamp
      }ms\nAPI Latency: ${this.framework.client.ws.ping}ms`,
    });
    message.reply({ embeds: [embed] });
  }

  async helpCommand(message) {
    const commands = Array.from(this.framework.commands.values());
    const commandList = commands
      .map(
        (cmd) =>
          `\`${this.framework.config.prefix}${cmd.name}\` - ${cmd.description}`
      )
      .join("\n");

    const embed = this.framework.createEmbed({
      title: "📋 Available Commands",
      description: commandList || "No commands available",
    });
    message.reply({ embeds: [embed] });
  }

  async infoCommand(message) {
    const embed = this.framework.createEmbed({
      title: "🤖 Bot Information",
      fields: [
        { name: "Framework Version", value: "1.0.0", inline: true },
        {
          name: "Plugins Loaded",
          value: this.framework.plugins.size.toString(),
          inline: true,
        },
        {
          name: "Commands Available",
          value: this.framework.commands.size.toString(),
          inline: true,
        },
        {
          name: "Servers",
          value: this.framework.client.guilds.cache.size.toString(),
          inline: true,
        },
        {
          name: "Users",
          value: this.framework.client.users.cache.size.toString(),
          inline: true,
        },
        { name: "Theme", value: this.framework.config.theme, inline: true },
      ],
    });
    message.reply({ embeds: [embed] });
  }
}

// Export classes
module.exports = {
  DiscordBotFramework,
  BasePlugin,
  UtilityPlugin,
};
