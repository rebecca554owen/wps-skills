mac-poll-server.ts, wps-client.ts, wps-keepalive.ts
WPS 客户端与平台通信实现目录。
mac-poll-server.ts 在 macOS/Linux 轮询模式下同时支持共享 Bridge：首个实例监听 127.0.0.1:58891 并服务 WPS 加载项 /poll、/result，后续 MCP 实例检测到端口占用后通过 /execute 转发命令到首个实例，避免 Hermes/Claude/Codex 多渠道各自启动 MCP 时抢占轮询端口。
一旦这里的结构发生变化，请务必更新我... 就像重新标记领地一样。
