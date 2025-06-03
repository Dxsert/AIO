module.exports = async (clientInformation, guildId) => {
  let applicationCommands;

  if (guildId) {
    const guild = await clientInformation.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    applicationCommands = client.application.commands;
  }

  await applicationCommands.fetch();

  return applicationCommands;
};
