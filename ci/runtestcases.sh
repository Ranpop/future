#bin/sh
pwd
cd /usr1/nodejs/blog/
pwd
out=$(mocha)
echo $out
echo $out | grep "failing" --color
if [ $? -eq 0 ]; then
echo "yes"
exit 1
else
echo "no"
fi
echo "all testcases are OK!"
exit 0
