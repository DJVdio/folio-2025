# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
npm install --force     # 必须 --force（依赖间有 peer 冲突）
npm run dev             # Vite dev server，localhost:1234，host=true 暴露局域网
npm run build           # 产物 -> dist/
npm run preview         # 本地预览构建产物
npm run compress        # 压缩 static/ 下的 GLB/纹理/UI 图，见 scripts/compress.js
```

没有测试框架、没有 lint 脚本。运行前复制 `.env.example` 为 `.env`。

## 关键环境变量（`.env`，`VITE_` 前缀由 Vite 暴露）

| 变量 | 作用 |
|---|---|
| `VITE_COMPRESSED` | 非空 → 加载 `*-compressed.glb` 和 `.ktx` 纹理；空 → 原始 `.glb`/`.png`。关键资源路径分叉点在 `Game.js` `init()` 顶部。 |
| `VITE_GAME_PUBLIC` | 非空 → `window.game = new Game()`，方便 DevTools 调试 |
| `VITE_PLAYER_SPAWN` | 覆盖 `Respawns` 的初始出生点（默认 `'landing'`） |
| `VITE_DAY_CYCLE_PROGRESS` / `VITE_YEAR_CYCLE_PROGRESS` | 强制昼夜/四季循环进度，方便调试特定时段 |
| `VITE_WHISPERS_COUNT` | Whispers 粒子数量 |
| `VITE_LOG` / `VITE_MUSIC` / `VITE_SERVER_URL` / `VITE_ANALYTICS_TAG` | 日志开关、音乐开关、后端 URL、分析 tag |

## 架构核心

### 单例 + 懒取
`sources/Game/Game.js` 是整棵对象图的根。`Game.instance` + `Game.getInstance()` 是所有子系统获取依赖的唯一路径：几乎每个类的构造函数开头都是 `this.game = Game.getInstance()`，然后通过 `this.game.xxx` 访问别的子系统。这替代了构造参数注入——改动时**不要**给子系统加构造参数传依赖，遵循现有模式。

### Tick 总线（readme "Game loop 0→999" 的实际实现）
`Ticker.events`（`Events.js`，自研 pub/sub）是全局帧循环总线。系统通过：
```js
this.game.ticker.events.on('tick', callback, order)
```
订阅每帧回调，`order` 就是 readme 里的"阶段号"（0–999）。`Events.trigger` 按 `order` 升序遍历——所以 `Rendering` 用 `998`、`Monitoring` 用 `999`，物理前系统用低位数。**修改/新增系统时，选 order 前先读 `readme.md` 的 Game loop 章节确认依赖阶段**，不要随手写一个数。

`Ticker` 还维护 shader 用的 TSL uniforms：`elapsedUniform`、`deltaUniform`、`elapsedScaledUniform`、`deltaScaledUniform`——着色器里要时间别自己读 `performance.now()`，用这些。

### 渲染是 WebGPU，不是 WebGL
`Rendering.js` 用 `THREE.WebGPURenderer`，导入路径是 `three/webgpu` + `three/tsl`（不是 `three`）。`World/` 下很多材质用 TSL（Node Material）写的。写新材质前确认用的是 TSL 而非旧版 `ShaderMaterial`。`forceWebGL: false`，不支持 WebGPU 的浏览器会失败——这是作品集项目，不做回退。

### 分阶段异步初始化
`Game.init()` 是 async，流程：
1. **第一批资源**（intro 显示前必需的：respawn refs、stars、sound、palette）；
2. 渲染器、Rendering、intro 可以开始；
3. **第二批资源 + Rapier WASM** 并行加载（`Promise.all`），加载进度通过 `this.world.intro.updateProgress` 驱动 intro 动画；
4. 加载完后构造 `Physics`、`Player`、`Zones`、各 `Area`，调用 `this.world.step(1)` 生成第二批世界对象（`Floor`/`Grass`/`Trees`/`Areas` 等）。

`World.step(0)` 只建 `Grid` 和 `Intro`；`step(1)` 在资源就绪后建全部可视对象。加新世界对象时按"几时能建"归到对应 step。

### 资源加载协议
`ResourcesLoader` 吃声明式元组数组 `[key, path, type, transformFn?]`：
- `type` 取 `'gltf'` / `'texture'` / `'textureKtx'`；
- 路径相对 `static/`；
- `transformFn` 在资源就绪后立即跑（设置 filter/wrap/colorSpace）。

压缩模式通过 `compressedModelSuffix`（`-compressed`）和 `compressedTextureFormat`（`textureKtx` vs `texture`）在加载声明里做字符串拼接——加新资源时**必须同时支持两种模式**，复制现有条目的写法。

### World / Areas 分层
`sources/Game/World/` 是所有视觉物件；`World/Areas/` 下每个文件是一个**可交互场景区**（landing / projects / career / bowling / cookie / social / circuit / altar / toilet / timeMachine / lab / behindTheScene / achievements）。`Zones.js` + `InteractivePoints.js` 处理玩家进入区域触发的逻辑。新增区域：在 `World/Areas/` 加类，在 `Areas.js` 注册，在 `static/` 放资源，在 `Game.js` 的资源清单里加条目。

### 物理
Rapier3D 以 WASM 动态 `import('@dimforge/rapier3d')` 加载——`vite.config.js` 的 `wasm()` + `topLevelAwait()` 插件是必需的，别删。载具物理分 `PhysicsVehicle`（pre/post 两阶段）+ 渲染侧 `VisualVehicle` 插值。`PhysicsWireframe` 在 debug 模式下画物理 shape。

### Debug 面板
`Debug.js` 用 Tweakpane。很多类构造时会 `if(this.game.debug.active) this.debugPanel = this.game.debug.panel.addFolder({...})`。debug 激活靠 URL hash `#debug`（读 `Debug.js` 确认当前条件），不是环境变量。

