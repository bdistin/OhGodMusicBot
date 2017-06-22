exports.run = (client, msg) => {
	const voiceChannel = msg.member.voiceChannel;
	if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply("I couldn't connect to your voice channel...");
	return voiceChannel.join();
};

exports.conf = {
	enabled: true,
	runIn: ['text'],
	aliases: [],
	permLevel: 0,
	botPerms: ['CONNECT'],
	requiredFuncs: []
};

exports.help = {
	name: 'join',
	description: "Joins the message author's voice channel.",
	usage: '',
	usageDelim: '',
	extendedHelp: ''
};
