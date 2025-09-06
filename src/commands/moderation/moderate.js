const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const moderationSchema = require("../../schemas/moderation");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderate")
    .setDescription("Moderate a user.")
    .addUserOption((o) =>
      o
        .setName("user")
        .setDescription("The user to moderate.")
        .setRequired(true)
    )
    .toJSON(),
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [],

  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;

    // 1) On défère UNE FOIS
    await interaction.deferReply({});

    // 2) Le reste = editReply
    const user = options.getUser("user", true);
    const targetMember = await guild.members.fetch(user.id).catch(() => null);
    if (!targetMember) {
      return interaction.editReply({
        content: "Utilisateur introuvable sur ce serveur.",
      });
    }

    const rEmbed = new EmbedBuilder()
      .setColor("#FFFFFF")
      .setFooter({ text: `${client.user.username} - Moderate user` });

    const data = await moderationSchema.findOne({ GuildID: guildId });
    if (!data) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(
          "`❌` **The advanced moderation system is not configured on this server.**"
        );
      return interaction.editReply({ embeds: [rEmbed] });
    }

    if (targetMember.id === member.id) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(mConfig.unableToInteractWithYourself);
      return interaction.editReply({ embeds: [rEmbed] });
    }

    if (targetMember.roles.highest.position >= member.roles.highest.position) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(mConfig.hasHigherRolePosition);
      return interaction.editReply({ embeds: [rEmbed] });
    }

    const moderationButtons = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId("punishmentBtn")
        .setEmoji("👮")
        .setLabel("Punishments")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("otherBtn")
        .setEmoji("❔")
        .setLabel("Utility")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("cancelBtn")
        .setEmoji("❌")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    rEmbed
      .setAuthor({
        name: targetMember.user.username,
        iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `\`❔\` What do you want to do to ${targetMember.user.username}?`
      );

    return interaction.editReply({
      embeds: [rEmbed],
      components: [moderationButtons],
    });
  },
};
