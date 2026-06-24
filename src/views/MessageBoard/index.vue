<template>
  <div class="message-board-container" @click.stop>
    <!-- 星云背景装饰 -->
    <div class="nebula-decoration">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="star-dust"></div>
      <span class="float-glyph glyph-1">💬</span>
      <span class="float-glyph glyph-2">✦</span>
      <span class="float-glyph glyph-3">✉️</span>
      <span class="float-glyph glyph-4">✧</span>
      <span class="float-glyph glyph-5">💭</span>
    </div>

    <!-- 留言板头部 -->
    <div class="message-board-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-coords">
            <span class="coord-dot"></span>
            <span class="coord-text">SIGNAL · 星际信箱 · OPEN CHANNEL</span>
          </div>
          <h1 class="message-board-title">
            <span class="title-text">留言信箱</span>
          </h1>
          <p class="message-board-subtitle">向星海深处发送一段讯息，静候回响穿越光年抵达</p>
        </div>

        <div class="close-btn" @click.stop="closeMessageBoard" title="返回">
          <Icon size="20"><CloseOne /></Icon>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-icon">📡</div>
          <div class="stat-number">∞</div>
          <div class="stat-label">无限频段</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-icon">💭</div>
          <div class="stat-number">思想</div>
          <div class="stat-label">星际交流</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-icon">✨</div>
          <div class="stat-number">灵感</div>
          <div class="stat-label">跨越光年</div>
        </div>
      </div>
    </div>

    <!-- Twikoo 评论系统 -->
    <div class="twikoo-section">
      <div class="twikoo-container">
        <div id="twikoo" class="twikoo-comments"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { CloseOne } from "@icon-park/vue-next";
import { Icon } from "@vicons/utils";
import { mainStore } from "@/store";
import { ElMessage } from 'element-plus';
import { twikooConfig, twikooStyles, twikooUtils } from '@/config/twikoo.js';

// 响应式数据
const store = mainStore();
let twikooInstance = null;
let isTwikooInitialized = false;

// 初始化 Twikoo
const initTwikoo = async () => {
  if (isTwikooInitialized) return;
  
  try {
    isTwikooInitialized = true;
    
    // 注入自定义样式
    twikooUtils.injectStyles(twikooStyles);
    
    // 配置回调函数
    const config = {
      ...twikooConfig,
      onCommentCreated: () => {
        ElMessage({
          message: '留言发表成功！',
          type: 'success'
        });
      }
    };
    
    // 等待DOM准备就绪
    await nextTick();
    
    // 检查是否已经加载了Twikoo脚本
    if (!document.querySelector('script[src*="twikoo"]')) {
      // 动态加载Twikoo脚本
      const script = document.createElement('script');
      script.src = 'https://cdn.staticfile.org/twikoo/1.6.44/twikoo.all.min.js';
      script.async = true;
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      
      // 等待脚本初始化
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 检查Twikoo是否可用
    if (typeof window.twikoo === 'undefined' || typeof window.twikoo.init !== 'function') {
      throw new Error('Twikoo 脚本加载失败或初始化失败');
    }
    
    // 初始化 Twikoo
    twikooInstance = window.twikoo.init(config);
    
  } catch (error) {
    ElMessage({
      message: '评论系统暂时不可用，请稍后再试。',
      type: 'warning',
      duration: 3000
    });
    
    // 显示错误信息
    const twikooContainer = document.getElementById('twikoo');
    if (twikooContainer) {
      twikooContainer.innerHTML = `
        <div class="error-container">
          <div class="error-content">
            <div class="error-icon">🛰️</div>
            <h3 class="error-title">信号暂时中断</h3>
            <p class="error-description">
              星际信箱正在重新校准天线。<br>
              您可以稍后再试，或者联系站长。
            </p>
            <p class="error-details">
              错误信息: ${error.message}
            </p>
            <button class="retry-btn" onclick="window.retryInit && window.retryInit()">
              重新连接
            </button>
          </div>
        </div>
      `;
    }
  }
};

// 关闭留言板
const closeMessageBoard = () => {
  store.messageBoardOpenState = false;
};

// 重试初始化
const retryInit = () => {
  isTwikooInitialized = false;
  initTwikoo();
};

// 暴露给全局
window.retryInit = retryInit;

// 生命周期
onMounted(() => {
  nextTick(() => {
    initTwikoo();
  });
});

onUnmounted(() => {
  twikooInstance = null;
  isTwikooInitialized = false;
  delete window.retryInit;
});
</script>

<style lang="scss" scoped>
.message-board-container {
  position: relative;
  padding: 0 0 60px;
  max-width: 1100px;
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
      background: radial-gradient(circle, rgba(167, 139, 255, 0.38), transparent 70%);
    }
    &.nebula-2 {
      width: 360px;
      height: 360px;
      bottom: 6%;
      left: -8%;
      background: radial-gradient(circle, rgba(78, 205, 196, 0.34), transparent 70%);
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

  .float-glyph {
    position: absolute;
    font-size: 1.6rem;
    color: rgba(135, 206, 235, 0.5);
    opacity: 0.18;
    animation: glyphFloat 7s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgba(167, 139, 255, 0.2));

    &.glyph-1 { top: 13%; left: 7%; animation-delay: 0s; font-size: 1.9rem; }
    &.glyph-2 { top: 28%; right: 9%; animation-delay: 1.4s; }
    &.glyph-3 { bottom: 30%; left: 10%; animation-delay: 2.6s; font-size: 1.8rem; }
    &.glyph-4 { bottom: 18%; right: 12%; animation-delay: 0.8s; }
    &.glyph-5 { top: 60%; left: 48%; animation-delay: 3.4s; }
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

@keyframes glyphFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.14; }
  50% { transform: translateY(-22px) rotate(8deg); opacity: 0.3; }
}

