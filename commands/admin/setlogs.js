const fs = require('fs');
const path = require('path');
const SympactEmbedBuilder = require('../../lib/EmbedBuilder');

const settingsPath = path.join(__dirname, '../../logSettings.json');

module.exports = {
    name: 'setlogs',
    aliases: ['set-logs', 'logs'],
    description: 'Définir le salon de logs de modération.',
    usage: '!setlogs <#salon>',
    permissions: ['ManageServer'],

    execute: async (client, message, args) => {
        // Vérifier le serveur
        if (!message.channel.server) {
            return await message.reply("❌ Cette commande ne fonctionne que dans un serveur.");
        }

        const server = message.channel.server;
        const member = await server.fetchMember(message.author.id);

        // Vérifier permissions
        const isOwner = server.owner === message.author.id;
        const hasPermission = isOwner || member.hasPermission(message.channel, "ManageServer");

        if (!hasPermission) {
            return await message.reply("❌ Vous devez être administrateur ou owner du serveur.");
        }

        // Parser le salon mentionné
        if (args.length < 1) {
            return await message.reply(`❌ Usage: \`${this.usage}\``);
        }

        const channelMatch = args[0].match(/<#([A-Z0-9]+)>/i);
        if (!channelMatch) {
            return await message.reply("❌ Mentionnez un salon avec #salon");
        }

        const channelId = channelMatch[1];
        const channel = client.channels.get(channelId);

        // Vérifier que le canal existe et appartient au serveur
        if (!channel || channel.server?.id !== server.id) {
            return await message.reply("❌ Salon invalide ou introuvable.");
        }

        try {
            // Charger les settings existants
            let settings = {};
            if (fs.existsSync(settingsPath)) {
                try {
                    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                } catch (err) {
                    console.error("Erreur lors de la lecture des settings:", err);
                    settings = {};
                }
            }

            // Ajouter/mettre à jour le serveur
            settings[server.id] = channelId;

            // Sauvegarder
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

            // Réponse
            await message.reply(`✅ Salon de logs défini sur <#${channelId}>`);

            // Envoi du log de confirmation
            try {
                const embed = new SympactEmbedBuilder()
                    .setTitle('📋 Salon de logs configuré')
                    .setDescription(`Salon des logs défini par ${message.author}\n<#${channelId}>`)
                    .setColor("#00FF00")
                    .build();

                await channel.sendMessage({ embeds: [embed] }).catch(console.error);
            } catch (logErr) {
                console.error('Erreur lors de l\'envoi du log:', logErr);
            }

        } catch (error) {
            console.error(`Erreur lors de la configuration des logs: ${error}`);
            await message.reply("❌ Une erreur est survenue lors de la configuration.");
        }
    }
};
