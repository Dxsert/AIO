const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const mConfig = require("../messageConfig.json");
const moderationSchema = require("../schemas/moderation");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Moderate user")
    .setType(ApplicationCommandType.User),
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [],

  run: async (client, interaction) => {
    const { targetMember, guildId, member } = interaction;

    const rEmbed = new EmbedBuilder()
      .setColor("FFFFFF")
      .setFooter({ text: `${client.user.username} - Moderate user` });

    let data = await moderationSchema.findOne({ GuildID: guildId });
    if (!data) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(
          `\`❌\` **The advanced moderation system is not configured on this server.**`
        );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    if (targetMember.id === member.id) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(`${mConfig.unableToInteractWithYourself}`);
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    if (targetMember.roles.highest.position >= member.roles.highest.position) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(`${mConfig.hasHigherRolePosition}`);
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    const moderationButtons = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId("banBtn")
        .setLabel("Server ban")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("kickBtn")
        .setLabel("Server kick")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("cancelBtn")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    rEmbed
      .setAuthor({
        name: `${targetMember.user.username}`,
        iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(
        `\`❔\` What do you want to do to ${targetMember.user.username}?`
      );

    interaction.reply({ embeds: [rEmbed], components: [moderationButtons] });
  },
};
