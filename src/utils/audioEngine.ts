import { SoundType } from '../types/mahjong'

// Web Audio API音效生成器
export class AudioEngine {
  private audioContext: AudioContext | null = null
  private isInitialized = false
  private isMuted = false
  private volume = 0.5
  
  constructor() {
    this.init()
  }
  
  // 初始化音频上下文
  private init() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.isInitialized = true
    } catch (error) {
      console.error('音频上下文初始化失败:', error)
      this.isInitialized = false
    }
  }
  
  // 播放音效
  play(soundType: SoundType) {
    if (!this.isInitialized || !this.audioContext || this.isMuted) {
      return
    }
    
    try {
      switch (soundType) {
        case SoundType.CLICK:
          this.playClickSound()
          break
        case SoundType.SWAP:
          this.playSwapSound()
          break
        case SoundType.MATCH:
          this.playMatchSound()
          break
        case SoundType.STRAIGHT:
          this.playStraightSound()
          break
        case SoundType.TRIPLE:
          this.playTripleSound()
          break
        case SoundType.FOUR:
          this.playFourSound()
          break
        case SoundType.COMBO:
          this.playComboSound()
          break
        case SoundType.VICTORY:
          this.playVictorySound()
          break
        case SoundType.GAME_OVER:
          this.playGameOverSound()
          break
        case SoundType.HINT:
          this.playHintSound()
          break
        case SoundType.SELECT:
          this.playSelectSound()
          break
        case SoundType.DESELECT:
          this.playDeselectSound()
          break
        case SoundType.SHUFFLE:
          this.playShuffleSound()
          break
        case SoundType.COUNTDOWN:
          this.playCountdownSound()
          break
        default:
          this.playDefaultSound()
      }
    } catch (error) {
      console.error('播放音效失败:', error)
    }
  }
  
  // 生成基础音调
  private generateTone(
    frequency: number,
    duration: number = 0.1,
    type: OscillatorType = 'sine',
    volume: number = this.volume
  ) {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.value = frequency
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }
  
  // 生成和弦音效
  private generateChord(frequencies: number[], duration: number = 0.2) {
    if (!this.audioContext) return
    
    for (const freq of frequencies) {
      this.generateTone(freq, duration, 'sine', this.volume * 0.7)
    }
  }
  
  // 生成噪声音效
  private generateNoise(duration: number = 0.1, volume: number = this.volume * 0.3) {
    if (!this.audioContext) return
    
    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const output = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }
    
    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    
    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = volume
    
    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    source.start()
    source.stop(this.audioContext.currentTime + duration)
  }
  
  // 具体音效实现
  private playClickSound() {
    this.generateTone(800, 0.05, 'sine')
  }
  
  private playSwapSound() {
    this.generateTone(600, 0.08, 'sine')
    setTimeout(() => {
      this.generateTone(800, 0.08, 'sine')
    }, 30)
  }
  
  private playMatchSound() {
    this.generateChord([400, 600, 800], 0.15)
  }
  
  private playStraightSound() {
    const notes = [261.63, 329.63, 392.00] // C4, E4, G4 (C大三和弦)
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        this.generateTone(notes[i], 0.1, 'sine')
      }, i * 50)
    }
  }
  
  private playTripleSound() {
    this.generateChord([300, 500, 700], 0.2)
  }
  
  private playFourSound() {
    this.generateChord([200, 400, 600, 800], 0.25)
  }
  
  private playComboSound() {
    const frequencies = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    for (let i = 0; i < frequencies.length; i++) {
      setTimeout(() => {
        this.generateTone(frequencies[i], 0.08, 'sine', this.volume * 0.8)
      }, i * 30)
    }
  }
  
  private playVictorySound() {
    // 胜利音效：上升音阶
    const victoryScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]
    for (let i = 0; i < victoryScale.length; i++) {
      setTimeout(() => {
        this.generateTone(victoryScale[i], 0.1, 'sine', this.volume * 0.7)
      }, i * 80)
    }
    
    // 最后加一个高音
    setTimeout(() => {
      this.generateTone(1046.50, 0.3, 'sine', this.volume)
    }, victoryScale.length * 80)
  }
  
  private playGameOverSound() {
    // 游戏结束音效：下降音阶
    const gameOverScale = [523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63]
    for (let i = 0; i < gameOverScale.length; i++) {
      setTimeout(() => {
        this.generateTone(gameOverScale[i], 0.1, 'sine', this.volume * 0.7)
      }, i * 100)
    }
    
    // 最后加一个低音
    setTimeout(() => {
      this.generateTone(130.81, 0.4, 'sine', this.volume * 0.8)
    }, gameOverScale.length * 100)
  }
  
  private playHintSound() {
    this.generateTone(1000, 0.2, 'sine', this.volume * 0.4)
    setTimeout(() => {
      this.generateTone(1200, 0.2, 'sine', this.volume * 0.4)
    }, 200)
  }
  
  private playSelectSound() {
    this.generateTone(600, 0.1, 'sine')
    setTimeout(() => {
      this.generateTone(800, 0.1, 'sine')
    }, 50)
  }
  
  private playDeselectSound() {
    this.generateTone(800, 0.1, 'sine')
    setTimeout(() => {
      this.generateTone(600, 0.1, 'sine')
    }, 50)
  }
  
  private playShuffleSound() {
    // 洗牌音效：快速连续点击声
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.generateNoise(0.03, this.volume * 0.2)
      }, i * 50)
    }
  }
  
  private playCountdownSound() {
    this.generateTone(1000, 0.1, 'sine')
  }
  
  private playDefaultSound() {
    this.generateTone(440, 0.1, 'sine')
  }
  
  // 控制方法
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }
  
  mute() {
    this.isMuted = true
  }
  
  unmute() {
    this.isMuted = false
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted
  }
  
  stopAll() {
    // 停止所有音效
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
      this.init() // 重新初始化
    }
  }
  
  // 检查浏览器是否支持Web Audio API
  static isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext)
  }
  
  // 获取音量
  getVolume(): number {
    return this.volume
  }
  
  // 检查是否静音
  isMutedState(): boolean {
    return this.isMuted
  }
  
  // 检查是否已初始化
  isReady(): boolean {
    return this.isInitialized
  }
}

