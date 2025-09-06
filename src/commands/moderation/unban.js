const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const moderationSchema = require("../../schemas/moderation");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Revoke a server ban")
    .addStringOption((o) =>
      o
        .setName("user_id")
        .setDescription("The id of the user whose ban you want to revoke.")
        .setRequired(true)
    )
    .toJSON(),
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.BanMembers],

  run: async (client, interaction) => {
    const { options, guildId, guild, member } = interaction;

    const userId = options.getString("user_id");

    let data = await moderationSchema.findOne({ GuildID: guildId });
    if (!data) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(
          `\`❌\` **The advanced moderation system is not configured on this server.**`
        );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }

    if (userId.id === member.id) {
      rEmbed
        .setColor(mConfig.embedColorError)
        .setDescription(`${mConfig.unableToInteractWithYourself}`);
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }
    guild.members.unban(userId);

    const rEmbed = new EmbedBuilder()
      .setColor(mConfig.embedColorSuccess)
      .setFooter({ text: `${client.user.username} - Unban user` })
      .setDescription(`\`✅\` Successfully revoked the ban of \`${userId}\`.`);

    interaction.reply({ embeds: [rEmbed], ephemeral: true });
  },
};
