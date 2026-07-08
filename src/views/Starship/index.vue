<template>
  <div class="starship-container" @click.stop>
    <!-- 深空背景装饰 -->
    <div class="starship-bg">
      <div class="bg-nebula bg-nebula-1"></div>
      <div class="bg-nebula bg-nebula-2"></div>
      <div class="bg-nebula bg-nebula-3"></div>
      <div class="bg-scanline"></div>
    </div>

    <!-- HUD 顶部状态栏 -->
    <div class="hud-header" :class="{ visible: loaded }">
      <div class="hud-left">
        <span class="hud-dot"></span>
        <span class="hud-sys">STARSHIP SYS</span>
      </div>
      <div class="hud-center">
        <h1 class="ship-title">
          <span class="title-glow">星际星舰</span>
        </h1>
        <p class="ship-subtitle">STELLAR CRUISER · SECTOR-7</p>
        <p class="ship-coords">{{ coords }}</p>
      </div>
      <div class="hud-right">
        <span class="hud-time">{{ timeStr }}</span>
        <button class="close-btn" @click="closeStarship" title="返回">
          <span>✕</span>
        </button>
      </div>
    </div>

    <!-- 交互提示 -->
    <Transition name="hint-fade">
      <div class="click-hint" v-if="loaded && !hintDismissed">
        <span class="hint-icon">◎</span>
        <span>拖拽旋转 · 使用右侧面板控制拆解 / 聚合</span>
        <button class="hint-close" @click="hintDismissed = true">×</button>
      </div>
    </Transition>

    <!-- 加载进度 -->
    <Transition name="loader-fade">
      <div class="ship-loader" v-if="!loaded">
        <div class="loader-core">
          <div class="loader-ring loader-ring-1"></div>
          <div class="loader-ring loader-ring-2"></div>
          <div class="loader-icon">📡</div>
        </div>
        <div class="loader-bar-wrap">
          <div class="loader-bar" :style="{ width: loadProgress * 100 + '%' }"></div>
        </div>
        <p class="loader-text">加载星舰数据 · {{ Math.round(loadProgress * 100) }}%</p>
      </div>
    </Transition>

    <!-- Three.js 画布 -->
    <canvas ref="canvasRef" class="starship-canvas"></canvas>

    <!-- 拆解状态角标 -->
    <Transition name="badge-fade">
      <div class="explode-badge" v-if="loaded && shipState.exploded">
        <span class="badge-icon">✦</span>
        <span>已拆解 · SECTOR-∞</span>
      </div>
    </Transition>

    <!-- 驾驶舱面板 -->
    <CockpitPanel
      v-if="loaded"
      :state="shipState"
      @toggleExplode="onToggleExplode"
      @toggleEngine="onToggleEngine"
      @toggleSpotLight="onToggleSpotLight"
      @toggleShield="onToggleShield"
      @toggleAutoRotate="onToggleAutoRotate"
      @lightColor="onLightColor"
      @lightIntensity="onLightIntensity"
      @rotateSpeed="onRotateSpeed"
      @preset="onPreset"
    />

    <!-- 操作 Toast -->
    <Transition name="toast-fade">
      <div class="op-toast" v-if="toastVisible">
        <span class="toast-dot"></span>
        <span>{{ toastMsg }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { mainStore } from '@/store'
import CockpitPanel from '@/components/CockpitPanel.vue'
import StarshipExperience from './scene/StarshipExperience.js'

const store = mainStore()
const canvasRef = ref(null)
let experience = null

const loaded = ref(false)
const loadProgress = ref(0)
const hintDismissed = ref(false)
const toastVisible = ref(false)
const toastMsg = ref('')

// 镜像 Experience 的状态（用于驾驶舱面板响应式绑定）
const shipState = reactive({
  exploded: false,
  shieldOn: false,
  engineOn: true,
  spotLightOn: false,
  autoRotate: true,
  rotateSpeed: 0.3,
  lightColor: '#4ecdc4',
  lightIntensity: 1.5,
  ambientPreset: 'cruise',
})

// HUD 数据
const coords = ref('RA 05h 34m 32s · DEC +22° 00′ 52″')
const timeStr = ref('')
let timeTimer = null
let coordsTimer = null

const updateTime = () => {
  const now = new Date()
  timeStr.value = now.toTimeString().slice(0, 8)
}

const updateCoords = () => {
  const ra = String(Math.floor(Math.random() * 24)).padStart(2, '0')
  const rm = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  const rs = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  const dd = String(Math.floor(Math.random() * 90)).padStart(2, '0')
  const dm = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  const ds = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  const sign = Math.random() > 0.5 ? '+' : '-'
  coords.value = `RA ${ra}h ${rm}m ${rs}s · DEC ${sign}${dd}° ${dm}′ ${ds}″`
}

const showToast = (msg, duration = 2200) => {
  toastMsg.value = msg
  toastVisible.value = true
  setTimeout(() => (toastVisible.value = false), duration)
}

// ─── 面板事件处理 ────────────────────────────────────────────────────────

const onToggleExplode = () => {
  experience?.toggleExplode()
}

const onToggleEngine = () => {
  const next = !shipState.engineOn
  experience?.setEngine(next)
  shipState.engineOn = next
  showToast(`ENGINE: ${next ? 'ONLINE' : 'OFFLINE'}`)
}

const onToggleSpotLight = () => {
  const next = !shipState.spotLightOn
  experience?.setSpotLight(next)
  shipState.spotLightOn = next
  showToast(`SPOTLIGHT: ${next ? 'ON' : 'OFF'}`)
}

const onToggleShield = () => {
  const next = !shipState.shieldOn
  experience?.setShield(next)
  shipState.shieldOn = next
  showToast(`SHIELD: ${next ? 'ACTIVATED' : 'OFFLINE'}`)
}

const onToggleAutoRotate = () => {
  const next = !shipState.autoRotate
  experience?.setAutoRotate(next)
  shipState.autoRotate = next
}

const onLightColor = (v) => {
  experience?.setLightColor(v)
  shipState.lightColor = v
}

const onLightIntensity = (v) => {
  experience?.setLightIntensity(v)
  shipState.lightIntensity = v
}

const onRotateSpeed = (v) => {
  experience?.setRotateSpeed(v)
  shipState.rotateSpeed = v
}

const onPreset = (key) => {
  experience?.setPreset(key)
  shipState.ambientPreset = key
  // 同步预设影响的状态
  const combatCfg = { lightColor: '#ff4444', lightIntensity: 2.2, engineOn: true, shieldOn: true }
  const cruiseCfg = { lightColor: '#4ecdc4', lightIntensity: 1.5, engineOn: true, shieldOn: false }
  const silentCfg = { lightColor: '#334466', lightIntensity: 0.5, engineOn: false, shieldOn: false }
  const cfg = { cruise: cruiseCfg, combat: combatCfg, silent: silentCfg }[key]
  if (cfg) Object.assign(shipState, cfg)
  const labels = { cruise: '巡航模式', combat: '战斗模式', silent: '静默模式' }
  showToast(`PRESET: ${labels[key] || key}`)
}

// ─── 关闭 ────────────────────────────────────────────────────────────────

const closeStarship = () => {
  store.shipOpenState = false
}

const handleKeydown = (e) => {
  if (!store.shipOpenState) return
  if (e.key === 'Escape') closeStarship()
}

// ─── 生命周期 ────────────────────────────────────────────────────────────

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  updateTime()
  updateCoords()
  timeTimer = setInterval(updateTime, 1000)
  coordsTimer = setInterval(updateCoords, 8000)

  if (!canvasRef.value) return

  experience = new StarshipExperience(canvasRef.value)

  experience.onLoadProgress = (p) => {
    loadProgress.value = p
  }

  experience.onLoadComplete = () => {
    loaded.value = true
    loadProgress.value = 1
  }

  // Experience 状态变化同步到 shipState
  experience.onStateChange = (key, value) => {
    if (key in shipState) shipState[key] = value
    if (key === 'exploded') {
      showToast(value ? '星舰已拆解' : '星舰已聚合')
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  clearInterval(timeTimer)
  clearInterval(coordsTimer)
  experience?.destroy()
  experience = null
})
</script>

<style lang="scss" scoped>
.starship-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #000818;
}

