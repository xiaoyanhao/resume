var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var yaml = require('js-yaml');
var data = require('gulp-data');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var ghPages = require('gulp-gh-pages');
var browserSync = require('browser-sync').create();

var paths = {
  jade: {
    src: 'src/jade/index.jade',
    dest: 'dist/'
  },
  sass: {
    src: 'src/sass/index.sass',
    dest: 'dist/css/'
  },
  assets: {
    src: 'assets/**/*',
    dest: 'dist/assets/'
  },
  watch: {
    jade: 'src/jade/**/*.jade',
    sass: 'src/sass/**/*.sass',
    reload: 'dist/index.html'
  },
  deploy: 'dist/',
  ghPages: '.publish/',
  data: 'data.yaml'
}

// Clean dist/
function Clean() {
  return del([paths.deploy, paths.ghPages]);
}

// Copy assets/
function Assets() {
  return gulp.src(paths.assets.src)
    .pipe(gulp.dest(paths.assets.dest));
}

// Compile jade into HTML
function Jade() {
  return gulp.src(paths.jade.src)
    .pipe(data(function(file) {
      return yaml.safeLoad(fs.readFileSync(paths.data, 'utf-8'));
    }))
    .pipe(jade())
    .pipe(gulp.dest(paths.jade.dest));
  
}

// Compile sass into CSS & auto-inject into browsers
function Sass() {
  return gulp.src(paths.sass.src)
    .pipe(sass())
    .pipe(gulp.dest(paths.sass.dest))
    .pipe(browserSync.stream());
}

// Static server + watching sass/jade/html files
function Watch() {
  browserSync.init({
    server: {
      baseDir: paths.deploy
    },
    open: false
  });

  gulp.watch(paths.watch.sass, Sass);
  gulp.watch([paths.watch.jade, paths.data], Jade);
  gulp.watch(paths.watch.reload).on('change', browserSync.reload);
}

// Publish contents to Github pages
function Deploy() {
  return gulp.src(paths.deploy)
    .pipe(ghPages());
}

var Build = gulp.series(Clean, gulp.parallel(Assets, Jade, Sass), Watch);

exports.default = Build;
exports.deploy = Deploy;