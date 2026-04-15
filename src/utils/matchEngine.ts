import { GameTile, MatchResult, MatchType, MahjongSuit, GAME_CONFIG } from '../types/mahjong'

// 检查对子（两张相同牌）
const checkPair = (tile1: GameTile, tile2: GameTile): boolean => {
  return (
    !tile1.isMatched &&
    !tile2.isMatched &&
    tile1.suit === tile2.suit &&
    tile1.value === tile2.value
  )
}

// 检查刻子（三张相同牌）
const checkTriple = (tile1: GameTile, tile2: GameTile, tile3: GameTile): boolean => {
  return (
    !tile1.isMatched &&
    !tile2.isMatched &&
    !tile3.isMatched &&
    tile1.suit === tile2.suit &&
    tile2.suit === tile3.suit &&
    tile1.value === tile2.value &&
    tile2.value === tile3.value
  )
}

// 检查顺子（同花色连续三张）
const checkStraight = (tile1: GameTile, tile2: GameTile, tile3: GameTile): boolean => {
  if (
    tile1.isMatched ||
    tile2.isMatched ||
    tile3.isMatched ||
    tile1.suit !== tile2.suit ||
    tile2.suit !== tile3.suit
  ) {
    return false
  }
  
  // 确保是基础牌（萬、条、筒）
  if (![MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG].includes(tile1.suit)) {
    return false
  }
  
  // 获取排序后的值
  const values = [tile1.value, tile2.value, tile3.value].sort((a, b) => a - b)
  
  // 检查是否连续
  return values[0] === values[1] - 1 && values[1] === values[2] - 1
}

// 检查四连（四张相同牌）
const checkFour = (tile1: GameTile, tile2: GameTile, tile3: GameTile, tile4: GameTile): boolean => {
  return (
    !tile1.isMatched &&
    !tile2.isMatched &&
    !tile3.isMatched &&
    !tile4.isMatched &&
    tile1.suit === tile2.suit &&
    tile2.suit === tile3.suit &&
    tile3.suit === tile4.suit &&
    tile1.value === tile2.value &&
    tile2.value === tile3.value &&
    tile3.value === tile4.value
  )
}

