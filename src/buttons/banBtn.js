// src/buttons/banBtn.js
const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const moderationSchema = require("../schemas/moderation");
const mConfig = require("../messageConfig.json");

module.exports = {
  customId: "banBtn",
  userPermissions: [], // tu peux en ajouter si tu veux
  botPermissions: [PermissionFlagsBits.BanMembers],

  run: async (client, interaction) => {
    const { message, channel, guildId, guild, user } = interaction;

    try {
      // Accuser réception du clic (évite le timeout bouton)
      await interaction.deferUpdate();

      // 1) Récup de la cible depuis l'embed source
      const base = message.embeds?.[0];
      const targetName = base?.author?.name;
      if (!targetName) {
        return message.edit({ content: "Embed invalide (aucun auteur).", embeds: [], components: [] });
      }

      const fetched = await guild.members.fetch({ query: targetName, limit: 1 });
      const targetMember = fetched.first();
      if (!targetMember) {
        return message.edit({ content: "Utilisateur introuvable dans ce serveur.", embeds: [], components: [] });
      }

      // 2) Demande la raison (on transforme CE message)
      const ask = new EmbedBuilder()
        .setColor("#FFFFFF")
        .setFooter({ text: `${client.user.username} - Moderate user` })
        .setAuthor({
          name: targetMember.user.username,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `\`❔\` What is the reason to ban **${targetMember.user.username}**?\n` +
          `\`❕\` You have 15 seconds to reply. After this time the moderation will be automatically cancelled.\n\n` +
          `\`💡\` To continue without a reason, answer with \`-\`.\n` +
          `\`💡\` To cancel the moderation, answer with \`cancel\`.`
        );

      await message.edit({ embeds: [ask], components: [] });

      // 3) Collect de la raison
      const filter = (m) => m.author.id === user.id;
      let reasonMsg;
      try {
        const collected = await channel.awaitMessages({ filter, max: 1, time: 15_000, errors: ["time"] });
        reasonMsg = collected.first();
      } catch {
        const cancel = EmbedBuilder.from(ask)
          .setColor(mConfig.embedColorError)
          .setDescription("`❌` Moderation cancelled (timeout).");
        await message.edit({ embeds: [cancel] });
        return;
      }

      const raw = reasonMsg?.content?.trim() ?? "";
      await reasonMsg.delete().catch(() => {});

      if (raw.toLowerCase() === "cancel") {
        const cancel = EmbedBuilder.from(ask)
          .setColor(mConfig.embedColorError)
          .setDescription("`❌` Moderation cancelled.");
        await message.edit({ embeds: [cancel] });
        return;
      }

      const reason = raw === "-" ? "No reason specified." : raw;

      // 4) Action: ban
      await targetMember.ban({
        reason,
        deleteMessageSeconds: 60 * 60 * 24 * 7, // 7 jours
      }).catch(async (e) => {
        const errEmbed = new EmbedBuilder()
          .setColor(mConfig.embedColorError)
          .setDescription("`❌` Impossible to ban this user. Check my permissions and role hierarchy.");
        await message.edit({ embeds: [errEmbed] });
        throw e;
      });

      // 5) Logs
      const dataGD = await moderationSchema.findOne({ GuildID: guildId }).catch(() => null);
      const logCh = dataGD ? guild.channels.cache.get(dataGD.LogChannelID) : null;
      const logEmbed = new EmbedBuilder()
        .setColor("#FFFFFF")
        .setTitle("`❌` User banned")
        .setAuthor({
          name: targetMember.user.username,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `\`💡\` To unban ${targetMember.user.username}, use \`/unban ${targetMember.user.id}\`.`
        )
        .addFields(
          { name: "Banned by", value: `<@${user.id}>`, inline: true },
          { name: "Reason", value: reason, inline: true }
        )
        .setFooter({
          text: `${client.user.username} - Logging system`,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });

      if (logCh) logCh.send({ embeds: [logEmbed] }).catch(() => {});

      // 6) Retour visuel sur le même message
      const bEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColorSuccess)
        .setFooter({ text: `${client.user.username} - Moderate user` })
        .setAuthor({
          name: targetMember.user.username,
          iconURL: targetMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`\`✅\` Successfully banned **${targetMember.user.username}**.`)
        .addFields(
          { name: "Reason", value: reason, inline: true },
          { name: "Banned by", value: `<@${user.id}>`, inline: true }
        );

      await message.edit({ embeds: [bEmbed], components: [] });
      setTimeout(() => message.delete().catch(() => {}), 2000);
    } catch (err) {
      console.error("banBtn error:", err);
    }
  },
};
