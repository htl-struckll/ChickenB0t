var config = require("./config.json");

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

dbclient.connect(function (err,db) {
    if (err) throw err;
    database = db.db(config.MongoDB.dbName)
    console.log("database connected!");
})

bot.onText(/^\/send (.+)/, (msg, match) => {
    chatId = msg.chat.id;
    var imageResource = getRandomPicture(match[1]);
    sendPicture(imageResource);

    console.log("Got a picture request: " + match[1]);
});

bot.onText(/^\/send/, (msg) => {
    chatId = msg.chat.id;
    var imageResource = getRandomPicture(match[1]);
    sendPicture(imageResource);

    console.log("Got a picture request: " + match[1]);
});

bot.onText(/^\/help/, (msg) => {
    chatId = msg.chat.id;

    bot.sendMessage(chatId, "Listen here shitheads:\n" +
        "First of all. I monitor every movement you make. And you can belive me one thing: \nI - WILL - FIND - YOUR - REPOST\n\n" +
        "/send        -  UwU da-a-a-addy i need HEEENTAIIIIII (work in progress)\n" +
        "/showmestats -  I want to see my wasted posts in here couse i am a waste of sperm");
});

bot.onText(/^\/showmestats/, showmestats);

async function showmestats(msg){
    var sendVal = "";
    var reposters = await database.collection(config.MongoDB.collReposters).find({}).sort({amount: -1}).toArray()
    for (i in reposters) {
        reposter = reposters[i];
        await bot.getChatMember(msg.chat.id, reposter.userId).then(user => {
            sendVal += "@" + user.user.username + ": " + reposter.amount + "\n";
        });
    };
    bot.sendMessage(msg.chat.id, sendVal != "" ? sendVal : "No reposts have been done yet..... Very suspicious");
}

bot.onText(/reddit\.com\/r\/\w+\/comments\/\w+(?:\/\w+\/\w+)?/, (msg,match) => {
    repostDetection(msg, match[0]);
})

bot.onText(/9gag\.com\/gag\/\w+/, (msg,match) => {
    repostDetection(msg, match[0]);
})

bot.onText(/vm.tiktok\.com\/\w+/, (msg,match) => {
    repostDetection(msg, match[0]);
})

bot.on("polling_error", (err) => {console.log('error: '); console.log(err);});

async function repostDetection(msg, meme) {
    var newMeme = { 
        chatId: msg.chat.id,
        messageId: msg.message_id,
        userId: msg.from.id,
        date: msg.date * 1000,
        meme: meme
    };
    console.log(newMeme);
    if (await database.collection(config.MongoDB.collMemesSend).findOne({meme:newMeme.meme, chatId:newMeme.chatId},{sort:[["date",1]]})) {
        sendRepostMessage(newMeme);
        rpost = await database.collection(config.MongoDB.collReposters).findOneAndUpdate({ userId: newMeme.userId },{$inc : {amount : 1}});
        if (!rpost.value) {
            database.collection(config.MongoDB.collReposters).insertOne({ userId: newMeme.userId, chatId: newMeme.chatId, amount: 1 });
        }
    }
    else
    {
        database.collection(config.MongoDB.collMemesSend).insertOne(newMeme);
    }
}

async function sendRepostMessage(repost) {
    var originalMeme = await database.collection(config.MongoDB.collMemesSend).findOne({meme:repost.meme, chatId:repost.chatId},{sort:[["date",1]]});
    date = new Date(originalMeme.date);
    bot.getChatMember(originalMeme.chatId,originalMeme.userId).then(function(user) {
        bot.sendMessage(repost.chatId, "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\nBuckle up Cowboy. This looks like a repost.\nThis meme was already posted by @"
            + user.user.username + " on " + date.toDateString() + " at " + date.toLocaleTimeString('en-US') + "\n🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨",{'reply_to_message_id':repost.messageId});
    });
}

function getRandomPicture(keyword) {

    console.log("no get random picture");
}