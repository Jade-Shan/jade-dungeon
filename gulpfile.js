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
		clean = require('gulp-clean');            //清空文件夹
		
var pathLess = "./src/less";
var pathCss = "./styles/";
var pathJs = "./src/javascript/";
var pathScripts = "./scripts/";

// 清空图片、样式、js
gulp.task('clean', function() {
		gulp.src([pathCss, pathScripts], {read: false}).pipe(clean());
});

// less编译为css
gulp.task('build-less', function() {
	gulp.src(pathLess + '**/*.less')
		.pipe(less({ compress: true }))
		.on('error', function(e) {console.log(e);} )
		.pipe(gulp.dest(pathCss));
	});

// 合并、压缩、重命名css
gulp.task('min-styles', function() {
	gulp.src([pathCss + '**/*.css'])
		.pipe(concat('portal.css'))      // 合并文件为all.css
		.pipe(gulp.dest(pathCss))  // 输出all.css文件
		.pipe(rename({suffix: '.min'})) // 重命名all.css为 all.min.css
		.pipe(minifycss())                // 压缩css文件
		.pipe(gulp.dest(pathCss)); // 输出all.min.css
	});

// 检查javascript
gulp.task('check-js', function() {
	gulp.src(pathJs + '**/*.js').pipe(jshint()) .pipe(jshint.reporter('default'));
	});

gulp.task('min-scripts', function() {
	gulp.src(pathJs + '**/*.js')
		.pipe(concat('portal.js'))
		.pipe(gulp.dest(pathScripts))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest(pathScripts));
	});

// // 默认任务 清空图片、样式、js并重建 运行语句 gulp
// gulp.task('default', ['build-less'], function(){
//     gulp.start('min-styles','min-scripts');
//     gulp.start();
// });
// 监控变化
gulp.task('develop', function() {
	gulp.watch(
		[pathLess + '**/*.less', pathJs + '**/*.js'], 
		['clean', 'build-less', 'min-styles']);
		});

