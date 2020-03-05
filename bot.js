const TelegramBot = require('node-telegram-bot-api');
const token = '594162168:AAE0wcAbFLrTr85b-j8mHV6NAAkcLu7z_18';
const bot = new TelegramBot(token, { polling: true });
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://MasterChickenHD:lol1@cluster0-nj6wv.mongodb.net/test?retryWrites=true&w=majority";
const collMemesSend = "memesSend";
const collReposters = "reposters";

var database;
var memesSend = [];
var reposters = [];
var chatId;

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    database = db.db("MemeBot");
    loadContent();

    console.log("connected to db and loaded content");
});

async function loadContent() {
    memesSend = await database.collection(collMemesSend).find({}).toArray();
    reposters = await database.collection(collReposters).find({}).toArray();
}


bot.onText(/\/send (.+)/, (msg, match) => {
    chatId = msg.chat.id;
    var imageResource = getRandomPicture(match[1]);
    sendPicture(imageResource);

    console.log("Got a picture request: " + match[1]);
});

bot.onText(/\/send/, (msg) => {
    chatId = msg.chat.id;
    var imageResource = getRandomPicture(match[1]);
    sendPicture(imageResource);

    console.log("Got a picture request: " + match[1]);
});

bot.onText(/\/help/, (msg) => {
    chatId = msg.chat.id;

    bot.sendMessage(chatId, "Listen here shitheads:\n" +
        "First of all. I monitor every movement you make. And you can belive me one thing: \nI - WILL - FIND - YOUR - REPOST\n\n" +
        "/send        -  UwU da-a-a-addy i need HEEENTAIIIIII (work in progress)\n" +
        "/showmestats -  I want to see my wasted posts in here couse i am a waste of sperm");
});

bot.onText(/\/showmestats/, (msg) => {
    chatId = msg.chat.id;

    reposters.sort((a, b) => {
        return (a.amount - b.amount) * -1;
    });

    var sendVal = "";
    var cnt = 1;

    reposters.forEach(obj => {
        sendVal += cnt + ". " + obj.name + ", " + obj.amount + "\n";
        cnt++;
    });

    bot.sendMessage(chatId, sendVal != "" ? sendVal : "No reposts have been done yet..... Very suspicious");
});

bot.on('text', (msg) => {
    chatId = msg.chat.id;

    if (msg.text.toLowerCase().includes("reddit") || msg.text.toLowerCase().includes("9gag") || msg.text.toLowerCase().includes("tiktok")) {

        var newMeme = { "senderChat": chatId, "sender": msg.from.first_name != undefined ? msg.from.first_name : "" + " " + msg.from.last_name != undefined ? msg.from.last_name : "", "sendOnDate": getCurrentDate(), "sendOnTime": getCurrentTime(), "meme": msg.text };

        if (memesSend.some(oldMeme => oldMeme.meme === msg.text && oldMeme.chatId === newMeme.chatId)) {
            sendRepostMessage(newMeme);
            addRepostToReposter(newMeme);
        } else {
            memesSend.push(newMeme);
            addValueToDb(newMeme, collMemesSend);
        }
    }
});

function addValueToDb(meme, collection) {
    database.collection(collection).insertOne(meme);
}

function addRepostToReposter(repostedMeme) {
    var found = false;

    reposters.forEach(obj => {
        var idx = 0;
        if (obj.name === repostedMeme.sender) {
            reposters[idx].amount = reposters[idx].amount + 1;
            found = true;

            var toUpdate = { $set: { "amount": reposters[idx].amount } };
            var query = { "name": reposters[idx].name };
            updateValueInDb(query, toUpdate, collReposters);
        }

        idx++;
    });

    if (!found) {
        reposter = { "name": repostedMeme.sender, "amount": 1 };
        reposters.push(reposter);
        addValueToDb(reposter, collReposters);
    }

}

async function updateValueInDb(serach, toUpdate, collection) {
    console.log(serach);
    try {
        await database.collection(collection).updateOne(serach, toUpdate, function (err, res) {
            if (err) throw err;
        });

    } catch (e) {
        console.log(e);
    }
}

async function sendRepostMessage(repost) {
    var originalMeme = memesSend.filter(obj => {
        return obj.meme === repost.meme;
    });

    bot.sendMessage(chatId, "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨");
    await sleep(100);
    bot.sendMessage(chatId, "Buckle up Cowboy. This looks like a repost.");
    await sleep(100);
    bot.sendMessage(chatId, "This meme was already posted by " + originalMeme[0].sender + " on the " + originalMeme[0].sendOnDate + " at " + originalMeme[0].sendOnTime);
    await sleep(100);
    bot.sendMessage(chatId, "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨");
}

function sendPicture(image_src) {
    bot.sendPicture(chatId, image_src);
}

function getCurrentDate() {
    var now = new Date();
    return String(now.getDate()).padStart(2, '0') + "."
        + String(now.getMonth() + 1).padStart(2, '0') + "." + now.getFullYear();
}

function getCurrentTime() {
    var now = new Date();
    return now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomPicture(keyword) {

    console.log("no get random picture");
}