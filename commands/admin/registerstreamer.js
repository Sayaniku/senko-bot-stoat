const fs = require('fs');
const path = require('path');

const streamersPath = path.join(__dirname, '../../twitch_streamers.json');

module.exports = {
    name: 'registerstreamer',
    aliases: ['regstreamer', 'addstreamer'],
    description: 'Enregistre un streamer Twitch à surveiller dans un salon spécifique.',
    usage: '!registerstreamer <pseudo> <#salon> [@role] [message personnalisé]',
    permissions: ['ManageServer'], // Requis: gérer le serveur ou être owner

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

        // Parser les arguments
        if (args.length < 2) {
            return await message.reply(
                `❌ **Usage:** \`${this.usage}\`\n\n` +
                `**Exemples:**\n` +
                `• \`!registerstreamer zerator #lives\` - Basique\n` +
                `• \`!registerstreamer zerator #lives @Live Zerator est en live !\` - Avec rôle et message`
            );
        }

        const pseudo = args[0].toLowerCase();

        // Extraire le salon (format <#CHANNEL_ID> sur Revolt)
        const channelMatch = args[1].match(/<#([A-Z0-9]+)>/i);
        if (!channelMatch) {
            return await message.reply("❌ Le salon doit être mentionné avec #salon (ex: #lives)");
        }

        const channelId = channelMatch[1];
        const channel = client.channels.get(channelId);

        if (!channel || channel.server?.id !== server.id) {
            return await message.reply("❌ Salon introuvable ou invalide.");
        }

        // Extraire le rôle (optionnel, format <@&ROLE_ID>)
        let roleId = null;
        let customMessage = null;
        let messageStartIndex = 2;

        if (args[2] && args[2].match(/<@&([A-Z0-9]+)>/i)) {
            const roleMatch = args[2].match(/<@&([A-Z0-9]+)>/i);
            roleId = roleMatch[1];

            // Vérifier que le rôle existe dans le serveur
            if (!server.roles || !server.roles[roleId]) {
                return await message.reply("❌ Le rôle spécifié n'existe pas sur ce serveur.");
            }

            messageStartIndex = 3;
        }

        // Le reste est le message personnalisé
        if (args.length > messageStartIndex) {
            customMessage = args.slice(messageStartIndex).join(' ');
        }

        // Charger ou initialiser la liste des streamers
        let streamers = [];
        if (fs.existsSync(streamersPath)) {
            try {
                streamers = JSON.parse(fs.readFileSync(streamersPath, 'utf8'));
            } catch (error) {
                console.error("Erreur lors de la lecture de twitch_streamers.json:", error);
                streamers = [];
            }
        }

        const serverId = server.id;

        // Vérifier si le streamer est déjà enregistré pour ce serveur
        if (streamers.some(s => s.pseudo === pseudo && s.serverId === serverId)) {
            return await message.reply(`⚠️ Le streamer **${pseudo}** est déjà enregistré sur ce serveur.`);
        }

        // Créer l'entrée
        const entry = {
            pseudo,
            channelId: channel.id,
            serverId
        };

        if (roleId) entry.roleId = roleId;
        if (customMessage) entry.customMessage = customMessage;

        // Ajouter et sauvegarder
        streamers.push(entry);

        try {
            fs.writeFileSync(streamersPath, JSON.stringify(streamers, null, 2), 'utf8');
        } catch (error) {
            console.error("Erreur lors de l'écriture de twitch_streamers.json:", error);
            return await message.reply("❌ Erreur lors de la sauvegarde. Vérifiez les logs.");
        }

        // Message de confirmation
        let replyMsg = `✅ Le streamer **${pseudo}** a été ajouté pour le salon <#${channel.id}> sur ce serveur.`;
        if (roleId) replyMsg += `\n🔔 Le rôle <@&${roleId}> sera mentionné à chaque live.`;
        if (customMessage) replyMsg += `\n💬 Message personnalisé défini.`;

        await message.reply(replyMsg);
    }
};