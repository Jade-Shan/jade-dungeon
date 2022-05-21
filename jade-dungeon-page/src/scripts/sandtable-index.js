/* jshint esversion: 8 */

let login = async (username, password, token) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRootAuth + 'login?t=' + (new Date()).getTime(), 
			type: 'POST', dataType: 'json', 
			data: {username: username, password: password, token: token},
			timeout: 30000,
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { 
					reject(data); }
			},
			error: function(xhr, errorType, error) { 
				reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

let userLogin = async (username, password, token) => {
	await login(username, password, token).then((data) => {
		console.log(data);
	}).catch((err) => {
		if ("username exists" == err.msg) {
			alert('用户名已经被使用');
		} else {
			alert('注册失败');
		}
	});
};



let regist = async (username, password) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRootAuth + 'regist?t=' + (new Date()).getTime(), 
			type: 'POST', dataType: 'json', 
			data: {username: username, password: password},
			timeout: 30000,
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { 
					reject(data); 
				}
			},
			error: function(xhr, errorType, error) { 
				reject(xhr); 
			},
			complete: function(xhr, status) { }
		});
	});
};

let userRegist = async (username, password) => {
	await regist(username, password).then((data) => {
		console.log(data);
		if (username == data.username) {
			alert('注册成功');
		} else {
			alert('注册失败');
		}
	}).catch((err) => {
		if ("username exists" == err.msg) {
			alert('用户名已经被使用');
		} else {
			alert('注册失败');
		}
	});
};


