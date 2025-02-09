#!/bin/bash
rm -rf envs.js
cp envs-front.js envs.js
sync
node ./node_modules/gulp-cli/bin/gulp.js release
tar -cvf webroot.tar.gz webroot
scp webroot.tar.gz   jade@www.jade-dungeon.net:/home/nginx/jadedungeon/
