# 个人网站后端

## 主要功能

* [基础框架](docs/framework.md)
* [博客后端](docs/blog.md)
* [网络相册后端](docs/gallery.md)
* [天气预报服务后端](docs/)
* [TRPG沙盘工具后端](docs/)

## 打包与发布

打包并上传：

```bash
tar -cvf patch.tar.gz javascript static package.json *.sh *.bat
scp patch.tar.gz   username@host:appdir
```

登录服务器后解压并运行：

```bash
cd appdir
tar -xvf patch.tar.gz
node .javascript/main.js
```
