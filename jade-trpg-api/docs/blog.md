# 博客后端

## 静态页面

* `static/html/blog/bolg.html`是输入博客界面的静态网页。

## 读取用户信息

`/api/blog/loadUserById`

```bash
curl 'http://www.jade-dungeon.net:8088/api/blog/loadUserById?userId=u001'
```

```javascript
{
    "status":"success",
    "user":{
        "userName":"Jade Shan",
        "avatar":"./images/atc-01.jpg",
        "desc":"Demo post with formatted elements and comments.",
        "joinTime":"2021-03-21",
        "group":"Primer",
        "homePageUrl":"#"
    }
}
```

## 读取用户博客列表

```bash
curl 'http://host:port/api/blog/loadByUser?userId=u001&page=1' 
```

```javascript
{
    "status":"success",
    "page":1,
    "pageCount":2,
    "articles":[
        {
            "time":1674389462813,
            "auth":"u001",
            "title":"新年学习计划",
            "text":"* 机器学习数学基础\r\n* 算法"
        },{
            "time":1674388588528,
            "auth":"u001",
            "title":"先进的3.5mm耳机接口",
            "text":"用了四年半的老手机从上周开始时不时死机重启。新买的荣耀 X40 GT。"
        }
    ]
}
```

## 读取推荐阅读的博客列表

`/api/blog/loadRecommandArticles`

```bash
curl 'http://host:port/api/blog/loadRecommandArticles'
```

```javascript
{
    "status":"success",
    "recommands":[
        {
            "title":"Demo post with formatted elements and comments",
            "thumbnail":"./atc-01.jpg",
            "link":"#"
        },{
            "title":"Images in this template",
            "thumbnail":"./images/atc-02.jpg",
            "link":"#"
        }
    ]
}
```

## 添加一条新博客

`/api/blog/save`

数据存入Redis，key的格式为：`jadedungeon::blog::${userId}`

```bash
curl 'http://host:port/api/blog/save' \
  -H 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundary2GucoQuV0UZl56On' \
  --data-raw $'------WebKitFormBoundary2GucoQuV0UZl56On\r\nContent-Disposition: form-data; name="userId"\r\n\r\nu001\r\n------WebKitFormBoundary2GucoQuV0UZl56On\r\nContent-Disposition: form-data; name="timeStr"\r\n\r\n2023-01-22 20:11:02\r\n------WebKitFormBoundary2GucoQuV0UZl56On\r\nContent-Disposition: form-data; name="time"\r\n\r\n1674389462813\r\n------WebKitFormBoundary2GucoQuV0UZl56On\r\nContent-Disposition: form-data; name="title"\r\n\r\n新年学习计划\r\n------WebKitFormBoundary2GucoQuV0UZl56On\r\nContent-Disposition: form-data; name="text"\r\n\r\n* 机器学习数学基础\r\n* 算法\r\n------WebKitFormBoundary2GucoQuV0UZl56On--\r\n' \
  --compressed \
  --insecure
```
