<template>
  <div id="loader-wrapper" :class="{ loaded: shouldExit }">
    <div class="loader">
      <div class="galaxy-bg" :class="{ 'galaxy-warp': warping }">
        <!-- 适度饱和的冷色星空：星点带淡蓝紫色彩但不艳丽，配合闪烁保留深空神秘感 -->
        <!-- 关闭鼠标交互，去除鼠标附近星空被排斥/聚合的效果 -->
        <Galaxy
          :mouse-repulsion="false"
          :mouse-interaction="false"
          :density="1.3"
          :glow-intensity="0.36"
          :saturation="0.42"
          :hue-shift="225"
          :twinkle-intensity="0.5"
          :star-speed="0.25"
          :speed="0.45"
          :rotation-speed="0.035"
          :transparent="false"
          :repulsion-strength="0.6"
        />
      </div>
      <!-- 银河系照片层：独立于 galaxy-bg，始终在极光下方可见 -->
      <div class="milkyway-photo" :class="{ 'milkyway-warp': warping }" />
      <!-- 深空暗角层：压暗四周，营造幽邃感 -->
      <div class="deep-space-vignette" />

      <Transition name="aurora-fade">
        <div
          v-if="auroraVisible"
          class="aurora-layer"
          :class="{ 'aurora-traverse': isExiting }"
        >
          <SoftAurora
            :speed="0.3"
            :scale="1.5"
            :brightness="0.55"
            color1="#c8e6ff"
            color2="#7b5cff"
            :noise-frequency="2.5"
            :noise-amplitude="1.0"
            :band-height="0.45"
            :band-spread="1.5"
            :color-speed="0.5"
            :enable-mouse-interaction="true"
            :mouse-influence="0.2"
          />
          <div class="aurora-particles">
            <AuroraParticles
              :count="100"
              color1="#c8e6ff"
              color2="#9d7bff"
              :speed="1.0"
              :max-size="2.6"
              :band-center="0.5"
              :band-spread="0.3"
              :enable-mouse-interaction="true"
              :mouse-influence="0.3"
            />
          </div>
        </div>
      </Transition>

      <div v-if="warping" class="traverse-effects">
        <!-- 曲速光轨：星点从中心向外加速拉伸成光线，营造穿梭隧道感 -->
        <canvas ref="warpCanvasRef" class="warp-canvas" />
        <!-- 隧道尽头的光：中心泛起冷色辉光，像即将冲出隧道口 -->
        <div class="warp-core-glow" />
        <div class="traverse-vignette" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { mainStore } from "@/store";
import Galaxy from "@/components/Galaxy.vue";
import SoftAurora from "@/components/SoftAurora.vue";
import AuroraParticles from "@/components/AuroraParticles.vue";

const emit = defineEmits(["exit-start"]);

const store = mainStore();

const AURORA_DELAY_MS = 3000;
const EXIT_DELAY_MS = 7000;
// 退场时先让裂缝（极光）快速闭合消失，稍作停顿后再进入曲速穿梭
const RIFT_CLOSE_MS = 720;
// 曲速穿梭持续时长（与 canvas 动画、结束定时器共用）
const WARP_DURATION_MS = 2100;

const auroraVisible = ref(false);
const sequenceDone = ref(false);
const isExiting = ref(false);
const warping = ref(false);
const warpCanvasRef = ref(null);

const shouldExit = computed(() => sequenceDone.value && store.imgLoadStatus);

let auroraTimer = null;
let exitTimer = null;
let traverseFallbackTimer = null;
let warpDelayTimer = null;
let splashFinished = false;
let warpRaf = null;

