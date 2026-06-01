main.js, manifest.xml, ribbon.xml, wps-auto.sh, handlers/, utils/
macOS WPS 加载项与处理器入口目录。
main.js 的轮询执行层维护 requestId 去重、短期结果缓存和结果发送重试，避免同一 Bridge 命令因重复 /poll 被重复写入 Word/Excel/PPT。
wps-auto.sh 使用共享 Bridge 的 /execute 调用 getAppInfo 并直接解析返回结果，不再依赖旧 /send 路由或 /tmp/server.log。
一旦这里的结构发生变化，请务必更新我... 就像重新标记领地一样。
