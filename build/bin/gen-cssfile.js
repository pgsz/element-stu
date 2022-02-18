/**
 * 自动在 package/theme-chalk/src/index.scss|css 中引入各个组件包的样式
 * 在全量注册组件库时需要使用到该文件样式，即 import 'packages/theme-chalk/src/index.scss 
*/
var fs = require('fs');
var path = require('path');
var Components = require('../../components.json');
var themes = [
  'theme-chalk'
];
// 获取所有包名
Components = Object.keys(Components);
// 所有组件包的基础路径 /packages
var basepath = path.resolve(__dirname, '../../packages/');

// 判断指定文件是否存在
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

themes.forEach((theme) => {
  // 是否是 scss, element-ui 默认使用 scss 编写的样式
  var isSCSS = theme !== 'theme-default';
  // 导入基础样式文件 @import './base.scss|css'
  var indexContent = isSCSS ? '@import "./base.scss";\n' : '@import "./base.css";\n';
  // 遍历所有组件包，并生成 @import "./comp-package.scss|css"
  Components.forEach(function(key) {
    // 忽略 icon 等三个组件包
    // 延伸： forEach 如何终止循环  ===>  try catch + throw
    if (['icon', 'option', 'option-group'].indexOf(key) > -1) return;
    // key： 组件名  comp-package.scss|css
    var fileName = key + (isSCSS ? '.scss' : '.css');
    // 导入语句 @import "./comp-package.scss|css"
    indexContent += '@import "./' + fileName + '";\n';
    // 拼接路径  /package/theme-chalk/src/comp-package.scss
    var filePath = path.resolve(basepath, theme, 'src', fileName);
    // 如果不存在此文件，则创建
    if (!fileExists(filePath)) {
      /**
       * 三个参数：
       *  1、path：被写入文件的路径
       *  2、data：写入的内容，字符串格式
       *  3、options：写入的参数配置，默认 utf8 编码
      */
      fs.writeFileSync(filePath, '', 'utf8');
      console.log(theme, ' 创建遗漏的 ', fileName, ' 文件');
    }
  });
  // 生成 /package/theme-chalk/src/index.scss 文件
  fs.writeFileSync(path.resolve(basepath, theme, 'src', isSCSS ? 'index.scss' : 'index.css'), indexContent);
});
