const fs = require('fs');
const path = require('path');

const streamersPath = path.join(__dirname, '../../twitch_streamers.json');

module.exports = {
    name: 'liststreamers',
    aliases: ['liststream', 'streamers'],
    description: 'Liste tous les streamers Twitch enregistrés sur ce serveur.',
    usage: '!liststreamers',
    permissions: ['ManageServer'],

    execute: async (client, message, args) => {
        // Vérifier si la commande est exécutée dans un serveur
        if (!message.channel.server) {
            return await message.reply("❌ Cette commande ne peut être utilisée que dans un serveur.");
        }

        const server = message.channel.server;
        const member = await server.fetchMember(message.author.id);

        // Vérifier si l'utilisateur est owner du serveur
        const isOwner = server.owner === message.author.id;

        // Vérifier si l'utilisateur a les permissions requises
        const hasPermission = isOwner || member.hasPermission(message.channel, "ManageServer");

        if (!hasPermission) {
            return await message.reply("❌ Vous devez être administrateur ou owner du serveur pour utiliser cette commande.");
        }

        // Charger la liste des streamers
        let streamers = [];
        if (fs.existsSync(streamersPath)) {
            try {
                streamers = JSON.parse(fs.readFileSync(streamersPath, 'utf8'));
            } catch (error) {
                console.error("Erreur lors de la lecture de twitch_streamers.json:", error);
                return await message.reply("❌ Erreur lors de la lecture de la liste des streamers.");
            }
        }

        // Filtrer les streamers de ce serveur
        const serverStreamers = streamers.filter(s => s.serverId === server.id);

        if (serverStreamers.length === 0) {
            return await message.reply("📋 Aucun streamer n'est enregistré sur ce serveur.\n\nUtilisez `!registerstreamer` pour en ajouter un.");
        }

        // Construire le message de liste
        let listMessage = `📋 **Streamers enregistrés sur ce serveur** (${serverStreamers.length}):\n\n`;

        serverStreamers.forEach((streamer, index) => {
            listMessage += `**${index + 1}.** **${streamer.pseudo}**\n`;
            listMessage += `   └ Salon: <#${streamer.channelId}>\n`;
            if (streamer.roleId) {
                listMessage += `   └ Rôle: <@&${streamer.roleId}>\n`;
            }
            if (streamer.customMessage) {
                listMessage += `   └ Message: "${streamer.customMessage}"\n`;
            }
            listMessage += '\n';
        });

        await message.reply(listMessage);
    }
};



