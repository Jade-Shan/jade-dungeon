exports.deployEnvs = {
	dev: {
		buildversion: "dev-0.0.1-",
		webRoot: ".",
		staticRoot: ".",
		apiRoot: "//47.102.120.187:8088",
		apiRootSandtable: "//47.102.120.187:8088",
		cdnRoot: "//47.102.120.187:8081",
		cdn3rd : "//cdn.bootcss.com"
	},
	rls: {
		buildversion: "rls-0.0.1-",
		webRoot: "//47.102.120.187",
		staticRoot: ".",
		apiRoot: "//47.102.120.187:8088",
		apiRootSandtable: "//47.102.120.187:8088",
		cdnRoot: "//47.102.120.187:8081",
		cdn3rd : "//cdn.bootcss.com"
	}
};
