// ServerStats Plugin
// File: plugins/serverstats.js

const { BasePlugin } = require("../discord-framework");

class ServerStatsPlugin extends BasePlugin {
  constructor(framework) {
    super(framework);
    this.name = "ServerStats";
    this.version = "1.0.0";
    this.description = "Display server statistics and information";

    this.commands = [
      {
        name: "serverinfo",
        description: "Display detailed server information",
        execute: this.serverInfoCommand.bind(this),
      },
      {
        name: "userinfo",
        description: "Display user information",
        execute: this.userInfoCommand.bind(this),
      },
      {
        name: "stats",
        description: "Display bot statistics",
        execute: this.statsCommand.bind(this),
      },
      {
        name: "membercount",
        description: "Show current member count",
        execute: this.memberCountCommand.bind(this),
      },
      {
        name: "channelinfo",
        description: "Display channel information",
        execute: this.channelInfoCommand.bind(this),
      },
      {
        name: "roleinfo",
        description: "Display role information",
        execute: this.roleInfoCommand.bind(this),
      },
    ];

    this.events = [
      {
        name: "guildMemberAdd",
        handler: this.onMemberJoin.bind(this),
      },
      {
        name: "guildMemberRemove",
        handler: this.onMemberLeave.bind(this),
      },
      {
        name: "channelCreate",
        handler: this.onChannelCreate.bind(this),
      },
      {
        name: "channelDelete",
        handler: this.onChannelDelete.bind(this),
      },
    ];

    // Track stats
    this.stats = {
      membersJoined: 0,
      membersLeft: 0,
      messagesProcessed: 0,
      commandsExecuted: 0,
    };
  }

  async initialize() {
    this.log("ServerStats plugin initialized");
    this.startTime = Date.now();
  }

