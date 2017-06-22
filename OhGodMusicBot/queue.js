exports.run = (client, msg) => {
	if (client.queue[msg.guild.id] === undefined) return msg.channel.send(`Add some songs to the queue first with ${client.config.prefix}add`);
	const tosend = client.queue[msg.guild.id].songs.map((song, i) => `${i + 1}. ${song.title} - Requested by: ${song.requester}`);
	return msg.channel.send([
		`🗒 __**${msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}`,
		`${'```'}${tosend.slice(0, 15).join('\n')}${'```'}`
	].join('\n'));
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
	name: 'queue',
	description: 'Displays the music queue.',
	usage: '',
	usageDelim: '',
	extendedHelp: ''
};