// 背景层
.starship-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;

  .bg-nebula {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    animation: nebulaDrift 20s ease-in-out infinite;

    &.bg-nebula-1 {
      width: 50vw;
      height: 50vh;
      top: -10%;
      left: -10%;
      background: radial-gradient(ellipse, rgba(78, 205, 196, 0.07) 0%, transparent 70%);
    }
    &.bg-nebula-2 {
      width: 40vw;
      height: 40vh;
      bottom: -5%;
      right: -8%;
      background: radial-gradient(ellipse, rgba(167, 139, 255, 0.07) 0%, transparent 70%);
      animation-delay: 8s;
    }
    &.bg-nebula-3 {
      width: 30vw;
      height: 30vh;
      top: 40%;
      left: 50%;
      background: radial-gradient(ellipse, rgba(135, 206, 235, 0.04) 0%, transparent 70%);
      animation-delay: 4s;
    }
  }

  .bg-scanline {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(78, 205, 196, 0.012) 2px,
      rgba(78, 205, 196, 0.012) 4px
    );
    pointer-events: none;
  }
}

@keyframes nebulaDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -15px) scale(1.05); }
  66% { transform: translate(-15px, 10px) scale(0.98); }
}

// HUD 顶栏
.hud-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 14px 24px;
  background: linear-gradient(180deg, rgba(0, 8, 24, 0.85) 0%, transparent 100%);
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hud-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'UnidreamLED', monospace;
    font-size: 0.62rem;
    letter-spacing: 1px;
    color: rgba(78, 205, 196, 0.6);
    white-space: nowrap;

    .hud-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ecdc4;
      box-shadow: 0 0 6px #4ecdc4;
      animation: dotPulse 2.5s ease-in-out infinite;
      flex-shrink: 0;
    }
    .hud-sys { flex-shrink: 0; }
  }

  .hud-center {
    text-align: center;
    pointer-events: none;

    .ship-title {
      margin: 0;
      .title-glow {
        font-size: 1.4rem;
        font-weight: 800;
        letter-spacing: 6px;
        background: linear-gradient(135deg, #87ceeb 0%, #4ecdc4 45%, #a78bff 100%);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 5s ease-in-out infinite;
        text-shadow: none;
        filter: drop-shadow(0 0 12px rgba(78, 205, 196, 0.3));
      }
    }

    .ship-subtitle {
      margin: 2px 0 0;
      font-family: 'UnidreamLED', monospace;
      font-size: 0.55rem;
      letter-spacing: 3px;
      color: rgba(135, 206, 235, 0.4);
    }

    .ship-coords {
      margin: 4px 0 0;
      font-family: 'UnidreamLED', monospace;
      font-size: 0.52rem;
      letter-spacing: 1px;
      color: rgba(78, 205, 196, 0.45);
      white-space: nowrap;
    }
  }

  .hud-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 14px;

    .hud-time {
      font-family: 'UnidreamLED', monospace;
      font-size: 0.8rem;
      color: rgba(135, 206, 235, 0.5);
      letter-spacing: 2px;
    }
  }
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(78, 205, 196, 0.18);
    border-color: rgba(78, 205, 196, 0.5);
    color: #fff;
    transform: rotate(90deg) scale(1.08);
    box-shadow: 0 0 12px rgba(78, 205, 196, 0.3);
  }
}

