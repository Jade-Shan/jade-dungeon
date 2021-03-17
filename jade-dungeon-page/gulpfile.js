// #!/bin/bash
// # lessc -x style.less > style.css
// # lessc style.less > style.css

// gulp build-less：你会在目录下发现less目录下的less文件被编译成对应的css文件。
// gulp min-styles：会在css目录下输出all.css和all.min.css文件。
// gulp develop：会监听所有less文件，当有less文件改变时，会执行build-less和min-styles
const gulp = require('gulp');
const less = require('gulp-less');                //less编译
const minifycss = require('gulp-minify-css');     //css压缩
const jshint = require('gulp-jshint');            //js检查
const uglify = require('gulp-uglify-es').default;  //js压缩，用于es2015以上版本
const rename = require('gulp-rename');            //重命名
const concat  = require('gulp-concat');           //合并文件
const fileinclude = require('gulp-file-include'); //html模板
const processhtml = require('gulp-processhtml');  // html引用替换
const clean = require('gulp-clean');              //清空文件夹
const envs = require('./envs');              //清空文件夹
const cfg = {
	path: {
		src: {
			js  : "./src/scripts/" ,
			less: "./src/styles/"  ,
			tpls: "./src/tpls/",
			img : "./src/images/",
			html: "./src/html/",
			api : "./src/api/"
		}, dst: {
			js  : "./webroot/scripts/" ,
			css : "./webroot/styles/"  ,
			img : "./webroot/images/",
			html: "./webroot/",
			api : "./webroot/api/"
		} },
	env : {} 
};

// =======================
// MockApi
// =======================

gulp.task('clean-mock-api', () => {
		return gulp.src([cfg.path.dst.api + '**/*'], 
			{read: false, allowEmpty: true}).pipe(clean());
});

gulp.task('copy-mock-api', gulp.series('clean-mock-api', () => {
		return gulp.src([cfg.path.src.api + '**/*'])
		.pipe(gulp.dest(cfg.path.dst.api))
}));

// =======================
// images
// =======================

gulp.task('clean-images', () => {
		return gulp.src([cfg.path.dst.img + '**/*'], 
			{read: false, allowEmpty: true}).pipe(clean());
});

gulp.task('copy-images', gulp.series('clean-images', () => {
		return gulp.src([cfg.path.src.img + '**/*.*'])
		.pipe(gulp.dest(cfg.path.dst.img))
}));

// =======================
// css
// =======================

gulp.task('clean-styles', () => {
		return gulp.src([cfg.path.dst.css + '**/*.css'], 
			{read: false, allowEmpty: true}).pipe(clean());
});

gulp.task('build-styles', gulp.series('clean-styles', () => {
	return gulp.src(cfg.path.src.less + '**/*.less')
		.pipe(less({compress: true})).on('error', (e) => {console.log(e)})
		.pipe(gulp.dest(cfg.path.dst.css));
}));

gulp.task('min-styles',   gulp.series('clean-styles', () => {
	return gulp.src(cfg.path.src.less + '**/*.less')
		.pipe(less({compress: true})).on('error', (e) => {console.log(e)})
		.pipe(concat('blog.css'))            // 合并文件为all.css
		.pipe(rename({suffix: '.min'}))      // 重命名all.css为 all.min.css
		.pipe(minifycss())                   // 压缩css文件
		.pipe(gulp.dest(cfg.path.dst.css));  // 输出all.min.css
}));

// =======================
// javascript
// =======================

gulp.task('clean-scripts', () => {
	return gulp.src([cfg.path.dst.js + '**/*.js'], 
		{read: false, allowEmpty: true}).pipe(clean());
});

// 检查javascript
gulp.task('check-scripts', () => {
	return gulp.src(cfg.path.src.js + '**/*.js').pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// 复制末处理的源文件供调试用
gulp.task('copy-scripts', gulp.series('clean-scripts', 'check-scripts', () => {
	return gulp.src([
			cfg.path.src.js + 'base.js',
			cfg.path.src.js + 'journal.js',
			cfg.path.src.js + 'gallery.js'
	]).pipe(gulp.dest(cfg.path.dst.js))
}));

// 合并、压缩、重命名javascript
gulp.task('min-scripts', gulp.series('clean-scripts', 'check-scripts', () => {
	return gulp.src([
			cfg.path.src.js + 'base.js',
			cfg.path.src.js + 'journal.js',
			cfg.path.src.js + 'gallery.js'
	]).pipe(concat('all.js'))
		.pipe(rename({suffix: '.min'})).pipe(uglify())
		.pipe(gulp.dest(cfg.path.dst.js));
}));

// =======================
// html
// =======================

function configEnv(envEntry) {
	cfg.env = envEntry;
	cfg.env.buildversion = cfg.env.buildversion + (new Date()).getTime();
	console.log("buildversion : " + cfg.env.buildversion);
	console.log("webRoot      : " + cfg.env.webRoot     );
	console.log("apiRoot      : " + cfg.env.apiRoot     );
	console.log("cdnRoot      : " + cfg.env.cdnRoot     );
	console.log("cdn3rd       : " + cfg.env.cdn3rd      );
}


gulp.task('clean-html-dev', () => {
	configEnv(envs.deployEnvs.dev)
	return gulp.src([cfg.path.dst.html + '**/*.html'], {read: false}).pipe(clean());
});

gulp.task('include-html', gulp.series('clean-html-dev', async (callback) => {
	return gulp.src([cfg.path.src.html + "**/*.html"])
		.pipe(fileinclude({prefix: '@@', basepath: '@root', context: cfg.env}))
		.pipe(gulp.dest(cfg.path.dst.html));
}));

gulp.task('clean-html-rls', () => {
	configEnv(envs.deployEnvs.rls)
	return gulp.src([cfg.path.dst.html + '**/*.html'], {read: false}).pipe(clean());
});

gulp.task('process-html', gulp.series('clean-html-rls', async (callback) => {
	return gulp.src([cfg.path.src.html + "**/*.html", cfg.path.src.tpls + "**/*.html"])
		.pipe(fileinclude({prefix: '@@', basepath: '@root', context: cfg.env}))
    .pipe(processhtml())
		.pipe(gulp.dest(cfg.path.dst.html));
}));

// gulp.task('clean-html', async (callback) => {
// 	await gulp.src([cfg.path.dst.html + '**/*.html'], {read: false}).pipe(clean());
// 	await callback();
// });
// 
// gulp.task('include-html', gulp.series('clean-html', async (callback) => {
// 	await gulp.src([cfg.path.src.html + "**/*.html"])
// 		.pipe(fileinclude({prefix: '@@', basepath: '@root', context: cfg.env}))
// 		.pipe(gulp.dest(cfg.path.dst.html));
// 	await callback();
// }));
// 
// gulp.task('process-html', gulp.series('clean-html', async (callback) => {
// 	await gulp.src([cfg.path.src.html + "**/*.html", cfg.path.src.tpls + "**/*.html"])
// 		.pipe(fileinclude({prefix: '@@', basepath: '@root', context: cfg.env}))
//     .pipe(processhtml())
// 		.pipe(gulp.dest(cfg.path.dst.html));
// 	await callback();
// }));

gulp.task('default', gulp.parallel('copy-mock-api', 'copy-images', 
'build-styles', 'copy-scripts', 'include-html'));

gulp.task('release', gulp.parallel('copy-mock-api', 'copy-images', 
'min-styles', 'min-scripts', 'process-html'));

