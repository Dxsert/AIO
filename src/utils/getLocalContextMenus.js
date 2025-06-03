const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exceptions = []) => {
  let localContextMenu = [];
  const menuFiles = getAllFiles(
    path.join(__dirname, "..", "contextmenus"),
    true
  );

  for (const menuFile of menuFiles) {
    const menuObject = getAllFiles(menuFile);

    if (exceptions.includes(menuObject.name)) continue;

    localContextMenu.push(menuObject);
  }

  return localContextMenu;
};
