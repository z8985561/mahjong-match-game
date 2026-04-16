// 麻将牌花色枚举
export enum MahjongSuit {
  WAN = 'wan',    // 萬子
  TIAO = 'tiao',  // 条子
  TONG = 'tong',  // 筒子
  FENG = 'feng',  // 风牌
  JIAN = 'jian',  // 箭牌
  HUA = 'hua'     // 花牌
}

// 麻将牌类型
export interface MahjongTile {
  id: number
  suit: MahjongSuit
  value: number
  name: string
  unicode?: string
  imageUrl?: string
}

// 游戏牌类型（扩展麻将牌）
export interface GameTile extends MahjongTile {
  row: number
  col: number
  isSelected: boolean
  isMatched: boolean
  isRemovable: boolean
}

// 游戏状态
export enum GameMode {
  STEPS = 'steps',      // 步数模式
  TIME = 'time',        // 限时模式
  ENDLESS = 'endless',  // 无尽模式
  INFINITE = 'infinite', // 无限模式（别名）
  CHALLENGE = 'challenge', // 挑战模式
  TIMED = 'timed'       // 限时模式（别名）
}

export enum GameState {
  MENU = 'menu',       // 菜单界面
  PLAYING = 'playing', // 游戏中
  PAUSED = 'paused',   // 暂停
  GAME_OVER = 'game_over', // 游戏结束
  VICTORY = 'victory'  // 胜利
}

// 匹配类型
export enum MatchType {
  PAIR = 'pair',       // 对子
  TRIPLE = 'triple',   // 刻子（三张相同）
  STRAIGHT = 'straight', // 顺子（同花色连续）
  FOUR = 'four'        // 四连
}

// 匹配结果
export interface MatchResult {
  tiles: GameTile[]
  type: MatchType
  score: number
  comboMultiplier: number
}

// 连击系统
export interface ComboSystem {
  currentCombo: number
  maxCombo: number
  comboMultiplier: number
  comboTimeout: number
  lastMatchTime: number
}

// 游戏统计数据
export interface GameStats {
  score: number
  moves: number
  matches: number
  combos: number
  startTime: number
  elapsedTime: number
  bestScore: number
}

// 游戏设置
export interface GameSettings {
  gridSize: number
  gameMode: GameMode
  targetScore: number
  maxMoves: number
  timeLimit: number
  allowHints: boolean
  soundEnabled: boolean
}

// 排行榜条目
export interface LeaderboardEntry {
  id: string
  playerName: string
  score: number
  moves: number
  time: number
  mode: GameMode
  date: string
}

// 音效类型
export enum SoundType {
  CLICK = 'click',
  SWAP = 'swap',
  MATCH = 'match',
  STRAIGHT = 'straight',
  TRIPLE = 'triple',
  FOUR = 'four',
  COMBO = 'combo',
  VICTORY = 'victory',
  GAME_OVER = 'game_over',
  HINT = 'hint',
  SELECT = 'select',
  DESELECT = 'deselect',
  SHUFFLE = 'shuffle',
  COUNTDOWN = 'countdown'
}

// 游戏配置
export const GAME_CONFIG = {
  // 网格大小
  GRID_SIZE: 8,
  
  // 游戏模式配置
  MODES: {
    [GameMode.STEPS]: {
      name: '步数模式',
      description: '60步内获得最高分',
      maxMoves: 60,
      targetScore: 1000,
      timeLimit: 0
    },
    [GameMode.TIME]: {
      name: '限时模式',
      description: '180秒内获得最高分',
      maxMoves: 0,
      targetScore: 1500,
      timeLimit: 180
    },
    [GameMode.ENDLESS]: {
      name: '无尽模式',
      description: '无步数限制，自由消除',
      maxMoves: 0,
      targetScore: 0,
      timeLimit: 0
    },
    [GameMode.INFINITE]: {
      name: '无限模式',
      description: '无步数限制，自由消除',
      maxMoves: 0,
      targetScore: 0,
      timeLimit: 0
    },
    [GameMode.CHALLENGE]: {
      name: '挑战模式',
      description: '20步内达到2000分',
      maxMoves: 20,
      targetScore: 2000,
      timeLimit: 0
    },
    [GameMode.TIMED]: {
      name: '限时模式',
      description: '90秒内达到1500分',
      maxMoves: 0,
      targetScore: 1500,
      timeLimit: 90
    }
  },
  
  // 分数配置
  SCORES: {
    [MatchType.PAIR]: 50,
    [MatchType.TRIPLE]: 100,
    [MatchType.STRAIGHT]: 150,
    [MatchType.FOUR]: 200
  },
  
  // 连击配置
  COMBO: {
    TIMEOUT: 2000, // 2秒内连续消除算连击
    MULTIPLIERS: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0],
    MAX_COMBO: 10
  },
  
  // 麻将牌配置
  TILES: {
    // 萬子 (1-9)
    [MahjongSuit.WAN]: {
      count: 9,
      name: '万',
      color: '#c62828', // 红色
      unicodePrefix: '🀇'
    },
    // 条子 (1-9)
    [MahjongSuit.TIAO]: {
      count: 9,
      name: '条',
      color: '#2e7d32', // 绿色
      unicodePrefix: '🀐'
    },
    // 筒子 (1-9)
    [MahjongSuit.TONG]: {
      count: 9,
      name: '筒',
      color: '#1565c0', // 蓝色
      unicodePrefix: '🀙'
    }
  },
  
  // 视觉配置
  VISUAL: {
    TILE_SIZE: 80,
    TILE_SPACING: 10,
    ANIMATION_DURATION: 300,
    HIGHLIGHT_COLOR: '#ffeb3b'
  },
  
  // 存储配置
  STORAGE: {
    LEADERBOARD_KEY: 'mahjong_match_leaderboard',
    SETTINGS_KEY: 'mahjong_match_settings',
    STATS_KEY: 'mahjong_match_stats'
  }
} as const

// 辅助函数类型
export type MahjongTileGenerator = () => MahjongTile
export type MatchValidator = (tiles: GameTile[]) => MatchResult | null
export type ScoreCalculator = (match: MatchResult) => number