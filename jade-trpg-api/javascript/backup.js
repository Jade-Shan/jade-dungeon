const fs = require('fs');
const path = require('path');

const http = require("http");
const https = require("https");

for (let i=0; i < process.argv.length; i++) {
	console.log(`${i}  -  ${process.argv[i]}`);
}

let baseUrl = process.argv[2];
let backupPath = process.argv[3];

let dirname = path.resolve(__dirname, backupPath)

// 递归创建目录
let mkdirRecursive = (dirname) => {
	console.log(dirname);
    // 判断是否存在当前 path 的最后一层目录
    if (fs.existsSync(dirname)) 
        // 存在，则不做操作，直接返回
        return true
    
    // 若不存在，则判断当前 path 倒数第二层目录是否存在
    // path.dirname 可以获取当前路径的上一层路径
    // 例如： /dirName1/dirName2/dirName3
    // path.dirname('/dirName1/dirName2/dirName3') // /dirName1/dirName2
    if (mkdirRecursive(path.dirname(dirname))) {
        // 若存在，则在当前目录，创建下一层目录
        fs.mkdirSync(dirname)
        return true
    }
};

let fetchData = (url, success) => {
	http.get(url, (res) => {
		let text = "";
		res.on("data", (data) => { text += data; });
		res.on("end", () => { success(text); });
	}).on("error",(e) => {
		console.log(`获取数据失败: ${e.message}`);
	});
};

let sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};


mkdirRecursive(dirname);

fetchData(`${baseUrl}/api/blog/loadByUser?userId=u001&page=1&pageSize=65535`, (json) => {
	fs.writeFile(dirname + '/blog.json', json, err => {
		if (err) { console.error(err); }
	});
	});

fetchData(`${baseUrl}/api/gallery/loadByUser?userId=u001&page=1&pageSize=65535`, async (json) => {
	fs.writeFile(dirname + '/gallery.json', json, err => {
		if (err) { console.error(err); }
	});
	let gallery = JSON.parse(json);
	let articles = gallery.articles;
	for (let i = 0; i < articles.length; i++) {
		let a = articles[i];
		let ablums = a.ablum;
		for (let j = 0; j < ablums.length; j++) {
			let b = ablums[j];
			// console.log(b.url);
			let ca = b.url.match(/^.*\//g);
			if (ca && ca.length > 0) {
				let imgFolder = `${dirname}/${ca[0]}`;
				mkdirRecursive(imgFolder);
				await sleep(1500);
				https.get(b.url, (res) => {
					// Image will be stored at this path
					const path = `${dirname}/${b.url}`;
					const filePath = fs.createWriteStream(path);
					res.pipe(filePath);
					filePath.on('finish', () => {
						filePath.close();
						console.log('Download Completed');
					})
				})


			}
		}
	}
	});