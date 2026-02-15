// Note: stoat.js/Revolt n'a pas d'équivalent natif pour les audit logs
// Cette implémentation est simplifiée pour signaler les bans sans raison

module.exports = {
  name: 'serverBan',
  /**
   * @param {import('stoat.js').ServerBan} ban
   */
  async execute(ban) {
    const server = ban.server;
    const user = ban.user;

    try {
      // Revolt n'a pas d'audit logs natifs comme Discord.js
      // On ne peut donc pas vérifier automatiquement la raison du ban
      // Cette commande est laissée comme exemple, mais limitée en fonctionnalité

      console.log(`[BanCheck] Utilisateur ${user.username} a été banni du serveur ${server.name}`);

      // Note: Le déban automatique nécessiterait une raison stockée ailleurs
      // Vous pouvez implémenter un système personnalisé avec base de données

    } catch (err) {
      console.error('[BanCheck] Erreur lors du traitement du ban :', err);
    }
  }
};