// 创建音频引擎实例
export const createAudioEngine = (): AudioEngine => {
  return new AudioEngine()
}

// 全局音频引擎实例
let globalAudioEngine: AudioEngine | null = null

// 获取全局音频引擎
export const getAudioEngine = (): AudioEngine => {
  if (!globalAudioEngine) {
    globalAudioEngine = createAudioEngine()
  }
  return globalAudioEngine
}

// 预加载音效（实际是预初始化）
export const preloadAudio = (): void => {
  if (!globalAudioEngine) {
    globalAudioEngine = createAudioEngine()
  }
}

// 音频工具函数
export const audioUtils = {
  // 生成音阶
  generateScale(startNote: string = 'C4', steps: number = 8): number[] {
    const noteFrequencies: Record<string, number> = {
      'C4': 261.63,
      'C#4': 277.18,
      'D4': 293.66,
      'D#4': 311.13,
      'E4': 329.63,
      'F4': 349.23,
      'F#4': 369.99,
      'G4': 392.00,
      'G#4': 415.30,
      'A4': 440.00,
      'A#4': 466.16,
      'B4': 493.88,
      'C5': 523.25,
      'C#5': 554.37,
      'D5': 587.33,
      'D#5': 622.25,
      'E5': 659.25,
      'F5': 698.46,
      'F#5': 739.99,
      'G5': 783.99,
      'G#5': 830.61,
      'A5': 880.00,
      'A#5': 932.33,
      'B5': 987.77,
      'C6': 1046.50
    }
    
    const frequencies: number[] = []
    const notes = Object.keys(noteFrequencies)
    const startIndex = notes.indexOf(startNote)
    
    if (startIndex === -1) {
      return frequencies
    }
    
    for (let i = 0; i < steps; i++) {
      const noteIndex = startIndex + i
      if (noteIndex < notes.length) {
        frequencies.push(noteFrequencies[notes[noteIndex]])
      }
    }
    
    return frequencies
  },
  
  // 生成和弦
  generateChord(rootNote: string = 'C4', chordType: string = 'major'): number[] {
    const noteFrequencies: Record<string, number> = {
      'C4': 261.63,
      'E4': 329.63,
      'G4': 392.00
    }
    
    switch (chordType.toLowerCase()) {
      case 'major':
        return [noteFrequencies['C4'], noteFrequencies['E4'], noteFrequencies['G4']]
      case 'minor':
        return [noteFrequencies['C4'], noteFrequencies['D#4'] || 311.13, noteFrequencies['G4']]
      case 'seventh':
        return [noteFrequencies['C4'], noteFrequencies['E4'], noteFrequencies['G4'], noteFrequencies['A#4'] || 466.16]
      default:
        return [noteFrequencies['C4'], noteFrequencies['E4'], noteFrequencies['G4']]
    }
  },
  
  // 计算频率
  calculateFrequency(note: string, octave: number): number {
    const A4 = 440.0
    const noteIndex: Record<string, number> = {
      'C': -9, 'C#': -8, 'D': -7, 'D#': -6,
      'E': -5, 'F': -4, 'F#': -3, 'G': -2,
      'G#': -1, 'A': 0, 'A#': 1, 'B': 2
    }
    
    const semitones = (octave - 4) * 12 + (noteIndex[note] || 0)
    return A4 * Math.pow(2, semitones / 12)
  }
}