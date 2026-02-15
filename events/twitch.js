const { getStreamers } = require('../lib/twitchStreamersManager');
const SympactEmbedBuilder = require('../lib/EmbedBuilder');
// Use a universal fetch: prefer global (Node >=18) with fallback to undici package
const fetch = globalThis.fetch || require('undici').fetch;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
let twitchToken = null;

async function getTwitchToken() {
    if (twitchToken) return twitchToken;

    try {
        const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, { method: 'POST' });
        const data = await res.json();

        // Vérifier si la réponse est valide
        if (!data.access_token) {
            console.error("Erreur Twitch: pas de token reçu", data);
            return null;
        }

        twitchToken = data.access_token;

        // Calculer le timeout (par défaut 3600 secondes = 1 heure)
        const expiresIn = data.expires_in || 3600;
        const timeoutDuration = Math.max(1, Math.min((expiresIn - 60) * 1000, 2147483647));

        // S'assurer que timeoutDuration est un nombre valide
        if (isNaN(timeoutDuration)) {
            console.warn("Timeout invalide calculé, utilisation du timeout par défaut (3600s)");
            setTimeout(() => { twitchToken = null; }, 3600000);
        } else {
            setTimeout(() => { twitchToken = null; }, timeoutDuration);
        }

        return twitchToken;
    } catch (error) {
        console.error("Erreur lors de la récupération du token Twitch:", error);
        return null;
    }
}

const liveNotified = new Set();

async function checkLive(client) {
    const streamers = getStreamers();
    if (streamers.length === 0) return;

    const token = await getTwitchToken();

    // Vérifier que le token est valide
    if (!token) {
        console.error("❌ Impossible de récupérer un token Twitch valide. Vérifiez TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET.");
        return;
    }

    for (const { pseudo, channelId, serverId, roleId, customMessage } of streamers) {
        try {
            const url = `https://api.twitch.tv/helix/streams?user_login=${pseudo}`;
            const res = await fetch(url, {
                headers: {
                    'Client-ID': TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                console.error(`Erreur API Twitch pour ${pseudo}: ${res.status} ${res.statusText}`);
                continue;
            }

            const data = await res.json();
            if (data.data && data.data.length > 0) {
                if (!liveNotified.has(`${serverId}:${pseudo}`)) {
                    liveNotified.add(`${serverId}:${pseudo}`);
                    const stream = data.data[0];

                    // Créer l'embed avec SympactEmbedBuilder
                    const embed = new SympactEmbedBuilder()
                        .setTitle(`${stream.user_name} est en live !`)
                        .setUrl(`https://twitch.tv/${stream.user_name}`)
                        .setDescription(stream.title && stream.title.length > 0 ? stream.title : "Live en cours")
                        .setColor("#9146FF")  // Couleur Twitch
                        .build();

                    try {
                        // Récupérer le canal depuis client.channels
                        const channel = client.channels.get(channelId);

                        if (channel) {
                            let variables = {
                                '{user.name}': stream.user_name,
                                '{stream.game}': stream.game_name || "Inconnu",
                                '{user.twitch.url}': `https://twitch.tv/${stream.user_name}`,
                                '{user.twitch_url}': `https://twitch.tv/${stream.user_name}`
                            };

                            // Construire le contenu du message
                            let content = '';
                            if (roleId) content += `<@&${roleId}> `;
                            if (customMessage) {
                                let msg = customMessage;
                                for (const [key, value] of Object.entries(variables)) {
                                    msg = msg.replaceAll(key, value);
                                }
                                content += msg;
                            } else {
                                // Message par défaut si pas de message personnalisé
                                content += `**${stream.user_name}** est en live sur Twitch !`;
                            }

                            // Ajouter les infos du stream dans le contenu
                            content += `\n\n🎮 **Jeu:** ${stream.game_name || "Inconnu"}`;
                            content += `\n👥 **Viewers:** ${stream.viewer_count}`;
                            content += `\n🔗 **Lien:** https://twitch.tv/${stream.user_name}`;

                            // Envoyer le message avec l'embed
                            await channel.sendMessage({
                                content: content.trim(),
                                embeds: [embed]
                            });
                        } else {
                            console.warn(`⚠️ Salon ${channelId} introuvable pour le streamer ${pseudo}`);
                        }
                    } catch (err) {
                        console.error(`Erreur en envoyant le live dans le salon ${channelId}:`, err);
                    }
                }
            } else {
                liveNotified.delete(`${serverId}:${pseudo}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la vérification de ${pseudo}:`, error);
        }
    }
}

module.exports = (client) => {
    setInterval(() => checkLive(client), 5 * 1000);
};