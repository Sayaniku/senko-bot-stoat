module.exports = {
    name: "help",
    description: "Aide des commandes pour le bot.",
    execute: async (client, message, args) => {
        const sent = await message.reply(`**Voici la liste des commandes disponibles :**
        Administrateur : 
            - !liststreamers => Affiche la liste des streamers qui sont annonce + le salon.
            - !registerstreamer [streamer] (role) [#salon] => Enregistre un streamer et le salon ou il annonce (et un ping en option).
            - !unregisterstreamer [streamer] => Supprime un streamer de la liste et son annonce.
            - !setlogs [#salon] => permet de définir un salon pour les logs [EN BETA ENCORE]
        Moderateur : 
            - !ban [@user] (raison) => Bannir un utilisateur du serveur.
            - !kick [@user] (raison) => Expulser un utilisateur du serveur.
            - !clear [nombre] => Supprimer un nombre de messages dans le salon (entre 1 et 99).
            - Note : le !mute et !multimute utilise un timeout vanilla, il n'est pas encore disponible
        General :
            - !help => Affiche ce message d'aide.
            - !ping => Pong.
            - !letmein => LAISSEZ MOI ENTRER
            - !gratuit => c'est rien tkt, juste un pave mdr
            - !pt => C'EST ENCORE PT
        `)
    }
}