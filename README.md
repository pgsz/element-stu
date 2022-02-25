# 基于 element-ui 源码的学习

由 工程化、官网、组件库、测试和类型声明五部分组成

[学习来源：https://juejin.cn/post/6935977815342841892](https://juejin.cn/post/6935977815342841892)



## 自定义主题


### 一：在线主题编辑器

直接在官网的主题中进行编辑修改下载，在项目中引入使用即可

可视化，简单明了，但无法支持按需加载


### 二： 命令行主题工具

```shell
# 初始化项目目录并安装主题生成工具
mkdir theme && cd theme && npm init -y && npm i element-theme -D

# 安装白垩主题
npm i element-theme-chalk -D

# 初始化变量文件
node_modules/.bin/et -i
```

可能会出现如下错误信息：
![](/myImages/element-error.png)

原因 element-theme 包中依赖了低版本的 graceful-fs，低版本在高版本的 node.js 中不兼容，最简单的解决方案升级 graceful-fs

在项目根目录下创建 `npm-shrinkwrap.json` 文件，并添加：
```json
{
   "dependencies": {
       "graceful-fs": {
           "version": "4.2.2"
       }
   }
}
```
在执行 `npm i` 重新安装依赖，然后执行 `node_modules/.bin/et -i`，之后会生成 `element-variables.scss` 文件

在 `element-variables.scss` 文件中，进行变量的修改、保存

随后进行编译，生成出来都是 CSS 样式文件，文件名和组件名一一对应，支持按需加载（指定组件的样式文件）和全量引入（index.css）

生成未压缩的样式文件
```shell
node_modules/.bin/et --out theme-chalk
```
生成压缩的样式文件
```shell
node_modules/.bin/et --minimize --out theme-chalk
```
帮助命令
```
node_modules/.bin/et --help
```

使用自定义主题：

将新生成的主题目录（theme-chalk）替换掉框架中的 `/packages/theme-chalk`,将老的重命名为 theme-pg ，后续可以使用，

由于新生成的文件和老文件的目录结构不一样，需要更改 examples 和 build 中的样式引入方式（直接搜索 packages/theme-chalk/ ，针对引入方式进行修改即可）

执行 `npm run dev` 启动开发环境，即可查看效果


### 三： 深度样式定制

有些组件的有些样式不属于主题样式，但和设计稿不一致的话，就需要覆写组件和自定义组件的样式

- 将 `/packages/theme-pg/src` 目录下的所有文件删除
- 加入覆写 button 组件的部分样式
    - 在 `/packages/theme-pg/src` 目录下新建 `button.scss` 文件
    ```scss
    // 这里我要把主要按钮的字号改大有些，只是为了演示效果
    .el-button--primary {
      font-size: 24px;
    }
    ``` 
    - 改造 `build/bin/gen-cssfile.js` 脚本
    ```js
    var fs = require('fs');
    var path = require('path');

    function getIndexScssFile(dir) {

      // 文件列表
      const files = fs.readdirSync(dir);

      /**
      * 需要的格式
      * @import 'xxx.scss'
      */

      let importStr = "/* Automatically generated by './build/bin/gen-cssfile.js' */\n";

      // 需要排查的文件
      const excludeFile = ['assets', 'font', 'index.scss', 'base.scss', 'variable.scss'];

      files.forEach(item => {
        if (excludeFile.includes(item) || !/\.scss$/.test(item)) return;

        importStr += `@import "./${item}";\n`;
      });

      // 在 /packages/theme-pg/src/index.scss 中引入所有样式文件
      fs.writeFileSync(path.resolve(dir, 'index.scss'), importStr);
    }

    getIndexScssFile(path.resolve(__dirname, '../../packages/theme-pg/src/'));
    ```
    - 在根目录下执行一下命令
    ```shell
    npm i shelljs -D
    ```
    - 新建 `/build/bin/compose-css-file.js`
    ```js
    /**
     * 负责合并打包之后的两个 css 目录文件（lib/theme-chalk、lib/theme-pg）
     * theme-chalk：主题配置自动生成的
     * theme-pg：自定义/覆写组件样式
     * 最后合并至 theme-chalk 目录下
    */
    const fs = require('fs');
    const fileSave = require('file-save');
    const { resolve: pathResolve } = require('path');
    const shelljs = require('shelljs');

    const themeChalkPath = pathResolve(__dirname, '../../lib/theme-chalk');
    const themeStsUIPath = pathResolve(__dirname, '../../lib/theme-pg');

    let themeChalk = null;
    let themeStsUI = null;

    try {
      themeChalk = fs.readdirSync(themeChalkPath);
      console.log(themeChalk);
    } catch (error) {
      console.log('/lib/theme-chalk 不存在');
      process.exit(1);
    }

    try {
      themeStsUI = fs.readdirSync(themeStsUIPath);
      console.log(themeStsUI);
    } catch (error) {
      console.log('/lib/theme-pg 不存在');
      process.exit(1);
    }

    const excludeFiles = ['element-variables.css', 'variable.css'];
    for (let i = 0, themeStsUILen = themeStsUI.length; i < themeStsUILen; i++) {
      if (excludeFiles.includes(themeStsUI[i])) continue;

      if (themeStsUI[i] === 'fonts') {
        // -R 递归处理  把 themeStsUIPath 下 fonts 所有文件 复制到 themeChalkPath 中
        shelljs.cp('-R', pathResolve(themeStsUIPath, 'fonts/*'), pathResolve(themeChalkPath, 'fonts'));
        continue;
      }

      if (themeStsUI[i] === 'assets') {
        // 把 themeStsUIPath 下 assets 目录文件 直接复制到 themeChalkPath
        shelljs.cp('-R', pathResolve(themeStsUIPath, 'assets'), themeChalkPath);
        continue;
      }

      if (themeChalk.includes(themeStsUI[i])) {
        // 说明当前样式文件是覆写 element-ui 中的样式
        const oldFileContent = fs.readFileSync(pathResolve(themeChalkPath, themeStsUI[i]), { encoding: 'utf-8' });
        fileSave(pathResolve(themeChalkPath, themeStsUI[i])).write(oldFileContent).write(fs.readFileSync(pathResolve(themeStsUIPath, themeStsUI[i])), 'utf-8').end();
      } else {
        // 说明当前样式文件是扩展的新组件的样式文件
        // fs.writeFileSync(pathResolve(themeChalkPath, themeStsUI[i]), fs.readFileSync(pathResolve(themeStsUIPath, themeStsUI[i])));
        shelljs.cp(pathResolve(themeStsUIPath, themeStsUI[i]), themeChalkPath);
      }
    }

    // 删除 lib/theme-pg
    shelljs.rm('-rf', themeStsUIPath);
    ``` 
    - 改造 package.json 文件中的 scripts
    ```json
    {
      "gen-cssfile:comment": "在 /packages/theme-pg/src/index.less 中自动引入各个组件的覆写样式文件",
      "gen-cssfile": "node build/bin/gen-cssfile",
      "build:theme:comment": "构建主题样式：在 index.less 中自动引入各个组件的覆写样式文件 && 通过 gulp 将 less 文件编译成 css 并输出到 lib 目录 && 拷贝基础样式 theme-chalk 到 lib/theme-chalk && 拷贝 编译后的 theme-pg/lib/* 目录到 lib/theme-pg && 合并 theme-chalk 和 theme-pg",
      "build:theme": "npm run gen-cssfile && gulp build --gulpfile packages/theme-pg/gulpfile.js && cp-cli packages/theme-pg/lib lib/theme-pg && cp-cli packages/theme-chalk lib/theme-chalk && node build/bin/compose-css-file.js",
    }
    ```
    - 执行以下命令
    ```shell
    npm run gen-cssfile
    ```
    - 改造 `/examples/entry.js`
    ```js
    // 引入自定义样式
    import 'packages/theme-pg/src/index.scss';
    ``` 
    - 启动开发环境，即可查看下个


## Vue 升级

element-ui 本身依赖于 vue@^2.5x，该版本的的 vue 不支持最新的 `v-slot` 语法

升级 Vue 版本，设计三个包：

 - 删除旧包
 ```shell
 npm uninstall vue @vue/component-compiler-utils vue-template-compiler -D
 ``` 
 - 安装新包
 ```shell
 npm install vue@^2.6.12 @vue/component-compiler-utils@^3.2.0 vue-template-compiler@^2.6.12 -D
 ``` 
 - 更新 package.json 中的 peerDependencies
 ```json
 {
  "peerDependencies": {
    "vue": "^2.6.12"
  }
 }
 ```


 ## package.json

 [参考来源：http://javascript.ruanyifeng.com/nodejs/packagejson.html](http://javascript.ruanyifeng.com/nodejs/packagejson.html)

 ### npm-shrinkwrap.json

 `npm shrinkwrap` 是 npm 包管理器的一项功能，可以按照当前项目 node_modules 目录内的安装包情况生成稳定的版本号描述，形成 npm 资源树

与`package-lock.json` 的区别

- npm install 或 npm init 会自动生成 package-lock.json，安装信息会依据该文件进行
- npm-shrinkwrap.json 优先级高于 package-lock.json
- npm-shrinkwrap.json 可以在发布包中出现，package-lock.json 不会出现在发布包中，及时出现，也会被 npm 无视

### peerDependencies

`peerDependencies` 的目的是提示宿主环境去安装满足创建 peerDependencies 所指定依赖的包，然后在插件 import 或 require 所依赖包的时候，永远都是使用宿主环境统一安装的 npm 包，最终解决插件与所依赖包不一致的问题，供插件指定所需要的主工的具版本。

### scripts

`scripts` 指定了运行脚本命令的 npm 命令行缩写

### dependencies 与 devDependencies

 - `dependencies` 字段指定了项目运行所依赖的模块
 - `devDependencies` 指定项目开发所依赖的模块

都指向一个对象，由模块名和对应的版本要求组成，表示所依赖的模块和对应的版本要求

> `指定版本`：比如 `1.2.2`，遵循 `大版本.次要版本.小版本` 的格式要求，安装时只安装指定版本
> 
> `波浪号（tilde）+指定版本`：比如 `~1.2.2`，表示安装 1.2.x 的最新版本（不低于 1.2.2），但是不安装 1.3.x，也就是说安装时不改变大版本号和次要版本号
> 
> `插入号（caret）+指定版本`：比如 `^1.2.2`，表示安装 1.x.x 的最新版本（不低于 1.2.2），但是不安装 2.x.x，也就是说安装时不改变大版本号。需要注意的是：如果大版本号为 0，则插入号的行为与波浪号相同。
> 
> `latest`：安装最新版本

### bin

`bin` 项用来指定各个内部命令对应的可执行文件的位置

所有 `node_modules/.bin` 目录下的命令，都可以使用 `npm run [命令]` 的格式来运行

```json
"bin": {
  "someTool": "./bin/someTool.js"
}

"scripts": {  
  "start": "./node_modules/bin/someTool.js build"
}

// 简写为

"scripts": {  
  "start": "someTool build"
}
```

### main

`main` 字段指定加载的入口文件，默认值模块根目录下的 `index.js`

### config

`config` 字段用于添加命令行的环境变量

### files

`files` 字段用来发布 `npm` 包时告诉发布程序只将 files 中指定的 文件 和 目录 上传到 npm 服务器

### repository

`repository` 字段代码库地址


## npm

[参考资料：https://www.cnblogs.com/kunmomo/p/11221786.html](https://www.cnblogs.com/kunmomo/p/11221786.html)

### 发布 npm 

 - 在 `https://www.npmjs.com/` 上注册账号，记住 用户名、密码和邮箱
 - 在本地添加 `npm` 账户
   - 输入 `npm adduser` 命令，填入你的 用户名、密码和邮箱
   - 切记将 `npm` 源设置为 `npm config set registry https://registry.npmjs.org/`，否则无法登录成功
    ![](/myImages/npm-adduser.png) 
- 第一次上传运行 `npm publish --access public`
- 即可在 npm 官网搜索刚刚上传 npm 包的名称

### 更新包

- 修改 package.json 文件中的版本，否则无法更新
- 执行 npm publish 发布新版本


## 组件库文档按需加载

安装 `babel-plugin-component`

安装 `babel-loader、@babel/core`

```shell
npm install --save-dev babel-plugin-component babel-loader @babel/core
```

```js
// webpack.config.js
const path = require('path')

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
}
```

安装 `@babel/preset-env`

创建 `.babelrc` 文件

```json
{
  "presets": ["@babel/preset-env"],
  "plugins": [
    [
      "component",
      {
        "libraryName": "@pgsz/pg-comp-lib",
        "style": false
      }
    ]
  ]
}
```


## 其他

### touch

windows 想要使用 touch 指令需要单独安装

```shell
npm install touch-cli -g
```