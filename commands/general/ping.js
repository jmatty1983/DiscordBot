module.exports = {
  message: "ping",
  run: (args, message, client) => {
    message.channel.send("Ping?").then(m => {
      m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    });
  }
};
