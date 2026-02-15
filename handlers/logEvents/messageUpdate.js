const fs = require('fs');
const path = require('path');

module.exports = async (client, oldMessage, newMessage) => {
    // Lire la configuration du fichier logSettings.json
    const logSettingsPath = path.join(__dirname, '../../logSettings.json');
    let logSettings = {};

    try {
        logSettings = JSON.parse(fs.readFileSync(logSettingsPath, 'utf8'));
    } catch (error) {
        console.error("Erreur de lecture du fichier logSettings.json : ", error);
        return;
    }

    // Vérifier que nous avons les deux messages et qu'ils ont un channel
    if (!oldMessage || !newMessage || !oldMessage.channel) return;

    // Ignorer les messages des bots
    if (!oldMessage.author || oldMessage.author?.bot) return;

    // stoat.js utilise serverId au lieu de guildId
    const serverId = oldMessage.channel.server?.id;
    if (!serverId) return;

    const logChannelId = logSettings[serverId];
    if (!logChannelId) return;

    // Récupérer les informations
    const author = oldMessage.author;
    const before = oldMessage.content || '[pas de contenu]';
    const after = newMessage.content || '[pas de contenu]';

    // Ne logger que si le contenu a changé
    if (before === after) return;

    const logMessage = `✏️ **Message modifié** par **${author.username}** (${author.id})\n**Avant**: ${before}\n**Après**: ${after}`;

    // Récupérer le salon de logs
    const logChannel = client.channels.get(logChannelId);
    if (logChannel) {
        try {
            await logChannel.sendMessage({
                content: logMessage
            });
        } catch (err) {
            console.error("Erreur lors de l'envoi du log:", err);
        }
    }
};
