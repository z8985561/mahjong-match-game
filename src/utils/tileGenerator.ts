import { MahjongTile, MahjongSuit, GAME_CONFIG } from '../types/mahjong'

// 生成麻将牌Unicode字符
const getTileUnicode = (suit: MahjongSuit, value: number): string => {
  const baseCodes: Record<MahjongSuit, number> = {
    [MahjongSuit.WAN]: 0x1F007, // 🀇
    [MahjongSuit.TIAO]: 0x1F010, // 🀐
    [MahjongSuit.TONG]: 0x1F019, // 🀙
    [MahjongSuit.FENG]: 0x1F000, // 🀀 (东风)
    [MahjongSuit.JIAN]: 0x1F006, // 🀆 (白板)
    [MahjongSuit.HUA]: 0x1F020   // 🀠 (春)
  }
  
  if ([MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG].includes(suit)) {
    return String.fromCodePoint(baseCodes[suit] + (value - 1))
  }
  
  return String.fromCodePoint(baseCodes[suit])
}

// 获取麻将牌名称
const getTileName = (suit: MahjongSuit, value: number): string => {
  const suitNames: Record<MahjongSuit, string> = {
    [MahjongSuit.WAN]: '万',
    [MahjongSuit.TIAO]: '条',
    [MahjongSuit.TONG]: '筒',
    [MahjongSuit.FENG]: '风',
    [MahjongSuit.JIAN]: '箭',
    [MahjongSuit.HUA]: '花'
  }
  
  if ([MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG].includes(suit)) {
    const numberNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
    return `${numberNames[value - 1]}${suitNames[suit]}`
  }
  
  return suitNames[suit]
}

// 获取麻将牌颜色
const getTileColor = (suit: MahjongSuit): string => {
  const colors: Record<MahjongSuit, string> = {
    [MahjongSuit.WAN]: '#c62828', // 红色
    [MahjongSuit.TIAO]: '#2e7d32', // 绿色
    [MahjongSuit.TONG]: '#1565c0', // 蓝色
    [MahjongSuit.FENG]: '#ff9800', // 橙色
    [MahjongSuit.JIAN]: '#9c27b0', // 紫色
    [MahjongSuit.HUA]: '#4caf50'   // 绿色
  }
  
  return colors[suit] || '#ffffff'
}

// 获取图片URL（如果使用图片模式）
const getTileImageUrl = (suit: MahjongSuit, value: number): string | undefined => {
  // 如果使用图片模式，返回图片路径
  // 例如：`/assets/mahjong/${suit}/${value}.png`
  return undefined
}

// 生成单个麻将牌
export const createTile = (id: number, suit: MahjongSuit, value: number): MahjongTile => {
  return {
    id,
    suit,
    value,
    name: getTileName(suit, value),
    unicode: getTileUnicode(suit, value),
    imageUrl: getTileImageUrl(suit, value)
  }
}

// 生成指定数量的随机麻将牌
export const generateRandomTiles = (count: number): MahjongTile[] => {
  const tiles: MahjongTile[] = []
  let tileId = 0
  
  // 基础牌型（萬、条、筒各1-9）
  const basicSuits = [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG]
  
  // 生成足够数量的牌
  while (tiles.length < count) {
    for (const suit of basicSuits) {
      for (let value = 1; value <= GAME_CONFIG.TILES[suit].count; value++) {
        if (tiles.length < count) {
          tiles.push(createTile(tileId++, suit, value))
        } else {
          break
        }
      }
      if (tiles.length >= count) break
    }
  }
  
  return shuffleTiles(tiles)
}

