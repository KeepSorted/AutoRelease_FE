# 强制更新到最新代码
git reset --hard origin/master
git clean -f
git pull origin master

# 安装依赖
cnpm install

# 测试，可以不要
# npm run test

#构建
npm run build