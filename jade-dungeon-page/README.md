jade-dungeon-page
=======================

Persional Website

`bash ./deploy-rls.sh`

packages

```bash
$ npm install   gulp gulp-cli gulp-less  gulp-minify-css gulp-jshint jshint gulp-uglify-es gulp-rename gulp-concat gulp-file-include gulp-processhtml gulp-clean
npm WARN deprecated source-map-url@0.4.1: See https://github.com/lydell/source-map-url
#deprecated
npm WARN deprecated source-map-url@0.4.1: See https://github.com/lydell/source-map-url
#deprecated
npm WARN deprecated urix@0.1.0: Please see https://github.com/lydell/urix#deprecated
npm WARN deprecated urix@0.1.0: Please see https://github.com/lydell/urix#deprecated
npm WARN deprecated resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated
npm WARN deprecated resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated
npm WARN deprecated source-map-resolve@0.5.3: See https://github.com/lydell/source-map-resolve#deprecated
npm WARN deprecated source-map-resolve@0.5.3: See https://github.com/lydell/source-map-resolve#deprecated
npm WARN deprecated chokidar@2.1.8: Chokidar 2 does not receive security updates since 2019. Upgrade to chokidar 3 with 15x fewer dependencies
npm WARN deprecated gulp-minify-css@1.2.4: Please use gulp-clean-css
npm WARN deprecated gulp-util@3.0.8: gulp-util is deprecated - replace it, following the guidelines at https://medium.com/gulpjs/gulp-util-ca3b1f9f9ac5

```

关于换源：

```bash
一、修改成腾讯云镜像源

1、命令

npm config set registry http://mirrors.cloud.tencent.com/npm/

2. 验证命令

npm config get registry

如果返回http://mirrors.cloud.tencent.com/npm/，说明镜像配置成功。

二、修改成淘宝镜像源

1. 命令

npm config set registry https://registry.npmmirror.com

2. 验证命令

npm config get registry

如果返回https://registry.npmmirror.com，说明镜像配置成功。

三、修改成华为云镜像源

1. 命令

npm config set registry https://mirrors.huaweicloud.com/repository/npm/

2. 验证命令

npm config get registry

如果返回https://mirrors.huaweicloud.com/repository/npm/，说明镜像配置成功。


```