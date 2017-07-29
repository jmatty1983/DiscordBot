module.exports = {
  message: "say",
  run: function(args, message) {
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{});
    message.channel.send(sayMessage);
  }
};
