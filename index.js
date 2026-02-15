const { Client } = require( "stoat.js");
const {token, prefix} = require("./config.json");
const fs = require("fs");
// const SympactEmbedBuilder = require("./lib/EmbedBuilder");
const eventHandler = require("./handlers/eventHandler");
const commandlist = require('./handlers/commandlist');
const logEvents = require('./handlers/logEvents/logEvents')
require('dotenv').config();

let client = new Client();
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const baseReconnectDelay = 3000; // 3 secondes

client.on("ready", async () => {
    console.info(`✅ Connecte avec le meilleur bot > ${client.user.username} (OUI ${client.user.username} EST LA MEILLEUR, COMME D'HAB!`);
    reconnectAttempts = 0; // Réinitialiser le compteur de reconnexion

    // Définir le statut du bot pour qu'il apparaisse en ligne
    try {
        await client.user.edit({
            status: {
                text: "Surveille les renards",
                presence: "Idle"
            }
        });
        console.info("✅ Statut du bot défini avec succès!");
    } catch (error) {
        console.error("❌ Erreur lors de la définition du statut:", error);
    }

    // Charger le système de vérification Twitch
    try {
        const twitchChecker = require('./events/twitch');
        twitchChecker(client);
        console.info("✅ Système Twitch initialisé et lancé!");
    } catch (error) {
        console.error("❌ Erreur lors du chargement du système Twitch:", error);
    }
});

// Événement de déconnexion
client.on("disconnect", async () => {
    console.warn("⚠️ Le bot s'est déconnecté. Tentative de reconnexion...");
    attemptReconnect();
});

// Événement d'erreur
client.on("error", (error) => {
    // Ignorer les erreurs triviales
    if (error?.type === "error" && !error?.data) {
        return; // Erreur générique vide, ignorer
    }

    console.error("❌ Une erreur s'est produite:", error);

    // Vérifier si c'est une erreur de session invalide
    if (error?.data?.type === "InvalidSession") {
        console.error("❌ ERREUR CRITIQUE: Session invalide. Vérifiez votre token dans config.json!");
        console.error("   Le token peut être expiré ou invalide.");
    } else if (error.context) {
        console.error("   Contexte de l'erreur:", error.context);
    }
});

// Fonction de reconnexion avec délai exponentiel
async function attemptReconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
        console.error("❌ Nombre max de tentatives de reconnexion atteint. Arrêt du bot.");
        process.exit(1);
    }

    reconnectAttempts++;
    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts - 1);
    console.warn(`⏳ Tentative de reconnexion ${reconnectAttempts}/${maxReconnectAttempts} dans ${delay}ms...`);

    setTimeout(async () => {
        try {
            console.info("🔄 Reconnexion en cours...");
            await client.loginBot(token);
        } catch (error) {
            console.error("❌ Reconnexion échouée:", error);
            attemptReconnect();
        }
    }, delay);
}

eventHandler(client);
commandlist(client);

// Handler de commandes + Événements de logs
client.on("messageCreate", async (message) => {
    // Ignorer les messages du bot lui-même
    if (message.author?.id === client.user?.id) return;

    // Envoyer aux logs
    if (!message.author?.bot) {
        logEvents.execute(client, null, message, null);  // Message créé
    }

    // Vérifier si le message commence par le préfixe
    if (!message.content?.startsWith(prefix)) return;

    // Extraire la commande et les arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Chercher la commande ou l'alias
    const command = client.commands.get(commandName) ||
                   client.commands.get(client.aliases.get(commandName));

    if (!command) return;

    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error(`❌ Erreur lors de l'exécution de la commande ${commandName}:`, error);
        message.reply("Une erreur s'est produite lors de l'exécution de cette commande.");
    }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    logEvents.execute(client, oldMessage, null, newMessage);  // Message modifié
});

client.on('messageDelete', (message) => {
    logEvents.execute(client, message, null, null);  // Message supprimé
});

// Easter eggs
client.on("messageCreate", async (message) => {
    if (message.content === "!hello") {
        message.reply("world");
    }
});

client.on("messageCreate", async (message) => {
    if (message.content === "Hello" || message.content === "hello" || message.content === "HELLO" || message.content === "Hi" || message.content === "hi" || message.content === "HI" || message.content === "Hey" || message.content === "hey" || message.content === "HEY" || message.content === "Salut" || message.content === "salut" || message.content === "SALUT" || message.content === "Coucou" || message.content === "coucou" || message.content === "COUCOU" || message.content === "Yo" || message.content === "yo" || message.content === "YO" || message.content === "Wesh" || message.content === "wesh" || message.content === "WESH" || message.content === "Slt" || message.content === "slt" || message.content === "SLT") {
        message.react(encodeURIComponent("👋"));
    }
});

// Connexion du bot avec le token de config.json
console.info("🚀 Tentative de connexion au bot...");
console.info("📋 Token: " + (token ? "✅ Présent" : "❌ MANQUANT"));
console.info("📋 Préfixe: " + prefix);

client.loginBot(token).catch((error) => {
    console.error("❌ Erreur initiale lors de la connexion:", error);
    if (error?.data?.type === "InvalidSession") {
        console.error("❌ ERREUR: Token invalide ou expiré!");
        console.error("   Vérifiez votre config.json et assurez-vous que le token est valide.");
        process.exit(1);
    } else {
        attemptReconnect();
    }
});
