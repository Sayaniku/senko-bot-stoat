# Senko-Bot Pour Stoat

J'ai migre le bot Senko sur Stoat au kaz ou si discord decide de faire pire et comme ca tout le monde peut toucher au code

Necessaire : 
- Nodejs 24
- Votre Token Stoat
- Un token d'application Twitch

-----------------

Token Stoat : 
- Aller dans les parametres
- Mes Bots / My bots
- Creer un bot (donnez le nom que vous voulez)
- Allez tout en bas de votre bot et faites "Copier le Token" / "Copy Token"
- Mettez le token sur la ligne "token": a la place de "YOUR STOAT TOKEN HERE" (en gardant les guillemets)

-----------------

Token Twitch
- Allez dans https://dev.twitch.tv/ et connectez vous en haut a gauche
- Allez dans https://dev.twitch.tv/console (your console en haut a droite)
- Faites "Enregistrer une application"
- Donnez le meme nom que le bot Stoat
- Dans "URL de redirection OAuth", mettez "http://localhost" (obligatoire mais il a pas vocation a etre utilise sur les chaines twitch)
- Dans categorie mettez "Application integration"
- Mettez votre Application en confidentielle
- Dans l'application, recuperez le "Secret du client" qui doit etre mis dans le fichier .env dans TWITCH_CLIENT_SECRET
- Recuperez aussi "Identifiant client" qui doit etre aussi mis dans le fichier .env dans TWITCH_CLIENT_ID

-----------------

Reste plus qu'a lancer le bot avec ``node .`` si tout les etapes au dessus sont reussi
