const { BasePlugin } = require("../discord-framework");
const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  AttachmentBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

class VerificationPlugin extends BasePlugin {
  constructor(framework) {
    super(framework);
    this.name = "Verification";
    this.version = "1.0.0";
    this.description =
      "User verification system with screenshot submission and admin approval";

    // Configuration
    this.config = {
      verificationChannelId: null,
      approvalChannelId: null,
      verifiedRoleId: null,
      approverRoleIds: [],
      logChannelId: null,
      requireScreenshot: true,
      requireCharacterName: true,
      requireGuildName: true,
      maxPendingVerifications: 5,
      verificationTimeout: 24 * 60 * 60 * 1000, // 24 hours
    };

    // Storage for pending verifications
    this.pendingVerifications = new Map();
    this.verifiedUsers = new Set();
    this.logFile = "./logs/verification.log";

    this.commands = [
      {
        name: "verify",
        description: "Submit verification request with screenshot and details",
        execute: this.verifyCommand.bind(this),
        options: [
          {
            name: "screenshot",
            description: "Screenshot for verification",
            type: 11, // ATTACHMENT
            required: this.config.requireScreenshot,
          },
          {
            name: "character_name",
            description: "Your character name",
            type: 3, // STRING
            required: this.config.requireCharacterName,
          },
          {
            name: "guild_name",
            description: "Your guild name",
            type: 3, // STRING
            required: this.config.requireGuildName,
          },
        ],
      },
      {
        name: "verification-setup",
        description: "Setup verification system (Admin only)",
        execute: this.setupCommand.bind(this),
        options: [
          {
            name: "verification_channel",
            description: "Channel where users submit verifications",
            type: 7, // CHANNEL
            required: true,
          },
          {
            name: "approval_channel",
            description: "Channel where approvals are handled",
            type: 7, // CHANNEL
            required: true,
          },
          {
            name: "verified_role",
            description: "Role to give verified users",
            type: 8, // ROLE
            required: true,
          },
          {
            name: "approver_role",
            description: "Role that can approve verifications",
            type: 8, // ROLE
            required: true,
          },
        ],
      },
      {
        name: "verification-status",
        description: "Check verification status or pending verifications",
        execute: this.statusCommand.bind(this),
      },
      {
        name: "verification-logs",
        description: "View recent verification logs (Admin only)",
        execute: this.logsCommand.bind(this),
      },
    ];

    this.events = [
      {
        name: "interactionCreate",
        handler: this.handleInteraction.bind(this),
      },
      {
        name: "ready",
        handler: this.onReady.bind(this),
      },
    ];
  }

  async initialize() {
    this.log("Verification plugin initialized");
    this.loadConfig();
    this.loadVerifiedUsers();
    this.ensureLogDirectory();
    this.startCleanupTimer();
  }

  loadConfig() {
    const configPath = "./config/verification.json";
    try {
      if (fs.existsSync(configPath)) {
        const savedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
        Object.assign(this.config, savedConfig);
        this.log("Configuration loaded from file");
      }
    } catch (error) {
      this.error("Failed to load configuration:", error);
    }
  }

