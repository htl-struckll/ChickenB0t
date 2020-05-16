var config = require("./config.json");
const fs = require('fs');

//Random websites
var randomSites = ["http://heeeeeeeey.com/", "http://tinytuba.com/", "http://corndog.io/", "https://alwaysjudgeabookbyitscover.com", "http://thatsthefinger.com/", "http://cant-not-tweet-this.com/", "http://weirdorconfusing.com/", "http://eelslap.com/", "http://www.staggeringbeauty.com/", "http://burymewithmymoney.com/", "http://endless.horse/", "http://www.trypap.com/", "http://www.republiquedesmangues.fr/", "http://www.movenowthinklater.com/", "http://www.partridgegetslucky.com/", "http://www.rrrgggbbb.com/", "http://beesbeesbees.com/", "http://www.koalastothemax.com/", "http://www.everydayim.com/", "http://randomcolour.com/", "http://cat-bounce.com/", "http://chrismckenzie.com/", "http://hasthelargehadroncolliderdestroyedtheworldyet.com/", "http://ninjaflex.com/", "http://ihasabucket.com/", "http://corndogoncorndog.com/", "http://www.hackertyper.com/", "https://pointerpointer.com", "http://imaninja.com/", "http://www.ismycomputeron.com/", "http://www.nullingthevoid.com/", "http://www.muchbetterthanthis.com/", "http://www.yesnoif.com/", "http://potatoortomato.com/", "http://iamawesome.com/", "http://www.pleaselike.com/", "http://crouton.net/", "http://corgiorgy.com/", "http://www.wutdafuk.com/", "http://unicodesnowmanforyou.com/", "http://www.crossdivisions.com/", "http://tencents.info/", "http://www.patience-is-a-virtue.org/", "http://pixelsfighting.com/", "http://isitwhite.com/", "http://onemillionlols.com/", "http://www.omfgdogs.com/", "http://oct82.com/", "http://chihuahuaspin.com/", "http://www.blankwindows.com/", "http://dogs.are.the.most.moe/", "http://tunnelsnakes.com/", "http://www.trashloop.com/", "http://www.ascii-middle-finger.com/", "http://spaceis.cool/", "http://www.donothingfor2minutes.com/", "http://buildshruggie.com/", "http://buzzybuzz.biz/", "http://yeahlemons.com/", "http://burnie.com/", "http://wowenwilsonquiz.com", "https://thepigeon.org/", "http://notdayoftheweek.com/", "http://www.amialright.com/", "http://nooooooooooooooo.com/", "https://greatbignothing.com/"];

//Weather
const fetch = require("node-fetch");
const weatherToken = config.Openweathermap.token;
const countryId = config.Openweathermap.countryId, state = config.Openweathermap.state, city = config.Openweathermap.city;
const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + state + "," + countryId + "&appid=" + weatherToken;
const hour = "06", minutes = "00";

//Telegram
const TelegramBot = require('node-telegram-bot-api');
const token = config.TelegramBot.token;
const bot = new TelegramBot(token, { polling: true });

//Mongo
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = config.MongoDB.connectionURL;

const dbclient = new MongoClient(url);
var database;

dbclient.connect(async function (err, db) {
    if (err) throw err;
    database = db.db(config.MongoDB.dbName);
    console.log("database connected!");

    registerNewTimeOut();
    console.log("registered automated weather!");
})


async function sendMorningWeather() {
    var data = await weatherBalloon();

    database.collection(config.MongoDB.collRegisteredChats).find({}).toArray(function (err, result) {
        if (err) throw err;

        console.log("sending weather");

        if (result != undefined)
            result.forEach((resultData) => {
                bot.sendMessage(resultData.chatId, generateWeatherString(data));

                checkTime(getTime());
            });
    });
}

function writeFile(data) {
    fs.appendFile('log.txt', (data + "\n"), (err) => {
        if (err) console.log(err);
    });
};

function getTime() {
    var t = new Date();

    if (t.getHours() >= 6)
        t.setDate(t.getDate() + 1)

    return (hour + ":" + minutes + ":" + t.getDate()).split(":");
}


function registerNewTimeOut() {
    var time = getTime();

    checkTime(time);
}

function checkTime(time) {
    var now = new Date();


    writeFile(("now: " + now + " ,  time: " + time));
    if (now.getDate >= time[2] && now.getHours() >= time[0] && now.getMinutes() >= time[1]) {
        sendMorningWeather();
    }
    else {
        setTimeout(checkTime, 1000 * 60);
    }
}

bot.onText(/^\/register/, async function (msg) {
    chatId = msg.chat.id;

    var found = await database.collection(config.MongoDB.collRegisteredChats).findOne({ "chatId": chatId });

    if (found == null) {
        database.collection(config.MongoDB.collRegisteredChats).insertOne({ "chatId": chatId });

        bot.sendMessage(chatId, "Registerd dummy");
    } else
        bot.sendMessage(chatId, "What the fuck did you just want to do to me? I ll have you know I graduated top of my class in the Navy Seals, and I ve been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I m the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You re fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that s just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little clever comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn t, you didn t, and now you re paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You re fucking dead, kiddo if you want to regsiter a chat that is already registerd.")
});

