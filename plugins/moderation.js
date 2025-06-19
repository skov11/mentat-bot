// Moderation Plugin
// File: plugins/moderation.js

const { BasePlugin } = require("../discord-framework");

class ModerationPlugin extends BasePlugin {
  constructor(framework) {
    super(framework);
    this.name = "Moderation";
    this.version = "1.0.0";
    this.description = "Basic moderation commands for Discord servers";

    this.commands = [
      {
        name: "kick",
        description: "Kick a user from the server",
        execute: this.kickCommand.bind(this),
      },
      {
        name: "ban",
        description: "Ban a user from the server",
        execute: this.banCommand.bind(this),
      },
      {
        name: "clear",
        description: "Clear messages from a channel",
        execute: this.clearCommand.bind(this),
      },
      {
        name: "mute",
        description: "Mute a user (timeout)",
        execute: this.muteCommand.bind(this),
      },
      {
        name: "unmute",
        description: "Unmute a user",
        execute: this.unmuteCommand.bind(this),
      },
      {
        name: "warn",
        description: "Warn a user",
        execute: this.warnCommand.bind(this),
      },
    ];

    this.events = [
      {
        name: "guildMemberAdd",
        handler: this.onMemberJoin.bind(this),
      },
      {
        name: "messageDelete",
        handler: this.onMessageDelete.bind(this),
      },
    ];

    // Store warnings in memory (in production, use a database)
    this.warnings = new Map();
  }

  async initialize() {
    this.log("Moderation plugin initialized");
  }

  async kickCommand(message, args) {
    // Check permissions
    if (!message.member.permissions.has("KickMembers")) {
      return message.reply(
        "❌ You need KICK_MEMBERS permission to use this command."
      );
    }

    if (!message.guild.members.me.permissions.has("KickMembers")) {
      return message.reply(
        "❌ I need KICK_MEMBERS permission to execute this command."
      );
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply(
        "❌ Please mention a user to kick.\nUsage: `!kick @user [reason]`"
      );
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply("❌ User not found in this server.");
    }

    // Check if target is kickable
    if (!member.kickable) {
      return message.reply(
        "❌ I cannot kick this user. They may have higher permissions than me."
      );
    }

    // Prevent kicking the command author
    if (member.id === message.author.id) {
      return message.reply("❌ You cannot kick yourself!");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      // Send DM to user before kicking
      try {
        await user.send(
          `You have been kicked from **${message.guild.name}** by ${message.author.tag}.\nReason: ${reason}`
        );
      } catch (error) {
        this.log("Could not send DM to kicked user");
      }

      await member.kick(reason);

      const embed = this.framework.createEmbed({
        title: "👢 User Kicked",
        description: `${user.tag} has been kicked from the server.`,
        fields: [
          { name: "Reason", value: reason, inline: false },
          { name: "Moderator", value: message.author.tag, inline: true },
          { name: "User ID", value: user.id, inline: true },
        ],
      });

      message.reply({ embeds: [embed] });
      this.log(
        `${user.tag} was kicked by ${message.author.tag}. Reason: ${reason}`
      );
    } catch (error) {
      this.error("Kick command failed:", error);
      message.reply(
        "❌ Failed to kick user. Please check my permissions and try again."
      );
    }
  }

  async banCommand(message, args) {
    // Check permissions
    if (!message.member.permissions.has("BanMembers")) {
      return message.reply(
        "❌ You need BAN_MEMBERS permission to use this command."
      );
    }

    if (!message.guild.members.me.permissions.has("BanMembers")) {
      return message.reply(
        "❌ I need BAN_MEMBERS permission to execute this command."
      );
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply(
        "❌ Please mention a user to ban.\nUsage: `!ban @user [reason]`"
      );
    }

    const member = message.guild.members.cache.get(user.id);

    // Check if target is bannable (if they're in the server)
    if (member && !member.bannable) {
      return message.reply(
        "❌ I cannot ban this user. They may have higher permissions than me."
      );
    }

    // Prevent banning the command author
    if (user.id === message.author.id) {
      return message.reply("❌ You cannot ban yourself!");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      // Send DM to user before banning
      try {
        await user.send(
          `You have been banned from **${message.guild.name}** by ${message.author.tag}.\nReason: ${reason}`
        );
      } catch (error) {
        this.log("Could not send DM to banned user");
      }

      await message.guild.members.ban(user, { reason, deleteMessageDays: 1 });

      const embed = this.framework.createEmbed({
        title: "🔨 User Banned",
        description: `${user.tag} has been banned from the server.`,
        fields: [
          { name: "Reason", value: reason, inline: false },
          { name: "Moderator", value: message.author.tag, inline: true },
          { name: "User ID", value: user.id, inline: true },
        ],
      });

      message.reply({ embeds: [embed] });
      this.log(
        `${user.tag} was banned by ${message.author.tag}. Reason: ${reason}`
      );
    } catch (error) {
      this.error("Ban command failed:", error);
      message.reply(
        "❌ Failed to ban user. Please check my permissions and try again."
      );
    }
  }

  async clearCommand(message, args) {
    // Check permissions
    if (!message.member.permissions.has("ManageMessages")) {
      return message.reply(
        "❌ You need MANAGE_MESSAGES permission to use this command."
      );
    }

    if (!message.guild.members.me.permissions.has("ManageMessages")) {
      return message.reply(
        "❌ I need MANAGE_MESSAGES permission to execute this command."
      );
    }

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply(
        "❌ Please provide a number between 1 and 100.\nUsage: `!clear <amount>`"
      );
    }

