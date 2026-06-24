<template>
  <div class="music-container" @click.stop>
    <!-- 星云背景装饰 -->
    <div class="nebula-decoration">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="star-dust"></div>
      <!-- 漂浮的音符 -->
      <span class="float-note note-1">♪</span>
      <span class="float-note note-2">♫</span>
      <span class="float-note note-3">♩</span>
      <span class="float-note note-4">♬</span>
      <span class="float-note note-5">♪</span>
    </div>

    <!-- 头部 -->
    <div class="music-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-coords">
            <span class="coord-dot"></span>
            <span class="coord-text">FREQUENCY · 星际电台 · 88.7 MHz</span>
          </div>
          <h1 class="music-title">
            <span class="title-text">星海音乐</span>
          </h1>
          <p class="music-subtitle">在浩瀚星河里，循着旋律自在漫游</p>
        </div>

        <div class="close-btn" @click.stop="closeMusic" title="返回">
          <Icon size="20"><CloseOne /></Icon>
        </div>
      </div>
    </div>

    <!-- 主体：星际播放控制台 -->
    <div class="studio">
      <!-- 正在播放 -->
      <div class="now-playing">
        <!-- 宇宙唱片可视化 -->
        <div class="visualizer">
          <div class="orbit-ring ring-outer"></div>
          <div class="orbit-ring ring-mid"></div>
          <div class="disc" :class="{ spinning: store.playerState }">
            <div class="disc-glow"></div>
            <div class="disc-grooves"></div>
            <div class="disc-core">
              <span class="core-icon">♪</span>
            </div>
            <span class="orbit-satellite"></span>
          </div>
          <!-- 频谱条 -->
          <div class="equalizer" :class="{ active: store.playerState }">
            <span v-for="n in 9" :key="n" :style="{ animationDelay: n * 0.12 + 's' }"></span>
          </div>
        </div>

        <!-- 曲目信息 -->
        <div class="track-info">
          <div class="track-status">
            <span class="status-led" :class="{ on: store.playerState }"></span>
            <span class="status-word">{{ store.playerState ? "NOW PLAYING" : "STANDBY" }}</span>
          </div>
          <h2 class="track-title">{{ store.getPlayerData.name || "等待信号接入" }}</h2>
          <p class="track-artist">
            {{ store.getPlayerData.artist || "选择右侧星轨上的曲目开始旅程" }}
          </p>
          <div class="track-lrc">
            <Transition name="lrc-fade" mode="out-in">
              <span :key="store.getPlayerLrc">{{ store.getPlayerLrc }}</span>
            </Transition>
          </div>
        </div>

        <!-- 传输控制 -->
        <div class="transport" v-if="store.musicIsOk">
          <button class="ctrl-btn" @click="prevSong" title="上一首">
            <go-start theme="filled" size="26" fill="#eaf6ff" />
          </button>
          <button class="ctrl-btn play-btn" @click="togglePlay" :title="store.playerState ? '暂停' : '播放'">
            <Transition name="fade" mode="out-in">
              <pause v-if="store.playerState" theme="filled" size="34" fill="#06121f" />
              <play-one v-else theme="filled" size="34" fill="#06121f" />
            </Transition>
          </button>
          <button class="ctrl-btn" @click="nextSong" title="下一首">
            <go-end theme="filled" size="26" fill="#eaf6ff" />
          </button>
        </div>
        <div class="transport-loading" v-else>
          <span class="loading-ring"></span>
          <span>正在接收来自深空的电波…</span>
        </div>

        <!-- 音量 -->
        <div class="volume-bar" v-if="store.musicIsOk">
          <span class="vol-icon">
            <volume-mute theme="filled" size="18" fill="#9fc6e0" v-if="volumeNum === 0" />
            <volume-small theme="filled" size="18" fill="#9fc6e0" v-else-if="volumeNum < 0.7" />
            <volume-notice theme="filled" size="18" fill="#9fc6e0" v-else />
          </span>
          <el-slider
            v-model="volumeNum"
            :show-tooltip="false"
            :min="0"
            :max="1"
            :step="0.01"
          />
          <span class="vol-value">{{ Math.round(volumeNum * 100) }}</span>
        </div>
      </div>

      <!-- 歌单星轨 -->
      <div class="playlist-panel">
        <div class="playlist-head">
          <div class="head-left">
            <span class="head-icon">🛰️</span>
            <span class="head-title">星轨歌单</span>
          </div>
          <span class="head-tip">点击曲目即可播放</span>
        </div>
        <div class="playlist-body">
          <Player
            ref="playerRef"
            :songServer="playerData.server"
            :songType="playerData.type"
            :songId="playerData.id"
            :volume="volumeNum"
            :listFolded="false"
            :listMaxHeight="520"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import {
  CloseOne,
  GoStart,
  GoEnd,
  PlayOne,
  Pause,
  VolumeMute,
  VolumeSmall,
  VolumeNotice,
} from "@icon-park/vue-next";
import { Icon } from "@vicons/utils";
import { mainStore } from "@/store";
import Player from "@/components/Player.vue";

