const {
  PermissionFlagsBits,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  customeId: "addroleBtn",
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],

  run: async (client, interaction) => {
    try {
      const addRoleModal = new ModalBuilder()
        .setTitle("User Add Role")
        .setCustomId("roleid")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Role ID")
              .setCustomId("role_id_input")
              .setPlaceholder("Example: 1148784622717653142")
              .setStyle(TextInputStyle.Short)
          )
        );

      return await interaction.showModal(addRoleModal);
    } catch (error) {
      console.log(error);
    }
  },
};
