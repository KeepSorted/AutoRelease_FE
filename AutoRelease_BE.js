const config = {
  /**
   * 监听端口
   */
  port : 7777,

  /**
   * 更新命令，当push 动作发生时执行，包括git更新以及项目构建，一般不需要更改，使用shell语法
   */
  freshCmdPath : './freshAndBuild.sh',
}

/**
 * express 服务器，处理请求
 */
"use strict";
var express = require("express"),
    path = require("path"),
    app = express(),
    compression = require("compression");
app.use(compression({level: 9}));//express compression to support gzip

/**
 * webhook 处理
 */
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/webhook', secret: 'myhashsecret' })
const spawn = require('child_process').spawn;




app.set("port", process.env.PORT || config.port);
app.use(express.static(path.join(__dirname, "dist")));
// 网页
app.get("/", function (req, res) {
    res.sendfile("dist/index.html");
});
// webhook 路由
app.post("/webhook",function (req, res) {
  console.log("connected!");
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
})

app.listen(app.get("port"), function () {
    console.log("Express server listening on port " + app.get("port"));
});

 
handler.on('error', function (err) {
  console.error('Error:', err.message)
})
 
handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',event.payload.repository.name,event.payload.ref);
  // 如果收到master的更新
  if (event.payload.ref === 'refs/heads/master') {
    console.log("Begin to build!")
    rumCommand('sh', [config.freshCmdPath], txt => {
      console.log(txt)
    })
  }
})
 
handler.on('issues', function (event) {
  console.log('Received an issue event for %s action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title)
})

/**
 * 
 * @param {*} cmd  命令
 * @param {*} args  参数
 * @param {*} callback  回调
 */
const rumCommand = (cmd, args, callback) => {
  const child = spawn(cmd, args)
  let response = ''
  child.stdout.on('data', buffer => response += buffer.toString())
  child.stdout.on('end', () => callback(response))
}
