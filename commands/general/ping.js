module.exports = {
    name: 'ping',
    // aliases: ['p'],
    description: 'Vérifier la latence du bot',
    execute: async (client, message, args) => {
        const sent = await message.reply('Pong! 🏓');
        // Calculer le temps de réponse
        const timeDiff = sent.createdAt - message.createdAt;
        await sent.edit(`Pong! 🏓\nLatence: ${timeDiff}ms`);
    }
};


