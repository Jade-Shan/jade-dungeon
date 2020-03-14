var envs = {
	dev: {
		buildversion: "0.0.1-dev",
		webRoot: "//127.0.0.1:8080/web-root",
		apiRoot: "//127.0.0.1:8082/src/mock-backend",
		cdnRoot: "//127.0.0.1:8081/jadeutils.v2/"
		cdn-3rd: "//127.0.0.1:8081/3rd.v2/",
	},
	fat: {
		buildversion: "0.0.1-fat",
		apiRoot: "//127.0.0.1:8082/src/mock-backend",
		cdnRoot: "//127.0.0.1:8081/jadeutils.v2/"
		cdn-3rd: "//127.0.0.1:8081/3rd.v2/",
	},
	prd: {
		buildversion: "0.0.1",
		apiRoot: "//127.0.0.1:8082/src/mock-backend",
		cdnRoot: "//127.0.0.1:8081/jadeutils.v2/"
		cdn-3rd: "//127.0.0.1:8081/3rd.v2/",
	}
}