// 曲速穿梭光轨：星点以屏幕中心为消失点向外加速，位移越快拖尾越长，
// 从静止星点逐渐拉伸成贯穿画面的光线，形成隧道穿越的视觉流动
const startWarpStreaks = () => {
  const canvas = warpCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.hypot(cx, cy);
  const STAR_COUNT = 240;
  const spawnStar = (nearCenter = false) => ({
    angle: Math.random() * Math.PI * 2,
    // 平方根分布让星点在画面上均匀铺开，重生时从中心附近冒出
    r: nearCenter
      ? 4 + Math.random() * maxR * 0.12
      : Math.sqrt(Math.random()) * maxR * 0.9 + 4,
    hue: 205 + Math.random() * 40,
    size: 0.5 + Math.random() * 1.3,
  });
  const stars = Array.from({ length: STAR_COUNT }, () => spawnStar(false));

  const DURATION = WARP_DURATION_MS;
  const start = performance.now();

  const frame = (now) => {
    const t = Math.min((now - start) / DURATION, 1);
    // 慢启动→急加速的曲线，后半段光线飞速划过
    const speed = 0.006 + Math.pow(t, 2.2) * 0.2;
    // 整体透明度：快速淡入，尾声随穿越结束淡出
    const fade = t < 0.12 ? t / 0.12 : t > 0.8 ? Math.max((1 - t) / 0.2, 0) : 1;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    for (const s of stars) {
      const r0 = s.r;
      s.r += s.r * speed + 0.35;
      if (s.r > maxR * 1.12) {
        Object.assign(s, spawnStar(true));
        continue;
      }
      // 拖尾长度随速度与时间放大，但不超过自身半径的一半，避免穿过中心
      const streak = Math.min((s.r - r0) * (4 + t * 14), s.r * 0.55);
      const cos = Math.cos(s.angle);
      const sin = Math.sin(s.angle);
      const x1 = cx + cos * (s.r - streak);
      const y1 = cy + sin * (s.r - streak);
      const x2 = cx + cos * s.r;
      const y2 = cy + sin * s.r;
      // 越靠近边缘越亮，强化中心深、四周快的隧道透视
      const depth = Math.min(s.r / maxR, 1);
      const alpha = (0.1 + depth * 0.55) * fade;
      ctx.strokeStyle = `hsla(${s.hue}, 80%, 82%, ${alpha})`;
      ctx.lineWidth = s.size * (0.5 + depth * 1.4);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    if (t < 1) {
      warpRaf = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  };
  warpRaf = requestAnimationFrame(frame);
};

const finishSplash = () => {
  if (splashFinished || !shouldExit.value) return;
  splashFinished = true;
  store.setSplashDone(true);
};

watch(shouldExit, (val) => {
  if (val && !isExiting.value) {
    isExiting.value = true;
    emit("exit-start");
    // 阶段一：极光（裂缝）先快速淡出闭合；阶段二：闭合后再启动背景加速与曲速光轨
    warpDelayTimer = setTimeout(() => {
      warping.value = true;
      nextTick(startWarpStreaks);
    }, RIFT_CLOSE_MS);
    traverseFallbackTimer = setTimeout(
      finishSplash,
      RIFT_CLOSE_MS + WARP_DURATION_MS
    );
  }
});

onMounted(() => {
  auroraTimer = setTimeout(() => {
    auroraVisible.value = true;
  }, AURORA_DELAY_MS);

  exitTimer = setTimeout(() => {
    sequenceDone.value = true;
  }, EXIT_DELAY_MS);
});

onBeforeUnmount(() => {
  clearTimeout(auroraTimer);
  clearTimeout(exitTimer);
  clearTimeout(traverseFallbackTimer);
  clearTimeout(warpDelayTimer);
  cancelAnimationFrame(warpRaf);
});
</script>

<style lang="scss" scoped>
#loader-wrapper {
  position: fixed;
  inset: 0;
  z-index: 999;
  overflow: hidden;
  background: #050510;

  .loader {
    position: relative;
    width: 100%;
    height: 100%;
    perspective: 900px;
    transform-style: preserve-3d;
  }

  .galaxy-bg {
    position: absolute;
    inset: 0;
    transform: scale(1) translateZ(0);
    transition:
      transform 2s cubic-bezier(0.55, 0.06, 0.22, 0.99),
      filter 1.6s ease-out,
      opacity 0.6s ease-out 1.4s;

    &.galaxy-warp {
      transform: scale(2.8) translateZ(320px);
      filter: blur(14px) brightness(1.6);
      opacity: 0;
    }

  }

  // 银河系照片层：与 galaxy-bg 同步穿越，始终在极光下方可见
  .milkyway-photo {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      url('/textures/galaxy/2k_stars_milky_way.jpg') center center / cover no-repeat;
    mix-blend-mode: lighten;
    // 适度压暗并保留银河本身的色彩，朗而不艳，若隐若现
    opacity: 0.68;
    filter: brightness(1.05) saturate(0.95) hue-rotate(-8deg);
    // 轻微旋转让银河带斜穿画面，更有宇宙纵深感
    transform: rotate(-18deg) scale(1.3);
    // 四周径向遮罩羽化，边缘自然融入深空背景
    -webkit-mask-image: radial-gradient(
      ellipse 100% 90% at 50% 52%,
      #000 0%,
      #000 45%,
      rgba(0,0,0,0.7) 72%,
      transparent 100%
    );
    mask-image: radial-gradient(
      ellipse 100% 90% at 50% 52%,
      #000 0%,
      #000 45%,
      rgba(0,0,0,0.7) 72%,
      transparent 100%
    );
    transition:
      transform 2s cubic-bezier(0.55, 0.06, 0.22, 0.99),
      filter 1.6s ease-out,
      opacity 0.6s ease-out 1.4s;

    &.milkyway-warp {
      transform: rotate(-18deg) scale(3.64) translateZ(320px);
      filter: brightness(1.05) saturate(0.95) hue-rotate(-8deg) blur(14px) brightness(1.6);
      opacity: 0;
    }
  }

  // 深空暗角：仅轻微压暗四周边缘聚焦中心，不影响主体色彩
  .deep-space-vignette {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(
      ellipse 130% 110% at 50% 45%,
      transparent 0%,
      transparent 52%,
      rgba(4, 5, 18, 0.22) 78%,
      rgba(2, 3, 12, 0.5) 100%
    );
  }

  .aurora-layer {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    mix-blend-mode: screen;
    // 用柔和的椭圆遮罩把极光四周渐隐，消除展开后明显的硬边界，使其融入星空背景；
    // 纵向半径收窄让裂缝展开后上下更窄
    -webkit-mask-image: radial-gradient(
      ellipse 92% 44% at 50% 47%,
      #000 0%,
      #000 30%,
      rgba(0, 0, 0, 0.55) 58%,
      transparent 100%
    );
    mask-image: radial-gradient(
      ellipse 92% 44% at 50% 47%,
      #000 0%,
      #000 30%,
      rgba(0, 0, 0, 0.55) 58%,
      transparent 100%
    );
    // 缩放锚点对齐 WebGL 极光光带的真实纵向中心（bandHeight 0.45 ≈ 距顶部 55%），
    // 避免纵向展开时光带相对锚点漂移产生跳动
    transform-origin: 50% 55%;
    transition:
      opacity 1.6s cubic-bezier(0.22, 1, 0.36, 1),
      filter 1.4s ease-out;

    .aurora-particles {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      mix-blend-mode: screen;
      // 粒子比光带稍慢淡入，营造光尘逐渐浮现的层次感
      animation: particlesFadeIn 2.8s ease-out 0.6s both;
    }

    &.aurora-traverse {
      opacity: 0;
      filter: blur(6px);
      // 退场时裂缝快速闭合消失（早于曲速穿梭启动），形成“先消失后穿梭”的先后关系
      transition:
        opacity 0.55s cubic-bezier(0.4, 0, 0.6, 1),
        filter 0.5s ease-out;
    }
  }

  .traverse-effects {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .warp-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    mix-blend-mode: screen;
    // 轻微辉光让光轨更像能量光线而非细硬线条
    filter: blur(0.4px) drop-shadow(0 0 6px rgba(150, 190, 255, 0.35));
  }

  // 隧道尽头的光：中心冷色辉光随穿越推进逐渐亮起、扩张，再随落地消散
  .warp-core-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(200, 222, 255, 0.5) 0%,
      rgba(140, 165, 255, 0.22) 14%,
      rgba(100, 120, 255, 0.08) 32%,
      transparent 58%
    );
    animation: warpCoreGlow 2.3s cubic-bezier(0.55, 0.06, 0.22, 0.99) forwards;
  }

  .traverse-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 32% 68% at 50% 50%,
      transparent 42%,
      rgba(5, 5, 16, 0.35) 68%,
      rgba(5, 5, 16, 0.65) 100%
    );
    animation: vignetteDisperse 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  &.loaded {
    pointer-events: none;
    visibility: hidden;
    transition: visibility 0s 2.2s;
  }
}

