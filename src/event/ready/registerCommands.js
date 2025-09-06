require("colors");

const { testServerId } = require("../../config.json");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();

    // 1) Bulldozer GUILD: set exactement les locales sur le serveur de test
    const guildCommands = await getApplicationCommands(client, testServerId);
    await guildCommands.set(localCommands.map(c => c.data));
    console.log(`[COMMAND] Guild commands synced (test server): ${localCommands.length}`.green);

    // 2) Bulldozer GLOBAL: vider totalement (évite les doublons visibles côté client)
    const globalCommands = await getApplicationCommands(client); // sans guildId => global
    await globalCommands.set([]); // purge complète
    console.log(`[COMMAND] Global commands purged`.underline.red);

  } catch (error) {
    console.log(`[ERROR] COMMAND REGISTERY: \n ${error}`.red);
  }
};