// 交互提示
.click-hint {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: rgba(0, 8, 24, 0.75);
  border: 1px solid rgba(78, 205, 196, 0.25);
  border-radius: 30px;
  font-family: 'UnidreamLED', monospace;
  font-size: 0.7rem;
  letter-spacing: 1px;
  color: rgba(135, 206, 235, 0.75);
  backdrop-filter: blur(10px);
  white-space: nowrap;
  animation: hintFloat 4s ease-in-out infinite;

  .hint-icon { color: #4ecdc4; animation: dotPulse 2s ease-in-out infinite; }

  .hint-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 0 0 0 6px;
    font-size: 0.85rem;
    line-height: 1;
    &:hover { color: rgba(255, 255, 255, 0.8); }
  }
}

@keyframes hintFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-4px); }
}

// 加载器
.ship-loader {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000818;
  gap: 20px;

  .loader-core {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    animation: ringRot 1.5s linear infinite;

    &.loader-ring-1 {
      border-top-color: #4ecdc4;
      border-right-color: rgba(78, 205, 196, 0.2);
    }
    &.loader-ring-2 {
      inset: 10px;
      border-bottom-color: #a78bff;
      border-left-color: rgba(167, 139, 255, 0.2);
      animation-direction: reverse;
      animation-duration: 1.0s;
    }
  }

  .loader-icon {
    font-size: 1.8rem;
    animation: iconFloat 2s ease-in-out infinite;
  }

  .loader-bar-wrap {
    width: 200px;
    height: 3px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    overflow: hidden;
  }

  .loader-bar {
    height: 100%;
    background: linear-gradient(90deg, #4ecdc4, #a78bff);
    border-radius: 3px;
    transition: width 0.3s ease;
    box-shadow: 0 0 8px rgba(78, 205, 196, 0.6);
  }

  .loader-text {
    font-family: 'UnidreamLED', monospace;
    font-size: 0.7rem;
    letter-spacing: 2px;
    color: rgba(135, 206, 235, 0.55);
  }
}

@keyframes ringRot {
  to { transform: rotate(360deg); }
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

// 主画布
.starship-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: block;
  cursor: grab;

  &:active { cursor: grabbing; }
}

// 拆解角标
.explode-badge {
  position: absolute;
  top: 80px;
  left: 24px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(167, 139, 255, 0.15);
  border: 1px solid rgba(167, 139, 255, 0.35);
  border-radius: 20px;
  font-family: 'UnidreamLED', monospace;
  font-size: 0.62rem;
  letter-spacing: 1px;
  color: rgba(167, 139, 255, 0.9);
  backdrop-filter: blur(8px);
  animation: badgePulse 2s ease-in-out infinite;

  .badge-icon { animation: dotPulse 1.5s ease-in-out infinite; }
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 8px rgba(167, 139, 255, 0.2); }
  50% { box-shadow: 0 0 16px rgba(167, 139, 255, 0.4); }
}

