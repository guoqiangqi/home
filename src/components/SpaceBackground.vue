<template>
  <div class="space-background">
    <canvas ref="canvasRef" class="galaxy-canvas"></canvas>
    <div class="deep-vignette"></div>

    <!-- 流星滑动（保留原效果，仅每次飞行随机变化轨迹） -->
    <div class="meteors-container">
      <div
        class="meteor"
        :style="meteor.style"
        @animationiteration="resetMeteor"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Experience from "@/galaxy/js/experience.js";

const canvasRef = ref(null);

// 仅随机化流星的运行轨迹（角度与起点），其余效果保持原样
const createMeteor = () => {
  const angle = -12 + Math.random() * 45; // 倾斜角度（含轻微上下偏移）
  const top = Math.random() * 60; // 起始纵向位置 (vh)
  const left = -15 + Math.random() * 10; // 起始横向位置 (vw)，在屏幕左侧外
  return {
    style: {
      top: `${top}vh`,
      left: `${left}vw`,
      "--angle": `${angle}deg`,
    },
  };
};

const meteor = ref(createMeteor());

// 每飞完一轮就换一条新的随机轨迹
const resetMeteor = () => {
  meteor.value = createMeteor();
};

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
  // 仅运行轨迹（角度）由 JS 注入的 CSS 变量控制，其余保持原效果
  --angle: 0deg;
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

@keyframes meteorSlide {
  0% {
    transform: rotate(var(--angle)) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateX(calc(100vw + 100px));
    opacity: 0;
  }
}
</style>
