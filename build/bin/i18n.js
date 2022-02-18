'use strict';

var fs = require('fs');
var path = require('path');
// 官网页面翻译配置，内置了四种语言
var langConfig = require('../../examples/i18n/page.json');

langConfig.forEach(lang => {
  // 获取 /examples/pages/{lang}
  try {
    // 用于异步返回有关给定文件路径的信息
    fs.statSync(path.resolve(__dirname, `../../examples/pages/${ lang.lang }`));
  } catch (e) {
    // 创建四种语言目录
    fs.mkdirSync(path.resolve(__dirname, `../../examples/pages/${ lang.lang }`));
 }

  // 遍历所有页面，根据 page.tpl 自动生成对应语言的 .vue 文件
  Object.keys(lang.pages).forEach(page => {
    // page：具体的某个页面，如 index
    // 模板路径  ===> examples/pages/template/index.tpl
    var templatePath = path.resolve(__dirname, `../../examples/pages/template/${ page }.tpl`);
    // 输出的 vue 文件路径
    var outputPath = path.resolve(__dirname, `../../examples/pages/${ lang.lang }/${ page }.vue`);
    // 读取模板内容
    var content = fs.readFileSync(templatePath, 'utf8');
    // 读取 页面 的所有键值对的配置  
    var pairs = lang.pages[page];

    // 遍历键值对，通过正则匹配的方式替换模板中对应的 key
    Object.keys(pairs).forEach(key => {
      // 匹配 模板语法
      content = content.replace(new RegExp(`<%=\\s*${ key }\\s*>`, 'g'), pairs[key]);
    });

    // 将替换之后的内容写入 vue 文件
    fs.writeFileSync(outputPath, content);
  });
});
