const fs = require('fs'); 
const path = require('path');
const messageDeleteModule = require('./messageDelete');

module.exports = async (client, message) => {
    try {
        // Mettre le message en cache pour la suppression
        messageDeleteModule.cacheMessage(message.id, {
            id: message.id,
            content: message.content,
            author: message.author,
            serverId: message.channel?.server?.id,
            channelId: message.channel?.id,
            timestamp: Date.now()
        });

        // Lire la configuration du fichier logSettings.json
        const logSettingsPath = path.join(__dirname, '../../logSettings.json');
        let logSettings = {};

        try {
            logSettings = JSON.parse(fs.readFileSync(logSettingsPath, 'utf8'));
        } catch (error) {
            console.error("Erreur de lecture du fichier logSettings.json : ", error);
            return;
        }

        // Ignorer les messages des bots et vérifier que le message a un channel
        if (!message || !message.channel || message.author?.bot) return;

        // stoat.js utilise serverId au lieu de guildId
        const serverId = message.channel.server?.id;
        if (!serverId) return;

        const logChannelId = logSettings[serverId];
        if (!logChannelId) return;

        // Récupérer les informations de l'auteur
        const author = message.author;
        const logMessage = `📝 **Message créé** par **${author.username}** (${author.id}):\n${message.content}`;

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
    } catch (err) {
        console.error("[MessageCreate] Erreur:", err);
    }
};
