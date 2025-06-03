const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exceptions = []) => {
  let buttons = [];
  const buttonFiles = getAllFiles(
    path.join(__dirname, "..", "contextmenus"),
    true
  );

  for (const buttonFile of buttonFiles) {
    const buttonObject = require(buttonFile);

    if (exceptions.includes(buttonObject.name)) continue;

    buttons.push(menuObject);
  }

  return buttons;
};
