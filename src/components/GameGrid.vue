<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import MahjongTile from './MahjongTile.vue'
import { useGameStore } from '../stores/gameStore'
import { GameTile, GameState } from '../types/mahjong'
import { LEVELS } from '../types/levels'

const gameStore = useGameStore()

// 是否关卡模式
const isLevelMode = computed(() => gameStore.currentLevel !== null)

// 当前关卡信息
const currentLevel = computed(() => gameStore.currentLevel)

// 触摸状态
const touchState = ref({
  startX: 0,
  startY: 0,
  currentTile: null as GameTile | null,
  isSwiping: false
})

// 计算网格样式（关卡模式使用关卡配置的网格大小）
const gridStyle = computed(() => {
  const size = currentLevel.value ? currentLevel.value.gridSize : gameStore.settings.gridSize
  // 根据网格大小自适应牌面大小
  const maxWidth = Math.min(700, window.innerWidth - 40)
  const tileSize = Math.floor((maxWidth - (size - 1) * 8 - 30) / size)
  const clampedSize = Math.max(40, Math.min(80, tileSize))
  
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, ${clampedSize}px)`,
    gridTemplateRows: `repeat(${size}, ${clampedSize}px)`,
    gap: '8px',
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
  
  event.preventDefault()
}

const handleTouchMove = (event: TouchEvent) => {
  if (!touchState.value.currentTile) return
  
  const touch = event.touches[0]
  if (!touch) return
  
  const deltaX = touch.clientX - touchState.value.startX
  const deltaY = touch.clientY - touchState.value.startY
  
  const threshold = 10
  if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
    touchState.value.isSwiping = true
    event.preventDefault()
  }
}

const handleTouchEnd = (tile: GameTile, event: TouchEvent) => {
  if (!touchState.value.currentTile || !touchState.value.isSwiping) {
    if (tile && !tile.isMatched) {
      gameStore.selectTile(tile)
    }
    return
  }
  
  const touch = event.changedTouches[0]
  if (!touch) return
  
  const deltaX = touch.clientX - touchState.value.startX
  const deltaY = touch.clientY - touchState.value.startY
  
  const absDeltaX = Math.abs(deltaX)
  const absDeltaY = Math.abs(deltaY)
  
  if (absDeltaX > absDeltaY && absDeltaX > 20) {
    const direction = deltaX > 0 ? 'right' : 'left'
    handleSwipe(touchState.value.currentTile, direction)
  } else if (absDeltaY > absDeltaX && absDeltaY > 20) {
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
  
  const size = currentLevel.value ? currentLevel.value.gridSize : gameStore.settings.gridSize
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
  if (gameStore.state === GameState.GAME_OVER || gameStore.state === GameState.VICTORY) return
  if (!gameStore.selectedTile) return
  
  const tile = gameStore.selectedTile
  const size = currentLevel.value ? currentLevel.value.gridSize : gameStore.settings.gridSize
  let targetTile: GameTile | null = null
  
  switch (event.key) {
    case 'ArrowUp':
      if (tile.row > 0) targetTile = gameStore.grid[tile.row - 1][tile.col]
      break
    case 'ArrowDown':
      if (tile.row < size - 1) targetTile = gameStore.grid[tile.row + 1][tile.col]
      break
    case 'ArrowLeft':
      if (tile.col > 0) targetTile = gameStore.grid[tile.row][tile.col - 1]
      break
    case 'ArrowRight':
      if (tile.col < size - 1) targetTile = gameStore.grid[tile.row][tile.col + 1]
      break
    case ' ':
    case 'Enter':
      if (gameStore.selectedTile) {
        gameStore.selectTile(gameStore.selectedTile)
      }
      break
    case 'Escape':
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

// 关卡胜利/失败弹窗的星星显示
const levelStars = computed(() => {
  if (!currentLevel.value) return 0
  return gameStore.levelProgress.stars[currentLevel.value.id] || 0
})

const hasNextLevel = computed(() => {
  if (!currentLevel.value) return false
  return currentLevel.value.id < LEVELS.length
})

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
        <span class="status-label">{{ isLevelMode ? `第${currentLevel!.id}关` : '分数' }}</span>
        <span class="status-value score">{{ gameStore.score }}</span>
      </div>
      
      <div class="status-item">
        <span class="status-label">步数</span>
        <span class="status-value moves" :class="{ 'low-moves': typeof gameStore.remainingMoves === 'number' && gameStore.remainingMoves <= 5 }">
          {{ gameStore.remainingMoves }}
        </span>
        <span v-if="isLevelMode" class="status-max">/ {{ currentLevel!.maxMoves }}</span>
        <span v-else-if="gameStore.currentModeConfig.maxMoves > 0" class="status-max">
          / {{ gameStore.currentModeConfig.maxMoves }}
        </span>
      </div>
      
      <div class="status-item">
        <span class="status-label">连击</span>
        <span class="status-value combo" :class="{ 'combo-active': gameStore.comboSystem.currentCombo > 0 }">
          {{ gameStore.comboSystem.currentCombo }}x
        </span>
      </div>
      
      <div class="status-item" v-if="!isLevelMode && gameStore.currentModeConfig.timeLimit > 0">
        <span class="status-label">时间</span>
        <span class="status-value time">{{ gameStore.remainingTime }}s</span>
      </div>
    </div>
    
    <!-- 进度条（关卡模式或自由模式有目标分数时显示） -->
    <div class="progress-container" v-if="isLevelMode || gameStore.currentModeConfig.targetScore > 0">
      <div class="progress-label">
        <span>🎯 目标: {{ isLevelMode ? currentLevel!.targetScore : gameStore.currentModeConfig.targetScore }}分</span>
        <span>{{ Math.round(gameStore.progressPercentage) }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :class="{ 'progress-complete': gameStore.progressPercentage >= 100 }"
          :style="{ width: `${gameStore.progressPercentage}%` }"
        ></div>
      </div>
    </div>
    
    <!-- 游戏网格 -->
    <div class="game-grid" :style="gridStyle">
      <template v-for="(row, rowIndex) in gameStore.grid" :key="`row-${rowIndex}`">
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
    
    <!-- 死局洗牌提示 -->
    <div 
      v-if="gameStore.isDeadlock" 
      class="shuffle-banner"
    >
      <span class="shuffle-text">🔀 无可用移动，自动洗牌中...</span>
    </div>
    
    <!-- 关卡胜利弹窗 -->
    <div v-if="isLevelMode && gameStore.isVictory" class="overlay">
      <div class="overlay-card victory-card">
        <div class="victory-icon">🎉</div>
        <h2 class="victory-title">通关成功！</h2>
        <div class="victory-stars">
          <span 
            v-for="i in 3" 
            :key="i" 
            class="star" 
            :class="{ 'star-earned': i <= levelStars }"
          >⭐</span>
        </div>
        <div class="victory-score">
          <div class="score-row">
            <span>得分</span>
            <span class="score-value">{{ gameStore.score }} / {{ currentLevel!.targetScore }}</span>
          </div>
          <div class="score-row">
            <span>步数</span>
            <span class="score-value">{{ gameStore.moves }} / {{ currentLevel!.maxMoves }}</span>
          </div>
        </div>
        <div class="victory-actions">
          <button v-if="hasNextLevel" class="btn btn-primary" @click="gameStore.nextLevel()">
            下一关 →
          </button>
          <button class="btn btn-secondary" @click="gameStore.replayLevel()">
            重玩本关
          </button>
          <button class="btn btn-ghost" @click="gameStore.returnToLevelSelect()">
            关卡选择
          </button>
        </div>
      </div>
    </div>
    
    <!-- 关卡失败弹窗 -->
    <div v-if="isLevelMode && gameStore.isGameOver" class="overlay">
      <div class="overlay-card fail-card">
        <div class="fail-icon">😢</div>
        <h2 class="fail-title">挑战失败</h2>
        <p class="fail-desc">
          差一点就成功了！再试试吧
        </p>
        <div class="fail-score">
          <div class="score-row">
            <span>得分</span>
            <span class="score-value">{{ gameStore.score }} / {{ currentLevel!.targetScore }}</span>
          </div>
          <div class="score-row">
            <span>完成度</span>
            <span class="score-value">{{ Math.round(gameStore.progressPercentage) }}%</span>
          </div>
        </div>
        <div class="fail-actions">
          <button class="btn btn-primary" @click="gameStore.replayLevel()">
            重新挑战
          </button>
          <button class="btn btn-ghost" @click="gameStore.returnToLevelSelect()">
            关卡选择
          </button>
        </div>
      </div>
    </div>
    
    <!-- 非关卡模式的游戏结束弹窗 -->
    <div v-if="!isLevelMode && gameStore.isGameOver" class="overlay">
      <div class="overlay-card fail-card">
        <div class="fail-icon">⏰</div>
        <h2 class="fail-title">游戏结束</h2>
        <div class="fail-score">
          <div class="score-row">
            <span>最终得分</span>
            <span class="score-value">{{ gameStore.score }}</span>
          </div>
        </div>
        <div class="fail-actions">
          <button class="btn btn-primary" @click="gameStore.restartGame()">
            再来一局
          </button>
          <button class="btn btn-ghost" @click="gameStore.returnToMenu()">
            返回菜单
          </button>
        </div>
      </div>
    </div>
    
    <!-- 非关卡模式的胜利弹窗 -->
    <div v-if="!isLevelMode && gameStore.isVictory" class="overlay">
      <div class="overlay-card victory-card">
        <div class="victory-icon">🎊</div>
        <h2 class="victory-title">恭喜达标！</h2>
        <div class="fail-score">
          <div class="score-row">
            <span>最终得分</span>
            <span class="score-value">{{ gameStore.score }}</span>
          </div>
        </div>
        <div class="victory-actions">
          <button class="btn btn-primary" @click="gameStore.restartGame()">
            再来一局
          </button>
          <button class="btn btn-ghost" @click="gameStore.returnToMenu()">
            返回菜单
          </button>
        </div>
      </div>
    </div>
    
    <!-- 底部工具栏 -->
    <div class="game-toolbar">
      <button class="toolbar-btn" @click="gameStore.restartGame()">🔄 重新开始</button>
      <button class="toolbar-btn" @click="gameStore.returnToMenu()">🏠 返回菜单</button>
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

.low-moves {
  color: #ff5252 !important;
  animation: lowMovesPulse 0.5s ease-in-out infinite alternate;
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

.progress-fill.progress-complete {
  background: linear-gradient(90deg, #feca57, #ff6b6b);
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: progressShine 2s infinite;
}

.game-grid {
  margin: 20px auto;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 弹窗遮罩 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.overlay-card {
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  min-width: 320px;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: overlayIn 0.3s ease-out;
}

.victory-icon, .fail-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.victory-title {
  font-size: 2rem;
  color: #feca57;
  margin: 0 0 15px;
}

.fail-title {
  font-size: 2rem;
  color: #ff6b6b;
  margin: 0 0 10px;
}

.fail-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin: 0 0 20px;
}

.victory-stars {
  font-size: 2.5rem;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.star {
  opacity: 0.3;
  transition: all 0.3s;
  filter: grayscale(1);
}

.star-earned {
  opacity: 1;
  filter: grayscale(0);
  animation: starPop 0.4s ease-out;
}

.victory-score, .fail-score {
  margin-bottom: 25px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px;
}

.score-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.score-value {
  color: #fff;
  font-weight: 600;
}

.victory-actions, .fail-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: #fff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
}

.btn-ghost:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

/* 底部工具栏 */
.game-toolbar {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.toolbar-btn {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
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
  justify-content: center;
  gap: 25px;
  margin-top: 15px;
  padding: 12px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.hint-icon {
  font-size: 1rem;
}

.shuffle-banner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(45deg, #6c5ce7, #a29bfe);
  color: white;
  padding: 20px 40px;
  border-radius: 20px;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  z-index: 1001;
  box-shadow: 0 10px 30px rgba(108, 92, 231, 0.4);
  animation: shufflePulse 0.6s ease-in-out infinite alternate;
}

.shuffle-text {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* 动画 */
@keyframes comboPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes comboBanner {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  10% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
  20% { transform: translate(-50%, -50%) scale(1); }
  80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes shufflePulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.8; }
}

@keyframes overlayIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes starPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes lowMovesPulse {
  0% { opacity: 1; }
  100% { opacity: 0.5; }
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
  
  .combo-text { font-size: 1.8rem; }
  .combo-multiplier { font-size: 1.5rem; }
  
  .overlay-card {
    min-width: 280px;
    padding: 30px;
    margin: 20px;
  }
  
  .game-toolbar {
    gap: 10px;
  }
  
  .toolbar-btn {
    padding: 8px 16px;
    font-size: 0.85rem;
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
  
  .combo-text { font-size: 1.6rem; }
  .combo-multiplier { font-size: 1.3rem; }
}
</style>
