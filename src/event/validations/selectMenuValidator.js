module.exports = async (client, interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    const menu = client.selectMenus?.get(interaction.customId);
    if (!menu) return;

    try {
        await menu.run(client, interaction);
    } catch (error) {
        console.error(`[ERROR] SELECT MENU:`, error);
    }
};