// 洗牌算法（Fisher-Yates）
export const shuffleTiles = <T extends any[]>(tiles: T): T => {
  const shuffled = [...tiles] as T
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

// 检查麻将牌是否有效
export const isValidTile = (tile: MahjongTile): boolean => {
  const suitConfig = GAME_CONFIG.TILES[tile.suit as MahjongSuit]
  if (!suitConfig) return false
  
  if ([MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG].includes(tile.suit)) {
    return tile.value >= 1 && tile.value <= suitConfig.count
  }
  
  return true
}

// 获取所有可用的麻将牌花色
export const getAllSuits = (): MahjongSuit[] => {
  return Object.values(MahjongSuit)
}

// 获取指定花色的所有值
export const getAllValues = (suit: MahjongSuit): number[] => {
  const suitConfig = GAME_CONFIG.TILES[suit]
  if (!suitConfig) return []
  
  const values: number[] = []
  for (let i = 1; i <= suitConfig.count; i++) {
    values.push(i)
  }
  
  return values
}

// 生成完整的麻将牌组（包含所有牌）
export const generateFullTileSet = (): MahjongTile[] => {
  const tiles: MahjongTile[] = []
  let tileId = 0
  
  const basicSuits = [MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG]
  
  for (const suit of basicSuits) {
    for (let value = 1; value <= GAME_CONFIG.TILES[suit].count; value++) {
      // 每种牌生成4张（麻将标准）
      for (let i = 0; i < 4; i++) {
        tiles.push(createTile(tileId++, suit, value))
      }
    }
  }
  
  return tiles
}

// 从网格中获取所有牌
export const getAllTilesFromGrid = (grid: any[][]): MahjongTile[] => {
  const tiles: MahjongTile[] = []
  
  for (const row of grid) {
    for (const tile of row) {
      if (tile) {
        tiles.push({
          id: tile.id,
          suit: tile.suit,
          value: tile.value,
          name: tile.name,
          unicode: tile.unicode,
          imageUrl: tile.imageUrl
        })
      }
    }
  }
  
  return tiles
}

// 统计牌的花色分布
export const getSuitDistribution = (tiles: MahjongTile[]): Record<MahjongSuit, number> => {
  const distribution: Record<MahjongSuit, number> = {
    [MahjongSuit.WAN]: 0,
    [MahjongSuit.TIAO]: 0,
    [MahjongSuit.TONG]: 0,
    [MahjongSuit.FENG]: 0,
    [MahjongSuit.JIAN]: 0,
    [MahjongSuit.HUA]: 0
  }
  
  for (const tile of tiles) {
    if (distribution[tile.suit] !== undefined) {
      distribution[tile.suit]++
    }
  }
  
  return distribution
}

// 统计牌的值分布
export const getValueDistribution = (
  tiles: MahjongTile[], 
  suit?: MahjongSuit
): Record<number, number> => {
  const distribution: Record<number, number> = {}
  
  for (const tile of tiles) {
    if (suit && tile.suit !== suit) continue
    
    if (!distribution[tile.value]) {
      distribution[tile.value] = 0
    }
    distribution[tile.value]++
  }
  
  // 确保所有值都有记录
  if (suit) {
    const values = getAllValues(suit)
    for (const value of values) {
      if (!distribution[value]) {
        distribution[value] = 0
      }
    }
  }
  
  return distribution
}

// 生成调试信息
export const generateDebugInfo = (tiles: MahjongTile[]): string => {
  const suitDist = getSuitDistribution(tiles)
  const totalTiles = tiles.length
  
  let info = `总计: ${totalTiles} 张牌\n\n`
  
  for (const [suit, count] of Object.entries(suitDist)) {
    if (count > 0) {
      const percentage = ((count / totalTiles) * 100).toFixed(1)
      info += `${suit}: ${count} 张 (${percentage}%)\n`
      
      if ([MahjongSuit.WAN, MahjongSuit.TIAO, MahjongSuit.TONG].includes(suit as MahjongSuit)) {
        const valueDist = getValueDistribution(tiles, suit as MahjongSuit)
        for (const [value, valueCount] of Object.entries(valueDist)) {
          if (valueCount > 0) {
            info += `  ${value}: ${valueCount} 张\n`
          }
        }
      }
    }
  }
  
  return info
}

// 检查是否需要洗牌（避免无解局面）
export const checkNeedReshuffle = (grid: any[][]): boolean => {
  // 简化实现：总是返回false
  // 实际实现需要检查是否有可用的匹配
  return false
}