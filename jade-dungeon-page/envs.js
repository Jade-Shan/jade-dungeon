exports.deployEnvs = {
	dev: {
		buildversion: "dev-0.0.1-",
		webRoot: ".",
		staticRoot: ".",
		apiRoot: "//localhost:8088",
		apiRootSandtable: "//localhost:8088",
		cdnRoot: "//www.jade-dungeon.net:8081",
		cdn3rd : "//cdn.bootcss.com"
	},
	rls: {
		buildversion: "rls-0.0.1-",
		webRoot: ".",
		staticRoot: ".",
		apiRoot: "//www.jade-dungeon.net:8088",
		apiRootSandtable: "//www.jade-dungeon.net:8088",
		cdnRoot: "//www.jade-dungeon.net:8081",
		cdn3rd : "//cdn.bootcss.com"
	}
};