## 目录速查

- `sources/index.js` — 入口，只做 `new Game()`
- `sources/Game/Game.js` — 单例根，看 `init()` 理解启动顺序
- `sources/Game/World/` — 所有视觉对象
- `sources/Game/World/Areas/` — 可交互场景区
- `sources/Game/Physics/` — Rapier 封装
- `sources/Game/Cycles/` — 昼夜/四季
- `sources/Game/Materials/` + `Materials.js` — TSL 材质
- `sources/Game/Passes/cheapDOF.js` — 后处理节点
- `sources/Game/utilities/` — Observable* 集合、maths、time 工具
- `sources/data/` — 静态数据（projects/achievements/countries/lab/social/consoleLog）
- `sources/style/*.styl` — Stylus，入口 `sources/style/index.styl`
- `sources/threejs-override.js` — 在 Game 之前 import，给 three 的 prototype 打猴子补丁
- `scripts/compress.js` — GLB（KTX + ETC1S via gltf-transform）+ 纹理（toktx）+ UI（sharp → WebP）
- `static/` — 所有运行时资源；`resources/` 是 Blender/PSD 原始工程，**不**会被打包

## Vite 配置陷阱（`vite.config.js`）

- `root: 'sources/'`，`index.html` 在 `sources/index.html`；
- `publicDir: '../static/'`，`envDir: '../'`——`.env` 和 `static/` 都在仓库根，不在 Vite root 下；
- `restart` 插件监听 `../static/**`，修改资源会**重启** dev server（不是 HMR）；
- `nodePolyfills()` 是为了 `msgpack-lite` 等依赖；
- `basicSsl()` 被注释掉，开发若需 HTTPS（手机测试、WebGPU 某些特性）再打开。

## 注意

- `resources/` 含 `.blend` / `.psd` / `.sbs` 源文件，体积大，不要误改。
- `.gitignore` 忽略了 `.env*` 和 `.wav`（但保留 `static/sounds/music/*.wav`）——新加音乐要放对路径。
- 新建类遵循 PascalCase 文件名（`PhysicalVehicle.js`）；数据/工具 camelCase。
