import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import {
  GameTile,
  GameMode,
  GameState,
  MatchResult,
  MatchType,
  MahjongSuit,
  GAME_CONFIG,
  SoundType,
  LeaderboardEntry
} from '../types/mahjong'
import { generateRandomTiles, shuffleTiles } from '../utils/tileGenerator'
import { findMatches } from '../utils/matchEngine'
import { createAudioEngine } from '../utils/audioEngine'

export const useGameStore = defineStore('game', () => {
  // 核心状态
  const state = ref<GameState>(GameState.MENU)
  const gameMode = ref<GameMode>(GameMode.STEPS)
  const grid = ref<GameTile[][]>([])
  const selectedTile = ref<GameTile | null>(null)
  
  // 统计数据
  const score = ref(0)
  const moves = ref(0)
  const matches = ref(0)
  const combos = ref(0)
  const startTime = ref(0)
  const elapsedTime = ref(0)
  const timerInterval = ref<number | null>(null)
  
  // 连击系统
  const comboSystem = reactive({
    currentCombo: 0,
    maxCombo: 0,
    comboMultiplier: 1,
    comboTimeout: GAME_CONFIG.COMBO.TIMEOUT,
    lastMatchTime: 0
  })
  
  // 游戏设置
  const settings = reactive({
    soundEnabled: true,
    allowHints: true,
    gridSize: GAME_CONFIG.GRID_SIZE
  })
  
  // 音效引擎
  const audioEngine = createAudioEngine()
  
  // 计算属性
  const currentModeConfig = computed(() => GAME_CONFIG.MODES[gameMode.value])
  const isGameOver = computed(() => state.value === GameState.GAME_OVER)
  const isVictory = computed(() => state.value === GameState.VICTORY)
  const isPlaying = computed(() => state.value === GameState.PLAYING)
  
  const remainingMoves = computed(() => {
    const config = currentModeConfig.value
    if (config.maxMoves === 0) return '∞'
    return Math.max(0, config.maxMoves - moves.value)
  })
  
  const remainingTime = computed(() => {
    const config = currentModeConfig.value
    if (config.timeLimit === 0) return '∞'
    const remaining = config.timeLimit - Math.floor(elapsedTime.value / 1000)
    return Math.max(0, remaining)
  })
  
  const progressPercentage = computed(() => {
    const config = currentModeConfig.value
    if (config.targetScore === 0) return 0
    
    const progress = (score.value / config.targetScore) * 100
    return Math.min(100, Math.max(0, progress))
  })
  
  // 初始化游戏
  const initializeGame = () => {
    resetGame()
    generateGrid()
    startTimer()
    state.value = GameState.PLAYING
  }
  
  // 重置游戏状态
  const resetGame = () => {
    grid.value = []
    selectedTile.value = null
    score.value = 0
    moves.value = 0
    matches.value = 0
    combos.value = 0
    startTime.value = Date.now()
    elapsedTime.value = 0
    
    comboSystem.currentCombo = 0
    comboSystem.maxCombo = 0
    comboSystem.comboMultiplier = 1
    comboSystem.lastMatchTime = 0
    
    audioEngine.stopAll()
  }
  
  // 生成游戏网格
  const generateGrid = () => {
    const size = settings.gridSize
    const tiles = generateRandomTiles(size * size)
    const newGrid: GameTile[][] = []
    
    for (let row = 0; row < size; row++) {
      newGrid[row] = []
      for (let col = 0; col < size; col++) {
        const tile = tiles[row * size + col]
        newGrid[row][row] = {
          ...tile,
          row,
          col,
          isSelected: false,
          isMatched: false,
          isRemovable: false
        }
      }
    }
    
    grid.value = newGrid
    checkAvailableMoves()
  }
  
  // 选择麻将牌
  const selectTile = (tile: GameTile) => {
    if (!isPlaying.value || tile.isMatched) return
    
    playSound(SoundType.CLICK)
    
    // 如果没有选中牌，选中当前牌
    if (!selectedTile.value) {
      selectedTile.value = tile
      tile.isSelected = true
      playSound(SoundType.SELECT)
      return
    }
    
    // 如果点击的是已选中的牌，取消选择
    if (selectedTile.value.id === tile.id) {
      selectedTile.value.isSelected = false
      selectedTile.value = null
      playSound(SoundType.DESELECT)
      return
    }
    
    // 检查是否可以交换（相邻）
    if (isAdjacent(selectedTile.value, tile)) {
      swapTiles(selectedTile.value, tile)
      moves.value++
      
      const matchResults = findMatches(grid.value)
      if (matchResults.length > 0) {
        // 有匹配，处理消除
        processMatches(matchResults)
        playSound(SoundType.MATCH)
      } else {
        // 无匹配，交换回来
        swapTiles(selectedTile.value, tile)
        playSound(SoundType.SWAP)
      }
      
      // 清除选择
      selectedTile.value.isSelected = false
      selectedTile.value = null
      tile.isSelected = false
      
      // 检查游戏结束条件
      checkGameState()
    } else {
      // 选择另一张牌
      selectedTile.value.isSelected = false
      selectedTile.value = tile
      tile.isSelected = true
      playSound(SoundType.SELECT)
    }
  }
  
  // 交换两张牌
  const swapTiles = (tile1: GameTile, tile2: GameTile) => {
    const tempRow = tile1.row
    const tempCol = tile1.col
    
    tile1.row = tile2.row
    tile1.col = tile2.col
    
    tile2.row = tempRow
    tile2.col = tempCol
    
    // 更新网格
    grid.value[tile1.row][tile1.col] = tile1
    grid.value[tile2.row][tile2.col] = tile2
  }
  
  // 检查两张牌是否相邻
  const isAdjacent = (tile1: GameTile, tile2: GameTile): boolean => {
    const rowDiff = Math.abs(tile1.row - tile2.row)
    const colDiff = Math.abs(tile1.col - tile2.col)
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }
  
  // 处理匹配结果
  const processMatches = (matchResults: MatchResult[]) => {
    const now = Date.now()
    
    // 检查是否在连击时间内
    if (now - comboSystem.lastMatchTime <= comboSystem.comboTimeout) {
      comboSystem.currentCombo++
      comboSystem.maxCombo = Math.max(comboSystem.maxCombo, comboSystem.currentCombo)
      
      // 计算连击倍率
      const comboIndex = Math.min(comboSystem.currentCombo, GAME_CONFIG.COMBO.MULTIPLIERS.length - 1)
      comboSystem.comboMultiplier = GAME_CONFIG.COMBO.MULTIPLIERS[comboIndex]
      
      combos.value++
      playSound(SoundType.COMBO)
    } else {
      comboSystem.currentCombo = 0
      comboSystem.comboMultiplier = 1
    }
    
    // 更新最后匹配时间
    comboSystem.lastMatchTime = now
    
    // 处理所有匹配
    for (const match of matchResults) {
      // 计算分数（基础分数 × 连击倍率）
      const baseScore = GAME_CONFIG.SCORES[match.type]
      const comboScore = Math.round(baseScore * comboSystem.comboMultiplier)
      
      // 更新分数
      score.value += comboScore
      matches.value++
      
      // 标记牌为已匹配
      for (const tile of match.tiles) {
        tile.isMatched = true
        tile.isRemovable = true
      }
    }
    
    // 移除已匹配的牌并填充新牌
    removeMatchedTiles()
    checkAvailableMoves()
  }
  
  // 移除已匹配的牌
  const removeMatchedTiles = () => {
    const size = settings.gridSize
    const newGrid = grid.value.map(row => [...row])
    
    // 标记所有待移除的牌
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const tile = newGrid[row][col]
        if (tile.isRemovable) {
          newGrid[row][col] = null as any
        }
      }
    }
    
    // 从底部开始，上方的牌下落填补空缺
    for (let col = 0; col < size; col++) {
      const columnTiles: GameTile[] = []
      
      // 收集该列中未匹配的牌
      for (let row = size - 1; row >= 0; row--) {
        const tile = newGrid[row][col]
        if (tile && !tile.isRemovable) {
          columnTiles.push(tile)
        }
      }
      
      // 重新排列该列
      for (let row = size - 1; row >= 0; row--) {
        if (columnTiles.length > 0) {
          const tile = columnTiles.shift()!
          tile.row = row
          newGrid[row][col] = tile
        } else {
          // 生成新牌填充空缺
          const newTile = generateRandomTiles(1)[0]
          newGrid[row][col] = {
            ...newTile,
            row,
            col,
            isSelected: false,
            isMatched: false,
            isRemovable: false
          }
        }
      }
    }
    
    grid.value = newGrid
  }
  
  // 检查是否有可用的移动
  const checkAvailableMoves = () => {
    // 简化实现：总是返回true，避免阻塞游戏
    // 实际实现需要检查所有可能的相邻交换是否能产生匹配
    return true
  }
  
  // 检查游戏状态
  const checkGameState = () => {
    const config = currentModeConfig.value
    
    // 检查胜利条件
    if (config.targetScore > 0 && score.value >= config.targetScore) {
      state.value = GameState.VICTORY
      playSound(SoundType.VICTORY)
      saveToLeaderboard()
      return
    }
    
    // 检查失败条件
    if (config.maxMoves > 0 && moves.value >= config.maxMoves) {
      state.value = GameState.GAME_OVER
      playSound(SoundType.GAME_OVER)
      return
    }
    
    if (config.timeLimit > 0 && remainingTime.value <= 0) {
      state.value = GameState.GAME_OVER
      playSound(SoundType.GAME_OVER)
      return
    }
    
    // 检查无可用移动
    if (!checkAvailableMoves()) {
      state.value = GameState.GAME_OVER
      playSound(SoundType.GAME_OVER)
      return
    }
  }
  
  // 保存到排行榜
  const saveToLeaderboard = () => {
    const entry: LeaderboardEntry = {
      id: Date.now().toString(),
      playerName: '玩家',
      score: score.value,
      moves: moves.value,
      time: elapsedTime.value,
      mode: gameMode.value,
      date: new Date().toISOString().split('T')[0]
    }
    
    try {
      const leaderboard = loadLeaderboard()
      leaderboard.push(entry)
      leaderboard.sort((a, b) => b.score - a.score)
      
      if (leaderboard.length > 20) {
        leaderboard.length = 20
      }
      
      localStorage.setItem(
        GAME_CONFIG.STORAGE.LEADERBOARD_KEY,
        JSON.stringify(leaderboard)
      )
    } catch (error) {
      console.error('保存排行榜失败:', error)
    }
  }
  
  // 加载排行榜
  const loadLeaderboard = (): LeaderboardEntry[] => {
    try {
      const data = localStorage.getItem(GAME_CONFIG.STORAGE.LEADERBOARD_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('加载排行榜失败:', error)
      return []
    }
  }
  
  // 开始计时器
  const startTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
    
    startTime.value = Date.now()
    
    timerInterval.value = setInterval(() => {
      elapsedTime.value = Date.now() - startTime.value
      checkGameState()
    }, 1000) as unknown as number
  }
  
  // 停止计时器
  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }
  
  // 播放音效
  const playSound = (soundType: SoundType) => {
    if (settings.soundEnabled) {
      audioEngine.play(soundType)
    }
  }
  
  // 切换游戏模式
  const setGameMode = (mode: GameMode) => {
    gameMode.value = mode
  }
  
  // 切换声音设置
  const toggleSound = () => {
    settings.soundEnabled = !settings.soundEnabled
  }
  
  // 切换提示设置
  const toggleHints = () => {
    settings.allowHints = !settings.allowHints
  }
  
  // 重新开始游戏
  const restartGame = () => {
    stopTimer()
    initializeGame()
  }
  
  // 返回菜单
  const returnToMenu = () => {
    stopTimer()
    state.value = GameState.MENU
  }
  
  return {
    // 状态
    state,
    gameMode,
    grid,
    selectedTile,
    score,
    moves,
    matches,
    combos,
    elapsedTime,
    comboSystem,
    settings,
    
    // 计算属性
    currentModeConfig,
    isGameOver,
    isVictory,
    isPlaying,
    remainingMoves,
    remainingTime,
    progressPercentage,
    
    // 方法
    initializeGame,
    resetGame,
    selectTile,
    setGameMode,
    toggleSound,
    toggleHints,
    restartGame,
    returnToMenu,
    playSound,
    loadLeaderboard
  }
})