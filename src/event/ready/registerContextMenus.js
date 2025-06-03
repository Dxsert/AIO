require("colors");

const { testServerId } = require("../../config.json");
const getApplicationContextMenus = require("../../utils/getApplicationCommands");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client) => {
  try {
    const localContextMenus = getLocalContextMenus();
    const applicationContextMenus = await getApplicationContextMenus(client);

    for (const localContextMenu of localContextMenus) {
      const { data } = localContextMenu;
      const contextMenuName = data.name;
      const contextMenuType = data.type;

      const existingContextMenu = await applicationContextMenus.cache.find(
        (cmd) => cmd.name === contextMenuName
      );

      if (existingContextMenu) {
        if (localContextMenu.deleted) {
          await applicationCommands.delete(existingContextMenu.id);
          console.log(
            `[CONTEXT MENU] ${contextMenuName} has been deleted`.underline.red
          );
          continue;
        }
      } else {
        if (localContextMenu.deleted) {
          console.log(`[CONTEXT MENU] ${contextMenuName} has been skipped`);
          continue;
        }

        await applicationContextMenus.create({
          name: contextMenuName,
          type: contextMenuType,
        });
        console.log(`[CONTEXT MENU] ${contextMenuName} has been registered`);
      }
    }
  } catch (error) {
    console.log(`[ERROR] COMMAND REGISTERY: \n ${error}`.red);
  }
};
