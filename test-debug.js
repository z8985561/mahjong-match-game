// 麻将消消乐调试脚本
console.log("🀄 麻将消消乐调试开始");

// 模拟游戏状态
const GAME_CONFIG = {
  GRID_SIZE: 8,
  TILES: {
    wan: { count: 9 },
    tiao: { count: 9 },
    tong: { count: 9 }
  },
  VISUAL: {
    TILE_SIZE: 80,
    TILE_SPACING: 10
  }
};

// 检查网格生成逻辑
function generateRandomTiles(count) {
  const tiles = [];
  const basicSuits = ['wan', 'tiao', 'tong'];
  let tileId = 0;
  
  while (tiles.length < count) {
    for (const suit of basicSuits) {
      for (let value = 1; value <= GAME_CONFIG.TILES[suit].count; value++) {
        if (tiles.length < count) {
          tiles.push({ id: tileId++, suit, value });
        } else {
          break;
        }
      }
      if (tiles.length >= count) break;
    }
  }
  
  console.log(`✅ 生成了 ${tiles.length} 张麻将牌`);
  console.log("样本牌:", tiles.slice(0, 5));
  return tiles;
}

// 模拟网格生成
function generateGrid() {
  const size = GAME_CONFIG.GRID_SIZE;
  const tiles = generateRandomTiles(size * size);
  const newGrid = [];
  
  for (let row = 0; row < size; row++) {
    newGrid[row] = [];
    for (let col = 0; col < size; col++) {
      const tile = tiles[row * size + col];
      newGrid[row][col] = {
        ...tile,
        row,
        col,
        isSelected: false,
        isMatched: false,
        isRemovable: false
      };
    }
  }
  
  console.log(`✅ 生成了 ${size}x${size} 网格`);
  console.log("网格样本位置 (0,0):", newGrid[0][0]);
  console.log("网格样本位置 (1,1):", newGrid[1][1]);
  
  return newGrid;
}

// 运行测试
const grid = generateGrid();
console.log("🎯 调试完成");
console.log("网格对象类型:", typeof grid);
console.log("网格长度:", grid.length);
console.log("第一行长度:", grid[0] ? grid[0].length : "undefined");