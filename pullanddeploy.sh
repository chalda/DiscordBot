echo "Stop server"
echo "====================================="
# forever stop server.js

echo "Update Code"
echo "====================================="
# cd ~/expro-future
# git pull
# pull if you want to merge or fetch/reset to overwrite
git fetch
git reset --hard origin/master

echo "Install dependency"
# cd passpro-crm/app
# bower install

# cd ../../passpro
npm install

echo "Restart server"
echo "====================================="
node discord_bot.js
# forever start server.js
# cd