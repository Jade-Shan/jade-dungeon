#!/bin/bash
rm -rf envs.js
cp envs-rls.js envs.js
sync
node ./node_modules/gulp-cli/bin/gulp.js release
tar -cvf webroot.tar.gz webroot
scp webroot.tar.gz   user-name@host-name:web-root
