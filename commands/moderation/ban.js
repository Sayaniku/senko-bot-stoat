const SympactEmbedBuilder = require('../../lib/EmbedBuilder');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../logSettings.json');

module.exports = {
    name: 'ban',
    aliases: ['b'],
    description: 'Bannir un utilisateur du serveur.',
    usage: '!ban <@utilisateur> [raison]',
    permissions: ['BanMembers'],

    execute: async (client, message, args) => {
        // Vérifier le serveur
        if (!message.channel.server) {
            return await message.reply("❌ Cette commande ne fonctionne que dans un serveur.");
        }

        const server = message.channel.server;
        const member = await server.fetchMember(message.author.id);

        // Vérifier permissions
        const isOwner = server.owner === message.author.id;
        const hasPermission = isOwner || member.hasPermission(message.channel, "BanMembers");

        if (!hasPermission) {
            return await message.reply("❌ Vous devez avoir la permission de bannir.");
        }

        // Parser le mention d'utilisateur
        if (args.length < 1) {
            return await message.reply(`❌ Usage: \`${this.usage}\``);
        }

        const userMatch = args[0].match(/<@([A-Z0-9]+)>/i);
        if (!userMatch) {
            return await message.reply("❌ Mentionnez un utilisateur avec @utilisateur");
        }

        const targetUserId = userMatch[1];
        const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

        try {
            // Vérifier que l'utilisateur existe dans le serveur
            const targetMember = await server.fetchMember(targetUserId).catch(() => null);

            if (!targetMember) {
                return await message.reply("❌ Cet utilisateur n'existe pas ou n'est pas dans ce serveur.");
            }

            // Vérifier que ce n'est pas l'owner
            if (targetMember.id.user === server.ownerId) {
                return await message.reply("❌ Vous ne pouvez pas bannir le propriétaire du serveur.");
            }

            // Vérifier les hiérarchies de rôles
            // Note: ranking plus petit = priorité plus haute
            // Owner = -Infinity, Pas de rôle = Infinity
            const targetRanking = targetMember.ranking;
            const memberRanking = member.ranking;
            const botMember = await server.fetchMember(client.user.id);
            const botRanking = botMember.ranking;

            if (targetRanking <= memberRanking) {
                return await message.reply("❌ Vous ne pouvez pas bannir quelqu'un avec un rôle égal ou supérieur au vôtre.");
            }

            if (targetRanking <= botRanking) {
                return await message.reply("❌ Je ne peux pas bannir quelqu'un avec un rôle égal ou supérieur au mien.");
            }

            // Bannir l'utilisateur
            await server.banUser(targetUserId, { reason });

            // Récupérer l'utilisateur pour l'afficher
            const targetUser = client.users.get(targetUserId);
            const userDisplay = targetUser ? `**${targetUser.username}**` : `<@${targetUserId}>`;

            // Réponse
            await message.reply(`✅ ${userDisplay} a été banni.\nRaison: ${reason}`);

            // Envoyer dans le salon de logs
            try {
                if (fs.existsSync(settingsPath)) {
                    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                    const logChannelId = settings[server.id];

                    if (logChannelId) {
                        const logChannel = client.channels.get(logChannelId);
                        if (logChannel) {
                            const embed = new SympactEmbedBuilder()
                                .setTitle('🚫 Utilisateur banni')
                                .setDescription(`${userDisplay} a été banni par ${message.author}`)
                                .setColor("#FF0000")
                                .build();

                            await logChannel.sendMessage({ embeds: [embed] }).catch(console.error);
                        }
                    }
                }
            } catch (logErr) {
                console.error('Erreur lors de l\'envoi du log:', logErr);
            }

        } catch (error) {
            console.error(`Erreur lors du ban: ${error}`);
            await message.reply("❌ Une erreur est survenue lors du bannissement.");
        }
    }
};
