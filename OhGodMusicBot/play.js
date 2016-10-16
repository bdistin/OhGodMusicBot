const yt = require("ytdl-core");
const OhGodConfig = require("./OhGodConfig.json");

exports.run = (client, msg) => {
  if (client.queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with ${client.config.prefix}add`);
  if (!msg.guild.voiceConnection) return client.commands.get("join").run(client, msg).then(() => client.commands.get("play").run(client, msg));
  if (client.queue[msg.guild.id].playing) return msg.channel.sendMessage("Already Playing");
  let dispatcher;
  client.queue[msg.guild.id].playing = true;

  console.log(client.queue);
  (function play(song) {
    console.log(song);
    if (song === undefined) return msg.channel.sendMessage("Queue is empty").then(() => {
      client.queue[msg.guild.id].playing = false;
      msg.member.voiceChannel.leave();
    });
    msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
    dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : OhGodConfig.passes });
    let collector = msg.channel.createCollector(m => m);
    collector.on("message", m => {
      if (m.content.startsWith(client.config.prefix + "pause")) {
        msg.channel.sendMessage("paused").then(() => {dispatcher.pause();});
      } else if (m.content.startsWith(client.config.prefix + "resume")){
        msg.channel.sendMessage("resumed").then(() => {dispatcher.resume();});
      } else if (m.content.startsWith(client.config.prefix + "skip")){
        msg.channel.sendMessage("skipped").then(() => {dispatcher.end();});
      } else if (m.content.startsWith("volume+")){
        if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
        dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split("+").length-1)))/50,2));
        msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
      } else if (m.content.startsWith("volume-")){
        if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
        dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split("-").length-1)))/50,0));
        msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
      } else if (m.content.startsWith(client.config.prefix + "time")){
        msg.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? "0"+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
      }
    });
    dispatcher.on("end", () => {
      collector.stop();
      client.queue[msg.guild.id].songs.shift();
      play(client.queue[msg.guild.id].songs[0]);
    });
    dispatcher.on("error", (err) => {
      return msg.channel.sendMessage("error: " + err).then(() => {
        collector.stop();
        client.queue[msg.guild.id].songs.shift();
        play(client.queue[msg.guild.id].songs[0]);
      });
    });
  })(client.queue[msg.guild.id].songs[0]);
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
  name: "play",
  description: "Plays the queue.",
  usage: "",
  usageDelim: ""
};
