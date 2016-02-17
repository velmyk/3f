var gulp = require('gulp'),
		eslint = require('gulp-eslint'),
		Server = require('karma').Server,
		concat = require('gulp-concat'),
		clean = require('gulp-clean'),
		wrap = require('gulp-wrap');

var path = {
	dist: './dist/',
	src: {
		js: ['src/*.js', '!src/*.spec.js'],
		wrapper: 'src/help-files/wrapper.js'
	}
};

gulp.task('clean', function() {
	return gulp.src(path.dist)
		.pipe(clean());
});

gulp.task('eslint', function() {
	return gulp.src(path.src.js)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('tdd', function(){  
	new Server({
		configFile:__dirname + '/karma.conf.js',
		singleRun: false
	}).start();
});

gulp.task('test', function(){  
	new Server({
		configFile:__dirname + '/karma.conf.js',
		singleRun: true
	}).start();
});

gulp.task('watch', function () {
	gulp.watch(path.src.js,['eslint']);
});

gulp.task('build', ['clean'],function() {
	gulp.src(path.src.js)
		.pipe(concat('f3.js'))
		.pipe(wrap({
			src: path.src.wrapper
		}))
		.pipe(gulp.dest(path.dist));
});

gulp.task('default', ['watch','tdd']);
