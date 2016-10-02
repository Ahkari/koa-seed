var gulp = require('gulp');
var del = require('del');
var merge = require('merge-stream');
var uglify = require('gulp-uglify');
var spritesmith = require('gulp.spritesmith');
var replace = require('gulp-rev-replace');
var less = require('gulp-less');
var RevAll = require('gulp-rev-all');

var revAll = new RevAll({
    fileNameManifest:'revision_manifest.json'
});

gulp.task('clean', function () {
    return del(['dist']);
});

gulp.task('compile', ['clean'], function () {

    var jsStream = gulp.src('src/public/scripts/**/*.js', {base: 'src/public'})
        .pipe(uglify());

    var lessStream = gulp.src('src/public/styles/**/*.less', {base: 'src/public'})
        .pipe(less());

    var cssStream = gulp.src('src/public/styles/**/*.css', {base: 'src/public'});

    var imgStream = gulp.src('src/public/images/**', {base: 'src/public'});

    var fontStream = gulp.src('src/public/fonts/**', {base: 'src/public'});

    return merge(jsStream, lessStream, cssStream, imgStream, fontStream)
        .pipe(revAll.revision())
        .pipe(gulp.dest('dist/public'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('dist/data'));
});

gulp.task('replace', ['compile'], function () {
    return gulp.src('src/views/**/*.html')
        .pipe(replace({manifest: gulp.src('dist/data/revision_manifest.json')}))
        .pipe(gulp.dest('dist/views'));
});

gulp.task('copy', ['clean', 'compile', 'replace'], function () {
    return gulp.src([
        'src/**',
        '!src/public/scripts/**',
        '!src/public/styles/**',
        '!src/public/images/**',
        '!src/views/**'
    ])
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['clean', 'compile', 'replace', 'copy']);

gulp.task('sprite', function () {
    var spriteData = gulp.src('src/public/images/sprite/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        imgPath: '../images/sprite.png',
        cssName: 'sprite.css',
        retinaSrcFilter: '**/*@2x.png',
        retinaImgName: 'sprite@2x.png',
        retinaImgPath: '../images/sprite@2x.png',
        cssOpts: {
            cssSelector: function (item) {
                var name = (item.name || '').toLowerCase();
                name = name.replace('-hover', ':hover');
                name = name.replace('-checked',':checked');
                name = name.replace('_active','.active');
                return '.sprite-' + name;
            }
        }
    }));
    var imgStream = spriteData.img
        .pipe(gulp.dest('src/public/images/'));

    var cssStream = spriteData.css
        .pipe(gulp.dest('src/public/styles/'));
    return merge(imgStream, cssStream);
});

gulp.task('default', ['clean', 'build']);