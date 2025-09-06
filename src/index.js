//                 ///\\\\\                  |||||||
//                /////\\\\\                 |||||||              ||||||||||||||||||
//               /////  \\\\\                                   ||||              ||||
//              /////    \\\\\               |||||||          ||||                 ||||
//             /////      \\\\\              |||||||        ||||                    ||||
//            /////        \\\\\             |||||||       |||                        |||
//           /////----------\\\\\            |||||||       |||                        |||
//          /////------------\\\\\           |||||||       |||                        |||
//         /////--------------\\\\\          |||||||       |||                        |||
//        /////                \\\\\         |||||||        |||                      |||
//       /////                  \\\\\        |||||||         ||||                  ||||
//      /////                    \\\\\       |||||||          ||||                ||||
//     /////                      \\\\\      |||||||           ||||              ||||
//    /////                        \\\\\     |||||||             ||||||||||||||||||   Everything made by Dxsert
// ____________________________________________________________________________________________________________
// Hey, if you're using this, just be careful. I mean — I don't even know what I'm doing here :kek:
// Even God probably has no clue what's going on, and honestly, He's likely brainstorming how to eject me from the IDE.
// But if you're really that brave, stay, try to decrypt it… or fail and cry like I did while writing this mess.
// Oh, and don’t even *think* about using ChatGPT — I’ve made sure this code defies AI comprehension.
// I'm not the devil, but I do love sharing… even my suffering.
//
//
// Good luck.
// Dxsert
//____________________________________________________________________________________________________________

require("dotenv/config");

const { Client, GatewayIntentBits } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

eventHandler(client);

client.login(process.env.TOKEN);
