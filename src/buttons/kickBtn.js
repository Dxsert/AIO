// kickBtn.js (v14)
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moderationSchema = require("../schemas/moderation");
const mConfig = require("../messageConfig.json");

module.exports = {
  customId: "kickBtn",
  userPermissions: [],
  botPermissions: [PermissionFlagsBits.KickMembers],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;

    // accuse réception du clic (sinon timeout bouton)
    await interaction.deferUpdate();

    const base = message.embeds?.[0];
    const targetName = base?.author?.name;
    if (!targetName) return;

    const fetched = await guild.members.fetch({ query: targetName, limit: 1 });
    const targetMember = fetched.first();
    if (!targetMember) return;

    const ask = new EmbedBuilder()
      .setColor("FFFFFF")
      .setFooter({ text: `${client.user.username} - Moderate user` })
      .setAuthor({
        name: targetMember.user.username,
        iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `\`❔\` What is the reason to kick ${targetMember.user.username}?\n` +
          `\`❕\` You have 15 seconds to reply.\n\n` +
          `\`💡\` Answer \`-\` for no reason.\n\`💡\` Type \`cancel\` to abort.`
      );

    // 1) Transformer l’embed d’origine → prompt (et retirer les boutons)
    await message.edit({ embeds: [ask], components: [] });

    // 2) Attendre la réponse de l’auteur de la commande
    const filter = (m) => m.author.id === user.id;
    let reasonMsg;
    try {
      const collected = await channel.awaitMessages({
        filter,
        max: 1,
        time: 15_000,
        errors: ["time"],
      });
      reasonMsg = collected.first();
    } catch {
      const cancel = new EmbedBuilder(ask)
        .setColor(mConfig.embedColorError)
        .setDescription("`❌` Moderation cancelled (timeout).");
      await message.edit({ embeds: [cancel] });
      return;
    }

    const content = reasonMsg.content.trim();
    await reasonMsg.delete().catch(() => {});
    if (content.toLowerCase() === "cancel") {
      const cancel = new EmbedBuilder(ask)
        .setColor(mConfig.embedColorError)
        .setDescription("`❌` Moderation cancelled.");
      await message.edit({ embeds: [cancel] });
      return;
    }

    const reason = content === "-" ? "No reason specified." : content;

    // 3) Action
    await targetMember.kick(reason).catch(() => {});
    const kEmbed = new EmbedBuilder()
      .setColor(mConfig.embedColorSuccess)
      .setFooter({ text: `${client.user.username} - Moderate user` })
      .setAuthor({
        name: targetMember.user.username,
        iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `\`✅\` Successfully kicked **${targetMember.user.username}**.`
      )
      .addFields(
        { name: "Reason", value: reason, inline: true },
        { name: "Kicked by", value: `<@${user.id}>`, inline: true } // 👈 ici
      );

    // 4) Transformer l’embed → résultat final (toujours le même message)
    await message.edit({ embeds: [kEmbed], components: [] });

    // (optionnel) logs
    const data = await moderationSchema.findOne({ GuildID: guildId });
    const logCh = data ? guild.channels.cache.get(data.LogChannelID) : null;
    if (logCh) logCh.send({ embeds: [ok] }).catch(() => {});
  },
};
