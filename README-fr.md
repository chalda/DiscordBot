# DiscordBot
Un bot Discord basé sur <a href="https://github.com/hydrabolt/discord.js/">discord.js</a>.

# Fonctionnalités:
- !gif query => Retourne un gif basé sur la requête. Exemple = !gif dogs
- !image query => Retourne une image provenant de Google Image (attention, il n'y a pas de filtre adulte). Exemple: !image dogs
- !youtube query=> Retourne un lien youtube. Exemple: !youtube Fortnite
- !wiki query=> Retourne le sommaire du premier résultat de recherche sur Wikipédia. Exemple: Linus Torvalds
- !wolfram query => demande à Wolfram Alpha le résulat
- !meme memetype "texte1" "texte2" => Retourne un meme. Attention, les guillemets autour de text1 et text2 sont très importants.
- !say texte => Envoie un message contenant le texte
- !alias => Créer un raccourci de commande personnalisé dans le channel.
- !join-server => Le bot rejoint le serveur demandé.
- !talk => Parler avec le bot !
- @botname => Répond quand il est @mentionné
- Gérer les channels!

Et encore plus ! Essayez `!help` pour obtenir une liste complète des commandes

# Installation

Ce bot est écrit pour fonctionner avec node.js. Allez voir : https://nodejs.org/en/download/

Une fois NodeJS installé, exécutez `npm install` depuis le répertoire du bot, cela devrait installer tous les fichiers nécessaires (packages npm). Si cette commande affiche des erreurs, le bot ne fonctionnera pas!



## Utilisateur windows
Notez que vous devez avoir un compileur C et Python dans le répertoire pour que
`npm install` fonctionne. Le bot a été testé sur Windows avec Visual Studio 2015 Community et Python 2.7, à l'exception de `!pullanddeploy`.
* [Installer Node sur Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
* [Erreurs npm sur Windows](http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm)
* [Visual Studio Community 2015](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx)
* [Python 2.7](https://www.python.org/downloads/)

[Tuck 64 a fait une vidéo afin d'illustrer la procédure](https://www.youtube.com/watch?v=H-82S2jFOII)

## RSS
Vous pouvez créer un fichier rss.json en ajoutant des flux rss sous forme de commande. Allez voir rss.json.example pour plus de détails.

## Instructions spéciales pour paramétrer l'API google search et l'API youtube :

(merci à @SchwererKonigstiger)

1) Créez une recherche personnalisée sur : https://cse.google.com/cse/create/new

2) Laissez le premier champ vide, et saisissez ce que vous souhaitez pour le nom du moteur de recherche.

3) Cliquez sur "Advanced Options" et ensuite sur ImageObject.

4) C'est créé.

5) Sur la nouvelle page, autorisez la recherche d'image dans le menu.

6) Cliquez ensuite sur "Search engine ID" sous l'en-tête des détails.

7) Copiez ceci dans le fichier auth.json, dans la partie "google_custom_search".

Vérifiez que vous possédiez bien la clé d'API Google server, qui est située dans la partie "youtube_api_key", ou la recherche va échouer.

# Lancement
Avant de lancer le bot pour la première fois, vous devez créer un fichier `auth.json`. Un token ou une adresse mail avec mot de passe d'un compte discord sont requis. Les autres informations d'identification ne sont pas requises pour que le bot s'exécute, mais elles sont vivement recommandées car les commandes qui en dépendent risquent de mal fonctionner. Voir `auth.json.example`.

Pour lancer le bot, exécuter ceci :
`node discord_bot.js`.

# Mis à jour
Si vous mettez à jour le bot, exécutez `npm update` avant de le lancer à nouveau. Si vous avez des erreurs, essayez de supprimer le dossier node_modules et exécutez de nouveau
`npm install`. Allez à [Installation](#Installation).

# A Faire:
Paramétrer le bot !

# Help
Veuillez vérifier la page des bugs GitHub de ce projet. Nous recevons beaucoup de questions similaires, et il est probable que votre problème ait déjà été résolu.


Si vous avez encore besoin d’aide, n'hésitez pas à nous rejoindre sur [discord.](https://discord.gg/m29GJBN)
