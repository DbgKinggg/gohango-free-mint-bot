const WebSocket = require("ws");
const { Client, Intents } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const monitorGuildId = process.env.MONITOR_GUILD_ID;
let internal = 0;

const token = "ODI4OTk3NzEyNTk3NzQ1NzY1.YmK9Gw.R1bowl1NJF9K2p7yM61vBGiZTcU";
const payload = {
  op: 2,
  d: {
    token: token,
    properties: {
      $os: "linux",
      $browser: "chrome",
      $device: "chrome",
    },
  },
};

const isInteger = (num) => /^-?[0-9]+$/.test(num + "");

const checkIfRepostRequired = (content) => {
  // console.log(content);
  const keywordIndex = content.indexOf("综合评分：");

  if (keywordIndex === -1) {
    return false;
  }

  let scoreString = "";
  for (let char of content.substr(keywordIndex + 5, 10)) {
    if (isInteger(char)) {
      scoreString += char;
    } else {
      break;
    }
  }

  console.log(scoreString);
  const score = parseInt(scoreString);
  if (score && score >= 62) {
    return true;
  }

  return false;
};

client.on("ready", async () => {
  console.log("Bot is ready");
  let channel = client.channels.cache.get(process.env.REPOST_GUILD_ID);
  // channel.send("Bot is ready");

  const ws = new WebSocket("wss://gateway.discord.gg/?v=6&encoding=json");

  ws.on("open", function open() {
    ws.send(JSON.stringify(payload));
  });

  ws.on("message", function incoming(data) {
    let payload = JSON.parse(data);

    const { t, event, op, d } = payload;

    switch (op) {
      case 10:
        const { heartbeat_interval } = d;
        interval = heartbeat(heartbeat_interval);
        break;
    }

    switch (t) {
      case "MESSAGE_CREATE":
        let content = d.content;

        if (d.channel_id == monitorGuildId) {
          if (checkIfRepostRequired(content)) {
            channel.send(content);
          }
        }
    }
  });

  const heartbeat = (ms) => {
    return setInterval(() => {
      ws.send(JSON.stringify({ op: 1, d: null }));
    }, ms);
  };
});

client.login(process.env.DISCORD_TOKEN);
