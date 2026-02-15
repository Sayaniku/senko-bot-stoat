const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../twitch_streamers.json');

function loadStreamers() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveStreamers(list) {
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
}

async function addStreamer(pseudo, channelId) {
    const list = loadStreamers();
    const exists = list.some(item => item.pseudo.toLowerCase() === pseudo.toLowerCase());
    if (exists) {
        return 'exists';
    }
    list.push({ pseudo: pseudo.toLowerCase(), channelId });
    saveStreamers(list);
    return 'added';
}

function getStreamers() {
    return loadStreamers();
}

module.exports = { addStreamer, getStreamers };