const store = mainStore();

const playerRef = ref(null);
const volumeNum = ref(store.musicVolume ? store.musicVolume : 0.7);

const playerData = reactive({
  server: import.meta.env.VITE_SONG_SERVER,
  type: import.meta.env.VITE_SONG_TYPE,
  id: import.meta.env.VITE_SONG_ID,
});

const togglePlay = () => playerRef.value?.playToggle();
const prevSong = () => playerRef.value?.changeSong(0);
const nextSong = () => playerRef.value?.changeSong(1);

const closeMusic = () => {
  store.musicPageOpenState = false;
};

// 音量联动
watch(
  () => volumeNum.value,
  (value) => {
    store.musicVolume = value;
    playerRef.value?.changeVolume(value);
  },
);

const handleKeydown = (e) => {
  if (!store.musicPageOpenState) return;
  if (e.key === "Escape") closeMusic();
};

onMounted(() => {
  nextTick(() => {
    // 将播放器实例暴露给迷你控制器与全局快捷键复用
    window.$aplayer = playerRef.value;
  });
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (window.$aplayer === playerRef.value) delete window.$aplayer;
});
</script>

<style lang="scss" scoped>
.music-container {
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
      right: -6%;
      background: radial-gradient(circle, rgba(78, 205, 196, 0.4), transparent 70%);
    }
    &.nebula-2 {
      width: 360px;
      height: 360px;
      bottom: 6%;
      left: -8%;
      background: radial-gradient(circle, rgba(167, 139, 255, 0.34), transparent 70%);
      animation-delay: 5s;
    }
  }

  .star-dust {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 24% 26%, rgba(255, 255, 255, 0.7), transparent),
      radial-gradient(1px 1px at 64% 66%, rgba(255, 255, 255, 0.5), transparent),
      radial-gradient(1px 1px at 84% 28%, rgba(135, 206, 235, 0.6), transparent),
      radial-gradient(1.5px 1.5px at 44% 80%, rgba(255, 255, 255, 0.5), transparent);
    opacity: 0.55;
    animation: twinkle 5s ease-in-out infinite;
  }

  .float-note {
    position: absolute;
    font-size: 1.7rem;
    color: rgba(135, 206, 235, 0.5);
    opacity: 0.2;
    animation: noteFloat 7s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgba(78, 205, 196, 0.2));

    &.note-1 { top: 14%; left: 7%; animation-delay: 0s; }
    &.note-2 { top: 26%; right: 9%; animation-delay: 1.4s; font-size: 2.1rem; }
    &.note-3 { bottom: 30%; left: 11%; animation-delay: 2.6s; }
    &.note-4 { bottom: 18%; right: 13%; animation-delay: 0.8s; font-size: 2rem; }
    &.note-5 { top: 62%; left: 48%; animation-delay: 3.4s; }
  }
}

