exports.deployEnvs = {
	dev: {
		buildversion: "dev-0.0.1-",
		webRoot: ".",
		staticRoot: ".",
		apiRoot: ".",
		cdnRoot: "//localhost:8081/webroot",
		cdn3rd : "//cdn.bootcss.com"
	},
	rls: {
		buildversion: "rls-0.0.1-",
		webRoot: ".",
		staticRoot: ".",
		apiRoot: ".",
		cdnRoot: "//www.jade-dungeon.net:8081",
		cdn3rd : "//cdn.bootcss.com"
	}
};
