<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import MahjongTile from './MahjongTile.vue'
import { useGameStore } from '../stores/gameStore'
import { GameTile } from '../types/mahjong'

const gameStore = useGameStore()

// 触摸状态
const touchState = ref({
  startX: 0,
  startY: 0,
  currentTile: null as GameTile | null,
  isSwiping: false
})

// 计算网格样式
const gridStyle = computed(() => {
  const size = gameStore.settings.gridSize
  const tileSize = 80 // 与MahjongTile.vue中的TILE_SIZE对应
  
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, ${tileSize}px)`,
    gridTemplateRows: `repeat(${size}, ${tileSize}px)`,
    gap: '10px',
    justifyContent: 'center',
    margin: '0 auto'
  }
})

// 处理麻将牌点击
const handleTileClick = (tile: GameTile) => {
  gameStore.selectTile(tile)
}

// 触摸事件处理
const handleTouchStart = (tile: GameTile, event: TouchEvent) => {
  if (!tile || tile.isMatched) return
  
  const touch = event.touches[0]
  if (!touch) return
  
  touchState.value = {
    startX: touch.clientX,
    startY: touch.clientY,
    currentTile: tile,
    isSwiping: false
  }
  
  // 阻止默认行为，避免滚动
  event.preventDefault()
}

const handleTouchMove = (event: TouchEvent) => {
  if (!touchState.value.currentTile) return
  
  const touch = event.touches[0]
  if (!touch) return
  
  const deltaX = touch.clientX - touchState.value.startX
  const deltaY = touch.clientY - touchState.value.startY
  
  // 如果移动距离超过阈值，开始滑动
  const threshold = 10
  if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
    touchState.value.isSwiping = true
    event.preventDefault()
  }
}

const handleTouchEnd = (tile: GameTile, event: TouchEvent) => {
  if (!touchState.value.currentTile || !touchState.value.isSwiping) {
    // 如果没有滑动，视为点击
    if (tile && !tile.isMatched) {
      gameStore.selectTile(tile)
    }
    return
  }
  
  const touch = event.changedTouches[0]
  if (!touch) return
  
  const deltaX = touch.clientX - touchState.value.startX
  const deltaY = touch.clientY - touchState.value.startY
  
  // 计算滑动方向
  const absDeltaX = Math.abs(deltaX)
  const absDeltaY = Math.abs(deltaY)
  
  if (absDeltaX > absDeltaY && absDeltaX > 20) {
    // 水平滑动
    const direction = deltaX > 0 ? 'right' : 'left'
    handleSwipe(touchState.value.currentTile, direction)
  } else if (absDeltaY > absDeltaX && absDeltaY > 20) {
    // 垂直滑动
    const direction = deltaY > 0 ? 'down' : 'up'
    handleSwipe(touchState.value.currentTile, direction)
  }
  
  touchState.value = {
    startX: 0,
    startY: 0,
    currentTile: null,
    isSwiping: false
  }
}

// 处理滑动
const handleSwipe = (tile: GameTile, direction: 'up' | 'down' | 'left' | 'right') => {
  const grid = gameStore.grid
  if (!grid || !grid.length) return
  
  const size = gameStore.settings.gridSize
  let targetTile: GameTile | null = null
  
  switch (direction) {
    case 'up':
      if (tile.row > 0) targetTile = grid[tile.row - 1][tile.col]
      break
    case 'down':
      if (tile.row < size - 1) targetTile = grid[tile.row + 1][tile.col]
      break
    case 'left':
      if (tile.col > 0) targetTile = grid[tile.row][tile.col - 1]
      break
    case 'right':
      if (tile.col < size - 1) targetTile = grid[tile.row][tile.col + 1]
      break
  }
  
  if (targetTile && !targetTile.isMatched) {
    gameStore.selectTile(tile)
    gameStore.selectTile(targetTile)
  }
}

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (!gameStore.selectedTile) return
  
  const tile = gameStore.selectedTile
  let targetTile: GameTile | null = null
  
  switch (event.key) {
    case 'ArrowUp':
      if (tile.row > 0) targetTile = gameStore.grid[tile.row - 1][tile.col]
      break
    case 'ArrowDown':
      if (tile.row < gameStore.settings.gridSize - 1) targetTile = gameStore.grid[tile.row + 1][tile.col]
      break
    case 'ArrowLeft':
      if (tile.col > 0) targetTile = gameStore.grid[tile.row][tile.col - 1]
      break
    case 'ArrowRight':
      if (tile.col < gameStore.settings.gridSize - 1) targetTile = gameStore.grid[tile.row][tile.col + 1]
      break
    case ' ':
    case 'Enter':
      // 空格或回车确认选择
      if (gameStore.selectedTile) {
        gameStore.selectTile(gameStore.selectedTile)
      }
      break
    case 'Escape':
      // 取消选择
      if (gameStore.selectedTile) {
        gameStore.selectedTile.isSelected = false
        gameStore.selectedTile = null
      }
      break
  }
  
  if (targetTile && !targetTile.isMatched) {
    gameStore.selectTile(targetTile)
    event.preventDefault()
  }
}

// 添加键盘事件监听
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="game-grid-container">
    <!-- 游戏状态指示器 -->
    <div class="game-status">
      <div class="status-item">
        <span class="status-label">分数</span>
        <span class="status-value score">{{ gameStore.score }}</span>
      </div>
      
      <div class="status-item">
        <span class="status-label">步数</span>
        <span class="status-value moves">{{ gameStore.moves }}</span>
        <span v-if="gameStore.currentModeConfig.maxMoves > 0" class="status-max">
          / {{ gameStore.currentModeConfig.maxMoves }}
        </span>
      </div>
      
      <div class="status-item">
        <span class="status-label">连击</span>
        <span class="status-value combo" :class="{ 'combo-active': gameStore.comboSystem.currentCombo > 0 }">
          {{ gameStore.comboSystem.currentCombo }}x
        </span>
      </div>
      
      <div class="status-item" v-if="gameStore.currentModeConfig.timeLimit > 0">
        <span class="status-label">时间</span>
        <span class="status-value time">{{ gameStore.remainingTime }}s</span>
      </div>
    </div>
    
    <!-- 进度条 -->
    <div class="progress-container" v-if="gameStore.currentModeConfig.targetScore > 0">
      <div class="progress-label">
        <span>目标: {{ gameStore.currentModeConfig.targetScore }}分</span>
        <span>{{ Math.round(gameStore.progressPercentage) }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${gameStore.progressPercentage}%` }"
        ></div>
      </div>
    </div>
    
    <!-- 游戏网格 -->
    <div class="game-grid" :style="gridStyle">
      <template v-for="row in gameStore.grid" :key="row">
        <template v-for="tile in row" :key="tile.id">
          <MahjongTile
            :tile="tile"
            :is-selected="tile.isSelected"
            @click="handleTileClick"
            @touch-start="handleTouchStart"
            @touch-move="handleTouchMove"
            @touch-end="handleTouchEnd"
          />
        </template>
      </template>
    </div>
    
    <!-- 连击横幅 -->
    <div 
      v-if="gameStore.comboSystem.currentCombo > 1" 
      class="combo-banner"
      :class="{
        'combo-high': gameStore.comboSystem.currentCombo >= 5,
        'combo-max': gameStore.comboSystem.currentCombo >= 8
      }"
    >
      <span class="combo-text">
        {{ gameStore.comboSystem.currentCombo }} 连击！
      </span>
      <span class="combo-multiplier">
        ×{{ gameStore.comboSystem.comboMultiplier.toFixed(1) }}
      </span>
    </div>
    
    <!-- 操作提示 -->
    <div class="game-hints">
      <div class="hint-item">
        <span class="hint-icon">🎮</span>
        <span class="hint-text">点击选择，交换相邻牌</span>
      </div>
      <div class="hint-item">
        <span class="hint-icon">📱</span>
        <span class="hint-text">滑动操作，支持触摸</span>
      </div>
      <div class="hint-item">
        <span class="hint-icon">⌨️</span>
        <span class="hint-text">方向键移动，空格确认</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-grid-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.game-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.status-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
  font-weight: 500;
}

