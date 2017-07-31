const request = require('async-request');
const cheerio = require('cheerio');

module.exports = {
  message: "probuilds",
  run: async (args, message, client, config) => {
    if (args === 'undefined' || !args[0] || args[0] === '') {
      message.channel.send("Please specify a champ");
    } else if (args[0] === 'help') {
      message.channel.send(`${config.prefix}probuilds {champion name} - gives information the highest gold total build from the last 20 games on probuild.net.`);
    } else {
      var name = args[0].toLowerCase();
      var champ = await getRiotChampInfo(name, config.riotApiKey);

      if (typeof(champ) === 'string') {
        message.channel.send(champ);
        return;
      }

      if (champ.name === null) {
        message.channel.send(`Come on son, ${args[0]} is not a valid champ name.`);
        return;
      }

      var game = getProBuildGame(champ);
      var buildData = await getProBuildsBuild(game);

      message.channel.send(`A ${champ.name} build can be found at: ${buildData.url}\n\n${buildData.str}`);
   }
  }
};

async function getRiotChampInfo(name, apiKey) {
  const url = `https://na1.api.riotgames.com/lol/static-data/v3/champions?locale=en_US&dataById=false&api_key=${apiKey}`
  const apiRes = await request(url);

  if (apiRes.statusCode === 503) {
    return 'Unable to retrieve champion information. Riot static API service is down. Womp. Womp.';
  }

  const body = apiRes.body;
  let ret = {
    id: null,
    name: null
  }

  for(var champData in body) {
    let champ = body[champData];

    champ.name = champ.name.toLowerCase();
    if (champ.name === name) {
      ret.id = champ.id;
      ret.name = champ.name;
      break;
    }
  }

  return ret;
}

async function getProBuildGame(champ, games = 20) {
  const url = `http://www.probuilds.net/ajax/games?limit=${games}&sort=gameDate-desc&championId=${champ.id}&olderThan=0`;
  const body = JSON.parse(await request(url).body);

  return getHighestGold(body);
}

function getHighestGold(body) {
  let mostGold = 0;
  let gameIndex = 0;
  body.forEach((game, i) => {
    const $ = cheerio.load(game);
    let gold = Number($('._gold').text().slice(0, -1));
    if (gold > mostGold) {
      mostGold = gold;
      gameIndex = i;
    }
  });

  return (body[gameIndex]);
}

async function getProBuildsBuild(game) {
  let $ = cheerio.load(game);
  const url = 'http://www.probuilds.net' + $('a').attr('href');

  $ = cheerio.load(await request(url).body);
  let str = '```\n';
  let kdaStr = $('.summoner.green + td + td').text().replace(/\s/g,'');
  str += '__________Build from: ' + $('a.green').text() + ' KDA: ' + kdaStr + '__________\n';
  str += 'Shop Trip  1: ';
  let shopTrip = 1;
  //Scrape item buy order.
  $('.buy-order').children('li').each((i, ele) => {
    if ($(ele).attr('class') === 'left arrow') {
      str = str.slice(0, -4);
      str += `\nShop Trip ${(shopTrip += 1).toString().length === 1 ? ' ' + shopTrip : shopTrip}: `
    } else {
      str += $(ele).children('div').children('img').attr('alt') + ' -> ';
    }
  });

  //scrape rune info
  str = str.slice(0, -4) + '\n\n__________Runes:__________\n';
  $('.rune-info > ul > li').each((i, ele) => {
    str += $(ele).text().replace('+ ', '') + '\n';
  });

  //scrape masteries
  str += '\n__________Masteries:__________\n';
  $('.treetitle').each((i, ele) => {
    str += $(ele).text() + '\n';
  });
  str += '```';

  return {
    url,
    str
  };
}
