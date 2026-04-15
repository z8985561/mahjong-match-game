<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
import { GameMode } from '../types/mahjong'

const gameStore = useGameStore()

const startGame = (mode: GameMode = GameMode.STEPS) => {
  gameStore.setGameMode(mode)
  gameStore.initializeGame()
}

const gameModes = [
  { id: GameMode.STEPS, name: '限步模式', desc: '有限步数内获得最高分' },
  { id: GameMode.TIME, name: '限时模式', desc: '有限时间内获得最高分' },
  { id: GameMode.ENDLESS, name: '无尽模式', desc: '无限时间，挑战最高分' },
]
</script>

<template>
  <div class="game-menu">
    <div class="menu-header">
      <h1>🀄 麻将消消乐</h1>
      <p class="menu-subtitle">中国传统益智游戏 · 现代消除玩法</p>
    </div>

    <div class="mode-selection">
      <h2 class="mode-title">选择游戏模式</h2>
      <div class="mode-cards">
        <div
          v-for="mode in gameModes"
          :key="mode.id"
          class="mode-card"
          @click="startGame(mode.id)"
        >
          <div class="mode-icon">
            <span v-if="mode.id === GameMode.STEPS">👣</span>
            <span v-else-if="mode.id === GameMode.TIME">⏱️</span>
            <span v-else>∞</span>
          </div>
          <h3 class="mode-name">{{ mode.name }}</h3>
          <p class="mode-desc">{{ mode.desc }}</p>
          <div class="mode-action">
            <button class="start-btn">开始游戏</button>
          </div>
        </div>
      </div>
    </div>

    <div class="menu-footer">
      <div class="game-settings">
        <div class="setting-item">
          <label class="setting-label">
            <input
              type="checkbox"
              v-model="gameStore.settings.soundEnabled"
              @change="gameStore.toggleSound"
            />
            <span class="setting-text">音效</span>
          </label>
        </div>
        <div class="setting-item">
          <label class="setting-label">
            <input
              type="checkbox"
              v-model="gameStore.settings.allowHints"
              @change="gameStore.toggleHints"
            />
            <span class="setting-text">提示</span>
          </label>
        </div>
      </div>

      <div class="leaderboard-link">
        <a href="#" class="leaderboard-btn">🏆 排行榜</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-menu {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.menu-header {
  margin-bottom: 40px;
}

.menu-header h1 {
  font-size: 4rem;
  margin: 0;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.menu-subtitle {
  color: #a8dadc;
  font-size: 1.3rem;
  margin-top: 10px;
}

.mode-selection {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mode-title {
  font-size: 1.8rem;
  margin-bottom: 25px;
  color: #fff;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.mode-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.mode-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.12);
  border-color: #ff6b6b;
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.2);
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  display: block;
}

.mode-name {
  font-size: 1.5rem;
  margin: 10px 0;
  color: #fff;
}

.mode-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.4;
}

.start-btn {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}

.menu-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.game-settings {
  display: flex;
  gap: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
}

.setting-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.setting-text {
  font-size: 0.95rem;
}

.leaderboard-link {
  display: flex;
  align-items: center;
}

.leaderboard-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.leaderboard-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-menu {
    padding: 20px 15px;
  }
  
  .menu-header h1 {
    font-size: 2.5rem;
  }
  
  .menu-subtitle {
    font-size: 1.1rem;
  }
  
  .mode-cards {
    grid-template-columns: 1fr;
  }
  
  .menu-footer {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .game-settings {
    justify-content: center;
  }
}
</style>