const {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  customeId: "tempmutebtn",
  userPermissions: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],

  run: async (client, interaction) => {
    try {
      const tempMuteModal = new ModalBuilder()
        .setTitle("Temp Mute")
        .setCustomId("tempmuteMdl")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Time")
              .setCustomId("tempmuteTime")
              .setPlaceholder("h for hour, d for day, m for month, y for year")
              .setStyle(TextInputStyle.Short)
          ),
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Reason")
              .setCustomId("tempmuteReason")
              .setPlaceholder("Reasoning to tempmute this user")
              .setStyle(TextInputStyle.Paragraph)
          )
        );

      return await interaction.showModal(tempMuteModal);
    } catch (error) {
      console.log(error);
    }
  },
};
