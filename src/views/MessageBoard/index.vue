<template>
  <div class="message-board-container" @click.stop>
    <!-- 留言板头部 -->
    <div class="message-board-header">
      <div class="header-content">
        <h1 class="message-board-title">💬 留言板</h1>
        <p class="message-board-subtitle">分享你的想法和感受</p>
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
    console.log('开始初始化 Twikoo...');
    isTwikooInitialized = true;
    
    // 注入自定义样式
    twikooUtils.injectStyles(twikooStyles);
    console.log('自定义样式已注入');
    
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
    
    console.log('Twikoo 配置:', config);
    
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
    console.log('Twikoo 初始化成功');
    
  } catch (error) {
    console.error('Twikoo 初始化失败:', error);
    ElMessage({
      message: '评论系统暂时不可用，请稍后再试。',
      type: 'warning',
      duration: 3000
    });
    
    // 显示错误信息
    const twikooContainer = document.getElementById('twikoo');
    if (twikooContainer) {
      twikooContainer.innerHTML = `
        <div style="
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.8);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 16px;
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        ">
          <div style="font-size: 48px; margin-bottom: 20px;">😔</div>
          <h3 style="margin-bottom: 15px; color: #667eea;">评论系统暂时不可用</h3>
          <p style="margin-bottom: 20px; line-height: 1.6;">
            我们正在努力修复这个问题。<br>
            您可以稍后再试，或者联系网站管理员。
          </p>
          <p style="font-size: 12px; opacity: 0.6; margin-top: 10px;">
            错误信息: ${error.message}
          </p>
          <button @click="retryInit" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            重新加载
          </button>
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

// 生命周期
onMounted(() => {
  nextTick(() => {
    initTwikoo();
  });
});

onUnmounted(() => {
  twikooInstance = null;
  isTwikooInitialized = false;
});
</script>

<style lang="scss" scoped>
.message-board-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.2) 50%, rgba(102, 126, 234, 0.3) 100%);
}

.message-board-header {
  margin-bottom: 20px;
  flex-shrink: 0;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    
    .message-board-title {
      font-size: 2.5rem;
      margin-bottom: 10px;
      font-weight: bold;
      text-align: center;
      flex: 1;
      color: #667eea;
    }
    
    .message-board-subtitle {
      font-size: 1.1rem;
      opacity: 0.8;
      text-align: center;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 60px;
    }
    
    .close-btn {
      color: white;
      font-size: 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.twikoo-section {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  
  .twikoo-container {
    height: 100%;
    overflow-y: auto;
    padding-right: 10px;
    
    .twikoo-comments {
      padding: 20px 0;
    }
    
    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
      
      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .message-board-container {
    padding: 15px;
    height: 100vh;
    overflow: hidden;
  }
  
  .message-board-header {
    .header-content {
      .message-board-title {
        font-size: 2rem;
      }
    }
  }
}
</style> 