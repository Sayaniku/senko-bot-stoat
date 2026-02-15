const fs = require('fs');
const path = require('path');

const streamersPath = path.join(__dirname, '../../twitch_streamers.json');

module.exports = {
    name: 'unregisterstreamer',
    aliases: ['unregstream', 'removestreamer', 'delstreamer'],
    description: 'Supprime un streamer Twitch de la liste de surveillance.',
    usage: '!unregisterstreamer <pseudo>',
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

        // Vérifier les arguments
        if (args.length < 1) {
            return await message.reply(
                `❌ **Usage:** \`${this.usage}\`\n\n` +
                `**Exemple:** \`!unregisterstreamer zerator\``
            );
        }

        const pseudo = args[0].toLowerCase();

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

        // Trouver le streamer à supprimer
        const initialLength = streamers.length;
        streamers = streamers.filter(s => !(s.pseudo === pseudo && s.serverId === server.id));

        if (streamers.length === initialLength) {
            return await message.reply(`⚠️ Le streamer **${pseudo}** n'est pas enregistré sur ce serveur.\n\nUtilisez \`!liststreamers\` pour voir la liste.`);
        }

        // Sauvegarder la liste mise à jour
        try {
            fs.writeFileSync(streamersPath, JSON.stringify(streamers, null, 2), 'utf8');
        } catch (error) {
            console.error("Erreur lors de l'écriture de twitch_streamers.json:", error);
            return await message.reply("❌ Erreur lors de la sauvegarde. Vérifiez les logs.");
        }

        await message.reply(`✅ Le streamer **${pseudo}** a été supprimé de la liste de surveillance de ce serveur.`);
    }
};