// 在网格中查找所有匹配
export const findMatches = (grid: GameTile[][]): MatchResult[] => {
  const results: MatchResult[] = []
  const size = grid.length
  
  // 存储已匹配的牌ID，避免重复匹配
  const matchedTileIds = new Set<number>()
  
  // 检查水平匹配
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size - 2; col++) {
      // 检查三连
      const tile1 = grid[row][col]
      const tile2 = grid[row][col + 1]
      const tile3 = grid[row][col + 2]
      
      if (!tile1 || !tile2 || !tile3) continue
      
      // 检查刻子
      if (checkTriple(tile1, tile2, tile3)) {
        if (!matchedTileIds.has(tile1.id) && !matchedTileIds.has(tile2.id) && !matchedTileIds.has(tile3.id)) {
          results.push({
            tiles: [tile1, tile2, tile3],
            type: MatchType.TRIPLE,
            score: GAME_CONFIG.SCORES[MatchType.TRIPLE],
            comboMultiplier: 1
          })
          
          matchedTileIds.add(tile1.id)
          matchedTileIds.add(tile2.id)
          matchedTileIds.add(tile3.id)
        }
      }
      
      // 检查顺子
      if (checkStraight(tile1, tile2, tile3)) {
        if (!matchedTileIds.has(tile1.id) && !matchedTileIds.has(tile2.id) && !matchedTileIds.has(tile3.id)) {
          results.push({
            tiles: [tile1, tile2, tile3],
            type: MatchType.STRAIGHT,
            score: GAME_CONFIG.SCORES[MatchType.STRAIGHT],
            comboMultiplier: 1
          })
          
          matchedTileIds.add(tile1.id)
          matchedTileIds.add(tile2.id)
          matchedTileIds.add(tile3.id)
        }
      }
    }
  }
  
  // 检查垂直匹配
  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size - 2; row++) {
      const tile1 = grid[row][col]
      const tile2 = grid[row + 1][col]
      const tile3 = grid[row + 2][col]
      
      if (!tile1 || !tile2 || !tile3) continue
      
      // 检查刻子
      if (checkTriple(tile1, tile2, tile3)) {
        if (!matchedTileIds.has(tile1.id) && !matchedTileIds.has(tile2.id) && !matchedTileIds.has(tile3.id)) {
          results.push({
            tiles: [tile1, tile2, tile3],
            type: MatchType.TRIPLE,
            score: GAME_CONFIG.SCORES[MatchType.TRIPLE],
            comboMultiplier: 1
          })
          
          matchedTileIds.add(tile1.id)
          matchedTileIds.add(tile2.id)
          matchedTileIds.add(tile3.id)
        }
      }
      
      // 检查顺子（垂直方向不会出现顺子）
    }
  }
  
  // 检查四连（水平）
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size - 3; col++) {
      const tile1 = grid[row][col]
      const tile2 = grid[row][col + 1]
      const tile3 = grid[row][col + 2]
      const tile4 = grid[row][col + 3]
      
      if (!tile1 || !tile2 || !tile3 || !tile4) continue
      
      if (checkFour(tile1, tile2, tile3, tile4)) {
        if (
          !matchedTileIds.has(tile1.id) &&
          !matchedTileIds.has(tile2.id) &&
          !matchedTileIds.has(tile3.id) &&
          !matchedTileIds.has(tile4.id)
        ) {
          results.push({
            tiles: [tile1, tile2, tile3, tile4],
            type: MatchType.FOUR,
            score: GAME_CONFIG.SCORES[MatchType.FOUR],
            comboMultiplier: 1
          })
          
          matchedTileIds.add(tile1.id)
          matchedTileIds.add(tile2.id)
          matchedTileIds.add(tile3.id)
          matchedTileIds.add(tile4.id)
        }
      }
    }
  }
  
  // 检查四连（垂直）
  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size - 3; row++) {
      const tile1 = grid[row][col]
      const tile2 = grid[row + 1][col]
      const tile3 = grid[row + 2][col]
      const tile4 = grid[row + 3][col]
      
      if (!tile1 || !tile2 || !tile3 || !tile4) continue
      
      if (checkFour(tile1, tile2, tile3, tile4)) {
        if (
          !matchedTileIds.has(tile1.id) &&
          !matchedTileIds.has(tile2.id) &&
          !matchedTileIds.has(tile3.id) &&
          !matchedTileIds.has(tile4.id)
        ) {
          results.push({
            tiles: [tile1, tile2, tile3, tile4],
            type: MatchType.FOUR,
            score: GAME_CONFIG.SCORES[MatchType.FOUR],
            comboMultiplier: 1
          })
          
          matchedTileIds.add(tile1.id)
          matchedTileIds.add(tile2.id)
          matchedTileIds.add(tile3.id)
          matchedTileIds.add(tile4.id)
        }
      }
    }
  }
  
  // 检查L形匹配（3×2区域）
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 2; col++) {
      // 可能的L形位置
      const positions = [
        // 左上L形
        [
          [row, col],     // 左上
          [row, col + 1], // 中上
          [row, col + 2], // 右上
          [row + 1, col], // 左下
        ],
        // 右上L形
        [
          [row, col],     // 左上
          [row, col + 1], // 中上
          [row, col + 2], // 右上
          [row + 1, col + 2], // 右下
        ],
        // 左下L形
        [
          [row, col],     // 左上
          [row + 1, col], // 左下
          [row + 1, col + 1], // 中下
          [row + 1, col + 2], // 右下
        ],
        // 右下L形
        [
          [row, col + 2], // 右上
          [row + 1, col], // 左下
          [row + 1, col + 1], // 中下
          [row + 1, col + 2], // 右下
        ]
      ]
      
      for (const pos of positions) {
        const tiles = pos.map(([r, c]) => grid[r][c]).filter(Boolean)
        
        if (tiles.length === 4) {
          const [tile1, tile2, tile3, tile4] = tiles
          
          // 检查是否四张相同
          if (checkFour(tile1, tile2, tile3, tile4)) {
            if (
              !matchedTileIds.has(tile1.id) &&
              !matchedTileIds.has(tile2.id) &&
              !matchedTileIds.has(tile3.id) &&
              !matchedTileIds.has(tile4.id)
            ) {
              results.push({
                tiles: [tile1, tile2, tile3, tile4],
                type: MatchType.FOUR,
                score: GAME_CONFIG.SCORES[MatchType.FOUR],
                comboMultiplier: 1
              })
              
              matchedTileIds.add(tile1.id)
              matchedTileIds.add(tile2.id)
              matchedTileIds.add(tile3.id)
              matchedTileIds.add(tile4.id)
            }
          }
        }
      }
    }
  }
  
  // 按优先级排序：四连 > 刻子 > 顺子
  results.sort((a, b) => {
    const priority = {
      [MatchType.FOUR]: 3,
      [MatchType.TRIPLE]: 2,
      [MatchType.STRAIGHT]: 1,
      [MatchType.PAIR]: 0
    }
    
    return priority[b.type] - priority[a.type]
  })
  
  return results
}

