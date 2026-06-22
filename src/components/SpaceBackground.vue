<template>
  <div class="space-background">
    <canvas ref="canvasRef" class="galaxy-canvas"></canvas>
    <div class="deep-vignette"></div>

    <!-- 流星滑动（保留原版 CSS 效果） -->
    <div class="meteors-container">
      <div class="meteor"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Experience from "@/galaxy/js/experience.js";

const canvasRef = ref(null);

onMounted(() => {
  if (canvasRef.value) {
    new Experience(canvasRef.value, { enableScrollZoom: false });
  }
});

onBeforeUnmount(() => {
  Experience.destroy();
});
</script>

<style scoped lang="scss">
.space-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #000012;
  pointer-events: none;
  filter: brightness(1);
  transform: scale(1);
  transition: filter 1.4s ease-out;

  &.splash-dimmed {
    filter: brightness(0.72) saturate(0.85);
  }

  &.is-revealing {
    animation: warpLand 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
}

@keyframes warpLand {
  0% {
    transform: scale(1.02);
    filter: brightness(0.82) blur(2px) saturate(0.9);
  }
  50% {
    transform: scale(1.03);
    filter: brightness(1.05) blur(1px) saturate(1);
  }
  100% {
    transform: scale(1);
    filter: brightness(1) blur(0) saturate(1);
  }
}

.galaxy-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.deep-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 35%,
    rgba(0, 0, 8, 0.55) 100%
  );
}

.meteors-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}

.meteor {
  position: absolute;
  width: 3px;
  height: 3px;
  background: linear-gradient(45deg, #fff, #87ceeb, #fff);
  border-radius: 50%;
  box-shadow:
    0 0 8px rgba(255, 255, 255, 0.9),
    0 0 16px rgba(135, 206, 235, 0.7),
    0 0 24px rgba(255, 255, 255, 0.5);
  animation: meteorSlide 6s linear infinite;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: -20px;
    width: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), rgba(135, 206, 235, 0.6));
    transform: translateY(-50%);
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: -40px;
    width: 15px;
    height: 0.5px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), rgba(135, 206, 235, 0.3));
    transform: translateY(-50%);
  }
}

.meteor {
  top: 30%;
  left: -50px;
}

@keyframes meteorSlide {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 100px));
    opacity: 0;
  }
}
</style>
