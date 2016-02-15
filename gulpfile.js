var gulp = require('gulp'),
		jshint = require('gulp-jshint'),
		Server = require('karma').Server,
		concat = require('gulp-concat'),
		clean = require('gulp-clean');

var path = {
	dist: './dist/',
	src: {
		js: ['src/**/*.js', '!src/**/*.spec.js']
	}
};

gulp.task('clean', function() {
	return gulp.src(path.dist)
		.pipe(clean());
});

gulp.task('jshint', function() {
	return gulp.src(path.src.js)
		.pipe(jshint({"esnext": true}))
		.pipe(jshint.reporter('default'));
});

gulp.task('test', function(){  
	new Server({
		configFile:__dirname + '/karma.conf.js',
		singleRun: false
	}).start();
});

gulp.task('watch', function () {
	gulp.watch(path.src.js,['jshint']);
});

gulp.task('build', ['clean'],function() {
	gulp.src(path.src.js)
		.pipe(concat('f3.js'))
		.pipe(gulp.dest(path.dist));
});

gulp.task('default', ['watch','test']);
