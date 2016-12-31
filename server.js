const Discord = require('discord.js');
const yt = require('ytdl-core');
const tokens = require('./tokens.json');
const client = new Discord.Client();

let broadcasts = new Discord.Collection();

const commands = {
	'broadcast': (msg) => {
		msg.member.voiceChannel.join().then(() => {
			if (msg.guild.broadcast) return msg.reply('You are already broadcasting...');
			broadcasts.set(msg.guild.id, {stream: client.createVoiceBroadcast(),listeners: new Discord.Collection(),guild: msg.guild,queue: {playing: false, songs: []}});
			let broadcast = msg.guild.broadcast = broadcasts.get(msg.guild.id);
			broadcast.listeners.set(msg.guild.id, {voiceChannel: msg.member.voiceChannel,textChannel: msg.channel});
			let collector = broadcast.collector = msg.channel.createCollector(m => m);
			collector.on('message', m => { if (m.content.startsWith(tokens.prefix) && broadcastCommands.hasOwnProperty(m.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) broadcastCommands[m.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](m, broadcast); });
		}).catch(() => msg.reply('I couldn\'t connect to your voice channel...'));
	},
	'tune-in': (msg) => {
		if (broadcasts.size === 0) return msg.reply(`Nobody is streaming right now. Broadcast your own stream with ${tokens.prefix}broadcast`);
		clearBroadcast(msg);
		let broadcastsList = broadcasts.map(b => { return {guildID: b.guild.id, guildName: b.guild.name, song: b.queue.current.title, tunedIn: b.listeners.size, listeners: b.listeners.reduce((a,b) => a+b.voiceChannel.members.size, 0)}; });
		let broadcastsListFriendly = [];
		for (let i = 0; i < broadcasts.size; i++) { broadcastsListFriendly.push(`__**${i}**__ - ${broadcastsList[i].guildName}'s broadcast - ${broadcastsList[i].tunedIn} guilds tuned in - ${broadcastsList[i].listeners} listening\nCurrently Playing: ${broadcastsList[i].song}\n`); }
		msg.channel.sendMessage('Respond "random", or the number from the following list.\n'+broadcastsListFriendly.join('\n')).then(() => {
			msg.channel.awaitMessages(m => m.author === msg.author, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
				let broadcast;
				if (!isNaN(parseInt(collected.first().content.toLowerCase())) && parseInt(collected.first().content.toLowerCase()) < broadcasts.size) broadcast = msg.guild.broadcast = broadcasts.get(broadcastsList[parseInt(collected.first().content.toLowerCase())].guildID);
				else if (collected.first().content.toLowerCase() === 'random') broadcast = msg.guild.broadcast = broadcasts.random();
				else return msg.channel.sendMessage('Unknown broadcast...');
				msg.member.voiceChannel.join().then(voiceConnection => {
					voiceConnection.playBroadcast(broadcast.stream);
					broadcast.listeners.set(msg.guild.id, {voiceChannel: msg.member.voiceChannel,textChannel: msg.channel});
				}).catch(() => msg.reply('I couldn\'t connect to your voice channel...'));
			}).catch(() => msg.channel.sendMessage('I am sorry, the request has timed out.'));
		});
	},
	'tune-out': (msg) => { clearBroadcast(msg, true); },
	'queue': (msg) => {
		if (!msg.guild.broadcast) return msg.channel.sendMessage(`You are neither broadcasting, or Tuned In to a broadcast. Use ${tokens.prefix}broadcast or ${tokens.prefix}tune-in to get started.`);
		if (msg.guild.broadcast.queue.songs.length === 0 && msg.guild.id === msg.guild.broadcast.guild.id) return msg.channel.sendMessage(`Add some songs to the queue first with ${tokens.prefix}add`);
		else if (msg.guild.broadcast.queue.songs.length === 0 && msg.guild.id !== msg.guild.broadcast.guild.id) return msg.channel.sendMessage(`The broadcast is playing the last song in it\'s queue:\n${msg.guild.broadcast.queue.current.title}`);
		let tosend = [];
		msg.guild.broadcast.queue.songs.forEach((song, i) => {tosend.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`);});
		msg.channel.sendMessage(`__**${msg.guild.broadcast.guild.name}'s Radio Broadcast:**__ Currently **${tosend.length}** songs queued ${ (tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0, 15).join('\n')}\`\`\``);
	},
	'help': (msg) => {
		msg.channel.sendMessage(['```xl', tokens.prefix + 'join : "Join Voice channel of msg sender"',tokens.prefix + 'add : "Add a valid youtube link to the queue"',tokens.prefix + 'queue : "Shows the current queue, up to 15 songs shown."',tokens.prefix + 'play : "Play the music queue if already joined to a voice channel"','','the following commands only function while the play command is running:'.toUpperCase(),tokens.prefix + 'pause : "pauses the music"',tokens.prefix + 'resume : "resumes the music"',tokens.prefix + 'skip : "skips the playing song"',tokens.prefix + 'time : "Shows the playtime of the song."','volume+(+++) : "increases volume by 2%/+"','volume-(---) : "decreases volume by 2%/-"','```']); //completely outdated, but low priority
	},
	'reboot': (msg) => {
		if (msg.author.id == tokens.adminID) process.exit(); //Requires a node module like Forever to work.
	}
};

const broadcastCommands = {
	'play': (msg, broadcast) => {
		if (broadcast.queue.playing) return msg.channel.sendMessage('Already Playing');
		if (broadcast.queue.length === 0) return msg.channel.sendMessage(`The queue is empty, try adding a song with ${tokens.prefix}add`);
		broadcast.queue.playing = true;
		(function play(song) {
			if (song === undefined) return msg.channel.sendMessage('Queue is empty').then(() => { deleteBroadcast(broadcast); });
			msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
			let dispatcher = msg.guild.voiceConnection.playBroadcast(broadcast.stream.playStream(yt(song.url, {audioonly: true}), {passes: tokens.passes}));
			dispatcher.on('end', () => { play(broadcast.queue.current = broadcast.queue.songs.shift()); });
			dispatcher.on('error', (err) => { return msg.channel.sendMessage('error: ' + err).then(() => { play(broadcast.queue.current = broadcast.queue.songs.shift()); }); });
		})(broadcast.queue.current = broadcast.queue.songs.shift());
	},
	'end': (msg, broadcast) => { deleteBroadcast(broadcast); },
	'add': (msg, broadcast) => {
		let url = msg.content.split(' ')[1];
		if (url == '' || url === undefined) return msg.channel.sendMessage(`You must add a url, or youtube video id after ${tokens.prefix}add`);
		yt.getInfo(url, (err, info) => {
			if (err) return msg.channel.sendMessage('Invalid YouTube Link: ' + err);
			broadcast.queue.songs.push({ url: url, title: info.title, requester: msg.author.username });
			msg.channel.sendMessage(`added **${info.title}** to the queue`);
		});
	}
};

const deleteBroadcast = (broadcast) => {
	broadcast.collector.stop();
	broadcast.listeners.forEach(l => l.voiceChannel.leave());
	broadcasts.delete(broadcast.guild.id);
};

const clearBroadcast = (msg, leave = false) => {
	if (!msg.guild.broadcast) return;
	if (msg.guild.broadcast.guild.id === msg.guild.id) deleteBroadcast(msg.guild.broadcast);
	else {
		if (leave) msg.guild.broadcast.listeners.get(msg.guild.id).voiceChannel.leave();
		msg.guild.broadcast.listeners.delete(msg.guild.id);
	}
	msg.guild.broadcast = undefined;
};

client.on('ready', () => { console.log('ready'); });

client.on('message', msg => { if (msg.content.startsWith(tokens.prefix) && commands.hasOwnProperty(msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](msg); });

client.login(tokens.d_token);
