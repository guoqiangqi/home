<template>
  <div class="pan-container" @click.stop>
    <!-- 星云背景装饰 -->
    <div class="nebula-decoration">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="star-dust"></div>
      <span class="float-glyph glyph-1">☁</span>
      <span class="float-glyph glyph-2">🛰️</span>
      <span class="float-glyph glyph-3">✦</span>
      <span class="float-glyph glyph-4">📡</span>
      <span class="float-glyph glyph-5">✧</span>
    </div>

    <!-- 头部 -->
    <div class="pan-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-coords">
            <span class="coord-dot"></span>
            <span class="coord-text">ORBITAL STORAGE · 星际网盘 · SECTOR-7</span>
          </div>
          <h1 class="pan-title">
            <span class="title-text">星际网盘</span>
          </h1>
          <p class="pan-subtitle">把珍贵的文件，安放在环绕星轨的数据空间站</p>
        </div>

        <div class="close-btn" @click.stop="closePan" title="返回">
          <Icon size="20"><CloseOne /></Icon>
        </div>
      </div>
    </div>

    <!-- 空间站存储状态 -->
    <div class="station-card">
      <div class="capacity">
        <svg class="capacity-ring" viewBox="0 0 120 120">
          <circle class="ring-bg" cx="60" cy="60" r="52" />
          <circle
            class="ring-fg"
            cx="60"
            cy="60"
            r="52"
            :stroke-dasharray="ringCircumference"
            :stroke-dashoffset="ringOffset"
          />
        </svg>
        <div class="capacity-text">
          <span class="cap-percent">{{ usedPercent }}<small>%</small></span>
          <span class="cap-label">已用空间</span>
        </div>
      </div>

      <div class="station-info">
        <div class="station-name">
          <span class="name-icon">🛰️</span>
          <span class="name-text">{{ stationName }}</span>
          <span class="online-tag">
            <span class="online-dot"></span> ONLINE
          </span>
        </div>
        <div class="capacity-bar">
          <div class="bar-fill" :style="{ width: usedPercent + '%' }"></div>
        </div>
        <div class="capacity-meta">
          <span>{{ usedSpace }} GB 已用</span>
          <span class="meta-divider">/</span>
          <span>{{ totalSpace }} GB 总容量</span>
        </div>
        <div class="station-stats">
          <div class="stat-pill">
            <span class="pill-num">{{ files.length }}</span>
            <span class="pill-label">在轨文件</span>
          </div>
          <div class="stat-pill">
            <span class="pill-num">{{ nodes }}</span>
            <span class="pill-label">同步节点</span>
          </div>
          <div class="stat-pill">
            <span class="pill-num">{{ uptime }}<small>%</small></span>
            <span class="pill-label">在线率</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="category-bar">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="cat-chip"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        <span class="chip-icon">{{ cat.icon }}</span>
        <span class="chip-label">{{ cat.label }}</span>
        <span class="chip-count">{{ countOf(cat.key) }}</span>
      </button>
    </div>

    <!-- 文件网格 -->
    <div class="file-grid" v-if="filteredFiles.length">
      <a
        v-for="(file, index) in filteredFiles"
        :key="file.name"
        class="file-card"
        :href="file.link || panLink"
        target="_blank"
        rel="noopener"
        :style="{ animationDelay: index * 0.06 + 's' }"
      >
        <div class="card-shine"></div>
        <div class="file-icon" :style="{ background: typeColor(file.type) }">
          <span class="ext">{{ extOf(file.name) }}</span>
        </div>
        <div class="file-meta">
          <h3 class="file-name">{{ file.name }}</h3>
          <p class="file-desc">{{ file.desc }}</p>
          <div class="file-foot">
            <span class="file-size">{{ file.size }}</span>
            <span class="file-date">{{ file.date }}</span>
          </div>
        </div>
        <div class="file-action">
          <Icon size="16"><DownloadOne /></Icon>
        </div>
      </a>
    </div>
    <div class="no-files" v-else>
      <div class="no-files-icon">🛸</div>
      <h3>该扇区暂无文件</h3>
      <p>切换其它分类继续探索</p>
    </div>

    <!-- 进入完整网盘 -->
    <div class="enter-section">
      <a class="enter-btn" :href="panLink" target="_blank" rel="noopener">
        <span class="enter-icon">🚀</span>
        <span>进入完整网盘空间</span>
        <span class="enter-arrow">→</span>
      </a>
      <p class="enter-hint">所有文件均托管于 {{ panHost }} · 安全加密传输</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { CloseOne, DownloadOne } from "@icon-park/vue-next";
import { Icon } from "@vicons/utils";
import { mainStore } from "@/store";
import panConfig from "@/assets/panFiles.json";

const store = mainStore();

// 网盘地址：优先读环境变量 VITE_PAN_URL，其次读取配置文件
const panLink = import.meta.env.VITE_PAN_URL || panConfig.link;

