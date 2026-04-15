# 麻将消消乐 (Mahjong Match Game)

一款基于 Vue 3 + TypeScript 开发的麻将消消乐游戏。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 极速的前端构建工具
- **Pinia** - Vue 的状态管理库

## 功能特性

- 🀄 27张基本麻将牌（萬、条、筒各1-9）
- 🎮 4种游戏模式：步数模式、无限模式、挑战模式、限时模式
- 🔥 连击系统：最高6倍得分倍率
- 🎵 Web Audio API 生成音效（无需音频文件）
- 📱 响应式设计，完美支持移动端触摸操作
- ✨ 流畅的动画效果和视觉反馈

## 游戏规则

- **顺子**：同花色连续三张牌（如一条、二条、三条）→ 150分
- **刻子**：三张相同的牌 → 100分
- **四连**：同花色连续四张牌 → 200分
- **对子**：两张相同的牌 → 50分

## 游戏模式

| 模式 | 描述 | 目标 |
|------|------|------|
| 步数模式 | 30步内完成 | 达到1000分 |
| 无限模式 | 无步数限制 | 尽量高分 |
| 挑战模式 | 仅20步 | 达到2000分 |
| 限时模式 | 90秒内 | 达到1500分 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

访问 http://localhost:5173 开始游戏！

## 项目结构

```
src/
├── components/
│   ├── GameGrid.vue      # 游戏主网格
│   ├── GameMenu.vue      # 游戏菜单
│   └── MahjongTile.vue   # 麻将牌组件
├── stores/
│   └── gameStore.ts      # Pinia 游戏状态
├── types/
│   └── mahjong.ts        # 类型定义
├── utils/
│   ├── audioEngine.ts    # 音效引擎
│   ├── matchEngine.ts    # 匹配引擎
│   └── tileGenerator.ts  # 牌局生成器
├── App.vue
└── main.ts
```

## License

MIT
