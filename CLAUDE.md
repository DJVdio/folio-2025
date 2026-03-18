# Folio 2025 项目指南

## 项目概述

这是一个基于 Three.js 和 Rapier 物理引擎的交互式 3D 作品集项目，使用 Vite 作为构建工具。项目包含复杂的游戏循环系统、物理模拟、天气系统、以及丰富的视觉效果。

## 技术栈

- **核心框架**: Three.js (v0.182.0) - 3D 渲染
- **物理引擎**: @dimforge/rapier3d (v0.17.3) - 物理模拟
- **构建工具**: Vite (v7.2.4)
- **动画库**: GSAP (v3.12.5)
- **音频**: Howler.js (v2.2.4)
- **调试工具**: Tweakpane (v4.0.4)
- **3D 模型处理**: @gltf-transform

## 项目结构

```
folio-2025/
├── sources/              # 源代码目录
│   ├── Game/            # 游戏核心逻辑
│   ├── data/            # 数据配置文件
│   ├── style/           # 样式文件
│   ├── index.html       # HTML 入口
│   └── index.js         # JS 入口
├── static/              # 静态资源（模型、纹理等）
├── scripts/             # 构建脚本
├── dist/                # 构建输出目录
└── vite.config.js       # Vite 配置
```

## 开发流程

### 安装依赖
```bash
npm install --force
```
注意：必须使用 `--force` 标志，因为某些依赖可能存在版本冲突。

### 开发服务器
```bash
npm run dev
```
- 运行在 localhost:1234
- 支持热重载
- 静态文件变化会自动重启服务器

### 生产构建
```bash
npm run build
```
输出到 `dist/` 目录。

### 资源压缩
```bash
npm run compress
```
压缩 GLB 模型和纹理文件，使用 KTX 格式优化 GPU 性能。

## 游戏循环架构

项目使用严格的游戏循环顺序（见 readme.md），每个系统按特定顺序执行：

1. **阶段 0-3**: 输入处理 → 玩家预物理 → 载具预物理 → 物理模拟
2. **阶段 4-6**: 物理后处理 → 载具后物理 → 玩家后物理
3. **阶段 7-10**: 视图更新 → 环境系统 → 视觉效果
4. **阶段 13-14**: 实例化对象 → 音频和通知
5. **阶段 998-999**: 渲染 → 性能监控

**重要**: 修改任何系统时，必须遵守这个执行顺序，避免依赖关系错误。

## 代码规范

### 文件命名
- 类文件使用 PascalCase: `PhysicalVehicle.js`
- 数据文件使用 camelCase: `consoleLog.js`
- 组件按功能分组在对应目录

### 模块导入
- 使用 ES6 模块语法
- 相对路径导入，包含 `.js` 扩展名
- 示例: `import { Game } from './Game/Game.js'`

### 环境变量
- 配置在 `.env` 文件（基于 `.env.example`）
- 通过 `import.meta.env.VITE_*` 访问
- 常用变量:
  - `VITE_LOG`: 启用控制台日志
  - `VITE_GAME_PUBLIC`: 将 game 实例暴露到 window

## 3D 资源工作流

### Blender 导出
1. 导出前静音 palette 纹理节点（在 Three.js 中直接加载）
2. 使用对应的导出预设
3. 不要在 Blender 中压缩（后续统一处理）

### 纹理压缩
- GLB 文件: 使用 ETC1S 格式，质量 255
- 纹理文件: 自动转换为 KTX 格式
- UI 图片: 转换为 WebP

## 物理系统

- 使用 Rapier3D WASM 物理引擎
- 物理更新在游戏循环阶段 3
- 载具物理分为预处理和后处理两个阶段
- 所有物理对象需要在 `Objects` 系统中注册

## 性能优化建议

1. **实例化渲染**: 使用 `InstancedGroup` 处理重复对象
2. **LOD 系统**: 根据距离调整细节级别
3. **纹理压缩**: 始终使用压缩纹理（KTX/ETC1S）
4. **对象池**: 复用频繁创建/销毁的对象
5. **视锥剔除**: 利用 Three.js 自动剔除

## 调试工具

- **Tweakpane**: 实时调整参数
- **Stats-GL**: 性能监控
- **PhysicsWireframe**: 物理调试可视化

## 常见任务

### 添加新的游戏对象
1. 在 `sources/Game/` 创建类文件
2. 在 `Game.js` 中注册到对应的游戏循环阶段
3. 实现 `update()` 方法（如需要）
4. 处理物理交互（如需要）

### 添加新的视觉效果
1. 确定依赖的系统（View, Weather, DayCycles 等）
2. 在游戏循环阶段 10 注册
3. 使用 GSAP 处理动画
4. 考虑性能影响

### 修改物理行为
1. 在预物理阶段设置力和速度
2. 在物理阶段让 Rapier 计算
3. 在后物理阶段读取结果并更新视觉

## 注意事项

- **不要跳过游戏循环顺序**: 系统间有严格的依赖关系
- **静态资源路径**: 使用相对于 `static/` 的路径
- **WASM 支持**: 确保 Vite 插件正确配置 WASM 和 top-level await
- **强制安装**: 某些依赖需要 `--force` 标志
- **不要提交压缩文件**: 压缩文件由脚本生成，不纳入版本控制

## 相关资源

- [gLTF Transform CLI](https://gltf-transform.dev/cli)
- [KTX Software](https://github.com/KhronosGroup/KTX-Software)
- [Rapier 文档](https://rapier.rs/docs/)
- [Three.js 文档](https://threejs.org/docs/)
