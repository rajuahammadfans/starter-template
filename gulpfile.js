"use strict";

let gulp = require('gulp'),
    pug = require('gulp-pug'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    beautify = require('gulp-beautify'),
    browserSync = require('browser-sync').create(),
    clean = require('gulp-clean'),
    imagemin = require('gulp-imagemin'),
    imageminUPNG = require("imagemin-upng"),
    mozjpeg = require('imagemin-mozjpeg'),
    jpegRecompress = require('imagemin-jpeg-recompress'),
    svgo = require('imagemin-svgo'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    htmlmin = require('gulp-htmlmin'),
    fileinclude = require('gulp-file-include');


let autoprefixerBrowsers = [
    "last 4 version",
    "> 1%",
    "ie >= 9",
    "ie_mob >= 10",
    "ff >= 30",
    "chrome >= 34",
    "safari >= 7",
    "opera >= 23",
    "ios >= 7",
    "android >= 4",
    "bb >= 10"
];


// Error Notification
function errorNotify(errTitle) {
    return plumber({
        errorHandler: notify.onError({
            title: errTitle || "Error running Gulp",
            message: "Error: <%= error.message %>",
            sound: "Glass"
        })
    });
}

// Clean App Folder
gulp.task('clean', function appClean(done) {
    gulp.src('app/')
        .pipe(clean());
    done();
});

// Localhost Server
function server(done) {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
    done();
}

// Auto Reload
function reload(done) {
    browserSync.reload();
    done();
}

// Compile Pug to HTML
function buildPug(done) {
    gulp.src('src/views/*.pug')
        .pipe(errorNotify('Error on Compile HTML'))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('app/'));
    done();
}

// Compile HTML
function buildHTML(done) {
    gulp.src('src/html/*.html')
        .pipe(errorNotify('Error on Compile HTML'))
        .pipe(fileinclude({
            prefix: '##',
            basepath: 'src/html/inc',
            indent: true
        }))
        .pipe(gulp.dest('app/'));
    done();
}

// Compile SCSS to CSS
function buildCSS(done) {
    const scssFiles = [
        'src/scss/style.scss'
    ];
    gulp.src(scssFiles)
        .pipe(errorNotify('Error on Compile CSS'))
        .pipe(scss())
        .pipe(autoprefixer(autoprefixerBrowsers))
        .pipe(beautify.css({
            indent_size: 4
        }))
        .pipe(gulp.dest('app/assets/css/'));
    done();
}

// Image Copy src to app
function imgCopy(done) {
    gulp.src('src/img/**/*')
        .pipe(errorNotify('Error On Copy Images'))
        .pipe(gulp.dest('app/assets/img/'));
    done();
}

// Fonts Copy src to app
function fontsCopy(done) {
    gulp.src('src/fonts/**/*')
        .pipe(errorNotify('Error On Copy Fonts'))
        .pipe(gulp.dest('app/assets/fonts/'));
    done();
}

// SCSS Copy src to app
function scssCopy(done) {
    gulp.src('src/scss/**/*')
        .pipe(errorNotify('Error On Copy SCSS Files'))
        .pipe(gulp.dest('app/assets/scss/'));
    done();
}

// CSS Copy src to app
function cssCopy(done) {
    gulp.src('src/css/**/*')
        .pipe(errorNotify('Error On Copy CSS'))
        .pipe(gulp.dest('app/assets/css/'));
    done();
}

// CSS JS src to app
function jsCopy(done) {
    gulp.src('src/js/**/*')
        .pipe(errorNotify('Error On Copy JS'))
        .pipe(gulp.dest('app/assets/js/'));
    done();
}

// Watch All Changes
function watch(done) {
    gulp.watch('src/views/**/*', gulp.series(buildPug, reload));
    gulp.watch('src/html/**/*', gulp.series(buildHTML, reload));
    gulp.watch('src/scss/**/*', gulp.series(buildCSS, reload));
    gulp.watch('src/css/**/*', gulp.series(cssCopy, reload));
    gulp.watch('src/fonts/**/*', gulp.series(fontsCopy, reload));
    gulp.watch('src/img/**/*', gulp.series(imgCopy, reload));
    gulp.watch('src/js/**/*', gulp.series(jsCopy, reload));

    done();
}

let vendor = gulp.series(buildHTML, buildCSS);
let files = gulp.series(cssCopy, fontsCopy, jsCopy, imgCopy);

// Default Task When command on Terminal
gulp.task('default', gulp.series(vendor, files, gulp.parallel(server, watch)));



/*================================
Dist Preview Files Make Scripts
=========================================*/

/*--- Landing Page Files Copy ----*/
gulp.task('landingPage', function (done) {
    gulp.src('landing/app/**/*')
        .pipe(gulp.dest('dist/arden-preview/'));
    done();
});

function previewImgcopy(done) {
    gulp.src('app/assets/img/**/*')
        .pipe(imagemin(
            [imageminUPNG(), mozjpeg(), jpegRecompress(), svgo()],
            {verbose: true}
        ))
        .pipe(gulp.dest('dist/arden-preview/arden/assets/img'));
    done();
}

function previewPhpCopy(done) {
    gulp.src('app/assets/php/**/*')
        .pipe(gulp.dest('dist/arden-preview/arden/assets/php'));
    done();
}

function previewFontsCopy(done) {
    gulp.src('app/assets/fonts/**/*')
        .pipe(gulp.dest('dist/arden-preview/arden/assets/fonts'));
    done();
}

gulp.task('previewFilesCopy', gulp.series(previewImgcopy, previewPhpCopy, previewFontsCopy));

gulp.task('mainHtmlCopy', function (done) {
    gulp.src('apps/*.html')
        .pipe(useref())
        .pipe(gulpif('*.html', htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('dist/arden-preview/arden'));
    done();
});

gulp.task('dist-preview', gulp.series('landingPage', 'previewFilesCopy', 'mainHtmlCopy'));

/*====================================
Dist Downloadable Files Make Scripts
============================================*/
function downloadImgcopy(done) {
    gulp.src('app/assets/img/**/*')
        .pipe(imagemin(
            [imageminUPNG(), mozjpeg(), jpegRecompress(), svgo()],
            {verbose: true}
        ))
        .pipe(gulp.dest('dist/downloadable-files/arden/assets/img'));
    done();
}

function downloadPhpCopy(done) {
    gulp.src('app/assets/php/**/*')
        .pipe(gulp.dest('dist/downloadable-files/arden/assets/php'));
    done();
}

function downloadFontsCopy(done) {
    gulp.src('app/assets/fonts/**/*')
        .pipe(gulp.dest('dist/downloadable-files/arden/assets/fonts'));
    done();
}

function downloadscssCopy(done) {
    gulp.src('app/assets/scss/**/*')
        .pipe(gulp.dest('dist/downloadable-files/arden/assets/scss'));
    done();
}

function downloadCssCopy(done) {
    gulp.src('app/assets/css/**/*')
        .pipe(beautify())
        .pipe(gulp.dest('dist/downloadable-files/arden/assets/css'));
    done();
}

function downloadJsCopy(done) {
    gulp.src('app/assets/js/**/*')
        .pipe(beautify())
        .pipe(gulp.dest('dist/downloadable-files/arden/assets/js'));
    done();
}

function downloadHtmlCopy(done) {
    gulp.src('app/*.html')
        .pipe(beautify())
        //.pipe(prettify())
        .pipe(gulp.dest('dist/downloadable-files/arden/'));
    done();
}

function docsCopy(done) {
    gulp.src('./documentation/**/*')
        .pipe(beautify())
        //.pipe(prettify())
        .pipe(gulp.dest('dist/downloadable-files/documentation'));
    done();
}

gulp.task('dist-file', gulp.series(downloadImgcopy, downloadPhpCopy, downloadFontsCopy, downloadscssCopy, downloadJsCopy, downloadCssCopy, downloadHtmlCopy, docsCopy));