// 空间站信息（来自配置文件 src/assets/panFiles.json）
const stationName = panConfig.stationName || "数据空间站";
const totalSpace = panConfig.totalSpace ?? 1024;
const usedSpace = panConfig.usedSpace ?? 0;
const nodes = panConfig.nodes ?? 1;
const uptime = panConfig.uptime ?? "99.9";
const usedPercent = totalSpace ? Math.round((usedSpace / totalSpace) * 100) : 0;

// 从网盘地址中提取域名用于展示
const panHost = (() => {
  try {
    return new URL(panLink).host;
  } catch {
    return panLink;
  }
})();

// 容量环
const ringRadius = 52;
const ringCircumference = 2 * Math.PI * ringRadius;
const ringOffset = computed(() => ringCircumference * (1 - usedPercent / 100));

// 分类
const categories = [
  { key: "all", label: "全部", icon: "✦" },
  { key: "doc", label: "文档", icon: "📄" },
  { key: "image", label: "图片", icon: "🖼️" },
  { key: "video", label: "视频", icon: "🎬" },
  { key: "audio", label: "音乐", icon: "🎵" },
  { key: "archive", label: "压缩包", icon: "🗜️" },
  { key: "app", label: "应用", icon: "🧩" },
];

const activeCategory = ref("all");

// 文件列表（来自配置文件 src/assets/panFiles.json）
const files = ref(panConfig.files || []);

const filteredFiles = computed(() => {
  if (activeCategory.value === "all") return files.value;
  return files.value.filter((f) => f.type === activeCategory.value);
});

const countOf = (key) => {
  if (key === "all") return files.value.length;
  return files.value.filter((f) => f.type === key).length;
};

const extOf = (name) => {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
};

const typeColor = (type) => {
  const map = {
    doc: "linear-gradient(135deg, #4ecdc4, #2d9b94)",
    image: "linear-gradient(135deg, #87ceeb, #5a8fd6)",
    video: "linear-gradient(135deg, #a78bff, #6f5acb)",
    audio: "linear-gradient(135deg, #4ecdc4, #87ceeb)",
    archive: "linear-gradient(135deg, #f5a96b, #d97e3f)",
    app: "linear-gradient(135deg, #ff8fa3, #d65f7a)",
  };
  return map[type] || "linear-gradient(135deg, #4ecdc4, #a78bff)";
};

const closePan = () => {
  store.panOpenState = false;
};

const handleKeydown = (e) => {
  if (!store.panOpenState) return;
  if (e.key === "Escape") closePan();
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style lang="scss" scoped>
.pan-container {
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
      background: radial-gradient(circle, rgba(135, 206, 235, 0.4), transparent 70%);
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

  .float-glyph {
    position: absolute;
    font-size: 1.7rem;
    color: rgba(135, 206, 235, 0.5);
    opacity: 0.2;
    animation: glyphFloat 7s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgba(78, 205, 196, 0.2));

    &.glyph-1 { top: 13%; right: 8%; animation-delay: 0s; font-size: 2rem; }
    &.glyph-2 { top: 30%; left: 6%; animation-delay: 1.4s; }
    &.glyph-3 { bottom: 32%; right: 11%; animation-delay: 2.6s; }
    &.glyph-4 { bottom: 16%; left: 12%; animation-delay: 0.8s; font-size: 1.9rem; }
    &.glyph-5 { top: 58%; left: 46%; animation-delay: 3.4s; }
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

@keyframes glyphFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.16; }
  50% { transform: translateY(-22px) rotate(8deg); opacity: 0.32; }
}

