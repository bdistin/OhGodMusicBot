const yt = require('ytdl-core');

exports.run = (client, msg, [song]) => {
	if (!client.hasOwnProperty('queue')) client.queue = {};
	yt.getInfo(song, (err, info) => {
		if (err) return msg.channel.send(`Invalid YouTube Link: ${err}`);
		if (!client.queue.hasOwnProperty(msg.guild.id)) {
			client.queue[msg.guild.id] = {
				playing: false,
				songs: []
			};
		}
		client.queue[msg.guild.id].songs.push({ url: song, title: info.title, requester: msg.author.username });
		return msg.channel.send(`🎵 Added **${info.title}** to the queue 🎶`);
	});
};

exports.conf = {
	enabled: true,
	runIn: ['text'],
	aliases: [],
	permLevel: 0,
	botPerms: [],
	requiredFuncs: []
};

exports.help = {
	name: 'add',
	description: 'Adds a song the the queue.',
	usage: '<song:str>',
	usageDelim: '',
	extendedHelp: ''
};
