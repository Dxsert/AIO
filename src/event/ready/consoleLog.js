require("colors");
const mongoose = require("mongoose");
const mongoUrl = process.env.MONGO_URL

module.exports = async (client) => {
  console.log(`[INFO] ${client.user.username} is online`.underline.green);

  if (!mongoUrl) return;
  mongoose.set("strictQuery", true);
  if (await mongoose.connect(mongoUrl)) {
    console.log(`[DATA BASE] Connected`.green)
  }
};
