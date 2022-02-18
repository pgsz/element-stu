/**
 * 监听 /examples/pages/template 目录下的所有模板文件，当模板文件发生改变时自动执行 npm run i18n
 * 重新生成四种语言的 .vue 文件
*/
const path = require('path');
// 监听目录
const templates = path.resolve(process.cwd(), './examples/pages/template');
// 文件监听库
const chokidar = require('chokidar');
// 监听模板目录
let watcher = chokidar.watch([templates]);

// 当目录下文件发生改变时，自动执行 npm run i18n
watcher.on('ready', function() {
  watcher
    .on('change', function() {
      exec('npm run i18n');
    });
});

// 负责执行命令
function exec(cmd) {
  return require('child_process').execSync(cmd).toString().trim();
}
