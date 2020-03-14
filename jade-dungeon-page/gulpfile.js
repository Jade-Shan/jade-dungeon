// #!/bin/bash
// # lessc -x style.less > style.css
// # lessc style.less > style.css

// gulp build-less：你会在目录下发现less目录下的less文件被编译成对应的css文件。
// gulp min-styles：会在css目录下输出all.css和all.min.css文件。
// gulp develop：会监听所有less文件，当有less文件改变时，会执行build-less和min-styles
var gulp = require('gulp'),
		less = require('gulp-less'),              //less编译
		minifycss = require('gulp-minify-css'),   //css压缩
		jshint = require('gulp-jshint'),          //js检查
		uglify  = require('gulp-uglify'),         //js压缩
		rename = require('gulp-rename'),          //重命名
		concat  = require('gulp-concat'),         //合并文件
		fileinclude = require('gulp-file-include'), //html模板
		processhtml = require('gulp-processhtml'),  // html引用替换
		clean = require('gulp-clean');            //清空文件夹
		



const cfg = {
	path: {
		src: {
			jsc  : "./src/scripts/" ,
			less: "./src/styles/"  ,
			tplt: "./src/pagetemp/",
			html: "./src/htmlpage/"
		}, tmp: {
			jsc : "./tmp/scripts/" ,
			css : "./tmp/styles/"  ,
			html: "./tmp/htmlpage/"
		}, dst: {
			jsc : "./webroot/scripts/" ,
			css : "./webroot/styles/"  ,
			html: "./webroot/htmlpage/"
		} }
};

// =======================
// css
// =======================

gulp.task('clean-styles', async (callback) => {
		await gulp.src([cfg.path.tmp.css, cfg.path.dst.css], 
			{read: false, allowEmpty: true}).pipe(clean());
		await callback();
});

gulp.task('build-less', gulp.series(/*'clean-styles',*/ async (callback) => {
	await gulp.src(cfg.path.src.less + '**/*.less')
		.pipe(less({compress: true}))
		.on('error', (e) => {console.log(e)})
		.pipe(gulp.dest(cfg.path.tmp.css));
	await callback();
}));

gulp.task('min-styles', gulp.series(/* 'build-less',*/ async (callback) => {
	await gulp.src([cfg.path.tmp.css + '*.css'])
		.pipe(concat('all.css'))           // 合并文件为all.css
		.pipe(gulp.dest(cfg.path.tmp.css))     // 输出all.css文件
		.pipe(rename({suffix: '.min'}))    // 重命名all.css为 all.min.css
		.pipe(minifycss())                 // 压缩css文件
		.pipe(gulp.dest(cfg.path.dst.css));    // 输出all.min.css
	await callback();
}));


// =======================
// javascript
// =======================

gulp.task('clean-scripts', async (callback) => {
	await gulp.src([cfg.path.tmp.jsc,cfg.path.dst.jsc], 
		{read: false, allowEmpty: true}).pipe(clean());
	await callback();
});

// 检查javascript
gulp.task('check-scripts', gulp.series(/* 'clean-scripts',*/ async (callback) => {
	await gulp.src(cfg.path.src.jsc + '**/*.js').pipe(jshint())
		.pipe(jshint.reporter('default'));
	await callback();
}));

// 合并、压缩、重命名javascript
gulp.task('min-scripts', gulp.series(/*'check-scripts',*/ async (callback) => {
	await gulp.src(cfg.path.src.jsc + '**/*.js').pipe(concat('script.js'))
		.pipe(gulp.dest(cfg.path.tmp.jsc))
		.pipe(rename({suffix: '.min'})).pipe(uglify())
		.pipe(gulp.dest(cfg.path.dst.jsc));
	await callback();
}));



