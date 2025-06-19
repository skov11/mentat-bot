# Mentat-Bot Framework

A powerful, modular Discord bot framework with an intelligent web-based management interface, comprehensive plugin system, and advanced moderation capabilities.

## ✨ Features

- 🛡️ **Advanced Moderation System** - Kick, ban, mute, warn users with comprehensive logging
- 📊 **Server Statistics & Analytics** - Detailed server info, user profiles, and real-time metrics
- 🔌 **Hot-Swappable Plugin System** - Add/remove functionality without restarting
- 🎨 **Dynamic Theme Support** - 5 beautiful themes that sync across Discord embeds and web UI
- ⚡ **Real-time Monitoring** - Live status updates and performance metrics
- 🔒 **Advanced Permission System** - Role-based command access with security checks
- 📱 **Modern Responsive Design** - Glass morphism UI with smooth animations
- ⚙️ **Live Configuration Editor** - Change bot settings instantly through web interface
- 🔧 **Plugin Management Dashboard** - Enable/disable plugins with one click
- 📈 **Real-time Statistics** - Monitor bot performance, server stats, and user activity
- 🎨 **Theme Customization** - Preview and switch themes with live updates
- 📊 **Analytics Dashboard** - Track commands, user joins/leaves, and bot uptime
- 🔍 **User Verification System** - Screenshot-based verification with admin approval workflow

## 🎨 Default Theme: House Atreides

The framework now defaults to the **House Atreides** theme, featuring:

- Noble royal blue and gold color scheme
- Inspired by the Dune universe
- Professional and commanding appearance
- Perfect for serious Discord communities

## 🔌 Built-in Plugins

### Moderation Plugin

- **User Management**: `!kick`, `!ban`, `!mute`, `!unmute`, `!warn`
- **Message Management**: `!clear` (bulk delete with safety checks)
- **Warning System**: Track user warnings with persistent storage
- **Auto-logging**: All moderation actions logged with timestamps and reasons
- **DM Notifications**: Users receive notifications when moderated
- **Permission Validation**: Automatic permission checks for all moderation actions

### Server Statistics Plugin

- **Server Overview**: `!serverinfo` - Complete server statistics and information
- **User Profiles**: `!userinfo` - Detailed user information with join dates and roles
- **Bot Statistics**: `!stats` - System performance, memory usage, and uptime
- **Live Metrics**: `!membercount` - Real-time member counts and status breakdown
- **Channel Analysis**: `!channelinfo` - Detailed channel information and settings
- **Role Management**: `!roleinfo` - Role information with member lists and permissions

### Verification Plugin

