var gulp 			= require('gulp');
var stylus 		= require('gulp-stylus');
var watch 		= require('gulp-watch');
var notify  	= require('gulp-notify');
var concat 		= require('gulp-concat');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var jshint 		= require('gulp-jshint');
var webserver = require('gulp-webserver');
var plumber 	= require('gulp-plumber');
var uglify 		= require('gulp-uglify');
var imagemin  = require('gulp-imagemin');
var pngquant  = require('imagemin-pngquant');
var del 			= require('del');
var vinylPaths = require('vinyl-paths');


gulp.task('webserver', function() {
	gulp.src('./')
	.pipe(webserver({
		host:'0.0.0.0',
		livereload: true,
		directoryListing: true,
		port: 3000
	}));
});

gulp.task('jshint',function(){
	return gulp.src(['js/**/*.js','!js/all*.js','!js/lib/jquery-2.1.3.min.js'])
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
gulp.task('concat',function(){
	return gulp.src([
		'js/**/*.js',
		])
	.pipe(concat('all.js'))
	.pipe(uglify())
	.pipe(gulp.dest('js/'))
})


gulp.task('stylus:page', function() {
  return gulp.src('stylus/*.styl')
  .pipe(plumber())
  .pipe(stylus({
    compress: true
  }))
  .pipe(gulp.dest('css/'))
 })

gulp.task("stylus:lower",function(){
	return gulp.src('lower/*.styl')
  .pipe(plumber())
  .pipe(stylus({
    compress: true
  }))
  .pipe(gulp.dest('css/lower'))
})

gulp.task("concat:lower",["stylus:lower"],function(){
	return gulp.src("css/lower/*.css")
	.pipe(concatCss("lower.css"))
	.pipe(gulp.dest('css/'))
})

gulp.task('clean:css',["concat:lower"],function () {
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


gulp.task('watch', function(){
	gulp.watch('js/**/*.js',['jshint','concat']);
	gulp.watch('stylus/*.styl',['stylus:page','stylus:lower','concat:lower','clean:css']);
})


gulp.task('default', ['webserver','imagemin']);
gulp.task('start', ['webserver','watch']);
