const yt = require("ytdl-core");

exports.run = (client, msg) => {
  return new Promise((resolve, reject) => {
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel || voiceChannel.type !== "voice") return msg.reply("I couldn't connect to your voice channel...");
    voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
  });
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0,
  botPerms: ["CONNECT"],
  requiredFuncs: []
};

exports.help = {
  name: "join",
  description: "Joins the message author's voice channel.",
  usage: "",
  usageDelim: ""
};
