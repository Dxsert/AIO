const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  customeId: "punishmenBtn",
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    const { message, channel, guilId, guild, user } = interaction;

    await interaction.deferReply({ ephemeral: false });

    try {
      const embedAuthor = message.embeds[0].author;
      const targetMember = await guild.members
        .fetch({ query: embedAuthor.name, limit: 1 })
        .first();

      const Oembed = new EmbedBuilder()
        .setTitle("Punishement")
        .setAuthor({
          name: `${targetMember.user.username}`,
          iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
        })
        .setDescription(
          `\`❓\`What punishement do you want to use against ${targetMember.user.username}?`
        );

      const otherRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("banBtn")
          .setLabel("Server ban")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("kickBtn")
          .setLabel("Server kick")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("tempmuteBtn")
          .setLabel("Temp Mute")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder("tempbanBtn")
          .setCustomId("Temp ban")
          .setLabel("Add role")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("cancelBtn")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.editReply({ embeds: [Oembed], component: [otherRow] });
    } catch (error) {
      console.log(error);
    }
  },
};
