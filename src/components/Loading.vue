<template>
  <div
    id="loader-wrapper"
    :class="{ loaded: shouldExit }"
    @transitionend="onTransitionEnd"
  >
    <div class="loader">
      <div class="galaxy-bg">
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
        <div v-if="auroraVisible" class="aurora-overlay">
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
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { mainStore } from "@/store";
import Galaxy from "@/components/Galaxy.vue";
import SoftAurora from "@/components/SoftAurora.vue";

const store = mainStore();

const AURORA_DELAY_MS = 3000;
const EXIT_DELAY_MS = 7000;

const auroraVisible = ref(false);
const sequenceDone = ref(false);

const shouldExit = computed(() => sequenceDone.value && store.imgLoadStatus);

let auroraTimer = null;
let exitTimer = null;

const onTransitionEnd = (event) => {
  if (event.propertyName === "opacity" && shouldExit.value) {
    store.setSplashDone(true);
  }
};

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
});
</script>

<style lang="scss" scoped>
#loader-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  overflow: hidden;
  background: #050510;

  .loader {
    width: 100%;
    height: 100%;

    .galaxy-bg {
      position: absolute;
      inset: 0;
    }

    .aurora-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      mix-blend-mode: screen;
    }
  }

  &.loaded {
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.8s ease-out,
      visibility 0.8s ease-out;
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
</style>
