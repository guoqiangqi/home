<template>
  <div class="cockpit-panel" :class="{ collapsed: !expanded }">
    <!-- 折叠按钮 -->
    <button class="panel-toggle" @click="expanded = !expanded">
      <span class="toggle-icon">{{ expanded ? '▼' : '▲' }}</span>
      <span class="toggle-label">{{ expanded ? 'CLOSE' : 'COCKPIT' }}</span>
    </button>

    <div class="panel-body" v-show="expanded">
      <!-- 标题栏 -->
      <div class="panel-header">
        <span class="hdr-dot"></span>
        <span class="hdr-title">STARSHIP · CONTROL</span>
        <span class="hdr-status" :class="statusCls">{{ statusText }}</span>
      </div>

      <!-- 实时状态指示灯 -->
      <div class="status-grid">
        <div class="sg-item" :class="{ on: props.state.engineOn }">
          <div class="sg-led"></div>
          <span>ENGINE</span>
        </div>
        <div class="sg-item" :class="{ on: props.state.shieldOn }">
          <div class="sg-led"></div>
          <span>SHIELD</span>
        </div>
        <div class="sg-item" :class="{ on: props.state.spotLightOn }">
          <div class="sg-led"></div>
          <span>BEAM</span>
        </div>
        <div class="sg-item" :class="{ on: props.state.exploded }">
          <div class="sg-led"></div>
          <span>SECTOR</span>
        </div>
      </div>

      <!-- 主操作：拆解 / 聚合 -->
      <button class="explode-btn" :class="{ on: props.state.exploded }" @click="emit('toggleExplode')">
        <span class="eb-bar"></span>
        <span class="eb-icon">{{ props.state.exploded ? '⊕' : '⊞' }}</span>
        <span class="eb-text">{{ props.state.exploded ? 'ASSEMBLE' : 'EXPLODE' }}</span>
        <span class="eb-ripple" :class="{ active: rippleActive }"></span>
      </button>

      <!-- 开关组 -->
      <div class="switch-group">
        <div class="sw-row" @click="emit('toggleEngine')">
          <div class="sw-info">
            <span class="sw-code">SYS-01</span>
            <span class="sw-name">引擎尾焰</span>
          </div>
          <div class="sci-switch" :class="{ on: props.state.engineOn }">
            <div class="sw-thumb"></div>
          </div>
        </div>
        <div class="sw-row" @click="emit('toggleSpotLight')">
          <div class="sw-info">
            <span class="sw-code">SYS-02</span>
            <span class="sw-name">前置射灯</span>
          </div>
          <div class="sci-switch" :class="{ on: props.state.spotLightOn }">
            <div class="sw-thumb"></div>
          </div>
        </div>
        <div class="sw-row" @click="emit('toggleShield')">
          <div class="sw-info">
            <span class="sw-code">SYS-03</span>
            <span class="sw-name">护盾激活</span>
          </div>
          <div class="sci-switch" :class="{ on: props.state.shieldOn }">
            <div class="sw-thumb"></div>
          </div>
        </div>
        <div class="sw-row" @click="emit('toggleAutoRotate')">
          <div class="sw-info">
            <span class="sw-code">SYS-04</span>
            <span class="sw-name">自动旋转</span>
          </div>
          <div class="sci-switch" :class="{ on: props.state.autoRotate }">
            <div class="sw-thumb"></div>
          </div>
        </div>
      </div>

      <!-- 旋转速度 -->
      <div class="param-row">
        <span class="pr-label">ROT <span class="pr-unit">SPEED</span></span>
        <div class="pr-slider-wrap">
          <input type="range" class="sci-slider"
            min="0" max="2" step="0.05"
            :value="props.state.rotateSpeed"
            @input="emit('rotateSpeed', parseFloat($event.target.value))"
          />
        </div>
        <span class="pr-val">{{ props.state.rotateSpeed.toFixed(2) }}</span>
      </div>

      <!-- 底部签名 -->
      <div class="panel-footer">
        <span class="scan-line"></span>
        <span class="ft-text">SECTOR-∞ · NX-∇74</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  state: { type: Object, required: true },
})

