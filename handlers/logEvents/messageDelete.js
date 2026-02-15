const fs = require('fs');
const path = require('path');

// Cache des messages récents pour la suppression
const messageCache = new Map();

// Nettoyer le cache tous les 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of messageCache.entries()) {
        if (now - value.timestamp > 5 * 60 * 1000) {
            messageCache.delete(key);
        }
    }
}, 5 * 60 * 1000);

// Fonction pour ajouter des messages au cache
const cacheMessage = (messageId, messageData) => {
    messageCache.set(messageId, {
        ...messageData,
        timestamp: Date.now()
    });
    console.log(`[MessageDelete Cache] Message ${messageId} mis en cache`);
};

// Fonction principale pour logger la suppression
const deleteMessageHandler = async (client, message) => {
    try {
        // Lire la configuration du fichier logSettings.json
        const logSettingsPath = path.join(__dirname, '../../logSettings.json');
        let logSettings = {};

        try {
            logSettings = JSON.parse(fs.readFileSync(logSettingsPath, 'utf8'));
        } catch (error) {
            console.error("Erreur de lecture du fichier logSettings.json : ", error);
            return;
        }

        console.log("[MessageDelete Debug]", {
            messageType: typeof message,
            messageKeys: message ? Object.keys(message).slice(0, 5) : 'null',
            cacheSize: messageCache.size,
            isCachedMessage: message ? messageCache.has(message.id || message) : false
        });

        // Essayer de récupérer le message du cache
        let cachedMessage = null;
        const messageId = message?.id || message;

        if (messageCache.has(messageId)) {
            cachedMessage = messageCache.get(messageId);
            console.log("[MessageDelete] Message trouvé dans le cache");
        }

        // Si pas de cache, on ne peut pas logger
        if (!cachedMessage) {
            console.warn("[MessageDelete] Message non trouvé dans le cache - impossible de logger");
            console.warn(`[MessageDelete] Cherchait le message: ${messageId}`);
            console.warn(`[MessageDelete] Messages en cache: ${Array.from(messageCache.keys()).slice(0, 3).join(', ')}`);
            return;
        }

        // Ignorer les messages des bots
        if (cachedMessage.author?.bot) {
            console.log("[MessageDelete] Ignoré - Message du bot");
            messageCache.delete(messageId);
            return;
        }

        // stoat.js utilise serverId au lieu de guildId
        const serverId = cachedMessage.serverId;
        if (!serverId) {
            console.warn("[MessageDelete] serverId manquant dans le cache");
            messageCache.delete(messageId);
            return;
        }

        const logChannelId = logSettings[serverId];
        if (!logChannelId) {
            console.warn(`[MessageDelete] Pas de logChannelId configuré pour ${serverId}`);
            messageCache.delete(messageId);
            return;
        }

        // Récupérer les informations de l'auteur
        const author = cachedMessage.author;
        const logMessage = `🗑️ **Message supprimé** par **${author.username}** (${author.id}):\n${cachedMessage.content}`;

        // Récupérer le salon de logs
        const logChannel = client.channels.get(logChannelId);
        if (!logChannel) {
            console.warn(`[MessageDelete] Salon de logs ${logChannelId} introuvable`);
            messageCache.delete(messageId);
            return;
        }

        console.log(`[MessageDelete] Envoi du log dans ${logChannelId}`);
        await logChannel.sendMessage({
            content: logMessage
        });

        // Nettoyer le cache
        messageCache.delete(messageId);

    } catch (err) {
        console.error("[MessageDelete] Erreur:", err);
    }
};

// Exporter les deux
module.exports = deleteMessageHandler;
module.exports.cacheMessage = cacheMessage;
