const { src, dest, series, parallel, watch } = require('gulp');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');	
const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();

const path = {
    src: './src',
    dest: './build'
}

//Compila o sass
const compileSass = async _ => {
    return src(`${path.src}/sass/stylePrincipal.scss`)
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(dest(`${path.dest}/css`));
}


const javascriptBuild = async _ => {
    // Start by calling browserify with our entry pointing to our main javascript file
    return (
        browserify({
            entries: [`${path.src}/js/scripts_main.js`],
            // Pass babelify as a transform and set its preset to @babel/preset-env
            transform: [babelify.configure({ presets: ["@babel/preset-env"] })]
        })
            .bundle()
            .pipe(source("script_bundle.js"))
            // Turn it into a buffer!
            .pipe(buffer())
            // And uglify
            .pipe(uglify())
            // Then write the resulting files to a folder
            .pipe(dest(`${path.dest}/js`))
    );
}
const bsReload = _ => browserSync.reload;

// Observa mudanças no sass
const watchSass = _ =>  watch(path.src+'/**/*.scss', compileSass);

const watchJs = _ =>  watch(path.src+'/**/*.js', javascriptBuild);

const watchReloadJs = _ =>  watch(path.src+'/**/*.js').on("change", browserSync.reload);

const watchReloadJson = _ =>  watch(path.src+'/**/*.json').on("change", browserSync.reload);

const watchReloadCss = _ =>  watch(path.src+'/**/*.scss').on("change", browserSync.reload);

const watchHtml = _ =>  watch('./index.html', bsReload);

const bSync = _ => browserSync.init({injectChanges: true, proxy: "http://localhost:8080/"}); // colocar a url correta aqui.

const bSyncServer = _ => browserSync.init( { server: { baseDir: "./" }} );


exports.default = series(compileSass, javascriptBuild, parallel( watchHtml, watchSass, watchJs, watchReloadCss, watchReloadJs, watchReloadJson, bSync) );
exports.local = series(compileSass, javascriptBuild, parallel( watchHtml, watchSass, watchJs, watchReloadCss, watchReloadJs, watchReloadJson, bSyncServer) );