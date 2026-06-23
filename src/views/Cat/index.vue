<template>
  <div class="cat-container" @click.stop>
    <!-- 星云背景装饰 -->
    <div class="nebula-decoration">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="star-dust"></div>
      <!-- 漂浮的猫爪与喵元素 -->
      <span class="float-paw paw-1">🐾</span>
      <span class="float-paw paw-2">🐱</span>
      <span class="float-paw paw-3">🐾</span>
      <span class="float-paw paw-4">😺</span>
      <span class="float-paw paw-5">🐾</span>
    </div>

    <!-- 头部 -->
    <div class="cat-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-coords">
            <span class="coord-dot"></span>
            <span class="coord-text">LIVE FEED · 喵星观测站 · CH-09</span>
          </div>
          <h1 class="cat-title">
            <span class="title-text">喵星来客</span>
          </h1>
          <p class="cat-subtitle">来自喵星的一只小恶魔，正在地球轨道上调皮捣蛋</p>
        </div>

        <div class="close-btn" @click.stop="closeCat" title="返回">
          <Icon size="20"><CloseOne /></Icon>
        </div>
      </div>
    </div>

    <!-- 视频播放器 -->
    <div class="player-section">
      <div class="player-card">
        <div class="player-frame">
          <div class="frame-glow"></div>

          <!-- 顶部状态条 -->
          <div class="player-topbar">
            <div class="topbar-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <span class="topbar-title">mischievous_little_devil.mp4</span>
            <span class="topbar-live">
              <span class="live-dot"></span> REC
            </span>
          </div>

          <div class="video-wrap">
            <video
              ref="videoRef"
              class="cat-video"
              :poster="poster"
              controls
              loop
              muted
              autoplay
              playsinline
              preload="metadata"
              @waiting="loading = true"
              @playing="loading = false"
              @canplay="loading = false"
              @error="onError"
            >
              <source :src="videoSrc" type="video/mp4" />
              <source :src="videoFallback" type="video/mp4" />
              你的浏览器不支持视频播放。
            </video>

            <!-- 加载态 -->
            <div v-if="loading && !errored" class="video-loading">
              <div class="loading-orbit">
                <span class="orbit-cat">🐱</span>
              </div>
              <p>信号接收中...</p>
            </div>

            <!-- 错误态 -->
            <div v-if="errored" class="video-error">
              <div class="error-icon">🙀</div>
              <h3>信号丢失了</h3>
              <p>喵星连接中断，换个姿势再试试</p>
              <button class="retry-btn" @click.stop="retry">重新连接</button>
            </div>
          </div>

          <!-- 底部信息条 -->
          <div class="player-bottombar">
            <div class="caption">
              <span class="caption-emoji">😼</span>
              <span class="caption-text">调皮的小恶魔 · The Mischievous Little Devil</span>
            </div>
            <div class="player-tags">
              <span class="tag"># 喵星人</span>
              <span class="tag"># 治愈</span>
              <span class="tag"># 日常</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示文案 -->
      <p class="player-hint">🔈 视频默认静音，点击播放器音量按钮即可聆听喵喵叫</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { CloseOne } from "@icon-park/vue-next";
import { Icon } from "@vicons/utils";
import { mainStore } from "@/store";

const store = mainStore();

// 视频源（自定义域名 CDN，返回 video/mp4 且支持 CORS）
const videoSrc = "https://guoqiangqi.com/images/mischievous_little_devil.mp4";
// 备用源（GitHub 原始直链）
const videoFallback =
  "https://raw.githubusercontent.com/guoqiangqi/guoqiangqi.github.io/academicpages/images/mischievous_little_devil.mp4";
const poster = "";

const videoRef = ref(null);
const loading = ref(true);
const errored = ref(false);

const onError = () => {
  errored.value = true;
  loading.value = false;
};

const retry = () => {
  errored.value = false;
  loading.value = true;
  if (videoRef.value) {
    videoRef.value.load();
    videoRef.value.play().catch(() => {});
  }
};

const closeCat = () => {
  store.catOpenState = false;
  if (videoRef.value) videoRef.value.pause();
};

const handleKeydown = (e) => {
  if (e.key === "Escape") closeCat();
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (videoRef.value) videoRef.value.pause();
});
</script>

<style lang="scss" scoped>
.cat-container {
  position: relative;
  padding: 0 0 60px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  color: #fff;
  overflow: hidden;
}

// 星云背景装饰
.nebula-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;

  .nebula {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    animation: nebulaDrift 18s ease-in-out infinite;

    &.nebula-1 {
      width: 420px;
      height: 420px;
      top: -8%;
      left: -6%;
      background: radial-gradient(circle, rgba(167, 139, 255, 0.4), transparent 70%);
    }
    &.nebula-2 {
      width: 360px;
      height: 360px;
      bottom: 6%;
      right: -8%;
      background: radial-gradient(circle, rgba(78, 205, 196, 0.32), transparent 70%);
      animation-delay: 5s;
    }
  }

  .star-dust {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 22% 28%, rgba(255, 255, 255, 0.7), transparent),
      radial-gradient(1px 1px at 62% 68%, rgba(255, 255, 255, 0.5), transparent),
      radial-gradient(1px 1px at 82% 24%, rgba(135, 206, 235, 0.6), transparent),
      radial-gradient(1.5px 1.5px at 42% 82%, rgba(255, 255, 255, 0.5), transparent);
    opacity: 0.55;
    animation: twinkle 5s ease-in-out infinite;
  }

  .float-paw {
    position: absolute;
    font-size: 1.6rem;
    opacity: 0.18;
    animation: pawFloat 7s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.1));

    &.paw-1 { top: 12%; left: 6%; animation-delay: 0s; }
    &.paw-2 { top: 24%; right: 8%; animation-delay: 1.4s; font-size: 2rem; }
    &.paw-3 { bottom: 28%; left: 10%; animation-delay: 2.6s; }
    &.paw-4 { bottom: 16%; right: 12%; animation-delay: 0.8s; font-size: 2rem; }
    &.paw-5 { top: 60%; left: 50%; animation-delay: 3.4s; }
  }
}