const emit = defineEmits([
  'toggleExplode', 'toggleEngine', 'toggleSpotLight',
  'toggleShield', 'toggleAutoRotate', 'rotateSpeed',
  'lightColor', 'lightIntensity', 'preset',
])

const expanded = ref(true)
const rippleActive = ref(false)

const statusText = computed(() => {
  if (props.state.shieldOn) return 'SHIELD ACTIVE'
  if (props.state.exploded) return 'SECTOR OPEN'
  if (!props.state.engineOn) return 'ENGINE OFF'
  return 'ALL SYSTEMS GO'
})

const statusCls = computed(() => {
  if (props.state.shieldOn) return 'st-shield'
  if (props.state.exploded) return 'st-explode'
  if (!props.state.engineOn) return 'st-warn'
  return 'st-ok'
})

watch(() => props.state.exploded, () => {
  rippleActive.value = true
  setTimeout(() => (rippleActive.value = false), 700)
})
</script>

<style lang="scss" scoped>
$c: #4ecdc4;       // 主青
$b: #7eb8ff;       // 蓝白
$p: #a78bff;       // 紫
$warn: #ffaa44;    // 橙

.cockpit-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 200;
  width: 240px;
  font-family: 'UnidreamLED', monospace;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  &.collapsed { width: auto; }
}

// 折叠按钮
.panel-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  width: 100%;
  justify-content: center;
  background: rgba(0, 6, 20, 0.82);
  border: 1px solid rgba($c, 0.3);
  border-radius: 8px;
  color: rgba($c, 0.85);
  font-family: inherit;
  font-size: 0.68rem;
  letter-spacing: 2px;
  cursor: pointer;
  backdrop-filter: blur(12px);
  margin-bottom: 6px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba($c, 0.6);
    box-shadow: 0 0 14px rgba($c, 0.18);
    color: $c;
  }

  .toggle-icon { font-size: 0.7rem; opacity: 0.7; }
}

// 面板主体
.panel-body {
  background: rgba(0, 5, 18, 0.92);
  border: 1px solid rgba($c, 0.22);
  border-top: 1px solid rgba($c, 0.5);
  border-radius: 12px;
  padding: 12px;
  backdrop-filter: blur(24px);
  box-shadow:
    0 0 0 1px rgba($c, 0.05),
    0 12px 40px rgba(0, 0, 30, 0.8),
    inset 0 1px 0 rgba($c, 0.1);
  animation: panelIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes panelIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}

// 标题栏
.panel-header {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba($c, 0.1);

  .hdr-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: $c;
    box-shadow: 0 0 8px $c, 0 0 20px rgba($c, 0.5);
    flex-shrink: 0;
    animation: dot-pulse 2s ease-in-out infinite;
  }
  .hdr-title {
    flex: 1;
    font-size: 0.58rem;
    letter-spacing: 2px;
    color: rgba($b, 0.65);
  }
  .hdr-status {
    font-size: 0.5rem;
    letter-spacing: 1px;
    padding: 2px 7px;
    border-radius: 20px;
    &.st-ok      { color: $c; border: 1px solid rgba($c, 0.35); background: rgba($c, 0.07); }
    &.st-shield  { color: $p; border: 1px solid rgba($p, 0.4);  background: rgba($p, 0.1); animation: shield-flash 1.5s infinite; }
    &.st-explode { color: $b; border: 1px solid rgba($b, 0.4);  background: rgba($b, 0.08); }
    &.st-warn    { color: $warn; border: 1px solid rgba($warn, 0.3); background: rgba($warn, 0.06); }
  }
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.4); opacity: 1; }
}
@keyframes shield-flash {
  0%, 100% { opacity: 0.85; } 50% { opacity: 1; }
}

// 状态指示灯网格
.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.sg-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 3px;
  border-radius: 7px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.25s ease;

  span {
    font-size: 0.42rem;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.3);
    transition: color 0.25s;
  }

  .sg-led {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
    transition: all 0.25s ease;
  }

  &.on {
    border-color: rgba($c, 0.28);
    background: rgba($c, 0.07);
    span { color: $c; }
    .sg-led {
      background: $c;
      box-shadow: 0 0 6px $c, 0 0 14px rgba($c, 0.6);
      animation: led-blink 2.2s ease-in-out infinite;
    }
  }
}

