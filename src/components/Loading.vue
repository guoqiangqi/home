<template>
  <div
    id="loader-wrapper"
    :class="{ loaded: shouldExit }"
    @transitionend="onTransitionEnd"
  >
    <div class="loader">
      <div class="galaxy-bg" :class="{ 'galaxy-warp': isExiting }">
        <Galaxy
          :mouse-repulsion="true"
          :mouse-interaction="true"
          :density="1.4"
          :glow-intensity="0.45"
          :saturation="0.65"
          :hue-shift="220"
          :twinkle-intensity="0.4"
          :star-speed="0.25"
          :speed="0.5"
          :rotation-speed="0.04"
          :transparent="false"
        />
      </div>

      <Transition name="aurora-fade">
        <div
          v-if="auroraVisible"
          class="aurora-layer"
          :class="{ 'aurora-traverse': isExiting }"
        >
          <SoftAurora
            :speed="0.3"
            :scale="1.5"
            :brightness="0.85"
            color1="#c8e6ff"
            color2="#7b5cff"
            :noise-frequency="2.5"
            :noise-amplitude="1.0"
            :band-height="0.45"
            :band-spread="1.0"
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
              :mouse-influence="1.0"
            />
          </div>
        </div>
      </Transition>

      <div v-if="isExiting" class="traverse-effects">
        <div class="traverse-vignette" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { mainStore } from "@/store";
import Galaxy from "@/components/Galaxy.vue";
import SoftAurora from "@/components/SoftAurora.vue";
import AuroraParticles from "@/components/AuroraParticles.vue";

const emit = defineEmits(["exit-start"]);

const store = mainStore();

const AURORA_DELAY_MS = 3000;
const EXIT_DELAY_MS = 7000;

const auroraVisible = ref(false);
const sequenceDone = ref(false);
const isExiting = ref(false);

const shouldExit = computed(() => sequenceDone.value && store.imgLoadStatus);

let auroraTimer = null;
let exitTimer = null;
let traverseFallbackTimer = null;
let splashFinished = false;

const finishSplash = () => {
  if (splashFinished || !shouldExit.value) return;
  splashFinished = true;
  store.setSplashDone(true);
};

const onTransitionEnd = (event) => {
  if (
    isExiting.value &&
    event.propertyName === "opacity" &&
    event.target.classList.contains("aurora-layer")
  ) {
    finishSplash();
  }
};

watch(shouldExit, (val) => {
  if (val && !isExiting.value) {
    isExiting.value = true;
    emit("exit-start");
    traverseFallbackTimer = setTimeout(finishSplash, 2400);
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

  .aurora-layer {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    mix-blend-mode: screen;
    // 用柔和的椭圆遮罩把极光四周渐隐，消除展开后明显的硬边界，使其融入星空背景
    -webkit-mask-image: radial-gradient(
      ellipse 92% 62% at 50% 47%,
      #000 0%,
      #000 32%,
      rgba(0, 0, 0, 0.55) 60%,
      transparent 100%
    );
    mask-image: radial-gradient(
      ellipse 92% 62% at 50% 47%,
      #000 0%,
      #000 32%,
      rgba(0, 0, 0, 0.55) 60%,
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
      filter: blur(4px);
      transition:
        opacity 1.6s cubic-bezier(0.22, 1, 0.36, 1),
        filter 1.4s ease-out;
    }
  }

  .traverse-effects {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
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
.aurora-fade-enter-active {
  animation: auroraReveal 3.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  will-change: opacity, transform, filter;
}

@keyframes auroraReveal {
  0% {
    opacity: 0;
    transform: scale(0.04, 0.02);
    filter: blur(12px) brightness(2);
  }
  16% {
    opacity: 0.9;
    transform: scale(0.14, 0.04);
    filter: blur(8px) brightness(1.7);
  }
  55% {
    opacity: 1;
    transform: scale(1, 0.2);
    filter: blur(4px) brightness(1.25);
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
</style>
