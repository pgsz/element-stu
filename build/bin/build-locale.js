/**
 * 通过 babel 将 ES Module 风格的翻译文件转译成 UMD 风格
*/
var fs = require('fs');
// 流式传输数据到文件并使用流保存。（如果目录不存在，模块将生成目录本身）
var save = require('file-save');
var resolve = require('path').resolve;
var basename = require('path').basename;
// 翻译文件目录，用于官网，得到文件列表
var localePath = resolve(__dirname, '../../src/locale/lang');
// 获取目录下的所有翻译文件
var fileList = fs.readdirSync(localePath);

// 转换函数
var transform = function(filename, name, cb) {
  // 通过 babel-core 完成转义
  require('babel-core').transformFile(resolve(localePath, filename), {
    plugins: [
      'add-module-exports',
      ['transform-es2015-modules-umd', {loose: true}]
    ],
    moduleId: name
  }, cb);
};

// 遍历所有文件
fileList
  .filter(function(file) {
    // 匹配 .js 结尾的文件
    return /\.js$/.test(file);
  })
  .forEach(function(file) {
    // 获取名称  zh-CN.js ==>  zh-CN
    var name = basename(file, '.js');

    // 调用转换函数，将转换后的代码写入到 /lib/umd/locale 目录下
    transform(file, name, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        var code = result.code;

        code = code
          .replace('define(\'', 'define(\'element/locale/')
          .replace('global.', 'global.ELEMENT.lang = global.ELEMENT.lang || {}; \n    global.ELEMENT.lang.');
        save(resolve(__dirname, '../../lib/umd/locale', file)).write(code);

        console.log(file);
      }
    });
  });
