<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { GameMode } from '../types/mahjong'
import { LEVELS } from '../types/levels'

const gameStore = useGameStore()
const showLevelSelect = ref(false)

const startGame = (mode: GameMode = GameMode.STEPS) => {
  gameStore.setGameMode(mode)
  gameStore.initializeGame()
}

const gameModes = [
  { id: GameMode.STEPS, name: '限步模式', desc: '有限步数内获得最高分', icon: '👣' },
  { id: GameMode.TIME, name: '限时模式', desc: '有限时间内获得最高分', icon: '⏱️' },
  { id: GameMode.ENDLESS, name: '无尽模式', desc: '无限时间，挑战最高分', icon: '∞' },
]

const levelProgress = computed(() => gameStore.levelProgress)

const getStarsText = (levelId: number) => {
  const stars = levelProgress.value.stars[levelId] || 0
  return '⭐'.repeat(stars) + '☆'.repeat(3 - stars)
}

const isLevelUnlocked = (levelId: number) => {
  return levelId <= levelProgress.value.maxUnlockedLevel
}
</script>

<template>
  <div class="game-menu">
    <div class="menu-header">
      <h1>🀄 麻将消消乐</h1>
      <p class="menu-subtitle">中国传统益智游戏 · 现代消除玩法</p>
    </div>

    <!-- 关卡选择界面 -->
    <div v-if="showLevelSelect" class="level-select">
      <div class="level-select-header">
        <button class="back-btn" @click="showLevelSelect = false">← 返回</button>
        <h2>🗺️ 闯关模式</h2>
        <div class="level-progress-text">
          已通关 {{ Object.keys(levelProgress.stars).length }}/{{ LEVELS.length }}
        </div>
      </div>
      
      <div class="level-grid">
        <div
          v-for="level in LEVELS"
          :key="level.id"
          class="level-card"
          :class="{ locked: !isLevelUnlocked(level.id) }"
          @click="isLevelUnlocked(level.id) && gameStore.startLevel(level.id)"
        >
          <div class="level-card-header">
            <span class="level-number">{{ level.id }}</span>
            <span class="level-stars">{{ isLevelUnlocked(level.id) ? getStarsText(level.id) : '🔒' }}</span>
          </div>
          <h3 class="level-name">{{ level.name }}</h3>
          <p class="level-desc">{{ level.description }}</p>
          <div class="level-meta">
            <span class="level-theme">{{ level.theme }}</span>
            <span class="level-size">{{ level.gridSize }}×{{ level.gridSize }}</span>
          </div>
          <div class="level-targets">
            <span class="target-item">🎯 {{ level.targetScore }}分</span>
            <span class="target-item">👣 {{ level.maxMoves }}步</span>
          </div>
          <div v-if="levelProgress.bestScores[level.id]" class="level-best">
            最高: {{ levelProgress.bestScores[level.id] }}分
          </div>
        </div>
      </div>
    </div>

    <!-- 主菜单 -->
    <div v-else>
      <div class="mode-selection">
        <!-- 闯关模式 - 重点突出 -->
        <div class="level-mode-card" @click="showLevelSelect = true">
          <div class="level-mode-banner">
            <span class="level-mode-icon">🗺️</span>
            <div class="level-mode-info">
              <h2>闯关模式</h2>
              <p>10个精心设计的关卡，从入门到大师</p>
            </div>
            <span class="level-mode-arrow">→</span>
          </div>
          <div class="level-mode-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: (Object.keys(levelProgress.stars).length / LEVELS.length * 100) + '%' }"
              ></div>
            </div>
            <span class="progress-text">进度 {{ Object.keys(levelProgress.stars).length }}/{{ LEVELS.length }}</span>
          </div>
        </div>

        <h2 class="mode-title">自由模式</h2>
        <div class="mode-cards">
          <div
            v-for="mode in gameModes"
            :key="mode.id"
            class="mode-card"
            @click="startGame(mode.id)"
          >
            <div class="mode-icon">{{ mode.icon }}</div>
            <h3 class="mode-name">{{ mode.name }}</h3>
            <p class="mode-desc">{{ mode.desc }}</p>
            <div class="mode-action">
              <button class="start-btn">开始游戏</button>
            </div>
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
        <a href="#" class="leaderboard-btn" @click.prevent>🏆 排行榜</a>
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

/* 闯关模式卡片 */
.level-mode-card {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(254, 202, 87, 0.2));
  border-radius: 16px;
  padding: 20px 25px;
  margin-bottom: 30px;
  border: 2px solid rgba(255, 107, 107, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.level-mode-card:hover {
  transform: translateY(-3px);
  border-color: #ff6b6b;
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.2);
}

.level-mode-banner {
  display: flex;
  align-items: center;
  gap: 15px;
}

.level-mode-icon {
  font-size: 2.5rem;
}

.level-mode-info {
  flex: 1;
  text-align: left;
}

.level-mode-info h2 {
  font-size: 1.4rem;
  margin: 0;
  color: #fff;
}

.level-mode-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 4px 0 0;
}

.level-mode-arrow {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s;
}

.level-mode-card:hover .level-mode-arrow {
  transform: translateX(5px);
  color: #ff6b6b;
}

.level-mode-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #feca57);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  white-space: nowrap;
}

/* 关卡选择 */
.level-select-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
}

.level-select-header h2 {
  font-size: 1.6rem;
  color: #fff;
  margin: 0;
}

.level-progress-text {
  color: #feca57;
  font-size: 0.95rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.level-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.level-card:not(.locked):hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.12);
  border-color: #feca57;
  box-shadow: 0 8px 20px rgba(254, 202, 87, 0.15);
}

.level-card.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

.level-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.level-number {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.level-stars {
  font-size: 0.85rem;
  letter-spacing: 2px;
}

.level-name {
  font-size: 1.15rem;
  margin: 5px 0;
  color: #fff;
}

.level-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin: 0 0 8px;
}

.level-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.level-theme {
  color: #feca57;
  font-size: 0.8rem;
}

.level-size {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.level-targets {
  display: flex;
  gap: 10px;
}

.target-item {
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.level-best {
  margin-top: 8px;
  color: #6bff6b;
  font-size: 0.8rem;
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
  
  .level-grid {
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