_Based on [Zachdidit's Discord Verification Bot](https://github.com/Zachdidit/discord-verification-bot)_

- **Slash Commands**: `/verify` with screenshot, character name, and guild name submission
- **Admin Approval Workflow**: Verification requests sent to designated approval channel with approve/reject buttons
- **Role-based Permissions**: Only users with specified roles can approve verifications
- **Anti-Duplicate System**: Prevents users from submitting multiple verification requests
- **Comprehensive Logging**: All verification events logged to both file and Discord channel
- **DM Notifications**: Users receive notifications when their verification is approved or rejected
- **Auto-cleanup**: Expired verification requests are automatically removed
- **Status Tracking**: Users can check their verification status with `/verification-status`
- **Admin Dashboard**: Verification statistics and management tools

#### Verification Commands:

- `/verify` - Submit verification request with screenshot and details
- `/verification-setup` - Configure the verification system (Admin only)
- `/verification-status` - Check your verification status or view system statistics
- `/verification-logs` - View recent verification logs (Admin only)

### Utility Plugin

- **System Status**: `!ping` - Check bot latency and response time
- **Help System**: `!help` - Dynamic command listing with descriptions
- **Bot Information**: `!info` - Framework version and configuration details

## 🛠️ Technical Stack

- **Node.js 16+** - Modern JavaScript with async/await support
- **Discord.js v14** - Latest Discord API features and performance
- **Express.js Web Server** - RESTful API with comprehensive error handling
- **Modular Architecture** - Easy to extend and customize
- **Hot Plugin Reloading** - Update functionality without downtime
- **Comprehensive Error Handling** - Graceful failure recovery
- **Environment Configuration** - Support for .env files and environment variables
- **Cross-Platform Support** - Works on Windows, macOS, and Linux

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 16.0.0 or higher** ([Download here](https://nodejs.org/))
- A Discord account and basic understanding of Discord servers
- Basic command line knowledge
- Text editor (VS Code recommended)

## 🚀 Quick Start

### 1. Create Discord Application

- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Click "New Application"
- Name it "Mentat-Bot" (or your preferred name)
- Click "Create"

### 2. Create Bot User

- Go to the "Bot" section in left sidebar
- Click "Add Bot" → "Yes, do it!"
- Copy the bot token (keep this secret!)
- Under "Privileged Gateway Intents", enable:
  - ✅ Server Members Intent
  - ✅ Message Content Intent

### 3. Set Bot Permissions

- Go to "OAuth2" → "URL Generator"
- Select scopes: `bot`, `applications.commands`
- Select bot permissions:
  - ✅ View Channels
  - ✅ Send Messages
  - ✅ Embed Links
  - ✅ Read Message History
  - ✅ Kick Members
  - ✅ Ban Members
  - ✅ Manage Messages
  - ✅ Moderate Members
  - ✅ Manage Roles
  - ✅ Use Application Commands
- Copy the generated URL and use it to invite your bot to your server

### 4. Project Setup

```bash
# Create project directory
mkdir mentat-bot
cd mentat-bot

# Initialize Node.js project
npm init -y

# Install dependencies
npm install discord.js@latest express
npm install --save-dev nodemon

# Create directory structure
mkdir plugins
mkdir web
mkdir config
mkdir logs
```

### 5. Create Configuration Files

Create `.env` file:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_actual_bot_token_here
PREFIX=!
PORT=3000
THEME=atreides

# Optional Settings
NODE_ENV=development
PLUGINS_PATH=./plugins
CONFIG_PATH=./config.json
```

Create `package.json` scripts:

```json
{
  "scripts": {
    "start": "THEME=atreides node index.js",
    "dev": "THEME=atreides nodemon index.js",
    "test": "THEME=atreides node index.js"
  }
}
```

### 6. Install Environment Support

```bash
npm install dotenv
```

### 7. Start the Bot

```bash
npm start
# Or for development with auto-restart:
npm run dev
```

### 8. Setup Verification System (Optional)

1. Run `/verification-setup` in your Discord server (Admin only)
2. Configure verification channel, approval channel, verified role, and approver role
3. Users can now use `/verify` to submit verification requests
4. Administrators with the approver role can approve/reject requests

## 🌐 Web Interface

### Dashboard Features

- **Dashboard Tab**: View real-time bot statistics, monitor server count, users, plugins
- **Configuration Tab**: Change command prefix, modify web server port, select theme, update plugins directory
- **Plugins Tab**: View all loaded plugins, enable/disable plugins with toggle switches
- **Themes Tab**: Preview available themes, see color schemes, test theme changes live

### Accessing the Dashboard

1. Start the bot with `npm start`
2. Open browser to `http://localhost:3000`
3. Use the dashboard to monitor and configure your bot

## 🎨 Available Themes

- **House Atreides** (Default) - Noble royal blue and gold theme
- **Ocean Blue** - Cool blue theme with ocean vibes
- **Royal Purple** - Elegant purple theme with mystical vibes
- **Forest Green** - Natural green theme with earthy tones
- **Crimson Red** - Bold red theme with fiery accents

## 📦 Plugin Development

Create custom plugins using the BasePlugin class:

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
  }

  async initialize() {
    this.log("My plugin initialized!");
  }

  async myCommand(message, args) {
    const embed = this.framework.createEmbed({
      title: "✨ My Custom Command",
      description: "Hello from my custom plugin!",
    });
    message.reply({ embeds: [embed] });
  }
}

module.exports = MyCustomPlugin;
```

### Available Framework Methods

- `this.framework.createEmbed(options)` - Create themed embeds
- `this.framework.client` - Access Discord.js client
- `this.framework.config` - Access bot configuration
- `this.log(message)` - Plugin logging
- `this.error(message)` - Error logging

## 🔧 Configuration

### Environment Variables

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
PREFIX=!
PORT=3000
THEME=atreides

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

## 🚀 Production Deployment

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start index.js --name "mentat-bot"
pm2 startup
pm2 save
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Reverse Proxy (Nginx)

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

## 🗃️ Database Integration

For persistent data storage, add database support:

```bash
npm install sqlite3
# or
npm install mongodb
# or
npm install mysql2
```

## 🔍 Troubleshooting

### Bot Won't Start

```bash
# Check Node.js version
node --version # Should be 16+

# Check dependencies
npm list discord.js express

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Discord Connection Issues

- Verify bot token is correct in `.env` file
- Check bot permissions in Discord server
- Ensure intents are enabled in Discord Developer Portal
- Make sure `.env` file is in the same directory as `index.js`

### Commands Not Working

- Check bot has necessary permissions
- Verify command prefix in configuration
- Check console for error messages

### Web Interface Not Loading

- Check if port 3000 is available: `lsof -i :3000`
- Try different port in configuration
- Check firewall settings

## 📊 Performance Guidelines

### Resource Usage

- **Base Framework**: ~30-50MB
- **Per Plugin**: ~5-10MB
- **Discord.js Client**: ~50-100MB
- **Web Server**: ~10-20MB

### Scalability Recommendations

- **Small Server** (< 1k members): All features enabled
- **Medium Server** (1k-10k members): Monitor memory usage
- **Large Server** (10k+ members): Consider database for warnings/logs

## 📈 API Endpoints

| Endpoint                    | Method | Description               |
| --------------------------- | ------ | ------------------------- |
| `/api/health`               | GET    | Health check              |
| `/api/status`               | GET    | Bot status and statistics |
| `/api/config`               | GET    | Current configuration     |
| `/api/config`               | POST   | Update configuration      |
| `/api/plugins`              | GET    | List all plugins          |
| `/api/plugins/:name/toggle` | POST   | Enable/disable plugin     |
| `/api/themes`               | GET    | Available themes          |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Plugin Development Guidelines

- Follow BasePlugin structure
- Include comprehensive error handling
- Add proper documentation
- Test with different Discord servers
- Ensure no security vulnerabilities

## 📄 License

MIT License - Feel free to use this framework for personal or commercial projects.

## 🙏 Acknowledgments

- **Discord.js** - Powerful Discord API library
- **Express.js** - Fast web framework
- **Node.js** - JavaScript runtime
- **Discord Developer Community** - Inspiration and support
- **[Zachdidit's Discord Verification Bot](https://github.com/Zachdidit/discord-verification-bot)** - Original verification system implementation

## 🔮 Future Roadmap

- [ ] Slash Commands Support
- [ ] Database Integration Helpers
- [ ] Plugin Marketplace
- [ ] Advanced Analytics Dashboard
- [ ] Multi-language Support
- [ ] Voice Channel Features
- [ ] External API Integrations
- [ ] Mobile App Companion

## 📝 Changelog

- **v2.0.0** - Added verification plugin, House Atreides default theme
- **v1.2.0** - Modern UI redesign as Mentat-Bot
- **v1.1.0** - Added moderation and stats plugins
- **v1.0.0** - Initial release with core framework

---

**Happy botting! ⚔️🤖**

_Built with ❤️ for the Discord community and inspired by the noble House Atreides_
