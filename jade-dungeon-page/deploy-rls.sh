#!/bin/bash
#  node ./node_modules/gulp-cli/bin/gulp.js         
node ./node_modules/gulp-cli/bin/gulp.js release
tar -cvf webroot.tar.gz webroot
# scp webroot.tar.gz morgan@www.jade-dungeon.net:/home/morgan/workspace/nginx-instance/www.jade-dungeon.net/
scp webroot.tar.gz   jade@www.jade-dungeon.net:/home/nginx/jadedungeon
