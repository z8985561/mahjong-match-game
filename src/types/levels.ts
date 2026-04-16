// 关卡配置
// 设计参考：开心消消乐难度曲线 - 循序渐进、难度波动上升、主旋律+次旋律

import { MahjongSuit } from './mahjong'

export interface LevelConfig {
  id: number
  name: string
  description: string
  gridSize: number
  maxMoves: number
  targetScore: number
  // 可用花色（控制牌的种类数，种类越少越容易匹配）
  suits: MahjongSuit[]
  // 每种花色使用多少个值（如 [3] 表示只用1-3万，[5] 表示用1-5万）
  suitRange: number
  // ⭐ 难度评级 1-3
  stars: number
  // 关卡主题提示
  theme: string
}

// 10个关卡设计
// 难度维度：网格大小、牌种类数、步数、目标分数
// 设计原则：前3关入门教学，4-6关逐渐加压，7-9关综合挑战，第10关boss关
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '初识麻将',
    description: '小棋盘，少种类，轻松上手',
    gridSize: 6,
    maxMoves: 25,
    targetScore: 300,
    suits: [MahjongSuit.WAN],
    suitRange: 4,
    stars: 1,
    theme: '🌸 新手教学'
  },
  {
    id: 2,
    name: '双色入门',
    description: '引入第二种花色，开始组合消除',
    gridSize: 6,
    maxMoves: 25,
    targetScore: 500,
    suits: [MahjongSuit.WAN, MahjongSuit.TONG],
    suitRange: 3,
    stars: 1,
    theme: '🌸 新手教学'
  },
  {
    id: 3,
    name: '三色初探',
    description: '三种花色齐全，试试顺子消除',
    gridSize: 6,
    maxMoves: 30,
    targetScore: 600,
    suits: [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG],
    suitRange: 3,
    stars: 1,
    theme: '🌿 略有挑战'
  },
  {
    id: 4,
    name: '棋盘扩大',
    description: '7×7棋盘登场，消除空间更大',
    gridSize: 7,
    maxMoves: 30,
    targetScore: 800,
    suits: [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG],
    suitRange: 4,
    stars: 2,
    theme: '🌿 略有挑战'
  },
  {
    id: 5,
    name: '步数紧缺',
    description: '步数减少，每步都要精打细算',
    gridSize: 7,
    maxMoves: 22,
    targetScore: 700,
    suits: [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG],
    suitRange: 4,
    stars: 2,
    theme: '🔥 小有难度'
  },
  {
    id: 6,
    name: '种类增多',
    description: '更多数字登场，匹配难度提升',
    gridSize: 7,
    maxMoves: 28,
    targetScore: 1000,
    suits: [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG],
    suitRange: 6,
    stars: 2,
    theme: '🔥 小有难度'
  },
  {
    id: 7,
    name: '标准棋盘',
    description: '8×8标准棋盘，全面考验眼力',
    gridSize: 8,
    maxMoves: 30,
    targetScore: 1200,
    suits: [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG],
    suitRange: 6,
    stars: 3,
    theme: '💀 真正考验'
  },
  {
    id: 8,
    name: '步步惊心',
    description: '步数吃紧，需要高效利用连击',
    gridSize: 8,
    maxMoves: 22,
    targetScore: 1000,
    suits: [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG],
    suitRange: 7,
    stars: 3,
    theme: '💀 真正考验'
  },
  {
    id: 9,
    name: '全牌上阵',
    description: '27种牌全部登场，辨识力大考验',
    gridSize: 8,
    maxMoves: 35,
    targetScore: 1800,
    suits: [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG],
    suitRange: 9,
    stars: 3,
    theme: '☠️ 高手挑战'
  },
  {
    id: 10,
    name: '终极挑战',
    description: '高目标、少步数、全种类，麻将大师的试炼',
    gridSize: 8,
    maxMoves: 25,
    targetScore: 2000,
    suits: [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG],
    suitRange: 9,
    stars: 3,
    theme: '👑 终极Boss'
  }
]

// 关卡进度存储
const LEVEL_PROGRESS_KEY = 'mahjong_match_level_progress'

export interface LevelProgress {
  // 已通关的最高关卡id
  maxUnlockedLevel: number
  // 每关最佳分数
  bestScores: Record<number, number>
  // 每关获得的星星数
  stars: Record<number, number>
}

// 加载进度
export function loadLevelProgress(): LevelProgress {
  try {
    const data = localStorage.getItem(LEVEL_PROGRESS_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('加载关卡进度失败:', e)
  }
  return {
    maxUnlockedLevel: 1,
    bestScores: {},
    stars: {}
  }
}

// 保存进度
export function saveLevelProgress(progress: LevelProgress): void {
  try {
    localStorage.setItem(LEVEL_PROGRESS_KEY, JSON.stringify(progress))
  } catch (e) {
    console.error('保存关卡进度失败:', e)
  }
}