  saveConfig() {
    const configPath = "./config/verification.json";
    try {
      if (!fs.existsSync("./config")) {
        fs.mkdirSync("./config", { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      this.error("Failed to save configuration:", error);
    }
  }

  loadVerifiedUsers() {
    const verifiedPath = "./config/verified-users.json";
    try {
      if (fs.existsSync(verifiedPath)) {
        const verifiedData = JSON.parse(fs.readFileSync(verifiedPath, "utf8"));
        this.verifiedUsers = new Set(verifiedData);
        this.log(`Loaded ${this.verifiedUsers.size} verified users`);
      }
    } catch (error) {
      this.error("Failed to load verified users:", error);
    }
  }

  saveVerifiedUsers() {
    const verifiedPath = "./config/verified-users.json";
    try {
      if (!fs.existsSync("./config")) {
        fs.mkdirSync("./config", { recursive: true });
      }
      fs.writeFileSync(
        verifiedPath,
        JSON.stringify([...this.verifiedUsers], null, 2)
      );
    } catch (error) {
      this.error("Failed to save verified users:", error);
    }
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  startCleanupTimer() {
    // Clean up expired verification requests every hour
    setInterval(() => {
      this.cleanupExpiredVerifications();
    }, 60 * 60 * 1000);
  }

  cleanupExpiredVerifications() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, verification] of this.pendingVerifications) {
      if (now - verification.timestamp > this.config.verificationTimeout) {
        this.pendingVerifications.delete(userId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.log(`Cleaned up ${cleanedCount} expired verification requests`);
    }
  }

  async onReady() {
    this.log("Verification system ready");
    // Register slash commands if needed
    await this.registerSlashCommands();
  }

  async registerSlashCommands() {
    try {
      const guild = this.framework.client.guilds.cache.first();
      if (guild) {
        await guild.commands.set(
          this.commands.map((cmd) => ({
            name: cmd.name,
            description: cmd.description,
            options: cmd.options || [],
          }))
        );
        this.log("Slash commands registered");
      }
    } catch (error) {
      this.error("Failed to register slash commands:", error);
    }
  }

  async verifyCommand(interaction) {
    const userId = interaction.user.id;

    // Check if user is already verified
    if (this.verifiedUsers.has(userId)) {
      return await interaction.reply({
        content: "❌ You are already verified!",
        ephemeral: true,
      });
    }

    // Check if user has pending verification
    if (this.pendingVerifications.has(userId)) {
      return await interaction.reply({
        content:
          "⏳ You already have a pending verification request. Please wait for approval.",
        ephemeral: true,
      });
    }

    // Check if verification is set up
    if (!this.config.verificationChannelId || !this.config.approvalChannelId) {
      return await interaction.reply({
        content:
          "❌ Verification system is not set up. Please contact an administrator.",
        ephemeral: true,
      });
    }

    // Get options
    const screenshot = interaction.options.getAttachment("screenshot");
    const characterName = interaction.options.getString("character_name");
    const guildName = interaction.options.getString("guild_name");

    // Validate screenshot
    if (this.config.requireScreenshot && !screenshot) {
      return await interaction.reply({
        content: "❌ Screenshot is required for verification.",
        ephemeral: true,
      });
    }

    if (screenshot && !screenshot.contentType?.startsWith("image/")) {
      return await interaction.reply({
        content: "❌ Please upload a valid image file.",
        ephemeral: true,
      });
    }

    // Create verification request
    const verificationId = `${userId}_${Date.now()}`;
    const verification = {
      id: verificationId,
      userId: userId,
      username: interaction.user.username,
      timestamp: Date.now(),
      screenshot: screenshot?.url,
      characterName: characterName,
      guildName: guildName,
      status: "pending",
    };

    this.pendingVerifications.set(userId, verification);

    // Send to approval channel
    await this.sendApprovalRequest(verification);

    // Log the verification request
    await this.logVerification(
      `Verification request submitted by ${interaction.user.tag} (${userId})`
    );

    await interaction.reply({
      content:
        "✅ Verification request submitted! Please wait for an administrator to approve it.",
      ephemeral: true,
    });
  }

  async sendApprovalRequest(verification) {
    const approvalChannel = this.framework.client.channels.cache.get(
      this.config.approvalChannelId
    );
    if (!approvalChannel) {
      this.error("Approval channel not found");
      return;
    }

    const embed = this.framework.createEmbed({
      title: "🔍 Verification Request",
      description: `User: <@${verification.userId}>\nUsername: ${verification.username}`,
      fields: [
        {
          name: "Character Name",
          value: verification.characterName || "Not provided",
          inline: true,
        },
        {
          name: "Guild Name",
          value: verification.guildName || "Not provided",
          inline: true,
        },
        {
          name: "Submitted",
          value: `<t:${Math.floor(verification.timestamp / 1000)}:R>`,
          inline: true,
        },
      ],
      footer: `Verification ID: ${verification.id}`,
    });

    if (verification.screenshot) {
      embed.setImage(verification.screenshot);
    }

    const approveButton = new ButtonBuilder()
      .setCustomId(`verify_approve_${verification.userId}`)
      .setLabel("✅ Approve")
      .setStyle(ButtonStyle.Success);

    const rejectButton = new ButtonBuilder()
      .setCustomId(`verify_reject_${verification.userId}`)
      .setLabel("❌ Reject")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(
      approveButton,
      rejectButton
    );

    await approvalChannel.send({
      embeds: [embed],
      components: [row],
    });
  }

  async setupCommand(interaction) {
    // Check permissions
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return await interaction.reply({
        content:
          "❌ You need Administrator permissions to set up verification.",
        ephemeral: true,
      });
    }

    const verificationChannel = interaction.options.getChannel(
      "verification_channel"
    );
    const approvalChannel = interaction.options.getChannel("approval_channel");
    const verifiedRole = interaction.options.getRole("verified_role");
    const approverRole = interaction.options.getRole("approver_role");

    // Update configuration
    this.config.verificationChannelId = verificationChannel.id;
    this.config.approvalChannelId = approvalChannel.id;
    this.config.verifiedRoleId = verifiedRole.id;
    this.config.approverRoleIds = [approverRole.id];

    this.saveConfig();

    const embed = this.framework.createEmbed({
      title: "⚙️ Verification System Setup",
      description: "Verification system has been configured successfully!",
      fields: [
        {
          name: "Verification Channel",
          value: `<#${verificationChannel.id}>`,
          inline: true,
        },
        {
          name: "Approval Channel",
          value: `<#${approvalChannel.id}>`,
          inline: true,
        },
        {
          name: "Verified Role",
          value: `<@&${verifiedRole.id}>`,
          inline: true,
        },
        {
          name: "Approver Role",
          value: `<@&${approverRole.id}>`,
          inline: true,
        },
      ],
    });

    await interaction.reply({ embeds: [embed] });
    await this.logVerification(
      `Verification system configured by ${interaction.user.tag}`
    );
  }

  async statusCommand(interaction) {
    const userId = interaction.user.id;

    if (this.verifiedUsers.has(userId)) {
      const embed = this.framework.createEmbed({
        title: "✅ Verification Status",
        description: "You are verified!",
        color: 0x00ff00,
      });
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (this.pendingVerifications.has(userId)) {
      const verification = this.pendingVerifications.get(userId);
      const embed = this.framework.createEmbed({
        title: "⏳ Verification Status",
        description: "Your verification is pending approval.",
        fields: [
          {
            name: "Submitted",
            value: `<t:${Math.floor(verification.timestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Character Name",
            value: verification.characterName || "Not provided",
            inline: true,
          },
          {
            name: "Guild Name",
            value: verification.guildName || "Not provided",
            inline: true,
          },
        ],
        color: 0xffaa00,
      });
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Show admin stats if user has permissions
    if (interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      const embed = this.framework.createEmbed({
        title: "📊 Verification Statistics",
        description: "System status and statistics",
        fields: [
          {
            name: "Pending Verifications",
            value: this.pendingVerifications.size.toString(),
            inline: true,
          },
          {
            name: "Total Verified Users",
            value: this.verifiedUsers.size.toString(),
            inline: true,
          },
          {
            name: "System Status",
            value: this.config.verificationChannelId
              ? "✅ Configured"
              : "❌ Not configured",
            inline: true,
          },
        ],
      });
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = this.framework.createEmbed({
      title: "❓ Verification Status",
      description:
        "You are not verified. Use `/verify` to submit a verification request.",
      color: 0xff0000,
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  async logsCommand(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return await interaction.reply({
        content: "❌ You don't have permission to view verification logs.",
        ephemeral: true,
      });
    }

    try {
      const logContent = fs.readFileSync(this.logFile, "utf8");
      const lines = logContent.split("\n").filter((line) => line.trim());
      const recentLogs = lines.slice(-20).join("\n");

      const embed = this.framework.createEmbed({
        title: "📋 Recent Verification Logs",
        description: `\`\`\`\n${recentLogs || "No logs available"}\n\`\`\``,
        footer: "Showing last 20 entries",
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      await interaction.reply({
        content: "❌ Unable to read verification logs.",
        ephemeral: true,
      });
    }
  }

  async handleInteraction(interaction) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;

    if (
      customId.startsWith("verify_approve_") ||
      customId.startsWith("verify_reject_")
    ) {
      await this.handleApprovalButton(interaction);
    }
  }

  async handleApprovalButton(interaction) {
    // Check if user has permission to approve
    const hasPermission =
      this.config.approverRoleIds.some((roleId) =>
        interaction.member.roles.cache.has(roleId)
      ) || interaction.member.permissions.has(PermissionFlagsBits.ManageRoles);

    if (!hasPermission) {
      return await interaction.reply({
        content: "❌ You don't have permission to approve verifications.",
        ephemeral: true,
      });
    }

    const [action, , userId] = interaction.customId.split("_");
    const isApproval =
      action === "verify" && interaction.customId.includes("approve");

    const verification = this.pendingVerifications.get(userId);
    if (!verification) {
      return await interaction.reply({
        content: "❌ Verification request not found or already processed.",
        ephemeral: true,
      });
    }

    if (isApproval) {
      await this.approveVerification(interaction, verification);
    } else {
      await this.rejectVerification(interaction, verification);
    }

    // Remove from pending
    this.pendingVerifications.delete(userId);

    // Disable buttons
    const disabledRow = ActionRowBuilder.from(
      interaction.message.components[0]
    ).setComponents(
      interaction.message.components[0].components.map((component) =>
        ButtonBuilder.from(component).setDisabled(true)
      )
    );

    await interaction.update({ components: [disabledRow] });
  }

  async approveVerification(interaction, verification) {
    const guild = interaction.guild;
    const member = await guild.members
      .fetch(verification.userId)
      .catch(() => null);

    if (!member) {
      await interaction.followUp({
        content: "❌ User not found in server.",
        ephemeral: true,
      });
      return;
    }

    // Add verified role
    if (this.config.verifiedRoleId) {
      try {
        await member.roles.add(this.config.verifiedRoleId);
      } catch (error) {
        this.error("Failed to add verified role:", error);
      }
    }

    // Add to verified users
    this.verifiedUsers.add(verification.userId);
    this.saveVerifiedUsers();

    // Log approval
    await this.logVerification(
      `Verification approved for ${verification.username} (${verification.userId}) by ${interaction.user.tag}`
    );

    // Send DM to user
    try {
      const user = await this.framework.client.users.fetch(verification.userId);
      const dmEmbed = this.framework.createEmbed({
        title: "✅ Verification Approved",
        description: `Your verification has been approved by ${interaction.user.username}!`,
        color: 0x00ff00,
      });
      await user.send({ embeds: [dmEmbed] });
    } catch (error) {
      this.log("Could not send DM to verified user");
    }

    await interaction.reply({
      content: `✅ Verification approved for ${verification.username}`,
      ephemeral: true,
    });
  }

  async rejectVerification(interaction, verification) {
    // Log rejection
    await this.logVerification(
      `Verification rejected for ${verification.username} (${verification.userId}) by ${interaction.user.tag}`
    );

    // Send DM to user
    try {
      const user = await this.framework.client.users.fetch(verification.userId);
      const dmEmbed = this.framework.createEmbed({
        title: "❌ Verification Rejected",
        description: `Your verification has been rejected by ${interaction.user.username}. You may submit a new verification request.`,
        color: 0xff0000,
      });
      await user.send({ embeds: [dmEmbed] });
    } catch (error) {
      this.log("Could not send DM to rejected user");
    }

    await interaction.reply({
      content: `❌ Verification rejected for ${verification.username}`,
      ephemeral: true,
    });
  }

  async logVerification(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    // Log to file
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      this.error("Failed to write to log file:", error);
    }

    // Log to Discord channel if configured
    if (this.config.logChannelId) {
      const logChannel = this.framework.client.channels.cache.get(
        this.config.logChannelId
      );
      if (logChannel) {
        const embed = this.framework.createEmbed({
          title: "📝 Verification Log",
          description: message,
          timestamp: new Date(),
        });
        await logChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    this.log(message);
  }

  async cleanup() {
    this.log("Verification plugin cleanup completed");
  }
}

module.exports = VerificationPlugin;