// 极光入场：先在中心聚成一点，再横向铺展开来，最后纵向展开成完整光带
// 用 transform 缩放代替 clip-path，配合柔和的椭圆遮罩羽化所有边缘，避免任何硬边界
// 高光峰值压低（裂缝阶段不再像闪电般刺眼），淡入更缓更柔
.aurora-fade-enter-active {
  animation: auroraReveal 3.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  will-change: opacity, transform, filter;
}

@keyframes auroraReveal {
  0% {
    opacity: 0;
    transform: scale(0.02, 0.02);
    filter: blur(18px) brightness(1.1);
  }
  16% {
    opacity: 0.35;
    transform: scale(0.08, 0.04);
    filter: blur(14px) brightness(1.08);
  }
  55% {
    opacity: 0.75;
    transform: scale(1, 0.2);
    filter: blur(6px) brightness(1.04);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1);
    filter: blur(0) brightness(1);
  }
}

@keyframes particlesFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes vignetteDisperse {
  0% {
    opacity: 0;
    transform: scale(1.1);
  }
  12% {
    opacity: 0.45;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(2.6);
  }
}

@keyframes warpCoreGlow {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  35% {
    opacity: 0.55;
    transform: scale(0.85);
  }
  70% {
    opacity: 0.9;
    transform: scale(1.35);
  }
  100% {
    opacity: 0;
    transform: scale(2.4);
  }
}
</style>
