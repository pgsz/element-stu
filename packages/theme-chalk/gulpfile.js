'use strict';

// gulp 配置文件

const { series, src, dest } = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');

// 将 scss 文件转换成 css 并压缩，最后输出到 ./lib 目录下
function compile() {
  // 输入
  return src('./src/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({
      overrideBrowserslist: ['ie > 9', 'last 2 versions'],
      cascade: false
    }))
    // css
    .pipe(cssmin())
    // 输出目录
    .pipe(dest('./lib'));
}

// 拷贝 ./src/fonts 到 ./lib/fonts  字体
function copyfont() {
  return src('./src/fonts/**')
    .pipe(cssmin())
    .pipe(dest('./lib/fonts'));
}

exports.build = series(compile, copyfont);
