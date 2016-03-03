var fs = require('fs');
var gulp = require('gulp');
var yaml = require('js-yaml');
var rimraf = require('rimraf');
var data = require('gulp-data');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var ghPages = require('gulp-gh-pages');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();

// clean dist directory
gulp.task('clean', function(cb) {
  rimraf('./dist', cb);
});

// copy assets directory
gulp.task('static', ['clean'], function() {
  return gulp.src('./assets/**/*')
    .pipe(gulp.dest('./dist/assets'));
});

// static server + watching sass/jade/html files
gulp.task('serve', ['jade', 'sass'], function() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });

  gulp.watch('src/sass/**/*.sass', ['sass']);
  gulp.watch(['src/jade/**/*.jade', 'data.yaml'], ['jade']);
  gulp.watch('dist/index.html').on('change', browserSync.reload);
});

// compile jade into HTML
gulp.task('jade', function() {
  return gulp.src('src/jade/index.jade')
    .pipe(data(function(file) {
      return yaml.safeLoad(fs.readFileSync('./data.yaml', 'utf-8'));
    }))
    .pipe(jade())
    .pipe(gulp.dest('dist/'));
});

// compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return gulp.src('src/sass/index.sass')
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

// publish contents to Github pages
gulp.task('deploy', function() {
  return gulp.src(['./dist/**/*', './assets'])
    .pipe(ghPages());
});

gulp.task('default', function(cb) {
  runSequence('static', 'serve', cb);
});