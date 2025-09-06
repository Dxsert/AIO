// cancelBtn.js
const { MessageFlags } = require("discord.js");

module.exports = {
  customId: "cancelBtn",
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    try {
      // Accuse réception pour éviter le timeout du bouton
      await interaction.deferUpdate();

      if (interaction.message.flags?.has(MessageFlags.Ephemeral)) {
        // Réponse éphémère : on supprime la reply, pas le message inexistant
        await interaction.deleteReply();          // ou: await interaction.editReply({ components: [] });
      } else {
        // Message normal dans le salon
        await interaction.message.delete().catch(async () => {
          // si pas les perms, on retire juste les boutons
          await interaction.editReply({ components: [] });
        });
      }
    } catch (e) {
      console.error("cancelBtn error:", e);
    }
  },
};