.status-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
}

.score {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.moves {
  color: #64b5f6;
}

.combo {
  color: #81c784;
  transition: all 0.3s ease;
}

.combo-active {
  animation: comboPulse 0.5s ease-in-out;
  color: #ffeb3b;
  text-shadow: 0 0 10px rgba(255, 235, 59, 0.5);
}

.time {
  color: #ff8a65;
}

.status-max {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 2px;
}

.progress-container {
  margin-bottom: 25px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 5px;
  transition: width 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: progressShine 2s infinite;
}

.game-grid {
  margin: 20px auto;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.combo-banner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
  padding: 20px 40px;
  border-radius: 20px;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  z-index: 1000;
  animation: comboBanner 1s ease-out forwards;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.combo-high {
  background: linear-gradient(45deg, #feca57, #ff9ff3);
  box-shadow: 0 10px 30px rgba(254, 202, 87, 0.4);
}

.combo-max {
  background: linear-gradient(45deg, #ff9ff3, #48dbfb);
  box-shadow: 0 10px 30px rgba(255, 159, 243, 0.4);
}

.combo-text {
  font-size: 2.2rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.combo-multiplier {
  font-size: 1.8rem;
  opacity: 0.9;
}

.game-hints {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.hint-icon {
  font-size: 1.2rem;
}

.hint-text {
  white-space: nowrap;
}

/* 动画 */
@keyframes comboPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes comboBanner {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  10% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
  20% {
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

@keyframes progressShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-grid-container {
    padding: 10px;
  }
  
  .game-status {
    flex-wrap: wrap;
    gap: 15px;
    padding: 12px;
  }
  
  .status-item {
    min-width: 70px;
  }
  
  .status-value {
    font-size: 1.5rem;
  }
  
  .game-grid {
    padding: 10px;
  }
  
  .combo-banner {
    font-size: 2rem;
    padding: 15px 30px;
  }
  
  .combo-text {
    font-size: 1.8rem;
  }
  
  .combo-multiplier {
    font-size: 1.5rem;
  }
  
  .game-hints {
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }
  
  .hint-item {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .game-status {
    gap: 10px;
  }
  
  .status-item {
    min-width: 60px;
  }
  
  .status-value {
    font-size: 1.3rem;
  }
  
  .status-label {
    font-size: 0.8rem;
  }
  
  .combo-banner {
    font-size: 1.8rem;
    padding: 12px 24px;
  }
  
  .combo-text {
    font-size: 1.6rem;
  }
  
  .combo-multiplier {
    font-size: 1.3rem;
  }
}
</style>