const Discord = require("discord.js-selfbot-v13");
const { Client, WebhookClient } = require("discord.js-selfbot-v13");
const {
  checkUpdatePackage,
  mobileStatus,
  syncStatus,
  notice,
  updateTool,
} = require("./config/mainConfig.json");
const {
  version,
  description,
  name,
  author,
  patch_version,
} = require("./package.json");
var colors = require("colors");
const { logger } = require("./utils/logger");
const online = require("./utils/online.js");
const language = require("./utils/language.js")
const fs = require("fs");
const client = new Client({
  checkUpdate: checkUpdatePackage,
  readyStatus: syncStatus,
  ws: {
    properties: {
      $browser: mobileStatus ? "Discord iOS" : "Discord Client",
    },
  },
});
const axios = require("axios");
const SourceBin = require("sourcebin-wrapper");
//const lang = "vi";
//const language = require("./language/" + lang + ".js");
console.log(language("update", "newUpdate"))
if (updateTool === true) {
  axios
    .get(
      "https://raw.githubusercontent.com/hocsinhgioitoan/Mutil-tool/main/version.json"
    )
    .then((resp) => {
      if (resp.data.version !== version) {
        logger.warn(
          language("update", "newUpdate").red + resp.data.version.green
        );
        logger.update(`${language("update", "infoUpdate")} ${resp.data.version.green}
${language("update","descriptionUpdate")}:
${resp.data.version_description}
${language("update","download")}: https://github.com/hocsinhgioitoan/Mutil-tool/releases/
${language("update","replitClone")}: https://replit.com/github/hocsinhgioitoan/Mutil-tool
`);
      } else if (resp.data.patch !== patch_version) {
        if (resp.data.patch_required === true) {
          logger.warn(
            language("update","newPatchUpdate").red + resp.data.patch.green
          );
          logger.update(`${language("update","patchUpdateInfo")}: ${resp.data.patch.green}
${language("update","descriptionUpdate")}:
${resp.data.version_description}
${language("update","download")}: https://github.com/hocsinhgioitoan/Mutil-tool/releases/
${language("update","replitClone")}: https://replit.com/github/hocsinhgioitoan/Mutil-tool
`);
        }
      } else {
        logger.info(language("update","noUpdate").green);
      }
    });
}

logger.info(
  `
███╗░░░███╗██╗░░░██╗████████╗██╗██╗░░░░░░██████╗  ████████╗░█████╗░░█████╗░██╗░░░░░
████╗░████║██║░░░██║╚══██╔══╝██║██║░░░░░██╔════╝  ╚══██╔══╝██╔══██╗██╔══██╗██║░░░░░
██╔████╔██║██║░░░██║░░░██║░░░██║██║░░░░░╚█████╗░  ░░░██║░░░██║░░██║██║░░██║██║░░░░░
██║╚██╔╝██║██║░░░██║░░░██║░░░██║██║░░░░░░╚═══██╗  ░░░██║░░░██║░░██║██║░░██║██║░░░░░
██║░╚═╝░██║╚██████╔╝░░░██║░░░██║███████╗██████╔╝  ░░░██║░░░╚█████╔╝╚█████╔╝███████╗
╚═╝░░░░░╚═╝░╚═════╝░░░░╚═╝░░░╚═╝╚══════╝╚═════╝░  ░░░╚═╝░░░░╚════╝░░╚════╝░╚══════╝
${language("introduce", "madeBy")} ${author} ${language("introduce", "version")}${version} - ${description}
`.blue
);

function init() {
  loadEvent();
  online();
}
init();
process.on("unhandledRejection", (error) => {
  if (notice === true) {
    if (!process.env.WH_URL) {
      return logger.error(
       language("WH", "invalidWH")
      );
    } else {
      console.error(error);
      const WebHookClient = new Discord.WebhookClient({
        url: process.env.WH_URL,
      });
      WebHookClient.send({
        content: "🚨 **ERROR**\n\n```" + error + "```",
      });
    }
  }
});
client.login(process.env["token"] || process.env["TOKEN"]); // Don't paste your token here
function loadEvent() {
  fs.readdirSync("./src/events").forEach((category) => {
    const eventsFiles = fs
      .readdirSync("./src/events/" + category + "/")
      .filter((file) => file.endsWith("js"));
    for (const file of eventsFiles) {
      let event = require("./src/events/" + category + "/" + file);
      logger.info(
        "[EVENTS]".cyan +
          " Event " +
          file.blue +
          " of the category " +
          category.magenta +
          " loaded"
      );
      client.on(file.split(".")[0], (...args) => event(client, ...args));
    }
  });
}
const anigame = ["571027211407196161"]; //Anigame ID
const config = require("./config/gameConfig.js");
client.on("messageCreate", async (message) => {
  if (anigame.includes(message.author.id)) {
    if (config.servers.includes(message.guild.id)) {
      message.embeds.forEach(async (e) => {
        if (!e.title) return;
        if (!e.footer) return;
        if (
          e.title.includes("What's this?") &&
          e.footer.text.includes(
            `Click on the claim button first to claim this card!`
          )
        ) {
          const label = "Claim!";
          const row = message.components[0];
          const button = row.components.find(
            (button_) => button_.label == label
          );
          if (!button) return;
          button.click(message);
          const hook = new WebhookClient({ url: config.webhook });
          const d = new Date();
          const x = d / 1000;
          hook.send(
            `<t:${Math.floor(x)}t:> | Claimed card in [${
              message.channel.name
            }](${message.channel.url})`
          );
          console.log(language("aniGame", "claimedCard")(message.channel.name));
        }
      });
    }
  }
});
