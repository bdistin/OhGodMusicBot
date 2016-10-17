const yt = require("ytdl-core");

exports.run = (client, msg, [song]) => {
  if(!client.hasOwnProperty("queue")) client.queue = {};
  yt.getInfo(song, (err, info) => {
    if(err) return msg.channel.sendMessage("Invalid YouTube Link: " + err);
    if (!client.queue.hasOwnProperty(msg.guild.id)) client.queue[msg.guild.id] = {}, client.queue[msg.guild.id].playing = false, client.queue[msg.guild.id].songs = [];
    client.queue[msg.guild.id].songs.push({url: song, title: info.title, requester: msg.author.username});
    msg.channel.sendMessage(`:musical_note: Added **${info.title}** to the queue :notes:`);
  });
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "add",
  description: "Adds a song the the queue.",
  usage: "<song:str>",
  usageDelim: ""
};
