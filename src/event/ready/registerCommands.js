require("colors");

const { testServerId } = require("../../config.json");
const commandComparing = require("../../utils/commandComparing");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = await getApplicationCommands(client);

    for (const localCommand of localCommands) {
      const { data, deleted } = localCommand;
      const {
        name: commandName,
        description: commandDescription,
        options: commandOptions,
      } = data;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === commandName
      );

      if (deleted) {
        if (existingCommand) {
          await applicationCommands.delete(existingCommand.id);
          console.log(
            `[COMMAND] ${commandName} has been deleted`.underline.red
          );
        } else {
          console.log(
            `[COMMAND] ${commandName} has been skipped`.underline.yellow
          );
        }
      } else if (existingCommand) {
        if (commandComparing(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            name: commandName,
            description: commandDescription,
            options: commandOptions,
          });
          console.log(`[COMMAND] ${commandName} has been edited`.bgGreen);
        }
      } else {
        await applicationCommands.create({
          name: commandName,
          description: commandDescription,
          options: commandOptions,
        });
        console.log(`[COMMAND] ${commandName} has been registered`.green);
      }
    }
  } catch (error) {
    console.log(`[ERROR] COMMAND REGISTERY: \n ${error}`.red);
  }
};
