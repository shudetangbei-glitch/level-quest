# 🎮 闯关冒险 (Level Quest)

一款优雅精致的横版闯关游戏，支持桌面和手机平台。

## ✨ 功能特性

- **6 个递进难度关卡** - 从简单到极难的挑战
- **纯 Canvas 游戏引擎** - 高性能 2D 渲染
- **手机触摸控制** - 虚拟摇杆和跳跃按钮
- **键盘控制** - 方向键/WASD 移动，空格跳跃
- **星级评分系统** - 根据完成时间评分（1-3 星）
- **用户认证** - Manus OAuth 登录
- **进度存档** - 自动保存游戏进度
- **全球排行榜** - 与玩家竞争
- **响应式设计** - 完美适配各种屏幕

## 🚀 快速开始

### 前置要求

- Node.js 18+
- pnpm 或 npm

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/shudetangbei-glitch/level-quest.git
cd level-quest

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 在浏览器打开
# http://localhost:5173
```

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 🎮 游戏操作

### 桌面版
- **移动**: 方向键 ← → 或 WASD
- **跳跃**: 空格键或上方向键
- **暂停**: P 键
- **重新开始**: R 键

### 手机版
- **移动**: 左右方向按钮
- **跳跃**: 绿色跳跃按钮
- **暂停**: 黄色暂停按钮
- **倾斜控制**: 可选的设备倾斜控制

## 📁 项目结构

```
level-quest/
├── client/                 # React 前端
│   ├── src/
│   │   ├── pages/         # 游戏页面
│   │   ├── components/    # UI 组件
│   │   ├── game/          # 游戏引擎
│   │   └── lib/           # 工具函数
│   └── index.html
├── server/                 # Express 后端
│   ├── routers.ts         # tRPC 路由
│   ├── db.ts              # 数据库查询
│   └── leaderboard.ts     # 排行榜管理
├── drizzle/               # 数据库 Schema
└── package.json
```

## 🎯 游戏关卡

| 关卡 | 难度 | 目标时间 | 特点 |
|------|------|---------|------|
| 1 | ⭐ 简单 | 30秒 | 基础平台跳跃 |
| 2 | ⭐⭐ 简单 | 45秒 | 移动平台 |
| 3 | ⭐⭐ 中等 | 60秒 | 障碍物躲避 |
| 4 | ⭐⭐⭐ 困难 | 90秒 | 复杂组合 |
| 5 | ⭐⭐⭐ 困难 | 120秒 | 高难度挑战 |
| 6 | ⭐⭐⭐⭐ 极难 | 150秒 | Boss 关卡 |

## ⭐ 星级系统

- **3 星** ⭐⭐⭐ - 在目标时间的 70% 内完成
- **2 星** ⭐⭐ - 在目标时间内完成
- **1 星** ⭐ - 在目标时间的 150% 内完成

## 🔐 用户系统

游戏支持 Manus OAuth 登录，登录后可以：
- 自动保存游戏进度
- 查看个人统计数据
- 参与全球排行榜竞争
- 追踪最佳成绩

## 📊 技术栈

- **前端**: React 19, TypeScript, Tailwind CSS 4
- **游戏引擎**: Canvas 2D API
- **后端**: Express, tRPC, Node.js
- **数据库**: MySQL/TiDB
- **ORM**: Drizzle ORM
- **认证**: Manus OAuth

## 🛠️ 开发

### 添加新关卡

编辑 `client/src/game/levels.ts`：

```typescript
export const LEVEL_DEFINITIONS: Record<number, LevelDefinition> = {
  7: {
    name: "新关卡名称",
    difficulty: "extreme",
    targetTime: 180000,
    platforms: [
      // 定义平台位置
    ],
    obstacles: [
      // 定义障碍物
    ],
    goal: { x: 750, y: 100 },
  },
};
```

### 修改游戏参数

编辑 `client/src/game/engine.ts` 中的 `GameEngine` 类：

```typescript
const config: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  gravity: 0.6,        // 重力加速度
  friction: 0.95,      // 摩擦力
};
```

## 🐛 已知问题

- 移动设备上的触摸延迟可能较高
- 某些旧浏览器可能不支持完整功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 许可证

MIT License

## 👨‍💻 作者

Created with ❤️ by Manus AI

---

**游戏链接**: [GitHub](https://github.com/shudetangbei-glitch/level-quest)

**在线体验**: 可部署到 GitHub Pages 或其他服务器

## 🎓 学习资源

- [Canvas API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [React 官方文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [tRPC 文档](https://trpc.io)
