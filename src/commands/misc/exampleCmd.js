const { SlashCommandBuilder, PermissionFlagsBits, } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test if everything works")
    .setDMPermission(false)
    .addSubcommandGroup((subcommandgroup) =>
      subcommandgroup
        .setName("user")
        .setDescription("Configue a user.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("role")
            .setDescription("Configure a user's role.")
            .addUserOption((option) =>
              option.setName("user").setDescription("The user to configure")
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("nickname")
            .setDescription("Configure a user's nickname.")
            .addStringOption((option) =>
              option
                .setName("nickname")
                .setDescription("The nickname the user should have.")
            )
            .addUserOption((option) =>
              option.setName("user").setDescription("The user to configure.")
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("message").setDescription("Configure a message")
    )
    .toJSON(),
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.Connect],

  run: (client, Interaction) => {
    return Interaction.reply("This is a test command.");
  },
};
