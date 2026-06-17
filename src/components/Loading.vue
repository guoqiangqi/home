<template>
  <div
    id="loader-wrapper"
    :class="store.imgLoadStatus ? 'loaded' : null"
    @transitionend="onTransitionEnd"
  >
    <div class="loader">
      <div class="space-rhythm">
        <div class="rhythm-wave wave-1" />
        <div class="rhythm-wave wave-2" />
        <div class="rhythm-wave wave-3" />
        <div class="rhythm-wave wave-4" />
        <div class="rhythm-ring ring-1" />
        <div class="rhythm-ring ring-2" />
        <div class="rhythm-ring ring-3" />
        <span class="rhythm-star star-1" />
        <span class="rhythm-star star-2" />
        <span class="rhythm-star star-3" />
        <span class="rhythm-star star-4" />
        <span class="rhythm-star star-5" />
        <span class="rhythm-star star-6" />
        <div class="rhythm-core" />
        <div class="rhythm-bars">
          <span
            v-for="(height, index) in barHeights"
            :key="index"
            class="bar"
            :style="{ height: `${height}px`, animationDelay: `${index * 0.1}s` }"
          />
        </div>
      </div>
      <div class="loader-text">
        <div class="name">
          <span
            v-for="(char, index) in siteNameChars"
            :key="index"
            class="name-char"
            :style="{ '--char-i': index, '--char-total': siteNameChars.length }"
          >{{ char }}</span>
        </div>
      </div>
    </div>
    <div class="loader-section section-left" />
    <div class="loader-section section-right" />
  </div>
</template>

<script setup>
import { mainStore } from "@/store";

const store = mainStore();

const onTransitionEnd = (event) => {
  if (event.propertyName === "transform" && store.imgLoadStatus) {
    store.setSplashDone(true);
  }
};

// 配置
const siteName = import.meta.env.VITE_SITE_NAME;
const siteNameChars = [...siteName];
const barHeights = [14, 22, 28, 22, 14];
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
  .loader {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 38px;
    .space-rhythm {
      position: relative;
      width: 210px;
      height: 210px;
      z-index: 2;

      .rhythm-core {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        border-radius: 50%;
        background: radial-gradient(circle, #fff 0%, #87ceeb 55%, #4ecdc4 100%);
        box-shadow:
          0 0 18px rgba(135, 206, 235, 0.9),
          0 0 36px rgba(78, 205, 196, 0.5);
        animation: corePulse 2s ease-in-out infinite;
      }

      .rhythm-wave {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        margin: -50% 0 0 -50%;
        border-radius: 50%;
        border: 1.5px solid rgba(135, 206, 235, 0.55);
        opacity: 0;
        animation: waveExpand 3.2s ease-out infinite;

        &.wave-1 { animation-delay: 0s; }
        &.wave-2 { animation-delay: 0.8s; }
        &.wave-3 { animation-delay: 1.6s; }
        &.wave-4 { animation-delay: 2.4s; }
      }

      .rhythm-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        border: 1.5px solid rgba(135, 206, 235, 0.2);
        transform: translate(-50%, -50%);
        animation: ringBreath 2.4s ease-in-out infinite;

        &.ring-1 {
          width: 70px;
          height: 70px;
          animation-delay: 0s;
        }
        &.ring-2 {
          width: 110px;
          height: 110px;
          animation-delay: 0.4s;
        }
        &.ring-3 {
          width: 150px;
          height: 150px;
          animation-delay: 0.8s;
        }
      }

      .rhythm-star {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 8px rgba(135, 206, 235, 0.8);
        animation: starRhythm 2.8s ease-in-out infinite;

        &.star-1 { top: 10%; left: 50%; animation-delay: 0s; }
        &.star-2 { top: 26%; right: 12%; animation-delay: 0.35s; }
        &.star-3 { bottom: 26%; right: 8%; animation-delay: 0.7s; }
        &.star-4 { bottom: 10%; left: 50%; animation-delay: 1.05s; }
        &.star-5 { bottom: 26%; left: 8%; animation-delay: 1.4s; }
        &.star-6 { top: 26%; left: 12%; animation-delay: 1.75s; }
      }

      .rhythm-bars {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: flex-end;
        gap: 13px;
        height: 28px;

        .bar {
          width: 3px;
          border-radius: 2px;
          background: linear-gradient(to top, transparent, rgba(78, 205, 196, 0.4), #87ceeb);
          transform-origin: bottom center;
          animation: barRhythm 1.4s ease-in-out infinite;
        }
      }
    }
    .loader-text {
      z-index: 2;

      .name {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        height: 30px;

        .name-char {
          display: inline-block;
          font-size: 24px;
          font-weight: 500;
          line-height: 1;
          background: linear-gradient(
            135deg,
            #d8ecf5 0%,
            #9ecfe3 30%,
            #8ec4be 55%,
            #c4b49a 80%,
            #c9a87a 100%
          );
          background-size: calc(var(--char-total) * 100%) 100%;
          background-position: calc(var(--char-i) / (var(--char-total) - 1) * 100%) 0;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          opacity: 0;
          animation: charBounce 4s ease-in-out infinite;
          animation-delay: calc(var(--char-i) * 0.2s);
        }
      }
    }
  }
  .loader-section {
    position: fixed;
    top: 0;
    width: 51%;
    height: 100%;
    background: #0a0a18;
    z-index: 1;
    &.section-left {
      left: 0;
    }
    &.section-right {
      right: 0;
    }
  }
  &.loaded {
    visibility: hidden;
    transform: translateY(-100%);
    transition:
      transform 0.3s 1.5s ease-out,
      visibility 0.3s 1.5s ease-out;
    .loader {
      .space-rhythm,
      .loader-text {
        opacity: 0;
        transition: opacity 0.3s ease-out;
      }
    }
    .loader-section {
      &.section-left {
        transform: translateX(-100%);
        transition: transform 0.5s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
      &.section-right {
        transform: translateX(100%);
        transition: transform 0.5s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
    }
  }
}

@keyframes corePulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 0 18px rgba(135, 206, 235, 0.9),
      0 0 36px rgba(78, 205, 196, 0.5);
  }
  50% {
    transform: scale(1.35);
    box-shadow:
      0 0 26px rgba(135, 206, 235, 1),
      0 0 48px rgba(78, 205, 196, 0.7),
      0 0 64px rgba(135, 206, 235, 0.3);
  }
}

@keyframes waveExpand {
  0% {
    transform: scale(0.25);
    opacity: 0.7;
  }
  70% {
    opacity: 0.15;
  }
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

@keyframes ringBreath {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(0.92);
    opacity: 0.25;
    border-color: rgba(135, 206, 235, 0.15);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.04);
    opacity: 0.65;
    border-color: rgba(135, 206, 235, 0.45);
  }
}

@keyframes starRhythm {
  0%,
  100% {
    transform: scale(0.6) translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2) translateY(-5px);
    opacity: 1;
  }
}

@keyframes barRhythm {
  0%,
  100% {
    transform: scaleY(0.25);
    opacity: 0.35;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes charBounce {
  0%,
  100% {
    opacity: 0;
    transform: translateY(8px) scale(0.75);
  }
  5% {
    opacity: 1;
    transform: translateY(-9px) scale(1.06);
  }
  10% {
    transform: translateY(3px) scale(0.97);
  }
  15%,
  80% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  86% {
    transform: translateY(-4px) scale(1.02);
  }
  92% {
    transform: translateY(0) scale(1);
  }
  97% {
    opacity: 0;
    transform: translateY(5px) scale(0.9);
  }
}
</style>