    try {
      // Delete the command message first
      await message.delete();

      // Bulk delete messages
      const messages = await message.channel.bulkDelete(amount, true);

      const embed = this.framework.createEmbed({
        title: "🧹 Messages Cleared",
        description: `Successfully deleted ${messages.size} messages.`,
        fields: [
          { name: "Moderator", value: message.author.tag, inline: true },
          { name: "Channel", value: message.channel.name, inline: true },
        ],
      });

      // Send confirmation and auto-delete after 5 seconds
      const reply = await message.channel.send({ embeds: [embed] });
      setTimeout(() => reply.delete().catch(() => {}), 5000);

      this.log(
        `${message.author.tag} cleared ${messages.size} messages in #${message.channel.name}`
      );
    } catch (error) {
      this.error("Clear command failed:", error);
      message.reply(
        "❌ Failed to clear messages. Messages might be too old (older than 14 days cannot be bulk deleted)."
      );
    }
  }

  async muteCommand(message, args) {
    // Check permissions
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply(
        "❌ You need MODERATE_MEMBERS permission to use this command."
      );
    }

    if (!message.guild.members.me.permissions.has("ModerateMembers")) {
      return message.reply(
        "❌ I need MODERATE_MEMBERS permission to execute this command."
      );
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply(
        "❌ Please mention a user to mute.\nUsage: `!mute @user [duration] [reason]`"
      );
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply("❌ User not found in this server.");
    }

    if (!member.moderatable) {
      return message.reply(
        "❌ I cannot mute this user. They may have higher permissions than me."
      );
    }

    // Parse duration (default: 10 minutes)
    let duration = 10; // minutes
    const durationArg = args[1];
    if (durationArg && !isNaN(durationArg)) {
      duration = Math.min(parseInt(durationArg), 40320); // Max 28 days
    }

    const reason = args.slice(2).join(" ") || "No reason provided";

    try {
      await member.timeout(duration * 60 * 1000, reason);

      const embed = this.framework.createEmbed({
        title: "🔇 User Muted",
        description: `${user.tag} has been muted for ${duration} minutes.`,
        fields: [
          { name: "Reason", value: reason, inline: false },
          { name: "Duration", value: `${duration} minutes`, inline: true },
          { name: "Moderator", value: message.author.tag, inline: true },
        ],
      });

      message.reply({ embeds: [embed] });
      this.log(
        `${user.tag} was muted by ${message.author.tag} for ${duration} minutes. Reason: ${reason}`
      );
    } catch (error) {
      this.error("Mute command failed:", error);
      message.reply(
        "❌ Failed to mute user. Please check my permissions and try again."
      );
    }
  }

  async unmuteCommand(message, args) {
    // Check permissions
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply(
        "❌ You need MODERATE_MEMBERS permission to use this command."
      );
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply(
        "❌ Please mention a user to unmute.\nUsage: `!unmute @user`"
      );
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply("❌ User not found in this server.");
    }

    try {
      await member.timeout(null);

      const embed = this.framework.createEmbed({
        title: "🔊 User Unmuted",
        description: `${user.tag} has been unmuted.`,
        fields: [
          { name: "Moderator", value: message.author.tag, inline: true },
        ],
      });

      message.reply({ embeds: [embed] });
      this.log(`${user.tag} was unmuted by ${message.author.tag}`);
    } catch (error) {
      this.error("Unmute command failed:", error);
      message.reply("❌ Failed to unmute user or user is not muted.");
    }
  }

  async warnCommand(message, args) {
    // Check permissions
    if (!message.member.permissions.has("ManageMessages")) {
      return message.reply(
        "❌ You need MANAGE_MESSAGES permission to use this command."
      );
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply(
        "❌ Please mention a user to warn.\nUsage: `!warn @user <reason>`"
      );
    }

    const reason = args.slice(1).join(" ");
    if (!reason) {
      return message.reply("❌ Please provide a reason for the warning.");
    }

    const guildWarnings = this.warnings.get(message.guild.id) || new Map();
    const userWarnings = guildWarnings.get(user.id) || [];

    const warning = {
      id: userWarnings.length + 1,
      reason: reason,
      moderator: message.author.tag,
      timestamp: new Date(),
      guildId: message.guild.id,
    };

    userWarnings.push(warning);
    guildWarnings.set(user.id, userWarnings);
    this.warnings.set(message.guild.id, guildWarnings);

    // Send DM to warned user
    try {
      await user.send(
        `You have been warned in **${message.guild.name}** by ${message.author.tag}.\nReason: ${reason}\nTotal warnings: ${userWarnings.length}`
      );
    } catch (error) {
      this.log("Could not send DM to warned user");
    }

    const embed = this.framework.createEmbed({
      title: "⚠️ User Warned",
      description: `${user.tag} has been warned.`,
      fields: [
        { name: "Reason", value: reason, inline: false },
        {
          name: "Warning #",
          value: userWarnings.length.toString(),
          inline: true,
        },
        { name: "Moderator", value: message.author.tag, inline: true },
      ],
    });

    message.reply({ embeds: [embed] });
    this.log(
      `${user.tag} was warned by ${message.author.tag}. Reason: ${reason}`
    );
  }

  onMemberJoin(member) {
    this.log(`New member joined: ${member.user.tag} (${member.guild.name})`);

    // Welcome message logic could go here
    // const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
    // if (welcomeChannel) {
    //     welcomeChannel.send(`Welcome ${member.user.tag} to ${member.guild.name}!`);
    // }
  }

  onMessageDelete(message) {
    if (message.author && !message.author.bot) {
      this.log(
        `Message deleted in #${message.channel.name}: "${message.content}" by ${message.author.tag}`
      );
    }
  }

  async cleanup() {
    this.log("Moderation plugin cleanup completed");
  }
}

module.exports = ModerationPlugin;
