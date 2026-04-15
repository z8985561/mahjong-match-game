<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import { GameState } from './types/mahjong'
import GameMenu from './components/GameMenu.vue'
import GameGrid from './components/GameGrid.vue'

const gameStore = useGameStore()

onMounted(() => {
  console.log('🀄 麻将消消乐游戏启动')
  console.log('当前游戏状态:', gameStore.state)
  console.log('GameState枚举值:', GameState)
})

// 根据游戏状态显示不同的组件
const currentComponent = computed(() => {
  console.log('当前游戏状态值:', gameStore.state)
  console.log('GameState.MENU值:', GameState.MENU)
  
  if (gameStore.state === GameState.MENU) {
    console.log('显示GameMenu组件')
    return GameMenu
  } else {
    console.log('显示GameGrid组件')
    return GameGrid
  }
})
</script>

<template>
  <div id="app">
    <header class="game-header">
      <h1>🀄 麻将消消乐</h1>
      <p class="subtitle">中国传统益智游戏 - 现代消除玩法</p>
    </header>
    
    <main class="game-container">
      <!-- 调试信息 -->
      <div v-if="false" style="color: red; padding: 10px; background: rgba(255,0,0,0.1);">
        调试信息: state={{ gameStore.state }}, GameState.MENU={{ GameState.MENU }}
      </div>
      
      <!-- 游戏菜单 -->
      <GameMenu v-if="gameStore.state === GameState.MENU" />
      
      <!-- 游戏网格（其他状态） -->
      <GameGrid v-else />
    </main>
    
    <footer class="game-footer">
      <p>© 2026 麻将消消乐游戏 | 基于 Vue 3 + TypeScript 开发</p>
    </footer>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  font-family: 'Arial', sans-serif;
}

.game-header {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #ff6b6b;
}

.game-header h1 {
  font-size: 3rem;
  margin: 0;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
}

.subtitle {
  color: #a8dadc;
  font-size: 1.2rem;
  margin-top: 0.5rem;
}

.game-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.game-footer {
  text-align: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
}

@media (max-width: 768px) {
  .game-header h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .game-container {
    padding: 1rem;
  }
}
</style>