@keyframes nebulaDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.08); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.7; }
}

@keyframes pawFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.16; }
  50% { transform: translateY(-22px) rotate(8deg); opacity: 0.3; }
}

// 头部
.cat-header {
  position: relative;
  z-index: 1;
  padding: 50px 30px 10px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .title-section {
    flex: 1;
    text-align: center;

    .title-coords {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: "UnidreamLED", monospace;
      font-size: 0.7rem;
      letter-spacing: 2px;
      color: rgba(135, 206, 235, 0.55);
      margin-bottom: 16px;

      .coord-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4ecdc4;
        box-shadow: 0 0 8px rgba(78, 205, 196, 0.8);
        animation: coordPulse 2.5s ease-in-out infinite;
      }
    }

    .cat-title {
      font-size: 3.4rem;
      font-weight: 800;
      margin: 0;
      letter-spacing: 4px;

      .title-text {
        background: linear-gradient(135deg, #87ceeb 0%, #4ecdc4 45%, #a78bff 100%);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradientShift 5s ease-in-out infinite;
        text-shadow: 0 0 40px rgba(78, 205, 196, 0.15);
      }
    }

    .cat-subtitle {
      font-size: 1.05rem;
      color: rgba(255, 255, 255, 0.65);
      margin-top: 14px;
      font-weight: 300;
      letter-spacing: 0.5px;
    }
  }

  .close-btn {
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(78, 205, 196, 0.18);
      border-color: rgba(78, 205, 196, 0.4);
      transform: scale(1.08) rotate(90deg);
      box-shadow: 0 4px 20px rgba(78, 205, 196, 0.25);
    }
  }
}

@keyframes coordPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

// 播放器区域
.player-section {
  position: relative;
  z-index: 1;
  padding: 24px 30px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-card {
  width: 100%;
  max-width: 720px;
  opacity: 0;
  animation: cardReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.player-frame {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(20, 22, 48, 0.85), rgba(10, 12, 28, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 70px rgba(0, 0, 8, 0.55);

  .frame-glow {
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.5), rgba(167, 139, 255, 0.4), transparent 60%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 3;
  }
}

// 顶部状态条
.player-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: rgba(0, 0, 8, 0.35);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .topbar-dots {
    display: flex;
    gap: 6px;

    .dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;

      &.red { background: #ff5f57; }
      &.yellow { background: #febc2e; }
      &.green { background: #28c840; }
    }
  }

  .topbar-title {
    flex: 1;
    text-align: center;
    font-family: "UnidreamLED", monospace;
    font-size: 0.78rem;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.55);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .topbar-live {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: "UnidreamLED", monospace;
    font-size: 0.72rem;
    letter-spacing: 1px;
    color: #ff6b6b;

    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ff5f57;
      box-shadow: 0 0 8px rgba(255, 95, 87, 0.8);
      animation: liveBlink 1.6s ease-in-out infinite;
    }
  }
}

@keyframes liveBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

// 视频容器
.video-wrap {
  position: relative;
  width: 100%;
  background: #05060f;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;

  .cat-video {
    width: 100%;
    max-height: 70vh;
    display: block;
    background: #05060f;
  }

  .video-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    background: rgba(5, 6, 15, 0.6);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    letter-spacing: 1px;

    .loading-orbit {
      position: relative;
      width: 60px;
      height: 60px;
      border: 2px dashed rgba(78, 205, 196, 0.4);
      border-radius: 50%;
      animation: orbitSpin 3s linear infinite;

      .orbit-cat {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 1.5rem;
      }
    }
  }

  .video-error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(5, 6, 15, 0.85);
    text-align: center;
    padding: 20px;

    .error-icon {
      font-size: 3.5rem;
      margin-bottom: 6px;
      animation: float 3s ease-in-out infinite;
    }

    h3 {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.9);
    }

    p {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.55);
      margin-bottom: 8px;
    }

    .retry-btn {
      padding: 9px 24px;
      background: linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(102, 126, 234, 0.3));
      border: 1px solid rgba(78, 205, 196, 0.5);
      border-radius: 30px;
      color: #fff;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(78, 205, 196, 0.25);
      }
    }
  }
}

@keyframes orbitSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

// 底部信息条
.player-bottombar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(0, 0, 8, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  .caption {
    display: flex;
    align-items: center;
    gap: 8px;

    .caption-emoji {
      font-size: 1.3rem;
    }

    .caption-text {
      font-size: 0.92rem;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
    }
  }

  .player-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tag {
      font-size: 0.72rem;
      color: rgba(135, 206, 235, 0.75);
      background: rgba(135, 206, 235, 0.08);
      border: 1px solid rgba(135, 206, 235, 0.15);
      padding: 3px 10px;
      border-radius: 20px;
    }
  }
}

.player-hint {
  margin-top: 20px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.5px;
  animation: fade 1s ease 0.4s both;
}

@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(26px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

// 响应式
@media (max-width: 768px) {
  .cat-header {
    padding: 36px 18px 6px;

    .title-section .cat-title {
      font-size: 2.4rem;
    }
    .title-section .cat-subtitle {
      font-size: 0.9rem;
    }
  }

  .player-section {
    padding: 18px 16px 0;
  }

  .player-bottombar {
    flex-direction: column;
    align-items: flex-start;
  }

  .player-hint {
    text-align: center;
  }
}
</style>