// 头部
.pan-header {
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

    .pan-title {
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

    .pan-subtitle {
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

// 空间站存储卡片
.station-card {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 36px;
  margin: 24px 30px 0;
  padding: 26px 30px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 40px rgba(0, 0, 8, 0.35);
  opacity: 0;
  animation: cardReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;

  .capacity {
    position: relative;
    width: 120px;
    height: 120px;
    flex-shrink: 0;

    .capacity-ring {
      width: 120px;
      height: 120px;
      transform: rotate(-90deg);

      .ring-bg {
        fill: none;
        stroke: rgba(255, 255, 255, 0.08);
        stroke-width: 8;
      }

      .ring-fg {
        fill: none;
        stroke: #4ecdc4;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        filter: drop-shadow(0 0 6px rgba(78, 205, 196, 0.6));
      }
    }

    .capacity-text {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .cap-percent {
        font-size: 1.9rem;
        font-weight: 800;
        font-family: "UnidreamLED", monospace;
        background: linear-gradient(135deg, #87ceeb, #4ecdc4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;

        small { font-size: 0.9rem; }
      }

      .cap-label {
        font-size: 0.68rem;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 2px;
      }
    }
  }

  .station-info {
    flex: 1;
    min-width: 0;

    .station-name {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;

      .name-icon { font-size: 1.2rem; }

      .name-text {
        font-size: 1.15rem;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .online-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-family: "UnidreamLED", monospace;
        font-size: 0.62rem;
        letter-spacing: 1px;
        color: #4ecdc4;
        padding: 3px 9px;
        border-radius: 20px;
        border: 1px solid rgba(78, 205, 196, 0.3);
        background: rgba(78, 205, 196, 0.08);

        .online-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ecdc4;
          box-shadow: 0 0 6px rgba(78, 205, 196, 0.8);
          animation: coordPulse 2s ease-in-out infinite;
        }
      }
    }

    .capacity-bar {
      width: 100%;
      height: 8px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;

      .bar-fill {
        height: 100%;
        border-radius: 8px;
        background: linear-gradient(90deg, #87ceeb, #4ecdc4, #a78bff);
        box-shadow: 0 0 12px rgba(78, 205, 196, 0.5);
        transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
      }
    }

    .capacity-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);

      .meta-divider { opacity: 0.4; }
    }

    .station-stats {
      display: flex;
      gap: 12px;
      margin-top: 18px;

      .stat-pill {
        flex: 1;
        text-align: center;
        padding: 10px 8px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.07);

        .pill-num {
          display: block;
          font-size: 1.2rem;
          font-weight: 700;
          font-family: "UnidreamLED", monospace;
          color: #87ceeb;

          small { font-size: 0.7rem; }
        }

        .pill-label {
          display: block;
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 3px;
        }
      }
    }
  }
}

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(26px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

// 分类筛选
.category-bar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 24px 30px 6px;

  .cat-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;

    .chip-count {
      font-family: "UnidreamLED", monospace;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.06);
      padding: 1px 7px;
      border-radius: 10px;
    }

    &:hover {
      color: #fff;
      transform: translateY(-2px);
      border-color: rgba(78, 205, 196, 0.3);
    }

    &.active {
      background: linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(102, 126, 234, 0.3));
      border-color: rgba(78, 205, 196, 0.6);
      color: #fff;
      box-shadow: 0 0 14px rgba(78, 205, 196, 0.25);

      .chip-count {
        color: #fff;
        background: rgba(255, 255, 255, 0.18);
      }
    }
  }
}

// 文件网格
.file-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
  padding: 18px 30px 0;
}

.file-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  overflow: hidden;
  opacity: 0;
  animation: cardReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, box-shadow 0.35s ease;

  .card-shine {
    position: absolute;
    top: 0;
    left: -60%;
    width: 50%;
    height: 100%;
    z-index: 2;
    background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.12), transparent);
    transform: translateX(0) skewX(-18deg);
    transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(78, 205, 196, 0.3);
    box-shadow: 0 16px 40px rgba(0, 0, 8, 0.5), 0 0 24px rgba(78, 205, 196, 0.1);

    .card-shine { transform: translateX(420%) skewX(-18deg); }
    .file-action {
      background: rgba(78, 205, 196, 0.25);
      border-color: rgba(78, 205, 196, 0.5);
      color: #fff;
    }
  }

  .file-icon {
    flex-shrink: 0;
    width: 54px;
    height: 54px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px rgba(0, 0, 8, 0.35);

    .ext {
      font-family: "UnidreamLED", monospace;
      font-size: 0.72rem;
      font-weight: 700;
      color: #06121f;
      letter-spacing: 0.5px;
    }
  }

  .file-meta {
    flex: 1;
    min-width: 0;

    .file-name {
      font-size: 0.98rem;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-desc {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.55);
      margin: 4px 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 9px;
      font-family: "UnidreamLED", monospace;
      font-size: 0.72rem;
      color: rgba(135, 206, 235, 0.7);

      .file-date { color: rgba(255, 255, 255, 0.4); }
    }
  }

  .file-action {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
  }
}

// 空状态
.no-files {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 70px 20px;

  .no-files-icon {
    font-size: 4rem;
    margin-bottom: 18px;
    animation: floatY 4s ease-in-out infinite;
  }

  h3 {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 8px;
  }

  p { color: rgba(255, 255, 255, 0.5); }
}

@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

// 进入完整网盘
.enter-section {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 40px;
  padding: 0 30px;

  .enter-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 15px 36px;
    border-radius: 40px;
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.28), rgba(167, 139, 255, 0.28));
    border: 1px solid rgba(78, 205, 196, 0.4);
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 1px;
    backdrop-filter: blur(10px);
    transition: all 0.35s ease;

    .enter-icon { font-size: 1.2rem; }
    .enter-arrow { transition: transform 0.3s ease; }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 14px 36px rgba(78, 205, 196, 0.35);
      border-color: rgba(78, 205, 196, 0.7);

      .enter-arrow { transform: translateX(5px); }
    }
  }

  .enter-hint {
    margin-top: 14px;
    font-size: 0.76rem;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.5px;
  }
}

// 响应式
@media (max-width: 768px) {
  .pan-header {
    padding: 36px 18px 6px;

    .title-section .pan-title { font-size: 2.4rem; }
    .title-section .pan-subtitle { font-size: 0.9rem; }
  }

  .station-card {
    flex-direction: column;
    gap: 22px;
    margin: 20px 18px 0;
    padding: 24px 20px;
  }

  .category-bar {
    padding: 20px 18px 4px;
  }

  .file-grid {
    grid-template-columns: 1fr;
    padding: 16px 18px 0;
  }

  .enter-section { padding: 0 18px; }
}
</style>
