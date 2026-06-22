<template>
  <div
    id="loader-wrapper"
    :class="{ loaded: shouldExit }"
    @transitionend="onTransitionEnd"
  >
    <div class="loader">
      <div class="galaxy-bg" :class="{ 'galaxy-warp': isExiting }">
        <Galaxy
          :mouse-repulsion="!isExiting"
          :mouse-interaction="!isExiting"
          :density="1.4"
          :glow-intensity="0.45"
          :saturation="0.65"
          :hue-shift="220"
          :twinkle-intensity="0.4"
          :star-speed="isExiting ? 1.2 : 0.25"
          :speed="isExiting ? 2.5 : 0.5"
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
            :speed="isExiting ? 0.8 : 0.3"
            :scale="1.5"
            :brightness="isExiting ? 1.1 : 0.85"
            color1="#c8e6ff"
            color2="#7b5cff"
            :noise-frequency="2.5"
            :noise-amplitude="1.0"
            :band-height="0.45"
            :band-spread="1.0"
            :color-speed="isExiting ? 1 : 0.5"
            :enable-mouse-interaction="!isExiting"
            :mouse-influence="0.2"
          />
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
    transition:
      opacity 1.4s ease-out 0.4s,
      filter 1.2s ease-out;

    &.aurora-traverse {
      opacity: 0;
      filter: blur(6px) brightness(1.3);
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
      ellipse 28% 62% at 50% 50%,
      transparent 38%,
      rgba(5, 5, 16, 0.5) 65%,
      rgba(5, 5, 16, 0.92) 100%
    );
    animation: vignetteDisperse 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  &.loaded {
    pointer-events: none;
    visibility: hidden;
    transition: visibility 0s 2.2s;
  }
}

.aurora-fade-enter-active {
  transition: opacity 2s ease-in;
}
.aurora-fade-enter-from {
  opacity: 0;
}
.aurora-fade-enter-to {
  opacity: 1;
}

@keyframes vignetteDisperse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2.6);
  }
}
</style>
