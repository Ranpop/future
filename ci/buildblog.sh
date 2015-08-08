#bin/sh
cd /usr1/nodejs/blog/
pwd
echo "kill and start app"
pkill node
nohup node app.js &
sleep 1s 
echo -e "\n"