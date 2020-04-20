var config = require("./config.json");

//Weather
const fetch = require("node-fetch");
const weatherToken = config.Openweathermap.token;
const cityID = config.Openweathermap.cityID;
const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + "Villach" + "," + "Carinthia" + "," + "040" + "&appid=" + weatherToken;

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

dbclient.connect(function (err, db) {
    if (err) throw err;
    database = db.db(config.MongoDB.dbName)
    console.log("database connected!");
})

bot.onText(/^\/weather/, async function (msg) {
    chatId = msg.chat.id;

    var data = await weatherBalloon(cityID);

    console.log(data);

    var weatherString = generateWeatherString(data);

    bot.sendPhoto(chatId, "pictures/fetish.png", { caption: weatherString });
});


//TODO maybe add weather emoticons for different weather
function generateWeatherString(data) {
    var minTemp = convertKelvinInC(data.main.temp_min), maxTemp = convertKelvinInC(data.main.temp_max), cityName = data.name, feelLikeTmp = convertKelvinInC(data.main.feels_like);
    var windSpeed = data.wind.speed * 3.6, windDir = getWindDirection(data.wind.deg);
    var humidity = data.main.humidity, pressure = data.main.pressure / 100;
    var cloudyness = data.clouds.all, generell = data.weather[0].description, visibility = data.visibility;

    //TODO DELETE IF THIS IS NO ARRAY
    console.log("DEBUG: " + data.weather);


    return "Overall it will be " + generell + " the whole day.\nIn " + cityName + " it will have at least " + minTemp + "°C and at a maximum " + maxTemp + "°C.\n" +
        "Due to the wind with a speed of " + windSpeed + "km/h coming from " + windDir + ", a humidity of " + humidity +
        "% and a air pressure of " + pressure + " Pa it will feel like " + feelLikeTmp + "°C.\n" +
        "There will be also a cloudyness of " + cloudyness + "% and a visibility of " + visibility + "m.";
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


bot.onText(/^\/help/, (msg) => {
    chatId = msg.chat.id;

    bot.sendMessage(chatId, "Listen here shitheads:\n" +
        "First of all. I monitor every movement you make. And you can belive me one thing: \nI - WILL - FIND - YOUR - REPOST\n\n" +
        "/weather - You alredy get your daily weather update you sick fuck.\n" +
        "/showmestats -  I want to see my wasted posts in here couse i am a waste of sperm");
});

bot.onText(/^\/showmestats/, showmestats);

async function showmestats(msg) {
    var sendVal = "";
    var reposters = await database.collection(config.MongoDB.collReposters).find({}).sort({ amount: -1 }).toArray()
    for (i in reposters) {
        reposter = reposters[i];
        await bot.getChatMember(msg.chat.id, reposter.userId).then(user => {
            sendVal += "@" + user.user.username + ": " + reposter.amount + "\n";
        });
    };
    bot.sendMessage(msg.chat.id, sendVal != "" ? sendVal : "No reposts have been done yet..... Very suspicious");
}

bot.onText(/reddit\.com\/r\/\w+\/comments\/\w+(?:\/\w+\/\w+)?/, (msg, match) => {
    repostDetection(msg, match[0]);
})

bot.onText(/9gag\.com\/gag\/\w+/, (msg, match) => {
    repostDetection(msg, match[0]);
})

bot.onText(/vm.tiktok\.com\/\w+/, (msg, match) => {
    repostDetection(msg, match[0]);
})

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
        bot.sendMessage(repost.chatId, "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\nBuckle up Cowboy. This looks like a repost.\nThis meme was already posted by @"
            + user.user.username + " on " + date.toDateString() + " at " + date.toLocaleTimeString('en-US') + "\n🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨", { 'reply_to_message_id': repost.messageId });
    });
}


function getWindDirection(deg) {
    if (deg > 11.25 && deg < 33.75) {
        return "NNE";
    } else if (deg > 33.75 && deg < 56.25) {
        return "ENE";
    } else if (deg > 56.25 && deg < 78.75) {
        return "E";
    } else if (deg > 78.75 && deg < 101.25) {
        return "ESE";
    } else if (deg > 101.25 && deg < 123.75) {
        return "ESE";
    } else if (deg > 123.75 && deg < 146.25) {
        return "SE";
    } else if (deg > 146.25 && deg < 168.75) {
        return "SSE";
    } else if (deg > 168.75 && deg < 191.25) {
        return "S";
    } else if (deg > 191.25 && deg < 213.75) {
        return "SSW";
    } else if (deg > 213.75 && deg < 236.25) {
        return "SW";
    } else if (deg > 236.25 && deg < 258.75) {
        return "WSW";
    } else if (deg > 258.75 && deg < 281.25) {
        return "W";
    } else if (deg > 281.25 && deg < 303.75) {
        return "WNW";
    } else if (deg > 303.75 && deg < 326.25) {
        return "NW";
    } else if (deg > 326.25 && deg < 348.75) {
        return "NNW";
    } else {
        return "N";
    }
}