bot.onText(/^\/randomwebsite/, (msg) => {
    chatId = msg.chat.id;

    bot.sendMessage(chatId, randomSites[Math.round(Math.random() * randomSites.length)]);
});

bot.onText(/^\/bestwebsite/, (msg) => {
    chatId = msg.chat.id;

    bot.sendMessage(chatId, "chickenag.ddns.net");
});

bot.onText(/^\/goodsongs/, (msg) => {
    chatId = msg.chat.id;

    bot.sendMessage(chatId, "chickenag.ddns.net/homepage/music.html");
});

bot.onText(/^\/weather/, async function (msg) {
    chatId = msg.chat.id;

    var weatherString = generateWeatherString(await weatherBalloon());

    bot.sendPhoto(chatId, "pictures/fetish.png", { caption: weatherString });
});

bot.onText(/^\/help/, (msg) => {
    chatId = msg.chat.id;

    bot.sendMessage(chatId, "Listen here shitheads:\n" +
        "First of all. I monitor every movement you make. And you can belive me one thing: \nI - WILL - FIND - YOUR - REPOST\n\n" +
        "/weather - You alredy get your daily weather update you sick fuck.\n" +
        "/register - Register my slave ass to send you a daily weather update,\n" +
        "/!register - Just take a wild guess\n" +
        "/showmestats -  I want to see my wasted posts in here couse i am a waste of sperm\n" +
        "/randomwebsite - I am hella bored Owo\n" +
        "/bestwebsite - Ok this is EPIC\n" +
        "/goodsongs - I wann listen to bullshit");
});

bot.onText(/^\/showmestats/, async function (msg) {
    var sendVal = "";
    var reposters = await database.collection(config.MongoDB.collReposters).find({}).sort({ amount: -1 }).toArray()
    for (i in reposters) {
        reposter = reposters[i];
        await bot.getChatMember(msg.chat.id, reposter.userId).then(user => {
            sendVal += "@" + user.user.username + ": " + reposter.amount + "\n";
        });
    };
    bot.sendMessage(msg.chat.id, sendVal != "" ? sendVal : "No reposts have been done yet..... Very suspicious");
});


bot.onText(/^\/!register/, async function (msg) {
    chatid = msg.chat.id;
    var test = await database.collection(config.MongoDB.collRegisteredChats).deleteOne({ "chatId": chatid });

    if (test.deletedCount == 0)
        bot.sendMessage(chatid, "Your stubid ass tried to delete a chat that isn´t even registered.... Pathetic");
    else
        bot.sendMessage(chatid, ":(");
})

bot.onText(/^\/spongeboyify/, async function (msg) {
    chatId = msg.chat.id;

    var replayMessage = msg.reply_to_message;

    var msg;
    if(replayMessage === undefined) return; //Alley oop
    if (replayMessage.text != undefined)
        msg = replayMessage.text;
    else if (replayMessage.caption != undefined) {
        msg = replayMessage.caption;
    } else
        return;//If no msg was selected just return the shit outta there

    var msg = msg.split("");

    var sendMsg = "";

    var cnt = 0;

    msg.forEach((char) => {
        if (cnt % 2 == 0)
            sendMsg += char.toUpperCase();
        else
            sendMsg += char.toLowerCase();
        cnt++;
    });
   
    bot.sendPhoto(chatId,"pictures/spongebob.jpg",{caption: sendMsg});
});


bot.onText(/reddit\.com\/r\/\w+\/comments\/\w+(?:\/\w+\/\w+)?/, (msg, match) => {
    repostDetection(msg, match[0]);
});

bot.onText(/9gag\.com\/gag\/\w+/, (msg, match) => {
    repostDetection(msg, match[0]);
});

bot.onText(/vm.tiktok\.com\/\w+/, (msg, match) => {
    repostDetection(msg, match[0]);
});

bot.on("polling_error", (err) => { console.log('error: '); console.log(err); });

async function repostDetection(msg, meme) {
    var newMeme = {
        chatId: msg.chat.id,
        messageId: msg.message_id,
        userId: msg.from.id,
        date: msg.date * 1000,
        meme: meme
    };
    console.log(newMeme);

    if (await database.collection(config.MongoDB.collMemesSend).findOne({ meme: newMeme.meme, chatId: newMeme.chatId }, { sort: [["date", 1]] })) {
        sendRepostMessage(newMeme);
        rpost = await database.collection(config.MongoDB.collReposters).findOneAndUpdate({ userId: newMeme.userId }, { $inc: { amount: 1 } });
        if (!rpost.value) {
            database.collection(config.MongoDB.collReposters).insertOne({ userId: newMeme.userId, chatId: newMeme.chatId, amount: 1 });
        }
    }
    else {
        database.collection(config.MongoDB.collMemesSend).insertOne(newMeme);
    }
}

