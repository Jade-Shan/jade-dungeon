# 相册后端

## 静态页面

* `static/html/blog/gallery.html`是输入新图片的静态网页。

没有上传功能，图片放在网络相册上，在这里引用。

## 新建相册

```bash
curl 'http://www.jade-dungeon.net:8088/api/gallery/save' \
  -H 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryBmhZKvLW7LxKhW1h' \
  --data-raw $'------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="userId"\r\n\r\nu001\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="timeStr"\r\n\r\n2022-12-28 20:51:07\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="time"\r\n\r\n1672231867240\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="title"\r\n\r\n第一个上传B站的视频\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="text"\r\n\r\n2022年10月07日第一次上传B站视频。是自己做的SD规格的GP-03D。现在已经过去快3个月了，100次播放2个赞\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n第一个上传B站的视频\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\nSD规格的GP-03D\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\nhttps://aaa.com//pSJ639g.jpg\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n不用在意数据\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n100次播放2个赞\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\nhttps://aaa.com//pSJ6Gcj.jpg\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picTitle"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picDesc"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h\r\nContent-Disposition: form-data; name="picUrl"\r\n\r\n\r\n------WebKitFormBoundaryBmhZKvLW7LxKhW1h--\r\n' \
  --compressed \
  --insecure
```

## 加载用户的相册

```bash
curl 'http://www.jade-dungeon.net:8088/api/gallery/loadByUser?userId=u001&page=1' 
```

```javascript
{
    "status":"success",
    "page":1,
    "pageCount":1,
    "articles":[
        {
            "time":"1672231867240",
            "auth":"u001",
            "title":"第一个上传B站的视频",
            "text":"2022年10月07日第一次上传B站视频。",
            "ablum":[
                {
                    "id":0,
                    "title":"第一个上传B站的视频",
                    "desc":"SD规格的GP-03D",
                    "url":"https://aaa.com/pSJ639g.jpg"
                },{
                    "id":1,
                    "title":"不用在意数据",
                    "desc":"100次播放2个赞",
                    "url":"https://s1.ax1x.com/2023/01/22/pSJ6Gcj.jpg"
                }
            ]
        },{
            "time":"1670248032397",
            "auth":"u001",
            "title":"密接隔离",
            "text":"公司同楼层有人阳了，判定为密接，集中隔离",
            "ablum":[
                {
                        "id":0,
                        "title":"判定为密接",
                        "desc":"公司同楼层有人阳了",
                        "url":"https://aaa.com/zgirRJ.png"
                },{
                        "id":1,
                        "title":"酒店入住",
                        "desc":"酒店入住",
                        "url":"https://aaa.com/2022/12/07/zgPoD0.png"
                }
            ]
         }
    ]
}
```
