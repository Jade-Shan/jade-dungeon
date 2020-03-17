exports.deployEnvs = {
	dev: {
		buildversion: "dev-0.0.1-",
		webRoot: ".",
		staticRoot: ".",
		apiRoot: "//localhost:8082",
		cdnRoot: "//localhost:8081/webroot",
		cdn3rd : "//cdn.bootcss.com"
	},
	rls: {
		buildversion: "rls-0.0.1-",
		webRoot: ".",
		staticRoot: ".",
		apiRoot: "//118.178.197.156:8082",
		cdnRoot: "//118.178.197.156:8081",
		cdn3rd : "//cdn.bootcss.com"
	}
};
