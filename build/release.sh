#!/usr/bin/env sh
set -e

# 合并 dev 分支到 master
git checkout master
git merge dev

# 版本选择 cli
VERSION=`npx select-version-cli`

# 是否确认当前版本信息
read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  # build  编译打包
  VERSION=$VERSION npm run dist

  # ssr test
  node test/ssr/require.test.js            

  # publish theme
  echo "Releasing theme-chalk $VERSION ..."
  cd packages/theme-chalk
  # 更改主题包的版本信息
  npm version $VERSION --message "[release] $VERSION"
  # 发布主题
  if [[ $VERSION =~ "beta" ]]
  then
    npm publish --tag beta
  else
    npm publish
  fi
  cd ../..

  # commit
  git add -A
  git commit -m "[build] $VERSION"
  npm version $VERSION --message "[release] $VERSION"

  # publish  将 master 推送到远程仓库
  git push eleme master
  git push eleme refs/tags/v$VERSION
  git checkout dev
  git rebase master
  git push eleme dev

# 发布组件库
  if [[ $VERSION =~ "beta" ]]
  then
    npm publish --tag beta
  else
    npm publish
  fi
fi
