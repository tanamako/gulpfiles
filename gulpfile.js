var gulp = require('gulp');
var stylus = require('gulp-stylus');
var watch = require('gulp-watch');
var notify  = require('gulp-notify');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var webserver = require('gulp-webserver');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var del = require('del');
var vinylPaths = require('vinyl-paths');


// -- FYI --
// gulpのタスクを同期的に実行する方法
// http://qiita.com/morou/items/d54000396a2a7d0714de

gulp.task('webserver', function() {
	gulp.src('./')
	.pipe(webserver({
		host:'0.0.0.0',
		livereload: true,
		directoryListing: true,
		port: 3000
	}));
});

gulp.task('jshint:sp',function(){
	return gulp.src(['sp/js/**/*.js','!sp/js/all*.js','!sp/js/lib/jquery-2.1.3.min.js'])
	.pipe(jshint())
	.pipe(notify(function(file){
		if(file.jshint.success){
			return false
		}
		var errors = file.jshint.results.map(function(data){
			if(data.error){
				return "("+ data.error.line + ":" + data.error.character + ")" + data.error.reason;
			}
		}).join("\n");
		return file.relative + "(" + file.jshint.results.length + " errors)\n" + errors;
	}))
})
gulp.task('jshint:pc',function(){
	return gulp.src(['pc/js/**/*.js','!pc/js/all.js','!pc/js/lib/jquery-2.1.3.min.js','!pc/js/lib/masonry.pkgd.min.js'])
	.pipe(jshint())
	.pipe(notify(function(file){
		if(file.jshint.success){
			return false
		}
		var errors = file.jshint.results.map(function(data){
			if(data.error){
				return "("+ data.error.line + ":" + data.error.character + ")" + data.error.reason;
			}
		}).join("\n");
		return file.relative + "(" + file.jshint.results.length + " errors)\n" + errors;
	}))
})
gulp.task('concat:sp',function(){
	return gulp.src([
		'sp/js/lib/segment.js',
		'sp/js/modules/namespace.js',
		'sp/js/modules/dispatcher.js',
		'sp/js/actions/namespace.js',
		'sp/js/actions/common.js',
		'sp/js/actions/index.js',
		'sp/js/actions/withdrawal.js',
		'sp/js/actions/history.js',
    'sp/js/actions/notification.js',
		'sp/js/actions/inquiry.js',
    'sp/js/actions/expiration.js',
		'sp/js/initialize.js'
		])
	.pipe(concat('all.js'))
	.pipe(uglify())
	.pipe(gulp.dest('sp/js/'))
})


// SP単一ページ用CSSの生成
gulp.task('stylus:sp-page', function() {
  return gulp.src('stylus/*.styl')
  .pipe(plumber())
  .pipe(stylus({
    compress: true
  }))
  .pipe(gulp.dest('css/'))
 })
// 第二階層共通CSSの生成
gulp.task("stylus:sp-lower",function(){
	return gulp.src('lower/*.styl')
  .pipe(plumber())
  .pipe(stylus({
    compress: true
  }))
  .pipe(gulp.dest('css/lower'))
})
// 第二階層共通CSSの結合
gulp.task("concat:sp-lower",["stylus:sp-lower"],function(){
	return gulp.src("css/lower/*.css")
	.pipe(concatCss("lower.css"))
	.pipe(gulp.dest('css/'))
})
// 第二階層共通CSSの削除
gulp.task('clean:sp-css',["concat:sp-lower"],function () {
  return gulp.src('css/lower')
  .pipe(vinylPaths(del))
});


gulp.task('imagemin',function (){
	return gulp.src('/images/*')
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]	
	}))
	.pipe(gulp.dest('dist/images'));
});


gulp.task('watch:sp', function(){
	gulp.watch('sp/js/actions/*.js',['jshint:sp','concat:sp']);
	gulp.watch('stylus/*.styl',['stylus:sp-page','stylus:sp-lower','concat:sp-lower','clean:sp-css']);
})


gulp.task('default', ['webserver','imagemin']);
gulp.task('start:sp', ['webserver','watch:sp']);
