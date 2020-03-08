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

    reposters.forEach(reposter => {
        sendVal += cnt + ". " + reposter.username + ", " + reposter.amount + "\n";
        cnt++;
    });

    bot.sendMessage(chatId, sendVal != "" ? sendVal : "No reposts have been done yet..... Very suspicious");
});

bot.onText(/.*(reddit\.com\/r\/\w*\/comments\/\w*).*/, (msg,match) => {
    repostDetection(msg, match[0]);
})

bot.onText(/.*(9gag\.com\/gag\/\w*).*/, (msg,match) => {
    repostDetection(msg, match[0]);
})

bot.onText(/.*(vm.tiktok\.com\/\w*).*/, (msg,match) => {
    repostDetection(msg, match[0]);
})

bot.on("polling_error", (err) => {console.log('error: '); console.log(err);});

function repostDetection(msg, meme) {
    var newMeme = { 
        "chatId": msg.chat.id,
        "messageId": msg.message_id,
        "userId": msg.from.id,
        //"username": msg.from.first_name != undefined ? msg.from.first_name : "" + " " + msg.from.last_name != undefined ? msg.from.last_name : "",
        "date": msg.date * 1000,
        "meme": meme
    };

    if (memesSend.some(oldMeme => oldMeme.meme === newMeme.meme && oldMeme.chatId === newMeme.chatId)) {
        sendRepostMessage(newMeme);
        addRepostToReposter(newMeme);
    } else {
        memesSend.push(newMeme);
        addValueToDb(newMeme, collMemesSend);
    }
}

function addValueToDb(meme, collection) {
    database.collection(collection).insertOne(meme);
}

async function sendRepostMessage(repost) {
    var originalMeme = memesSend.filter(meme => {
        return meme.meme === repost.meme;
    });
    date = new Date(originalMeme[0].date);
    bot.getChatMember(originalMeme[0].chatId,originalMeme[0].userId).then(function(user) {
        bot.sendMessage(repost.chatId, "🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\nBuckle up Cowboy. This looks like a repost.\nThis meme was already posted by @"
            + user.user.username + " on " + date.toDateString() + " at " + date.toLocaleTimeString('en-US') + "\n🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨",{'reply_to_message_id':repost.messageId});
    });
    
}

function addRepostToReposter(repostedMeme) {
    var found = false;

    reposters.forEach(reposter => {
        var idx = 0;
        if (reposter.userId === repostedMeme.userId) {
            reposters[idx].amount = reposters[idx].amount + 1;
            found = true;

            var toUpdate = { $set: { "amount": reposters[idx].amount } };
            var query = { "userId": reposters[idx].userId };
            updateValueInDb(query, toUpdate, collReposters);
        }

        idx++;
    });

    if (!found) {
        reposter = { "userId": repostedMeme.userId, "username": repostedMeme.username, "amount": 1 };
        reposters.push(reposter);
        addValueToDb(reposter, collReposters);
    }
}

async function updateValueInDb(serach, toUpdate, collection) {
    try {
        await database.collection(collection).updateOne(serach, toUpdate, function (err, res) {
            if (err) throw err;
        });

    } catch (e) {
        console.log(e);
    }
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