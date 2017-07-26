const Discord = require('discord.js');

const client = new Discord.Client();

const token = process.env.BOT_TOKEN;

client.on('ready', () => {
  console.log('Fo0 Bot Online');
});

client.on('message', message => {
  if (message.content === 'ping') {
    message.channel.send('pong');
  }
});

client.login(token);
