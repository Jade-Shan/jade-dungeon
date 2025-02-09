#!/bin/bash
rm -rf envs.js
cp envs-behind.js envs.js
sync
node ./node_modules/gulp-cli/bin/gulp.js release
tar -cvf webroot.tar.gz webroot
scp webroot.tar.gz   ecs-user@47.102.120.187:/home/ecs-user/workspace/nginx/jadedungeon/