// Toast
.op-toast {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(0, 8, 24, 0.85);
  border: 1px solid rgba(78, 205, 196, 0.35);
  border-radius: 30px;
  font-family: 'UnidreamLED', monospace;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  color: rgba(135, 206, 235, 0.9);
  backdrop-filter: blur(10px);
  white-space: nowrap;

  .toast-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ecdc4;
    box-shadow: 0 0 6px #4ecdc4;
    flex-shrink: 0;
  }
}

// 通用关键帧
@keyframes dotPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.35); }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

// Transitions
.hint-fade-enter-active, .hint-fade-leave-active { transition: all 0.5s ease; }
.hint-fade-enter-from, .hint-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }

.loader-fade-enter-active { transition: opacity 0.3s ease; }
.loader-fade-leave-active { transition: opacity 0.6s ease 0.3s; }
.loader-fade-enter-from, .loader-fade-leave-to { opacity: 0; }

.badge-fade-enter-active, .badge-fade-leave-active { transition: all 0.4s ease; }
.badge-fade-enter-from { opacity: 0; transform: translateX(-10px); }
.badge-fade-leave-to { opacity: 0; transform: translateX(-10px); }

.toast-fade-enter-active { transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
.toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-6px); }

// 响应式
@media (max-width: 768px) {
  .hud-header {
    padding: 10px 16px;

    .hud-left .hud-coords { display: none; }
    .hud-center .ship-title .title-glow { font-size: 1.1rem; letter-spacing: 3px; }
    .hud-center .ship-subtitle { font-size: 0.45rem; }
    .hud-right .hud-time { display: none; }
  }

  .click-hint { font-size: 0.62rem; bottom: 24px; }
  .explode-badge { top: 68px; left: 14px; }
}
</style>
