<script setup lang="ts">
import { computed } from 'vue'
import { GameTile, GAME_CONFIG } from '../types/mahjong'

const props = defineProps<{
  tile: GameTile
  isSelected: boolean
}>()

const emit = defineEmits<{
  click: [tile: GameTile]
  touchStart: [tile: GameTile, event: TouchEvent]
  touchMove: [event: TouchEvent]
  touchEnd: [tile: GameTile, event: TouchEvent]
}>()

// 计算样式
const tileStyle = computed(() => {
  const style: Record<string, any> = {
    width: `${GAME_CONFIG.VISUAL.TILE_SIZE}px`,
    height: `${GAME_CONFIG.VISUAL.TILE_SIZE}px`,
    margin: `${GAME_CONFIG.VISUAL.TILE_SPACING / 2}px`
  }
  
  // 如果牌已匹配，添加透明度
  if (props.tile.isMatched) {
    style.opacity = 0.3
    style.pointerEvents = 'none'
  }
  
  return style
})

const tileClass = computed(() => {
  const classes = ['mahjong-tile']
  
  if (props.tile.isSelected) {
    classes.push('selected')
  }
  
  if (props.tile.isMatched) {
    classes.push('matched')
  }
  
  if (props.tile.isRemovable) {
    classes.push('removable')
  }
  
  // 添加花色类
  classes.push(`suit-${props.tile.suit}`)
  
  return classes.join(' ')
})

// 背景颜色基于花色
const backgroundColor = computed(() => {
  const colors: Record<string, string> = {
    wan: 'rgba(198, 40, 40, 0.9)',
    tiao: 'rgba(46, 125, 50, 0.9)',
    tong: 'rgba(21, 101, 192, 0.9)'
  }
  
  return colors[props.tile.suit] || 'rgba(255, 255, 255, 0.9)'
})

// 处理点击事件
const handleClick = () => {
  if (!props.tile.isMatched) {
    emit('click', props.tile)
  }
}

// 处理触摸事件（移动端支持）
const handleTouchStart = (event: TouchEvent) => {
  if (!props.tile.isMatched) {
    emit('touchStart', props.tile, event)
  }
}

const handleTouchMove = (event: TouchEvent) => {
  emit('touchMove', event)
}

const handleTouchEnd = (event: TouchEvent) => {
  if (!props.tile.isMatched) {
    emit('touchEnd', props.tile, event)
  }
}
</script>

<template>
  <div
    :class="tileClass"
    :style="tileStyle"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <div class="tile-content">
      <!-- 如果使用图片 -->
      <div v-if="tile.imageUrl" class="tile-image">
        <img 
          :src="tile.imageUrl" 
          :alt="tile.name"
          :title="tile.name"
        />
      </div>
      
      <!-- 否则使用Unicode字符和文字 -->
      <div v-else class="tile-symbol">
        <div class="tile-unicode" v-if="tile.unicode">
          {{ tile.unicode }}
        </div>
        <div class="tile-name">
          {{ tile.name }}
        </div>
      </div>
    </div>
    
    <!-- 选中状态指示器 -->
    <div v-if="isSelected" class="selection-indicator"></div>
    
    <!-- 匹配状态指示器 -->
    <div v-if="tile.isMatched" class="match-indicator"></div>
  </div>
</template>

<style scoped>
.mahjong-tile {
  position: relative;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95));
  border-radius: 12px;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.5);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid transparent;
}

.mahjong-tile:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.25),
    0 3px 6px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);
}

.mahjong-tile.selected {
  border-color: #ffeb3b;
  box-shadow: 
    0 0 0 3px rgba(255, 235, 59, 0.3),
    0 6px 12px rgba(0, 0, 0, 0.25);
  animation: pulse 1.5s infinite;
}

.mahjong-tile.matched {
  opacity: 0.5;
  transform: scale(0.95);
  pointer-events: none;
}

.mahjong-tile.removable {
  animation: removeAnimation 0.5s ease-out forwards;
}

.tile-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tile-image {
  width: 100%;
  height: 100%;
}

.tile-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.tile-symbol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  padding: 8px;
}

.tile-unicode {
  font-size: 2.5rem;
  line-height: 1;
  margin-bottom: 4px;
}

.tile-name {
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  color: #333;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

/* 花色特定背景 */
.suit-wan {
  background: linear-gradient(145deg, #fef0f0, #fde0e0) !important;
  border: 2px solid rgba(198, 40, 40, 0.2);
}

.suit-tiao {
  background: linear-gradient(145deg, #edf7ee, #dff0e0) !important;
  border: 2px solid rgba(46, 125, 50, 0.2);
}

.suit-tong {
  background: linear-gradient(145deg, #fff5eb, #ffecd5) !important;
  border: 2px solid rgba(230, 126, 34, 0.2);
}

/* 花色特定文字颜色 */
.suit-wan .tile-name {
  color: #c62828;
  font-weight: 700;
}

.suit-tiao .tile-name {
  color: #2e7d32;
  font-weight: 700;
}

.suit-tong .tile-name {
  color: #d35400;
  font-weight: 700;
}

/* 指示器 */
.selection-indicator {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid #ffeb3b;
  border-radius: 16px;
  pointer-events: none;
  animation: borderPulse 1.5s infinite;
}

.match-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  pointer-events: none;
  animation: fadeOut 0.5s ease-out forwards;
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    box-shadow: 
      0 0 0 3px rgba(255, 235, 59, 0.3),
      0 6px 12px rgba(0, 0, 0, 0.25);
  }
  50% {
    box-shadow: 
      0 0 0 6px rgba(255, 235, 59, 0.2),
      0 6px 12px rgba(0, 0, 0, 0.25);
  }
}

@keyframes borderPulse {
  0%, 100% {
    border-width: 2px;
    opacity: 1;
  }
  50% {
    border-width: 4px;
    opacity: 0.7;
  }
}

@keyframes removeAnimation {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes fadeOut {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tile-unicode {
    font-size: 2rem;
  }
  
  .tile-name {
    font-size: 0.8rem;
  }
  
  .mahjong-tile {
    border-radius: 10px;
  }
}

@media (max-width: 480px) {
  .tile-unicode {
    font-size: 1.8rem;
  }
  
  .tile-name {
    font-size: 0.75rem;
  }
  
  .mahjong-tile {
    border-radius: 8px;
  }
}
</style>