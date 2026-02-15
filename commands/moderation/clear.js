const SympactEmbedBuilder = require('../../lib/EmbedBuilder');

module.exports = {
    name: 'clear',
    aliases: ['delete', 'purge', 'cls'],
    description: 'Supprimer un nombre de messages du salon.',
    usage: '!clear <nombre>',
    permissions: ['ManageMessages'],

    execute: async (client, message, args) => {
        // Vérifier le serveur
        if (!message.channel.server) {
            return await message.reply("❌ Cette commande ne fonctionne que dans un serveur.");
        }

        const server = message.channel.server;
        const member = await server.fetchMember(message.author.id);

        // Vérifier permissions
        const isOwner = server.owner === message.author.id;
        const hasPermission = isOwner || member.hasPermission(message.channel, "ManageMessages");

        if (!hasPermission) {
            return await message.reply("❌ Vous devez avoir la permission de supprimer les messages.");
        }

        // Parser le nombre de messages à supprimer
        if (args.length < 1) {
            return await message.reply(`❌ Usage: \`${this.usage}\``);
        }

        const amount = parseInt(args[0]);

        // Vérifier que c'est un nombre valide
        if (isNaN(amount)) {
            return await message.reply("❌ Veuillez spécifier un nombre valide de messages à supprimer.");
        }

        // Vérifier les limites
        // Note: stoat.js a une limite de 99 messages pour fetchMessages
        if (amount < 1 || amount > 99) {
            return await message.reply("❌ Vous devez supprimer entre 1 et 99 messages (limite de l'API).");
        }

        try {
            // Récupérer les messages du salon
            // stoat.js utilise fetchMessages() directement
            let messages = [];
            try {
                const messagesData = await message.channel.fetchMessages({ limit: amount + 1 });
                messages = Array.from(messagesData.values ? messagesData.values() : messagesData);
            } catch (err) {
                // Fallback: essayer d'accéder directement aux messages
                console.warn("fetchMessages non disponible, tentative alternative...", err);
                return await message.reply("❌ Impossible de récupérer les messages du salon.");
            }

            let deletedCount = 0;
            let failedCount = 0;

            // Supprimer chaque message
            for (const msg of messages) {
                try {
                    // Ne pas supprimer le message de commande
                    if (msg.id !== message.id) {
                        await msg.delete();
                        deletedCount++;
                    }
                } catch (error) {
                    console.error(`Erreur lors de la suppression du message ${msg.id}:`, error);
                    failedCount++;
                }
            }

            // Créer l'embed de confirmation
            const embed = new SympactEmbedBuilder()
                .setTitle('🗑️ Messages supprimés')
                .setDescription(`${deletedCount} message(s) supprimé(s) par ${message.author}`)
                .setColor("#FF6B6B")
                .build();

            // Envoyer la confirmation
            try {
                const confirmationMsg = await message.reply({ embeds: [embed] });

                // Supprimer le message de confirmation après 3 secondes
                setTimeout(async () => {
                    try {
                        // Vérifier que le message existe encore avant de supprimer
                        if (confirmationMsg && confirmationMsg.id) {
                            await confirmationMsg.delete();
                        }
                    } catch (err) {
                        // Silencieusement ignorer l'erreur si le message n'existe plus
                        if (err?.type === "NotFound") {
                            console.warn("Message de confirmation déjà supprimé ou introuvable.");
                        } else {
                            console.error("Erreur lors de la suppression du message de confirmation:", err);
                        }
                    }
                }, 3000);
            } catch (error) {
                console.error("Erreur lors de l'envoi du message de confirmation:", error);
            }

        } catch (error) {
            console.error(`Erreur lors du clear: ${error}`);
            await message.reply("❌ Une erreur est survenue lors de la suppression des messages.");
        }
    }
};