// 头部
.message-board-header {
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

    .message-board-title {
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

    .message-board-subtitle {
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

// 统计信息区域
.stats-section {
  position: relative;
  z-index: 1;
  padding: 22px 30px 6px;

  .stats-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    padding: 18px 30px;
    max-width: 620px;
    margin: 0 auto;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    backdrop-filter: blur(12px);
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 14px 36px rgba(0, 0, 8, 0.3);

    .stat-item {
      text-align: center;
      transition: transform 0.3s ease;

      &:hover { transform: translateY(-3px); }

      .stat-icon {
        font-size: 1.4rem;
        margin-bottom: 6px;
      }

      .stat-number {
        font-size: 1.1rem;
        font-weight: 700;
        background: linear-gradient(135deg, #87ceeb, #4ecdc4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .stat-label {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 3px;
        letter-spacing: 0.5px;
      }
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    }
  }
}

// Twikoo 区域
.twikoo-section {
  position: relative;
  z-index: 1;
  padding: 24px 30px 0;

  .twikoo-container {
    .twikoo-comments {
      padding: 8px 0;
    }
  }
}

// 错误容器样式
.error-container {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.9);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .error-content {
    max-width: 500px;
    margin: 0 auto;

    .error-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      animation: floatY 3s ease-in-out infinite;
    }

    .error-title {
      margin-bottom: 15px;
      color: #4ecdc4;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .error-description {
      margin-bottom: 20px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.75);
    }

    .error-details {
      font-size: 0.85rem;
      opacity: 0.5;
      margin-top: 15px;
      color: rgba(255, 255, 255, 0.6);
    }

    .retry-btn {
      background: linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(167, 139, 255, 0.3));
      border: 1px solid rgba(78, 205, 196, 0.5);
      border-radius: 30px;
      color: white;
      padding: 13px 32px;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
      transition: all 0.3s ease;
      margin-top: 20px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(78, 205, 196, 0.35);
      }
    }
  }
}

@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

// 响应式设计
@media (max-width: 768px) {
  .message-board-header {
    padding: 36px 18px 6px;

    .title-section .message-board-title { font-size: 2.4rem; }
    .title-section .message-board-subtitle { font-size: 0.9rem; padding: 0 10px; }
  }

  .stats-section {
    padding: 18px 18px 4px;

    .stats-card {
      gap: 16px;
      padding: 14px 16px;
    }
  }

  .twikoo-section {
    padding: 18px 18px 0;
  }
}

@media (max-width: 480px) {
  .stats-section .stats-card {
    gap: 12px;
    padding: 12px;

    .stat-item .stat-icon { font-size: 1.2rem; }
    .stat-divider { height: 32px; }
  }
}
</style>