@keyframes nebulaDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 20px) scale(1.08); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.7; }
}

@keyframes noteFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.16; }
  50% { transform: translateY(-24px) rotate(10deg); opacity: 0.34; }
}

// 头部
.music-header {
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

    .music-title {
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

    .music-subtitle {
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

// 主体布局
.studio {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 28px 30px 0;
  align-items: stretch;
}

// 正在播放卡片
.now-playing {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 28px 30px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(20, 22, 48, 0.78), rgba(10, 12, 28, 0.86));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 70px rgba(0, 0, 8, 0.5);
  overflow: hidden;
  opacity: 0;
  animation: cardReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(78, 205, 196, 0.12), transparent 60%);
    pointer-events: none;
  }
}

// 可视化唱片
.visualizer {
  position: relative;
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  .orbit-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(135, 206, 235, 0.18);

    &.ring-outer {
      width: 240px;
      height: 240px;
      animation: ringSpin 24s linear infinite;
      border-style: dashed;
    }
    &.ring-mid {
      width: 196px;
      height: 196px;
      border-color: rgba(167, 139, 255, 0.2);
    }
  }

  .disc {
    position: relative;
    width: 168px;
    height: 168px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 50%, #1a1d3a 0%, #0a0c1c 60%, #05060f 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.6), 0 0 30px rgba(78, 205, 196, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;

    &.spinning {
      animation: discSpin 8s linear infinite;
    }

    .disc-glow {
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      background: conic-gradient(
        from 0deg,
        rgba(78, 205, 196, 0.5),
        rgba(135, 206, 235, 0.1),
        rgba(167, 139, 255, 0.5),
        rgba(78, 205, 196, 0.5)
      );
      filter: blur(6px);
      opacity: 0.4;
      z-index: -1;
    }

    .disc-grooves {
      position: absolute;
      inset: 14px;
      border-radius: 50%;
      background: repeating-radial-gradient(
        circle at 50% 50%,
        rgba(255, 255, 255, 0.045) 0,
        rgba(255, 255, 255, 0.045) 1px,
        transparent 1px,
        transparent 5px
      );
    }

    .disc-core {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4ecdc4, #a78bff);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(78, 205, 196, 0.5);

      .core-icon {
        font-size: 1.6rem;
        color: #06121f;
      }
    }

    .orbit-satellite {
      position: absolute;
      top: 6px;
      left: 50%;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #87ceeb;
      box-shadow: 0 0 10px rgba(135, 206, 235, 0.9);
    }
  }

  .equalizer {
    position: absolute;
    bottom: -2px;
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 26px;

    span {
      width: 4px;
      height: 6px;
      border-radius: 3px;
      background: linear-gradient(180deg, #87ceeb, #4ecdc4);
      opacity: 0.5;
    }

    &.active span {
      animation: eq 1s ease-in-out infinite;
    }
  }
}

@keyframes discSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ringSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes eq {
  0%, 100% { height: 6px; opacity: 0.4; }
  50% { height: 24px; opacity: 1; }
}

