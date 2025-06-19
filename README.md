# 🧠 Mentat-Bot - Advanced Discord Bot Framework

A powerful, modular Discord bot framework with an intelligent web-based management interface, comprehensive plugin system, and advanced moderation capabilities.

---

## ✨ Features

### 🎯 **Core Bot Features**

- **🛡️ Advanced Moderation System** - Kick, ban, mute, warn users with comprehensive logging
- **📊 Server Statistics & Analytics** - Detailed server info, user profiles, and real-time metrics
- **🔌 Hot-Swappable Plugin System** - Add/remove functionality without restarting
- **🎨 Dynamic Theme Support** - 5 beautiful themes that sync across Discord embeds and web UI
- **⚡ Real-time Monitoring** - Live status updates and performance metrics
- **🔒 Advanced Permission System** - Role-based command access with security checks

### 🌐 **Web Management Interface**

- **📱 Modern Responsive Design** - Glass morphism UI with smooth animations
- **⚙️ Live Configuration Editor** - Change bot settings instantly through web interface
- **🔧 Plugin Management Dashboard** - Enable/disable plugins with one click
- **📈 Real-time Statistics** - Monitor bot performance, server stats, and user activity
- **🎨 Theme Customization** - Preview and switch themes with live updates
- **📊 Analytics Dashboard** - Track commands, user joins/leaves, and bot uptime

### 🛡️ **Moderation Commands**

- **User Management**: `!kick`, `!ban`, `!mute`, `!unmute`, `!warn`
- **Message Management**: `!clear` (bulk delete with safety checks)
- **Warning System**: Track user warnings with persistent storage
- **Auto-logging**: All moderation actions logged with timestamps and reasons
- **DM Notifications**: Users receive notifications when moderated
- **Permission Validation**: Automatic permission checks for all moderation actions

### 📊 **Server Analytics Commands**

- **Server Overview**: `!serverinfo` - Complete server statistics and information
- **User Profiles**: `!userinfo` - Detailed user information with join dates and roles
- **Bot Statistics**: `!stats` - System performance, memory usage, and uptime
- **Live Metrics**: `!membercount` - Real-time member counts and status breakdown
- **Channel Analysis**: `!channelinfo` - Detailed channel information and settings
- **Role Management**: `!roleinfo` - Role information with member lists and permissions

### 🔧 **Utility Commands**

- **System Status**: `!ping` - Check bot latency and response time
- **Help System**: `!help` - Dynamic command listing with descriptions
- **Bot Information**: `!info` - Framework version and configuration details

### 🏗️ **Technical Features**

- **Node.js 16+** - Modern JavaScript with async/await support
- **Discord.js v14** - Latest Discord API features and performance
- **Express.js Web Server** - RESTful API with comprehensive error handling
- **Modular Architecture** - Easy to extend and customize
- **Hot Plugin Reloading** - Update functionality without downtime
- **Comprehensive Error Handling** - Graceful failure recovery
- **Environment Configuration** - Support for .env files and environment variables
- **Cross-Platform Support** - Works on Windows, macOS, and Linux

---

## 🚀 Complete Setup Guide

### Prerequisites

Before starting, ensure you have:

