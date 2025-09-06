const { PermissionFlagsBits, Component } = require("discord.js");

module.exports = {
  customId: "addrole_modal",
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],

  run: async (clientInformation, interaction) => {
    try {
      const { message, channel, guildId, guild, user } = interaction;

      const embedAuthor = message.embeds[0].author;
      const targetMember = await guild.members
        .fetch({
          query: embedAuthor.name,
          limit: 1,
        })
        .first();

      const roleId = ModalSubmitFields.getTextInputValue("role_id_input");
      const role = guild.roles.cache.get(roleId);

      await interaction.deferReply({ ephemeral: true });

      const addedRole = new EmbedBuilder()
        .setAuthor({
          name: `${targetMember.user.username}`,
          iconURL: `${targetMember.user.displayAvatarURL({ dynamic: true })}`,
        })
        .setDescription(
          `**${role} has been added successfully to ${targetMember}!**`
        );

      targetMember.roles.add(role).catch((err) => {
        console.log(err);
      });

      return interaction.editReply({ embeds: [addedRole], Components: [] });
    } catch (error) {
      console.log(error);
    }
  },
};