// 曲目信息
.track-info {
  text-align: center;
  margin-top: 18px;
  width: 100%;

  .track-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: "UnidreamLED", monospace;
    font-size: 0.66rem;
    letter-spacing: 2px;
    color: rgba(135, 206, 235, 0.6);
    margin-bottom: 10px;

    .status-led {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      transition: all 0.3s ease;

      &.on {
        background: #4ecdc4;
        box-shadow: 0 0 8px rgba(78, 205, 196, 0.8);
        animation: coordPulse 2s ease-in-out infinite;
      }
    }
  }

  .track-title {
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-artist {
    font-size: 0.86rem;
    color: rgba(255, 255, 255, 0.55);
    margin-top: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-lrc {
    margin-top: 14px;
    height: 22px;
    font-size: 0.9rem;
    color: rgba(135, 206, 235, 0.85);
    letter-spacing: 0.5px;

    span {
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
  }
}

// 传输控制
.transport {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-top: 24px;

  .ctrl-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(78, 205, 196, 0.16);
      border-color: rgba(78, 205, 196, 0.4);
      transform: translateY(-2px);
    }

    &:active { transform: scale(0.94); }

    &.play-btn {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #87ceeb, #4ecdc4);
      border: none;
      box-shadow: 0 8px 24px rgba(78, 205, 196, 0.4);

      &:hover {
        transform: translateY(-3px) scale(1.04);
        box-shadow: 0 12px 30px rgba(78, 205, 196, 0.55);
      }
    }
  }
}

.transport-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);

  .loading-ring {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(135, 206, 235, 0.25);
    border-top-color: #4ecdc4;
    border-radius: 50%;
    animation: ringSpin 0.9s linear infinite;
  }
}

// 音量
.volume-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 78%;
  margin-top: 26px;

  .vol-icon {
    display: flex;
    flex-shrink: 0;
  }

  .vol-value {
    font-family: "UnidreamLED", monospace;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    width: 28px;
    text-align: right;
    flex-shrink: 0;
  }

  .el-slider {
    --el-slider-main-bg-color: #4ecdc4;
    --el-slider-runway-bg-color: rgba(255, 255, 255, 0.12);
    --el-slider-button-size: 14px;
    margin: 0;
  }
}

// 歌单面板
.playlist-panel {
  display: flex;
  flex-direction: column;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(20, 22, 48, 0.7), rgba(10, 12, 28, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 70px rgba(0, 0, 8, 0.5);
  overflow: hidden;
  opacity: 0;
  animation: cardReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;

  .playlist-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(0, 0, 8, 0.25);

    .head-left {
      display: flex;
      align-items: center;
      gap: 9px;

      .head-icon { font-size: 1.1rem; }

      .head-title {
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 1px;
      }
    }

    .head-tip {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .playlist-body {
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: center;
    padding: 16px 14px 20px;
    overflow: hidden;
  }
}

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(26px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

// APlayer 在歌单面板中的适配：隐藏自带信息条，仅保留列表
.playlist-body :deep(.aplayer) {
  width: 100%;
  background: transparent;
  box-shadow: none;
  margin: 0;

  .aplayer-body {
    display: none !important;
  }

  .aplayer-list {
    margin-top: 0;
    height: auto !important;
    max-height: 540px;

    ol {
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, rgba(78, 205, 196, 0.5), rgba(167, 139, 255, 0.5));
        border-radius: 10px;
      }

      li {
        padding: 12px 14px;
        border-radius: 10px;
        transition: all 0.25s ease;

        &.aplayer-list-light {
          background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(167, 139, 255, 0.15)) !important;
          box-shadow: 0 0 0 1px rgba(78, 205, 196, 0.3);
        }
        .aplayer-list-title { color: #f3f9ff; }
      }
    }
  }
}

// 歌词切换动画
.lrc-fade-enter-active,
.lrc-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.lrc-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.lrc-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

// 响应式
@media (max-width: 900px) {
  .studio {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .music-header {
    padding: 36px 18px 6px;

    .title-section .music-title { font-size: 2.4rem; }
    .title-section .music-subtitle { font-size: 0.9rem; }
  }

  .studio {
    padding: 20px 16px 0;
  }

  .now-playing {
    padding: 28px 20px 24px;
  }

  .visualizer {
    width: 200px;
    height: 200px;

    .orbit-ring.ring-outer { width: 200px; height: 200px; }
    .orbit-ring.ring-mid { width: 164px; height: 164px; }
    .disc { width: 140px; height: 140px; }
  }

  .volume-bar { width: 90%; }
}
</style>