  async serverInfoCommand(message) {
    const guild = message.guild;
    const owner = await guild.fetchOwner();

    // Get channel counts by type
    const channels = guild.channels.cache;
    const textChannels = channels.filter((c) => c.type === 0).size; // GuildText
    const voiceChannels = channels.filter((c) => c.type === 2).size; // GuildVoice
    const categories = channels.filter((c) => c.type === 4).size; // GuildCategory

    // Get member stats
    const members = guild.members.cache;
    const humans = members.filter((m) => !m.user.bot).size;
    const bots = members.filter((m) => m.user.bot).size;
    const onlineMembers = members.filter(
      (m) => m.presence?.status === "online"
    ).size;

    // Get boost info
    const boostLevel = guild.premiumTier;
    const boosts = guild.premiumSubscriptionCount || 0;
    const boosters = guild.members.cache.filter((m) => m.premiumSince).size;

    // Verification level
    const verificationLevels = {
      0: "None",
      1: "Low",
      2: "Medium",
      3: "High",
      4: "Very High",
    };

    const embed = this.framework.createEmbed({
      title: `📊 ${guild.name} Server Information`,
      fields: [
        {
          name: "🏷️ Basic Info",
          value: `**Name:** ${guild.name}\n**ID:** ${
            guild.id
          }\n**Created:** ${guild.createdAt.toDateString()}`,
          inline: true,
        },
        {
          name: "👑 Owner",
          value: `${owner.user.tag}\n(${owner.user.id})`,
          inline: true,
        },
        {
          name: "📈 Members",
          value: `**Total:** ${guild.memberCount}\n**Humans:** ${humans}\n**Bots:** ${bots}\n**Online:** ${onlineMembers}`,
          inline: true,
        },
        {
          name: "📺 Channels",
          value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categories}\n**Total:** ${channels.size}`,
          inline: true,
        },
        {
          name: "🎭 Roles",
          value: `**Count:** ${guild.roles.cache.size}\n**Highest:** ${guild.roles.highest.name}`,
          inline: true,
        },
        {
          name: "🔒 Security",
          value: `**Verification:** ${
            verificationLevels[guild.verificationLevel]
          }\n**2FA Required:** ${guild.mfaLevel ? "Yes" : "No"}`,
          inline: true,
        },
        {
          name: "🚀 Nitro Boost",
          value: `**Level:** ${boostLevel}\n**Boosts:** ${boosts}\n**Boosters:** ${boosters}`,
          inline: true,
        },
        {
          name: "🌍 Other",
          value: `**Region:** ${guild.preferredLocale}\n**Large Server:** ${
            guild.large ? "Yes" : "No"
          }\n**Partnered:** ${guild.partnered ? "Yes" : "No"}`,
          inline: true,
        },
        {
          name: "📱 Features",
          value:
            guild.features.length > 0
              ? guild.features.slice(0, 5).join(", ") +
                (guild.features.length > 5 ? "..." : "")
              : "None",
          inline: true,
        },
      ],
    });

    if (guild.iconURL()) {
      embed.setThumbnail(guild.iconURL({ dynamic: true, size: 256 }));
    }

    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
    }

    embed.setFooter({ text: `Server ID: ${guild.id}` });

    message.reply({ embeds: [embed] });
  }

  async userInfoCommand(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    // User account info
    const accountAge = Math.floor(
      (Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24)
    );

    const embed = this.framework.createEmbed({
      title: `👤 ${user.globalName || user.username} User Information`,
      fields: [
        {
          name: "🏷️ Basic Info",
          value: `**Username:** ${user.username}\n**Display Name:** ${
            user.globalName || "None"
          }\n**ID:** ${user.id}`,
          inline: true,
        },
        {
          name: "📅 Account",
          value: `**Created:** ${user.createdAt.toDateString()}\n**Account Age:** ${accountAge} days`,
          inline: true,
        },
        { name: "🤖 Type", value: user.bot ? "Bot" : "Human", inline: true },
      ],
    });

    if (member) {
      const joinAge = Math.floor(
        (Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24)
      );
      const roles = member.roles.cache
        .filter((role) => role.id !== message.guild.id)
        .sort((a, b) => b.position - a.position)
        .map((role) => role.name)
        .slice(0, 10);

      embed.addFields([
        {
          name: "📋 Server Info",
          value: `**Joined:** ${member.joinedAt.toDateString()}\n**Days in Server:** ${joinAge}\n**Nickname:** ${
            member.nickname || "None"
          }`,
          inline: true,
        },
        {
          name: "🎭 Roles",
          value:
            roles.length > 0
              ? roles.join(", ") + (member.roles.cache.size > 11 ? "..." : "")
              : "None",
          inline: true,
        },
        {
          name: "💪 Permissions",
          value: member.permissions.has("Administrator")
            ? "Administrator"
            : member.permissions.has("ManageGuild")
            ? "Server Manager"
            : "Regular Member",
          inline: true,
        },
      ]);

      if (member.premiumSince) {
        embed.addFields([
          {
            name: "🚀 Nitro Booster",
            value: `Since: ${member.premiumSince.toDateString()}`,
            inline: true,
          },
        ]);
      }

      // Add presence info if available
      if (member.presence) {
        const status = {
          online: "🟢 Online",
          idle: "🟡 Idle",
          dnd: "🔴 Do Not Disturb",
          offline: "⚫ Offline",
        };
        embed.addFields([
          {
            name: "📱 Status",
            value: status[member.presence.status] || "❓ Unknown",
            inline: true,
          },
        ]);
      }
    }

    if (user.avatarURL()) {
      embed.setThumbnail(user.avatarURL({ dynamic: true, size: 256 }));
    }

    embed.setFooter({ text: `User ID: ${user.id}` });

    message.reply({ embeds: [embed] });
  }

  async statsCommand(message) {
    const client = this.framework.client;
    const uptime = this.formatUptime(client.uptime);
    const startupTime = this.formatUptime(Date.now() - this.startTime);

    // Memory usage
    const memUsage = process.memoryUsage();
    const memUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotal = Math.round(memUsage.heapTotal / 1024 / 1024);

    // Get total members across all guilds
    const totalMembers = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );

    // Plugin stats
    const enabledPlugins = Array.from(this.framework.plugins.values()).filter(
      (p) => p.enabled !== false
    ).length;

    const embed = this.framework.createEmbed({
      title: "📈 Bot Statistics",
      fields: [
        {
          name: "🏠 Servers",
          value: `**Total:** ${client.guilds.cache.size}\n**Large Servers:** ${
            client.guilds.cache.filter((g) => g.large).size
          }`,
          inline: true,
        },
        {
          name: "👥 Users",
          value: `**Cached:** ${
            client.users.cache.size
          }\n**Total Members:** ${totalMembers.toLocaleString()}`,
          inline: true,
        },
        {
          name: "📺 Channels",
          value: `**Total:** ${client.channels.cache.size}\n**Text:** ${
            client.channels.cache.filter((c) => c.type === 0).size
          }\n**Voice:** ${
            client.channels.cache.filter((c) => c.type === 2).size
          }`,
          inline: true,
        },
        {
          name: "🔌 System",
          value: `**Commands:** ${this.framework.commands.size}\n**Plugins:** ${enabledPlugins}/${this.framework.plugins.size}\n**Events:** ${this.framework.events.size}`,
          inline: true,
        },
        {
          name: "⏱️ Uptime",
          value: `**Discord:** ${uptime}\n**Plugin:** ${startupTime}`,
          inline: true,
        },
        {
          name: "💾 Memory",
          value: `**Used:** ${memUsed} MB\n**Total:** ${memTotal} MB\n**Usage:** ${Math.round(
            (memUsed / memTotal) * 100
          )}%`,
          inline: true,
        },
        {
          name: "🖥️ System",
          value: `**Node.js:** ${process.version}\n**Discord.js:** ${
            require("discord.js").version
          }\n**Platform:** ${process.platform}`,
          inline: true,
        },
        {
          name: "📊 Session Stats",
          value: `**Members Joined:** ${this.stats.membersJoined}\n**Members Left:** ${this.stats.membersLeft}\n**Commands Run:** ${this.stats.commandsExecuted}`,
          inline: true,
        },
        {
          name: "🏓 Latency",
          value: `**API:** ${client.ws.ping}ms\n**Gateway:** ${
            client.ws.ping > 0 ? "Connected" : "Disconnected"
          }`,
          inline: true,
        },
      ],
    });

    if (client.user.avatarURL()) {
      embed.setThumbnail(client.user.avatarURL());
    }

    embed.setFooter({
      text: `Framework v1.0.0 • Started ${new Date(
        this.startTime
      ).toLocaleString()}`,
    });

    message.reply({ embeds: [embed] });
  }

  async memberCountCommand(message) {
    const guild = message.guild;
    const members = guild.members.cache;

    const humans = members.filter((m) => !m.user.bot).size;
    const bots = members.filter((m) => m.user.bot).size;
    const online = members.filter((m) => m.presence?.status === "online").size;
    const idle = members.filter((m) => m.presence?.status === "idle").size;
    const dnd = members.filter((m) => m.presence?.status === "dnd").size;
    const offline = members.filter(
      (m) => !m.presence || m.presence.status === "offline"
    ).size;

    const embed = this.framework.createEmbed({
      title: `👥 ${guild.name} Member Count`,
      fields: [
        {
          name: "📊 Total Members",
          value: guild.memberCount.toString(),
          inline: true,
        },
        { name: "👤 Humans", value: humans.toString(), inline: true },
        { name: "🤖 Bots", value: bots.toString(), inline: true },
        { name: "🟢 Online", value: online.toString(), inline: true },
        { name: "🟡 Idle", value: idle.toString(), inline: true },
        { name: "🔴 DND", value: dnd.toString(), inline: true },
        { name: "⚫ Offline", value: offline.toString(), inline: true },
        {
          name: "📈 Growth",
          value: `+${this.stats.membersJoined} / -${this.stats.membersLeft}`,
          inline: true,
        },
        {
          name: "📅 Updated",
          value: new Date().toLocaleTimeString(),
          inline: true,
        },
      ],
    });

    message.reply({ embeds: [embed] });
  }

  async channelInfoCommand(message, args) {
    const channel = message.mentions.channels.first() || message.channel;

    const channelTypes = {
      0: "Text Channel",
      1: "DM",
      2: "Voice Channel",
      3: "Group DM",
      4: "Category",
      5: "Announcement Channel",
      10: "Announcement Thread",
      11: "Public Thread",
      12: "Private Thread",
      13: "Stage Channel",
      15: "Forum Channel",
    };

    const embed = this.framework.createEmbed({
      title: `📺 #${channel.name} Channel Information`,
      fields: [
        {
          name: "🏷️ Basic Info",
          value: `**Name:** ${channel.name}\n**Type:** ${
            channelTypes[channel.type]
          }\n**ID:** ${channel.id}`,
          inline: true,
        },
        {
          name: "📅 Created",
          value: channel.createdAt.toDateString(),
          inline: true,
        },
        {
          name: "📍 Position",
          value: channel.position?.toString() || "N/A",
          inline: true,
        },
      ],
    });

    if (channel.topic) {
      embed.addFields([
        {
          name: "📝 Topic",
          value: channel.topic.substring(0, 1024),
          inline: false,
        },
      ]);
    }

    if (channel.parent) {
      embed.addFields([
        { name: "📁 Category", value: channel.parent.name, inline: true },
      ]);
    }

    if (channel.type === 0) {
      // Text channel
      embed.addFields([
        {
          name: "💬 Settings",
          value: `**NSFW:** ${channel.nsfw ? "Yes" : "No"}\n**Slowmode:** ${
            channel.rateLimitPerUser || 0
          }s`,
          inline: true,
        },
      ]);
    }

    if (channel.type === 2) {
      // Voice channel
      embed.addFields([
        {
          name: "🔊 Voice Settings",
          value: `**User Limit:** ${
            channel.userLimit || "Unlimited"
          }\n**Bitrate:** ${channel.bitrate}kbps\n**Members:** ${
            channel.members?.size || 0
          }`,
          inline: true,
        },
      ]);
    }

    embed.setFooter({ text: `Channel ID: ${channel.id}` });

    message.reply({ embeds: [embed] });
  }

  async roleInfoCommand(message, args) {
    const roleName = args.join(" ");
    const role =
      message.mentions.roles.first() ||
      message.guild.roles.cache.find(
        (r) => r.name.toLowerCase() === roleName.toLowerCase()
      ) ||
      message.guild.roles.cache.get(roleName);

    if (!role) {
      return message.reply(
        "❌ Please mention a role or provide a role name.\nUsage: `!roleinfo @role` or `!roleinfo role name`"
      );
    }

    const members = message.guild.members.cache.filter((m) =>
      m.roles.cache.has(role.id)
    );
    const permissions = role.permissions.toArray();

    const embed = this.framework.createEmbed({
      title: `🎭 ${role.name} Role Information`,
      fields: [
        {
          name: "🏷️ Basic Info",
          value: `**Name:** ${role.name}\n**ID:** ${role.id}\n**Color:** ${role.hexColor}`,
          inline: true,
        },
        {
          name: "📊 Stats",
          value: `**Members:** ${members.size}\n**Position:** ${
            role.position
          }\n**Mentionable:** ${role.mentionable ? "Yes" : "No"}`,
          inline: true,
        },
        {
          name: "📅 Created",
          value: role.createdAt.toDateString(),
          inline: true,
        },
        {
          name: "🔒 Permissions",
          value:
            permissions.length > 0
              ? permissions.slice(0, 10).join(", ") +
                (permissions.length > 10 ? "..." : "")
              : "None",
          inline: false,
        },
      ],
    });

    if (role.color !== 0) {
      embed.setColor(role.color);
    }

    if (members.size <= 20) {
      const memberList = members.map((m) => m.user.username).join(", ");
      if (memberList.length <= 1024) {
        embed.addFields([
          { name: "👥 Members", value: memberList || "None", inline: false },
        ]);
      }
    }

    embed.setFooter({ text: `Role ID: ${role.id}` });

    message.reply({ embeds: [embed] });
  }

  formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  onMemberJoin(member) {
    this.stats.membersJoined++;
    this.log(
      `Member joined: ${member.user.tag} (${member.guild.name}) - Total joined this session: ${this.stats.membersJoined}`
    );
  }

  onMemberLeave(member) {
    this.stats.membersLeft++;
    this.log(
      `Member left: ${member.user.tag} (${member.guild.name}) - Total left this session: ${this.stats.membersLeft}`
    );
  }

  onChannelCreate(channel) {
    if (channel.guild) {
      this.log(`Channel created: #${channel.name} in ${channel.guild.name}`);
    }
  }

  onChannelDelete(channel) {
    if (channel.guild) {
      this.log(`Channel deleted: #${channel.name} in ${channel.guild.name}`);
    }
  }

  async cleanup() {
    this.log("ServerStats plugin cleanup completed");
  }
}

module.exports = ServerStatsPlugin;
