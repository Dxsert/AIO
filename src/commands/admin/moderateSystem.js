const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const moderationSchema = require("../../schemas/moderation");
const mConfig = require("../../messageConfig.json");
const suspiciousUsers = require("../../suspiciousUsers.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderatesystem")
    .setDescription("An advanced moderating system.")
    .addSubcommand((s) =>
      s
        .setName("configure")
        .setDescription(
          "Configures the advanced moderating system into the server."
        )
        .addChannelOption((o) =>
          o
            .setName("logging_channel")
            .setDescription("The channel where all moderations will be logged.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption((o) =>
          o
            .setName("mute_role")
            .setDescription("The role to use for the muting members")
            .setRequired(true)
        )
        .addBooleanOption((o) =>
          o
            .setName("multi_guilded")
            .setDescription(
              "Adds your server on the list of allowing multi-guilded moderation"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("remove")
        .setDescription(
          "Removes the advanced moderation system from the server."
        )
    )
    .toJSON(),

  userPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [],

  run: async (client, interaction) => {
    const { options, guildId, guild } = interaction;
    const subcmd = options.getSubcommand();
    if (!["configure", "remove"].includes(subcmd)) return;

    const rEmbed = new EmbedBuilder().setFooter({
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
      text: `${client.user.username} - Advanced Moderation System`,
    });

    try {
      await interaction.deferReply({ ephemeral: true }); // safe contre “ne répond plus”

      switch (subcmd) {
        case "configure": {
          const multiGuilded = options.getBoolean("multi_guilded");
          const muteRole = options.get;
          const loggingChannel = options.getChannel("logging_channel");

          let dataGD = await moderationSchema.findOne({ GuildID: guildId });
          if (!dataGD) {
            // création
            rEmbed
              .setColor(mConfig.embedColorWarning)
              .setDescription(
                "`⌛` **The system wasn't configured. Initializing...**"
              );
            await interaction.editReply({
              embeds: [rEmbed],
              fetchReply: true,
              ephemeral: true,
            });

            dataGD = new moderationSchema({
              GuildID: guildId,
              MultiGuilded: multiGuilded,
              MuteRoleID: muteRole.id,
              LogChannelID: loggingChannel.id,
            });
            await dataGD.save();

            let i;
            for (i = 0; i < suspiciousUsers.ids.length; i++) {
              try {
                const suspiciousUsers = await guild.members.fetch(
                  suspiciousUsers.ids[i]
                );

                await guild.bans.create(suspiciousUsers, {
                  deleteMessageSeconds: 60 * 60 * 24 * 7,
                  reason: "Suspicious user listed by developer.",
                });

                const lEmbed = new EmbedBuilder()
                  .setColor("White")
                  .setTitle("`⛔` User banned")
                  .setAuthor({
                    name: suspiciousUsers.user.username,
                    iconURL: suspiciousUsers.user.displayAvatarURL({
                      dynamic: true,
                    }),
                  })
                  .addFields(
                    {
                      name: "Banned by",
                      value: `<@${client.user.id}>`,
                      inline: true,
                    },
                    {
                      name: "Reason",
                      value: `\`Suspicious user listed by developer. Please contact the developer if this is a mistake.\``,
                      inline: true,
                    }
                  )
                  .setFooter({
                    iconURL: `${client.user.displayAvatarURL({ dynamic })}`,
                    text: `${client.user.username} - Logging system`,
                  });

                loggingChannel.send({ embeds: [lEmbed] });
              } catch (error) {
                continue;
              }
            }
          } else {
            // mise à jour
            await moderationSchema.findOneAndUpdate(
              { GuildID: guildId },
              {
                MultiGuilded: multiGuilded,
                MuteRoleID: muteRole.id,
                LogChannelID: loggingChannel.id,
              }
            );
          }

          rEmbed
            .setColor(mConfig.embedColorSuccess)
            .setDescription("`✅` **Configuration saved successfully.**")
            .setFields(
              {
                name: "Multi-guilded",
                value: `\`${multiGuilded ? "Yes" : "No"}\``,
                inline: true,
              },
              {
                name: "Mute Role",
                value: `${muteRole}`,
                inline: true,
              },
              {
                name: "Logging channel",
                value: `${loggingChannel}`,
                inline: true,
              }
            );

          await interaction.editReply({ embeds: [rEmbed] });
          break;
        }

        case "remove": {
          const removed = await moderationSchema.findOneAndDelete({
            GuildID: guildId,
          });
          if (removed) {
            rEmbed
              .setColor(mConfig.embedColorSuccess)
              .setDescription(
                "`✅` **The advanced moderation system has been disabled.**"
              );
          } else {
            rEmbed
              .setColor(mConfig.embedColorError)
              .setDescription(
                "`❌` **The system is not configured on this server.**"
              );
          }
          await interaction.editReply({ embeds: [rEmbed] });
          break;
        }
      }
    } catch (e) {
      console.error("moderatesystem:", e);
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({ content: mConfig.embedErrorMessage });
      }
    }
  },
};
