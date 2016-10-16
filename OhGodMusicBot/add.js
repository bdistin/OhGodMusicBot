const yt = require("ytdl-core");

exports.run = (client, msg) => {
  if(!client.hasOwnProperty("queue")) client.queue = {};
  let url = msg.content.split(" ")[1];
  if (url == "" || url === undefined) return msg.channel.sendMessage(`You must add a url, or youtube video id after ${client.config.prefix}add`);
  yt.getInfo(url, (err, info) => {
    if(err) return msg.channel.sendMessage("Invalid YouTube Link: " + err);
    if (!client.queue.hasOwnProperty(msg.guild.id)) client.queue[msg.guild.id] = {}, client.queue[msg.guild.id].playing = false, client.queue[msg.guild.id].songs = [];
    client.queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
    msg.channel.sendMessage(`added **${info.title}** to the queue`);
  });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "add",
  description: "Adds a song the the queue.",
  usage: "",
  usageDelim: ""
};