// 检查特定位置是否可能形成匹配
export const checkPotentialMatch = (
  grid: GameTile[][],
  row: number,
  col: number
): MatchResult | null => {
  const size = grid.length
  const tile = grid[row][col]
  
  if (!tile || tile.isMatched) return null
  
  // 检查与相邻牌的匹配
  const directions = [
    [0, 1],  // 右
    [1, 0],  // 下
    [0, -1], // 左
    [-1, 0]  // 上
  ]
  
  for (const [dr, dc] of directions) {
    const r2 = row + dr
    const c2 = col + dc
    
    if (r2 >= 0 && r2 < size && c2 >= 0 && c2 < size) {
      const tile2 = grid[r2][c2]
      
      if (!tile2 || tile2.isMatched) continue
      
      // 检查对子
      if (checkPair(tile, tile2)) {
        return {
          tiles: [tile, tile2],
          type: MatchType.PAIR,
          score: GAME_CONFIG.SCORES[MatchType.PAIR],
          comboMultiplier: 1
        }
      }
    }
  }
  
  return null
}

// 检查网格中是否有可用移动
export const hasAvailableMoves = (grid: GameTile[][]): boolean => {
  const size = grid.length
  
  // 检查所有相邻交换是否能产生匹配
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const currentTile = grid[row][col]
      if (!currentTile || currentTile.isMatched) continue
      
      // 检查右交换
      if (col < size - 1) {
        const rightTile = grid[row][col + 1]
        if (rightTile && !rightTile.isMatched) {
          // 模拟交换
          const tempGrid = JSON.parse(JSON.stringify(grid))
          tempGrid[row][col] = rightTile
          tempGrid[row][col + 1] = currentTile
          
          const matches = findMatches(tempGrid)
          if (matches.length > 0) {
            return true
          }
        }
      }
      
      // 检查下交换
      if (row < size - 1) {
        const downTile = grid[row + 1][col]
        if (downTile && !downTile.isMatched) {
          // 模拟交换
          const tempGrid = JSON.parse(JSON.stringify(grid))
          tempGrid[row][col] = downTile
          tempGrid[row + 1][col] = currentTile
          
          const matches = findMatches(tempGrid)
          if (matches.length > 0) {
            return true
          }
        }
      }
    }
  }
  
  return false
}

// 计算匹配的基础分数
export const calculateBaseScore = (matchType: MatchType, tileCount: number): number => {
  const baseScore = GAME_CONFIG.SCORES[matchType] || 0
  
  // 对于四连，增加额外分数
  if (matchType === MatchType.FOUR) {
    return baseScore + Math.floor(baseScore * 0.5) // 增加50%
  }
  
  return baseScore
}

// 应用连击倍率
export const applyComboMultiplier = (baseScore: number, comboMultiplier: number): number => {
  return Math.round(baseScore * comboMultiplier)
}

// 检查是否为特殊匹配（连对、多顺子等）
export const isSpecialMatch = (matchResult: MatchResult): boolean => {
  // 四连是特殊匹配
  if (matchResult.type === MatchType.FOUR) {
    return true
  }
  
  // 顺子长度超过3也是特殊匹配
  if (matchResult.type === MatchType.STRAIGHT && matchResult.tiles.length > 3) {
    return true
  }
  
  return false
}

// 获取匹配的视觉特效类型
export const getMatchEffectType = (matchResult: MatchResult): string => {
  switch (matchResult.type) {
    case MatchType.FOUR:
      return 'explosion'
    case MatchType.TRIPLE:
      return 'flash'
    case MatchType.STRAIGHT:
      return 'streak'
    case MatchType.PAIR:
      return 'sparkle'
    default:
      return 'default'
  }
}

// 验证匹配结果
export const validateMatch = (matchResult: MatchResult): boolean => {
  if (!matchResult.tiles || matchResult.tiles.length === 0) {
    return false
  }
  
  // 检查所有牌是否未匹配
  for (const tile of matchResult.tiles) {
    if (tile.isMatched) {
      return false
    }
  }
  
  // 根据匹配类型验证
  switch (matchResult.type) {
    case MatchType.PAIR:
      return matchResult.tiles.length === 2 && 
             checkPair(matchResult.tiles[0], matchResult.tiles[1])
      
    case MatchType.TRIPLE:
      return matchResult.tiles.length === 3 &&
             checkTriple(matchResult.tiles[0], matchResult.tiles[1], matchResult.tiles[2])
      
    case MatchType.STRAIGHT:
      return matchResult.tiles.length >= 3 &&
             checkStraight(matchResult.tiles[0], matchResult.tiles[1], matchResult.tiles[2])
      
    case MatchType.FOUR:
      return matchResult.tiles.length === 4 &&
             checkFour(matchResult.tiles[0], matchResult.tiles[1], matchResult.tiles[2], matchResult.tiles[3])
      
    default:
      return false
  }
}