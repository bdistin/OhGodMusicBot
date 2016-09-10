const Discord = require('discord.js');
const yt = require('ytdl-core');
const tokens = require('./tokens.json');
const client = new Discord.Client();

let queue = {};

client.on('message', msg => {
	if (msg.content.startsWith(tokens.prefix + 'play')) {
		if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing');
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage('Add some songs to the queue first with ++add');
		if (!client.voiceConnections.exists('channel', msg.member.voiceChannel)) return msg.channel.sendMessage('Join me to a voice channel with ++join first');
		let myVoiceConnection = client.voiceConnections.find('channel', msg.member.voiceChannel);
		let dispatcher;

		console.log(queue);
		(function play(song) {
			queue[msg.guild.id].playing = true;
			console.log(song);
			if (song === undefined) {
				msg.channel.sendMessage('Queue is empty');
				queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
				return;
			}
			msg.channel.sendMessage(`Playing: **${song.title}**`);
			dispatcher = myVoiceConnection.playStream(yt(song.url, { audioonly: true }));
			let collector = msg.channel.createCollector(m => m);
			collector.on('message', m => {
				if (m.content.startsWith(tokens.prefix + 'pause')) {
					dispatcher.pause();
					msg.channel.sendMessage('paused');
				} else if (m.content.startsWith(tokens.prefix + 'resume')){
					dispatcher.resume();
					msg.channel.sendMessage('resumed');
				} else if (m.content.startsWith(tokens.prefix + 'skip')){
					dispatcher.end();
					msg.channel.sendMessage('skipped');
				} else if (m.content.startsWith('volume+')){
					if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					const amount = m.content.split('+').length-1;
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (4*amount))/50,2));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith('volume-')){
					if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					const amount = m.content.split('-').length-1;
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (4*amount))/50,0));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				}
			});
			dispatcher.on('end', () => {
				setTimeout(()=>{
					collector.stop();
					queue[msg.guild.id].songs.shift();
					play(queue[msg.guild.id].songs[0]);
				}, 1000);
			});
			dispatcher.on('error', (err) => {
				collector.stop();
				queue[msg.guild.id].songs.shift();
				queue[msg.guild.id].playing = false;
				msg.channel.sendMessage('error: ' + err);
				msg.member.voiceChannel.leave();
				return;
			});
		})(queue[msg.guild.id].songs[0]);

	} else if (msg.content.startsWith(tokens.prefix + 'join')) {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('I couldn\'t connect to your voice channel...');
		voiceChannel.join();
	} else if (msg.content.startsWith(tokens.prefix + 'add')) {
		let url = msg.content.slice(6);
		yt.getInfo(url, (err, info) => {
			if(err) return msg.channel.sendMessage('Invalid YouTube Link: ' + err);
			if (!queue.hasOwnProperty(msg.guild.id)) {
				queue[msg.guild.id] = {};
				queue[msg.guild.id].playing = false;
				queue[msg.guild.id].songs = [];
			}
			queue[msg.guild.id].songs.push({url: url, title: info.title});
			msg.channel.sendMessage(`added **${info.title}** to the queue`);
		});
	} else if (msg.content.startsWith(tokens.prefix + 'help')) {
		let tosend = ['```xl', '++join : "Join Voice channel of msg sender"',	'++add : "Add a valid youtube link to the queue"', '++play : "Play the music queue if already joined to a voice channel', '++pause : "pauses the music, only available while play command is running."',	'++resume : "resumes the music, only available while play command is running."', '++skip : "skips the playing song, only available while play command is running."',	'volume+(+++) : "increases volume by 2%/+, only available while play command is running."',	'volume+(---) : "decreases volume by 2%/-, only available while play command is running."',	'notes : "commands are case sensitive, because I want to be a lazy ass on this bot."',	'```'];
		msg.channel.sendMessage(tosend.join('\n'));
	} else if (msg.content.startsWith(tokens.prefix + 'reboot')) {
		if (msg.author.id == tokens.adminID) process.exit();
	}
});

client.login(tokens.d_token);

client.on('ready', () => {
	console.log('ready!');
});
