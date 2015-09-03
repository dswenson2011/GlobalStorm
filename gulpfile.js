// General
var gulp = require('gulp')
	, sourcemaps = require('gulp-sourcemaps')
	, rename = require('gulp-rename')
	, notify = require('gulp-notify')
	, concat = require('gulp-concat')
	, uglify = require('gulp-uglify')
	, plumber = require('gulp-plumber')
	, map = require('map-stream')
	, events = require('events')
	, path = require('path')
	, emmitter = new events.EventEmitter()
	, del = require('del')
	, notification = function () {
		notify.logLevel(1);
		return notify({
			message: "Generated file: <%= file.relative %> @ <%= options.date %>",
			templateOptions: {
				date: new Date()
			}
		});
	}
	, onError = notify.onError({
		title: '<%= error.plugin %>',
		subtitle: '',
		message: 'ERROR: <%= error.message %>'
	})
	, errorHandler = notify(function (file) {
		if (file.csslint && !file.csslint.success) {
			var errors = file.csslint.results.map(function (data) {
				if (data.error) {
					return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
				}
			}).join("\n");
			return file.relative + " (" + file.csslint.results.length + " errors)\n" + errors;
		}
		if (file.jshint && !file.jshint.success) {
			var errors = file.jshint.results.map(function (data) {
				if (data.error) {
					return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
				}
			}).join("\n");
			return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
		}
		return false;
	});

// Stylings
var sass = require('gulp-sass')
	, concatCSS = require('gulp-concat-css')
	, minifyCSS = require('gulp-minify-css')
	, csslint = require('gulp-csslint');

// Scripts
var coffee = require('gulp-coffee')
	, stylish = require('jshint-stylish')
	, jshint = require('gulp-jshint');

gulp.task('clean:build', function () {
	return del([
		'dist/',
		'maps/'
	]);
});

gulp.task('build', ['clean:build'], function () {
	gulp.start('css');
	gulp.start('js');
});

gulp.task('css', function () {
	return gulp.src('src/css/*.scss')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(sass())
		.pipe(csslint())
		.pipe(csslint.reporter())
		.pipe(errorHandler)
		.pipe(concatCSS("dist/css/style.css"))
		.pipe(sourcemaps.init())
		.pipe(rename({ suffix: '.min' }))
		.pipe(minifyCSS({ compatibility: 'ie8' }))
		.pipe(sourcemaps.write('maps'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./'))
		.pipe(notification());
});

gulp.task('js', function () {
	return gulp.src('src/scripts/**/*.coffee')
		.pipe(plumber({ errorHandler: onError }))
		.pipe(coffee({ bare: false }))
		.pipe(jshint('.jshintrc', { fail: true }))
		.pipe(jshint.reporter(stylish))
		.pipe(errorHandler)
		.pipe(concat('app.js'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('maps'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('dist/js'))
		.pipe(notification());
});