- **Node.js 16.0.0 or higher** ([Download here](https://nodejs.org/))
- **A Discord account** and basic understanding of Discord servers
- **Basic command line knowledge**
- **Text editor** (VS Code recommended)

### Step 1: Discord Bot Setup

1. **Create Discord Application**

   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Name it "Mentat-Bot" (or your preferred name)
   - Click "Create"

2. **Create Bot User**

   - Go to the "Bot" section in left sidebar
   - Click "Add Bot" → "Yes, do it!"
   - **Copy the bot token** (keep this secret!)
   - Under "Privileged Gateway Intents", enable:
     - ✅ Server Members Intent
     - ✅ Message Content Intent

3. **Set Bot Permissions**
   - Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`
   - Select bot permissions:
     ```
     ✅ View Channels
     ✅ Send Messages
     ✅ Embed Links
     ✅ Read Message History
     ✅ Kick Members
     ✅ Ban Members
     ✅ Manage Messages
     ✅ Moderate Members
     ✅ Manage Roles
     ```
   - Copy the generated URL and use it to invite your bot to your server

### Step 2: Project Setup

1. **Create Project Directory**

   ```bash
   mkdir mentat-bot
   cd mentat-bot
   ```

2. **Initialize Node.js Project**

   ```bash
   npm init -y
   ```

3. **Install Dependencies**

   ```bash
   npm install discord.js@latest express
   npm install --save-dev nodemon
   ```

4. **Create Directory Structure**
   ```bash
   mkdir plugins
   mkdir web
   ```

Your directory should look like:

```
mentat-bot/
├── package.json
├── plugins/
└── web/
```

### Step 3: Download Framework Files

Create these files in your project directory:

1. **Main Framework** (`discord-framework.js`)

   - Copy the framework code from the first artifact

2. **Main Bot File** (`index.js`)

   - Copy the main bot code from the updated index.js artifact

3. **Web Interface** (`web/index.html`)

   - Copy the web UI code from the HTML artifact

4. **Moderation Plugin** (`plugins/moderation.js`)

   - Copy the moderation plugin code

5. **ServerStats Plugin** (`plugins/serverstats.js`)
   - Copy the server stats plugin code

### Step 4: Configuration

1. **Create Environment File**

   Create a `.env` file in your project root:

   ```bash
   touch .env
   ```

   Add your configuration to `.env`:

   ```env
   # Discord Bot Configuration
   DISCORD_TOKEN=your_actual_bot_token_here
   PREFIX=!
   PORT=3000
   THEME=blue

   # Optional Settings
   NODE_ENV=development
   PLUGINS_PATH=./plugins
   CONFIG_PATH=./config.json
   ```

2. **Install Environment Support**

   ```bash
   npm install dotenv
   ```

3. **Update Main Bot File**

   Add this line to the top of `index.js` (after the requires):

   ```javascript
   require("dotenv").config();
   ```

4. **Create Example Environment File**

   Create `.env.example` for documentation (safe to commit):

   ```bash
   cp .env .env.example
   ```

   Then edit `.env.example` to remove your actual token:

   ```env
   # Discord Bot Configuration
   DISCORD_TOKEN=your_bot_token_here
   PREFIX=!
   PORT=3000
   THEME=blue

   # Optional Settings
   NODE_ENV=development
   PLUGINS_PATH=./plugins
   CONFIG_PATH=./config.json
   ```

5. **Update package.json Scripts**
   ```json
   {
     "scripts": {
       "start": "node index.js",
       "dev": "nodemon index.js",
       "test": "node index.js"
     },
     "dependencies": {
       "discord.js": "^14.14.1",
       "express": "^4.18.2",
       "dotenv": "^16.3.1"
     }
   }
   ```

### Step 5: First Run

1. **Start the Bot**

   ```bash
   npm start
   ```

   Or for development with auto-restart:

   ```bash
   npm run dev
   ```

2. **Check for Success Messages**
   You should see:

   ```
   🚀 Starting Mentat-Bot Framework...
   🌐 Web server started on http://localhost:3000
   📊 Dashboard: http://localhost:3000
   📦 Loading plugins...
   ✅ Loaded plugin: Utility
   ✅ Loaded plugin: Moderation (6 commands)
   ✅ Loaded plugin: ServerStats (6 commands)
   ✅ All plugins loaded successfully! Total: 3 plugins, 14 commands
   🔌 Connecting to Discord...
   🤖 Bot is ready! Logged in as YourBotName#1234
   🎉 Mentat-Bot framework is fully ready!
   ```

   **If you see a token warning:**

   ```
   ⚠️  No Discord token provided. Web interface will work but bot won't connect to Discord.
   ```

   Check that your `.env` file has the correct `DISCORD_TOKEN` value.

3. **Access Web Interface**
   - Open browser to `http://localhost:3000`
   - You should see the Mentat-Bot dashboard

### Step 6: Test Commands

In your Discord server, test these commands:

**Basic Commands:**

```
!ping          # Check bot response
!help          # List all commands
!info          # Bot information
```

**Moderation Commands:**

```
!serverinfo    # Server statistics
!userinfo      # Your user information
!membercount   # Current member count
```

**Admin Commands** (requires permissions):

```
!kick @user reason here
!clear 5
!warn @user Please follow rules
```

### Step 7: Web Interface Tour

1. **Dashboard Tab**

   - View real-time bot statistics
   - Monitor server count, users, plugins
   - Check bot online status

2. **Configuration Tab**

   - Change command prefix
   - Modify web server port
   - Select theme
   - Update plugins directory

3. **Plugins Tab**

   - View all loaded plugins
   - Enable/disable plugins with toggle switches
   - See plugin descriptions and command counts

4. **Themes Tab**
   - Preview available themes
   - See color schemes
   - Test theme changes live

---

## 🔧 Advanced Configuration

### Environment Variables

Create `.env` file for secure configuration:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
PREFIX=!
PORT=3000
THEME=blue

# Optional Settings
NODE_ENV=production
LOG_LEVEL=info
```

### Custom Themes

Add custom themes by modifying the CSS variables in `web/index.html`:

```css
[data-theme="custom"] {
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
  --accent-color: #45b7d1;
}
```

### Production Deployment

1. **Using PM2 (Recommended)**

   ```bash
   npm install -g pm2
   pm2 start index.js --name "mentat-bot"
   pm2 startup
   pm2 save
   ```

2. **Using Docker**

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Database Integration (Optional)

For persistent data storage, add database support:

```bash
npm install sqlite3
# or
npm install mongodb
# or
npm install mysql2
```

Example SQLite integration in plugins:

```javascript
const sqlite3 = require("sqlite3").verbose();

class DatabasePlugin extends BasePlugin {
  async initialize() {
    this.db = new sqlite3.Database("./bot.db");
    await this.createTables();
  }

  async createTables() {
    this.db.run(`
            CREATE TABLE IF NOT EXISTS warnings (
                id INTEGER PRIMARY KEY,
                user_id TEXT,
                guild_id TEXT,
                reason TEXT,
                moderator TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
  }
}
```

---

## 🔌 Creating Custom Plugins

### Basic Plugin Structure

```javascript
const { BasePlugin } = require("../discord-framework");

class MyCustomPlugin extends BasePlugin {
  constructor(framework) {
    super(framework);
    this.name = "MyCustomPlugin";
    this.version = "1.0.0";
    this.description = "Description of what this plugin does";

    this.commands = [
      {
        name: "mycommand",
        description: "My custom command",
        execute: this.myCommand.bind(this),
      },
    ];

    this.events = [
      {
        name: "messageCreate",
        handler: this.onMessage.bind(this),
      },
    ];
  }

  async initialize() {
    this.log("My plugin initialized!");
    // Setup code here
  }

  async myCommand(message, args) {
    const embed = this.framework.createEmbed({
      title: "✨ My Custom Command",
      description: "Hello from my custom plugin!",
      fields: [
        { name: "Arguments", value: args.join(" ") || "None", inline: true },
      ],
    });

    message.reply({ embeds: [embed] });
  }

  onMessage(message) {
    if (message.author.bot) return;
    this.log(`Message from ${message.author.tag}: ${message.content}`);
  }

  async cleanup() {
    this.log("Plugin cleanup completed");
  }
}

module.exports = MyCustomPlugin;
```

### Plugin Features Available

- **this.framework.createEmbed(options)** - Create themed embeds
- **this.framework.client** - Access Discord.js client
- **this.framework.config** - Access bot configuration
- **this.log(message)** - Plugin logging
- **this.error(message)** - Error logging

### Adding Your Plugin

1. Create your plugin file in `plugins/` directory
2. Add to main bot file:

   ```javascript
   const MyCustomPlugin = require("./plugins/mycustomplugin");

   // In loadPlugins function:
   const myPlugin = new MyCustomPlugin(bot);
   await myPlugin.initialize();
   bot.plugins.set(myPlugin.name, myPlugin);
   ```

---

## 🛠️ Troubleshooting

### Common Issues

**Bot Won't Start**

```bash
# Check Node.js version
node --version  # Should be 16+

# Check dependencies
npm list discord.js express

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**404 Errors in Web Interface**

```bash
# Check if web server is running
curl http://localhost:3000/api/health

# Check file structure
ls -la discord-framework.js index.js
ls -la plugins/
ls -la web/
```

**Discord Connection Issues**

- Verify bot token is correct in `.env` file
- Check bot permissions in Discord server
- Ensure intents are enabled in Discord Developer Portal
- Make sure `.env` file is in the same directory as `index.js`

**Commands Not Working**

- Check bot has necessary permissions
- Verify command prefix in configuration
- Check console for error messages

**Web Interface Not Loading**

- Check if port 3000 is available: `lsof -i :3000`
- Try different port in configuration
- Check firewall settings

### Debug Mode

Enable detailed logging:

```javascript
// Add to top of index.js
process.env.DEBUG = "*";
```

### Getting Help

1. **Check Console Output** - Look for error messages and warnings
2. **Verify File Structure** - Ensure all files are in correct locations
3. **Test Components** - Test web server and Discord connection separately
4. **Check Permissions** - Verify bot has required Discord permissions
5. **Review Configuration** - Double-check all configuration values

---

## 📚 API Reference

### Web API Endpoints

| Endpoint                    | Method | Description               |
| --------------------------- | ------ | ------------------------- |
| `/api/health`               | GET    | Health check              |
| `/api/status`               | GET    | Bot status and statistics |
| `/api/config`               | GET    | Current configuration     |
| `/api/config`               | POST   | Update configuration      |
| `/api/plugins`              | GET    | List all plugins          |
| `/api/plugins/:name/toggle` | POST   | Enable/disable plugin     |
| `/api/themes`               | GET    | Available themes          |

### Framework Methods

```javascript
// Create themed embeds
bot.createEmbed({
  title: "Title",
  description: "Description",
  fields: [{ name: "Field", value: "Value", inline: true }],
});

// Plugin management
bot.plugins.get("PluginName");
bot.loadPlugin("filename.js");
bot.unloadPlugin("PluginName");

// Command registration
bot.commands.set("commandname", commandObject);
```

---

## 📊 Performance & Scaling

### Memory Usage

- **Base Framework**: ~30-50MB
- **Per Plugin**: ~5-10MB
- **Discord.js Client**: ~50-100MB
- **Web Server**: ~10-20MB

### Recommended Limits

- **Small Server** (< 1k members): All features enabled
- **Medium Server** (1k-10k members): Monitor memory usage
- **Large Server** (10k+ members): Consider database for warnings/logs

### Performance Tips

1. **Use PM2** for process management
2. **Enable gzip** compression for web interface
3. **Implement database** for persistent data storage
4. **Monitor memory usage** with `!stats` command
5. **Regular restarts** for long-running instances

---

## 🤝 Contributing

### Development Setup

```bash
git clone your-repo
cd mentat-bot
npm install
npm run dev
```

### Plugin Contribution Guidelines

1. Follow BasePlugin structure
2. Include comprehensive error handling
3. Add proper documentation
4. Test with different Discord servers
5. Ensure no security vulnerabilities

### Code Style

- Use async/await for promises
- Include JSDoc comments for functions
- Follow Discord.js best practices
- Use descriptive variable names

---

## 📄 License

MIT License - Feel free to use this framework for personal or commercial projects.

---

## 🙏 Acknowledgments

- **Discord.js** - Powerful Discord API library
- **Express.js** - Fast web framework
- **Node.js** - JavaScript runtime
- **Discord Developer Community** - Inspiration and support

---

## 🔮 Roadmap

### Upcoming Features

- [ ] Slash Commands Support
- [ ] Database Integration Helpers
- [ ] Plugin Marketplace
- [ ] Advanced Analytics Dashboard
- [ ] Multi-language Support
- [ ] Voice Channel Features
- [ ] External API Integrations
- [ ] Mobile App Companion

### Version History

- **v1.0.0** - Initial release with core framework
- **v1.1.0** - Added moderation and stats plugins
- **v1.2.0** - Modern UI redesign as Mentat-Bot

---

**Happy botting! 🧠🤖**

_Built with ❤️ for the Discord community_
