var request = require('request');
var cheerio = require('cheerio');

module.exports = {
  message: "probuilds",
  run: (args, message, client, config) => {
    if (args === 'undefined' || !args[0] || args[0] === '') {
      message.channel.send("Please specify a champ");
    } else if (args[0] === 'help') {
      message.channel.send(`${config.prefix}probuilds {champion name} - gives information the highest gold total build from the last 20 games on probuild.net.`);
    } else {
      args[0] = args[0].toLowerCase();
      request(`https://na1.api.riotgames.com/lol/static-data/v3/champions?locale=en_US&dataById=false&api_key=${config.riotApiKey}`, (err, msg, body) => {
        var apiRes = JSON.parse(body);
        var champName = '';
        for(var champData in apiRes.data) {
          var champ = apiRes.data[champData];

          champ.name = champ.name.toLowerCase();
          if (champ.name === args[0]) {
            champName = champ.name;
            request(`http://www.probuilds.net/ajax/games?limit=20&sort=gameDate-desc&championId=${champ.id}&olderThan=0`, (err, msg, body) => {
              body = JSON.parse(body);
              var mostGold = 0;
              var gameIndex = 0;
              body.forEach((game, i) => {
                var $ = cheerio.load(game);
                var gold = Number($('._gold').text().slice(0, -1));
                if (gold > mostGold) {
                  mostGold = gold;
                  gameIndex = i;
                }
              });

              $ = cheerio.load(body[gameIndex]);
              var buildUrl = 'http://www.probuilds.net' + $('a').attr('href');
              request(buildUrl, (err, msg, body) => {
                $ = cheerio.load(body);
                var buyStr = '```Shop Trip  1: ';
                var shopTrip = 1;

                var items = $('.buy-order').children('li').each((i, ele) => {
                  if ($(ele).attr('class') === 'left arrow') {
                    buyStr = buyStr.slice(0, -4);
                    buyStr += `\nShop Trip ${(shopTrip += 1).toString().length === 1 ? ' ' + shopTrip : shopTrip}: `
                  } else {
                    buyStr += $(ele).children('div').children('img').attr('alt') + ' -> ';
                  }
                });
                buyStr = buyStr.slice(0, -4);
                buyStr += '```';

                message.channel.send(`A ${champName} build can be found at: ${buildUrl}\n\n${buyStr}`);
              });
            });
          }
        }
        if (champName === '') {
          message.channel.send(`Come on son, ${args[0]} is not a valid champ name.`);
        }
      });
    }
  }
};
