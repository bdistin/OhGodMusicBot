const yt = require('ytdl-core');
const OhGodConfig = require('./OhGodConfig.json');
require('node-opus');

exports.run = async (client, msg) => {
	if (client.queue[msg.guild.id] === undefined) return msg.channel.send(`Add some songs to the queue first with ${client.config.prefix}add`);
	if (!msg.guild.voiceConnection) return client.commands.get('join').run(client, msg).then(() => client.commands.get('play').run(client, msg));
	if (client.queue[msg.guild.id].playing) return msg.channel.send('Already Playing');
	let dispatcher;
	client.queue[msg.guild.id].playing = true;

	console.log(client.queue);
	(function play(song) {
		console.log(song);
		if (song === undefined) {
			return msg.channel.send('⏹ Queue is empty').then(() => {
				client.queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
			});
		}
		msg.channel.send(`🎧 Playing: **${song.title}** as requested by: **${song.requester}**`);
		dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes: OhGodConfig.passes });
		const collector = msg.channel.createMessageCollector(message => message);
		collector.on('collect', m => { // eslint-disable-line id-length
			if (m.content.startsWith(`${client.config.prefix}pause`)) {
				return msg.channel.send('⏸ Paused').then(() => { dispatcher.pause(); });
			} else if (m.content.startsWith(`${client.config.prefix}resume`)) {
				return msg.channel.send('▶ Resumed').then(() => { dispatcher.resume(); });
			} else if (m.content.startsWith(`${client.config.prefix}skip`)) {
				return msg.channel.send('⏭ Skipped').then(() => { dispatcher.end(); });
			} else if (m.content.startsWith('volume+')) {
				if (Math.round(dispatcher.volume * 50) >= 100) return msg.channel.send(`📢 Volume: ${Math.round(dispatcher.volume * 50)}%`);
				dispatcher.setVolume(Math.min(((dispatcher.volume * 50) + (2 * (m.content.split('+').length - 1))) / 50, 2));
				return msg.channel.send(`${dispatcher.volume === 2 ? '📢' : '🔊'} Volume: ${Math.round(dispatcher.volume * 50)}%`);
			} else if (m.content.startsWith('volume-')) {
				if (Math.round(dispatcher.volume * 50) <= 0) return msg.channel.send(`🔇 Volume: ${Math.round(dispatcher.volume * 50)}%`);
				dispatcher.setVolume(Math.max(((dispatcher.volume * 50) - (2 * (m.content.split('-').length - 1))) / 50, 0));
				return msg.channel.send(`${dispatcher.volume === 0 ? '🔇' : '🔉'} Volume: ${Math.round(dispatcher.volume * 50)}%`);
			} else if (m.content.startsWith(`${client.config.prefix}time`)) {
				return msg.channel.send(`🕰 Time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000) / 1000) < 10 ?
          `0${Math.floor((dispatcher.time % 60000) / 1000)}` :
          Math.floor((dispatcher.time % 60000) / 1000)}`);
			}
			return null;
		});
		dispatcher.on('end', () => {
			collector.stop();
			client.queue[msg.guild.id].songs.shift();
			play(client.queue[msg.guild.id].songs[0]);
		});
		dispatcher.on('error', (err) => msg.channel.send(`error: ${err}`).then(() => {
			collector.stop();
			client.queue[msg.guild.id].songs.shift();
			play(client.queue[msg.guild.id].songs[0]);
		}));

		return null;
	}(client.queue[msg.guild.id].songs[0]));

	return null;
};

exports.conf = {
	enabled: true,
	runIn: ['text'],
	aliases: [],
	permLevel: 0,
	botPerms: ['SPEAK'],
	requiredFuncs: []
};

exports.help = {
	name: 'play',
	description: 'Plays the queue.',
	usage: '',
	usageDelim: '',
	extendedHelp: ''
};
