const Discord = require("discord.js");
const config = require("./config.js");
const commands = require("./commands");
console.log(commands);

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setGame(`on ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setGame(`on ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setGame(`on ${client.guilds.size} servers`);
});


client.on("message", async message => {
  if (message.author.bot || message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.split(/\s+/g);
  const command = args.shift().slice(config.prefix.length).toLowerCase();

  commands.forEach(function(cmdGroup){
    cmdGroup.forEach(function(cmd) {
        if (cmd.message === command) {
          cmd.run(args, message, client);
        }
    });
  });
});

client.login(config.token);