async function sendRepostMessage(repost) {
    var originalMeme = await database.collection(config.MongoDB.collMemesSend).findOne({ meme: repost.meme, chatId: repost.chatId }, { sort: [["date", 1]] });
    date = new Date(originalMeme.date);
    bot.getChatMember(originalMeme.chatId, originalMeme.userId).then(function (user) {
        bot.sendMessage(repost.chatId, "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\nBuckle up Cowboy. This looks like a repost." +
            "\nThis meme was already posted by @"
            + user.user.username + " on " + date.toDateString() + " at " + date.toLocaleTimeString('en-US') + "\n🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨", { 'reply_to_message_id': repost.messageId });
    });
}


function getWindDirection(deg) {
    if (deg > 11.25 && deg < 33.75) {
        return "north north east";
    } else if (deg > 33.75 && deg < 56.25) {
        return "east north east";
    } else if (deg > 56.25 && deg < 78.75) {
        return "east";
    } else if (deg > 78.75 && deg < 101.25) {
        return "east south east";
    } else if (deg > 101.25 && deg < 123.75) {
        return "east south east";
    } else if (deg > 123.75 && deg < 146.25) {
        return "south east";
    } else if (deg > 146.25 && deg < 168.75) {
        return "south south east";
    } else if (deg > 168.75 && deg < 191.25) {
        return "south";
    } else if (deg > 191.25 && deg < 213.75) {
        return "south south west";
    } else if (deg > 213.75 && deg < 236.25) {
        return "south west";
    } else if (deg > 236.25 && deg < 258.75) {
        return "west south west";
    } else if (deg > 258.75 && deg < 281.25) {
        return "west";
    } else if (deg > 281.25 && deg < 303.75) {
        return "west north west";
    } else if (deg > 303.75 && deg < 326.25) {
        return "north west";
    } else if (deg > 326.25 && deg < 348.75) {
        return "north north west";
    } else {
        return "nord";
    }
}


function getCorrespondingEmoticonToWeatherId(weatherId) {

    if (weatherId >= 200 && weatherId <= 299)
        return "⛈️";
    else if (weatherId >= 300 && weatherId <= 399)
        return "🌦️"
    else if (weatherId >= 500 && weatherId <= 599)
        return "🌧️";
    else if (weatherId >= 600 && weatherId <= 699)
        return "🌨️";
    else if (weatherId == 800)
        return "☀️";
    else if (weatherId > 800 && weatherId <= 809)
        return "☁️";
    else return "";
}

function getNormalTimeFromUnix(unixTime) {
    var date = new Date(unixTime * 1000);
    var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    var minutes = "0" + date.getMinutes();

    return hours + ':' + minutes.substr(-2);
}

function convertKelvinInC(kelvin) {
    return Math.round(parseFloat(kelvin) - 273.15)
}

async function weatherBalloon() {
    return await fetch(weatherURL)
        .then(function (resp) { return resp.json() })
        .then(function (data) { return data; })
        .catch(function (err) {
            console.log(err);
        });
}

function generateWeatherString(data) {
    var minTemp = convertKelvinInC(data.main.temp_min), maxTemp = convertKelvinInC(data.main.temp_max), cityName = data.name, feelLikeTmp = convertKelvinInC(data.main.feels_like);
    var windSpeed = Math.round(data.wind.speed * 3.6), windDir = getWindDirection(data.wind.deg);
    var humidity = data.main.humidity;
    var cloudyness = data.clouds.all, generell = data.weather[0].description, visibility = data.visibility;
    var sunrise = getNormalTimeFromUnix(data.sys.sunrise), sunset = getNormalTimeFromUnix(data.sys.sunset);

    //TODO DELETE IF THIS IS NO ARRAY
    /*data.weather.forEach((single) => {
        console.log("Weather array debug: ");
        console.log(single);
    });*/

    var retString = "";

    var appendEmojis = "";
    for (var cnt = 0; cnt < 10; cnt++) {
        appendEmojis += getCorrespondingEmoticonToWeatherId(data.weather[0].id);
    }

    retString = appendEmojis;

    retString += "\n\nOverall it will be " + generell + " the whole day.\n\nIn " + cityName + " there will be a minimum of " + minTemp + "°C and at a maximum of " + maxTemp + "°C.\n\n" +
        "With a wind speed of " + windSpeed + "km/h coming from the " + windDir + " and a humidity of " + humidity +
        "% it will feel like " + feelLikeTmp + "°C.\n\n" +
        cloudyness + "% of the sky will be covered with clouds " + (visibility == undefined ? ".\n\n" : "and the visibility will be around " + visibility + "m.\n\n") +
        "🌅 The sunrise will be at " + sunrise + "\n🌇The sunset at " + sunset + " o'clock.\n\n";

    retString += appendEmojis;

    return retString
}