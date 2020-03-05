const TelegramBot = require('node-telegram-bot-api');
const token = '594162168:AAE0wcAbFLrTr85b-j8mHV6NAAkcLu7z_18';
const bot = new TelegramBot(token, { polling: true });

var memesSend = [];
var database = require('mongoDb.js');
var chatId;

bot.onText(/\/send (.+)/, (msg, match) => {
    chatId = msg.chat.id;
    var imageResource = getRandomPicture(match[1]);
    sendPicture(imageResource);

    console.log("Got a picture request: " + match[1]);
});

bot.on('text', (msg) => {
    chatId = msg.chat.id;

    if (msg.text.toLowerCase().includes("reddit") || msg.text.toLowerCase().includes("9gag") || msg.text.toLowerCase().includes("tiktok")) {

        var newMeme = { "senderChat": chatId, "sender": msg.from.first_name, "sendOnDate": getCurrentDate(), "sendOnTime": getCurrentTime(), "meme": msg.text };

        if (memesSend.some(oldMeme => oldMeme.meme === msg.text && oldMeme.chatId === newMeme.chatId)) {
            sendRepostMessage(newMeme);
        } else {
            memesSend.push(newMeme);
        }

        console.log("Got a meme from : " + memesSend[memesSend.length - 1].sender + ", " + memesSend[memesSend.length - 1].meme);
    } else
        console.log("Got normal msg");
});

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