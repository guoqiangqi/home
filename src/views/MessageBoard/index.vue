<template>
  <div class="message-board-container" @click.stop>
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
      <div class="gradient-overlay"></div>
    </div>

    <!-- 留言板头部 -->
    <div class="message-board-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-wrapper">
            <h1 class="message-board-title">
              <span class="title-icon">💬</span>
              <span class="title-text">留言板</span>
            </h1>
            <div class="title-underline"></div>
          </div>
          <p class="message-board-subtitle">分享你的想法和感受，让这里成为思想的交汇点</p>
        </div>
        
        <el-button 
          class="close-btn"
          @click="closeMessageBoard"
          type="text"
        >
          <Icon size="20">
            <CloseOne />
          </Icon>
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-number">∞</div>
          <div class="stat-label">无限可能</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">💭</div>
          <div class="stat-label">思想交流</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">🌟</div>
          <div class="stat-label">灵感碰撞</div>
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
            <div class="error-icon">😔</div>
            <h3 class="error-title">评论系统暂时不可用</h3>
            <p class="error-description">
              我们正在努力修复这个问题。<br>
              您可以稍后再试，或者联系网站管理员。
            </p>
            <p class="error-details">
              错误信息: ${error.message}
            </p>
            <button class="retry-btn" onclick="window.retryInit && window.retryInit()">
              重新加载
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
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
  overflow: hidden;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.15) 0%, 
    rgba(118, 75, 162, 0.1) 25%, 
    rgba(102, 126, 234, 0.08) 50%, 
    rgba(118, 75, 162, 0.12) 75%, 
    rgba(102, 126, 234, 0.15) 100%
  );
}

// Twikoo 评论样式
:deep(.tk-comment) {
  // backdrop-filter: blur(666px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px;
}

// 背景装饰
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  
  .floating-orb {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.2));
    backdrop-filter: blur(10px);
    animation: float 6s ease-in-out infinite;
    
    &.orb-1 {
      width: 120px;
      height: 120px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }
    
    &.orb-2 {
      width: 80px;
      height: 80px;
      top: 20%;
      right: 15%;
      animation-delay: 2s;
    }
    
    &.orb-3 {
      width: 100px;
      height: 100px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }
  }
  
  .gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.message-board-header {
  position: relative;
  z-index: 1;
  padding: 40px 30px 20px;
  flex-shrink: 0;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .title-section {
      flex: 1;
      text-align: center;
      
      .title-wrapper {
        display: inline-block;
        position: relative;
        margin-bottom: 15px;
        
        .message-board-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          
          .title-icon {
            font-size: 3rem;
            animation: pulse 2s ease-in-out infinite;
          }
          
          .title-text {
            position: relative;
            
            &::after {
              content: '';
              position: absolute;
              bottom: -5px;
              left: 0;
              width: 100%;
              height: 2px;
              background: linear-gradient(90deg, transparent, #667eea, transparent);
              transform: scaleX(0);
              animation: titleUnderline 2s ease-in-out infinite;
            }
          }
        }
        
        .title-underline {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #667eea, #764ba2, #667eea, transparent);
          border-radius: 2px;
          opacity: 0.6;
        }
      }
      
      .message-board-subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
        margin: 0;
        line-height: 1.6;
        font-weight: 300;
        color: rgba(255, 255, 255, 0.9);
        max-width: 600px;
        margin: 0 auto;
      }
    }
    
    .close-btn {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }
    }
  }
}

// 统计信息区域
.stats-section {
  position: relative;
  z-index: 1;
  padding: 0 30px 15px;
  flex-shrink: 0;
  
  .stats-card {
    display: flex;
    justify-content: center;
    gap: 50px;
    padding: 10px 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(15px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .stat-item {
      text-align: center;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
      }
      
      .stat-number {
        font-size: 1.6rem;
        font-weight: bold;
        margin-bottom: 3px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .stat-label {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
      }
    }
  }
}

.twikoo-section {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  position: relative;
  z-index: 1;
  padding: 0 30px 30px;
  
  .twikoo-container {
    height: 100%;
    overflow-y: auto;
    padding-right: 10px;
    
    .twikoo-comments {
      padding: 20px 0;
    }
    
    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6));
      border-radius: 4px;
      
      &:hover {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
      }
    }
  }
}

// 错误容器样式
.error-container {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.9);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .error-content {
    max-width: 500px;
    margin: 0 auto;
    
    .error-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      animation: bounce 2s ease-in-out infinite;
    }
    
    .error-title {
      margin-bottom: 15px;
      color: #667eea;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .error-description {
      margin-bottom: 20px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .error-details {
      font-size: 0.85rem;
      opacity: 0.6;
      margin-top: 15px;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .retry-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
      border: none;
      border-radius: 12px;
      color: white;
      padding: 15px 30px;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
      transition: all 0.3s ease;
      margin-top: 20px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
    }
  }
}

// 动画定义
@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes titleUnderline {
  0%, 100% {
    transform: scaleX(0);
  }
  50% {
    transform: scaleX(1);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .message-board-container {
    padding: 0;
  }
  
  .message-board-header {
    padding: 30px 20px 15px;
    
    .header-content {
      .title-section {
        .title-wrapper {
          .message-board-title {
            font-size: 2.5rem;
            flex-direction: column;
            gap: 10px;
            
            .title-icon {
              font-size: 2.5rem;
            }
          }
        }
        
        .message-board-subtitle {
          font-size: 1rem;
          padding: 0 10px;
        }
      }
      
      .close-btn {
        width: 45px;
        height: 45px;
      }
    }
  }
  
  .stats-section {
    padding: 0 20px 10px;
    
    .stats-card {
      gap: 25px;
      padding: 8px 15px;
      
      .stat-item {
        .stat-number {
          font-size: 1.5rem;
        }
        
        .stat-label {
          font-size: 0.65rem;
        }
      }
    }
  }
  
  .twikoo-section {
    padding: 0 20px 20px;
  }
}

@media (max-width: 480px) {
  .stats-section {
    .stats-card {
      flex-direction: column;
      gap: 12px;
      padding: 6px 12px;
      
      .stat-item {
        .stat-number {
          font-size: 1.4rem;
        }
        
        .stat-label {
          font-size: 0.6rem;
        }
      }
    }
  }
}
</style> 