@keyframes led-blink {
  0%, 100% { opacity: 0.85; } 50% { opacity: 1; transform: scale(1.2); }
}

// 拆解主按钮
.explode-btn {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba($c, 0.15), rgba(100, 120, 240, 0.15));
  border: 1px solid rgba($c, 0.4);
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.72rem;
  letter-spacing: 2px;
  overflow: hidden;
  transition: all 0.25s ease;

  .eb-bar {
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: $c;
    box-shadow: 0 0 8px $c;
  }

  .eb-icon { color: $c; font-size: 1rem; }

  &:hover {
    background: linear-gradient(135deg, rgba($c, 0.25), rgba(100, 120, 240, 0.25));
    box-shadow: 0 0 18px rgba($c, 0.25);
    transform: translateY(-1px);
  }

  &.on {
    background: linear-gradient(135deg, rgba($p, 0.2), rgba($c, 0.12));
    border-color: rgba($p, 0.5);
    .eb-bar { background: $p; box-shadow: 0 0 8px $p; }
    .eb-icon { color: $p; }
  }

  .eb-ripple {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 140%; aspect-ratio: 1; border-radius: 50%;
    background: rgba($c, 0.2); pointer-events: none;
    &.active { animation: ripple 0.7s ease-out forwards; }
  }
}

@keyframes ripple {
  to { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}

// 开关组
.switch-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.sw-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 7px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($c, 0.05);
    border-color: rgba($c, 0.18);
  }

  .sw-info {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .sw-code {
    font-size: 0.46rem;
    letter-spacing: 1px;
    color: rgba($c, 0.4);
  }
  .sw-name {
    font-size: 0.62rem;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.65);
  }
}

.sci-switch {
  width: 34px; height: 17px;
  border-radius: 9px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  position: relative;
  transition: all 0.3s ease;

  .sw-thumb {
    position: absolute;
    top: 2px; left: 2px;
    width: 11px; height: 11px;
    border-radius: 50%;
    background: rgba(255,255,255,0.35);
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }

  &.on {
    background: rgba($c, 0.28);
    border-color: rgba($c, 0.55);
    box-shadow: 0 0 8px rgba($c, 0.25);
    .sw-thumb {
      left: 19px;
      background: $c;
      box-shadow: 0 0 6px rgba($c, 0.9);
    }
  }
}

// 参数行
.param-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;

  .pr-label {
    font-size: 0.55rem;
    letter-spacing: 1px;
    color: rgba($b, 0.55);
    width: 44px;
    flex-shrink: 0;
    .pr-unit { opacity: 0.6; }
  }
  .pr-val {
    font-size: 0.58rem;
    color: rgba($c, 0.85);
    width: 30px;
    text-align: right;
    flex-shrink: 0;
  }
  .pr-slider-wrap { flex: 1; }
}

.sci-slider {
  width: 100%;
  -webkit-appearance: none;
  height: 2px;
  border-radius: 2px;
  background: rgba($c, 0.18);
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 11px; height: 11px;
    border-radius: 50%;
    background: $c;
    box-shadow: 0 0 6px rgba($c, 0.9);
    cursor: pointer;
    transition: transform 0.15s ease;
    &:hover { transform: scale(1.3); }
  }
  &::-moz-range-thumb {
    width: 11px; height: 11px;
    border-radius: 50%;
    background: $c;
    box-shadow: 0 0 6px rgba($c, 0.9);
    cursor: pointer; border: none;
  }
}

// 底部
.panel-footer {
  padding-top: 8px;
  border-top: 1px solid rgba($c, 0.07);
  display: flex;
  align-items: center;
  gap: 8px;

  .scan-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba($c, 0.3), transparent);
  }
  .ft-text {
    font-size: 0.45rem;
    letter-spacing: 1.5px;
    color: rgba($b, 0.22);
  }
}

@media (max-width: 768px) {
  .cockpit-panel { bottom: 16px; right: 16px; width: 224px; }
}
</style>
