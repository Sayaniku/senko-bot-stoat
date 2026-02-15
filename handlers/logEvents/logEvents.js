const messageCreate = require('./messageCreate');
const messageUpdate = require('./messageUpdate');
const messageDelete = require('./messageDelete');

module.exports.execute = async (client, oldMessage, message, newMessage) => {
    // Appelle les fonctions appropriées selon le type d'événement
    // Format: execute(client, oldMessage, message, newMessage)
    // messageCreate: (client, null, message, null)
    // messageUpdate: (client, oldMessage, null, newMessage)
    // messageDelete: (client, message, null, null)

    try {
        if (message && !oldMessage && !newMessage) {
            // Message créé: message est défini, oldMessage et newMessage sont null
            await messageCreate(client, message);
        } else if (oldMessage && newMessage && !message) {
            // Message modifié: oldMessage et newMessage sont définis, message est null
            await messageUpdate(client, oldMessage, newMessage);
        } else if (oldMessage && !newMessage && !message) {
            // Message supprimé: oldMessage est défini, message et newMessage sont null
            await messageDelete(client, oldMessage);
        }
    } catch (error) {
        console.error("Erreur dans logEvents.execute:", error);
    }
};
