exports.run = (client, msg) => {
	const tosend = [
		`${client.config.prefix}join : "Join Voice channel of msg sender"`,
		`${client.config.prefix}add : "Add a valid youtube link to the queue"`,
		`${client.config.prefix}queue : "Shows the current queue, up to 15 songs shown."`,
		`${client.config.prefix}play : "Play the music queue if already joined to a voice channel"`,
		'',
		'the following commands only function while the play command is running:'.toUpperCase(),
		`${client.config.prefix}pause : "pauses the music"`,
		`${client.config.prefix}resume : "resumes the music"`,
		`${client.config.prefix}skip : "skips the playing song"`,
		`${client.config.prefix}time : "Shows the playtime of the song."`,
		'volume+(+++) : "increases volume by 2%/+"',
		'volume-(---) : "decreases volume by 2%/-"'
	];
	return msg.channel.send(tosend, { code: 'xl' });
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
	name: 'musichelp',
	description: 'Displays the OhGodMusicBot help.',
	usage: '',
	usageDelim: '',
	extendedHelp: ''
};
