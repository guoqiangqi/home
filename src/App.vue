<template>
  <!-- 太空背景 -->
  <SpaceBackground v-if="!showMainPage" />
  
  <!-- 加载（仅首次进入） -->
  <Loading v-if="!store.splashDone" />
  
  <!-- 壁纸 -->
  <Background ref="backgroundRef" @loadComplete="loadComplete" />
  
  <!-- 主界面 -->
  <Transition name="fade" mode="out-in">
    <main id="main" :class="{ 'space-active': !showMainPage }" v-if="store.imgLoadStatus">
      <!-- 太空欢迎页面 -->
      <div v-if="!showMainPage" class="space-welcome">
        <div class="space-content">
          <div class="space-status">
            <span class="status-dot"></span>
            <span class="status-text">SYSTEM ONLINE</span>
            <span class="status-divider">|</span>
            <span class="status-coords">{{ currentCoords }}</span>
          </div>
        </div>

        <div class="space-mission">
          <div class="space-elements">
            <span class="space-element el-1">🚀</span>
            <span class="space-element el-2">🛸</span>
            <span class="space-element el-3">🛰️</span>
            <span class="space-element el-4">☄️</span>
            <span class="space-element el-5">🌌</span>
          </div>
        </div>

        <div class="scroll-hint">
          <div class="scroll-text">向下滚动开始探索</div>
          <div class="scroll-arrow-container">
            <div class="scroll-arrow"></div>
            <div class="scroll-arrow scroll-arrow-2"></div>
          </div>
        </div>

        <div class="scroll-area"></div>
      </div>
      
      <!-- 主内容页面 -->
      <div v-else class="main-page" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
        <div class="container" v-show="!store.backgroundShow">
          <section class="all" v-show="!store.setOpenState && !store.albumOpenState && !store.messageBoardOpenState">
            <MainLeft />
            <MainRight v-show="!store.boxOpenState" />
            <Box v-show="store.boxOpenState" />
          </section>
          <section class="more" v-show="store.setOpenState" @click="store.setOpenState = false">
            <MoreSet />
          </section>
          <section class="album" v-show="store.albumOpenState" @click="store.albumOpenState = false">
            <Album />
          </section>
          <section class="message-board" v-show="store.messageBoardOpenState" @click="store.messageBoardOpenState = false">
            <MessageBoard />
          </section>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <Icon
          class="menu"
          size="24"
          v-show="!store.backgroundShow"
          @click="store.mobileOpenState = !store.mobileOpenState"
        >
          <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
        </Icon>
        
        <!-- 页脚 -->
        <Transition name="fade" mode="out-in">
          <Footer class="f-ter" v-show="!store.backgroundShow && !store.setOpenState" />
        </Transition>
        
        <!-- 返回提示 -->
        <div class="return-hint" v-show="showMainPage && !store.albumOpenState && !store.messageBoardOpenState">
          <div class="hint-content">
            <div class="hint-icon">↑</div>
            <p>向上滑动返回太空页面</p>
          </div>
        </div>
        
        <!-- 壁纸选择器 -->
        <WallpaperSelector 
          v-show="!store.backgroundShow && !store.setOpenState" 
          :currentLocalIndex="backgroundRef?.currentLocalBgIndex || 1"
          @updateLocalIndex="handleUpdateLocalIndex"
        />
      </div>
    </main>
  </Transition>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { helloInit, checkDays } from "@/utils/getTime.js";
import { HamburgerButton, CloseSmall } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { Icon } from "@vicons/utils";
import Loading from "@/components/Loading.vue";
import MainLeft from "@/views/Main/Left.vue";
import MainRight from "@/views/Main/Right.vue";
import Background from "@/components/Background.vue";
import Footer from "@/components/Footer.vue";
import Box from "@/views/Box/index.vue";
import MoreSet from "@/views/MoreSet/index.vue";
import Album from "@/views/Album/index.vue";
import MessageBoard from "@/views/MessageBoard/index.vue";
import SpaceBackground from "@/components/SpaceBackground.vue";
import WallpaperSelector from "@/components/WallpaperSelector.vue";
import cursorInit from "@/utils/cursor.js";
import config from "@/../package.json";

const store = mainStore();
const showMainPage = ref(false);
const backgroundRef = ref(null);

const currentCoords = ref("RA 14h 27m 04s · DEC +02° 12′ 47″");

const updateCoords = () => {
  const ra = (Math.random() * 24).toFixed(0).padStart(2, "0");
  const raM = (Math.random() * 60).toFixed(0).padStart(2, "0");
  const raS = (Math.random() * 60).toFixed(0).padStart(2, "0");
  const dec = (Math.random() * 90).toFixed(0).padStart(2, "0");
  const decM = (Math.random() * 60).toFixed(0).padStart(2, "0");
  const decS = (Math.random() * 60).toFixed(0).padStart(2, "0");
  const sign = Math.random() > 0.5 ? "+" : "-";
  currentCoords.value = `RA ${ra}h ${raM}m ${raS}s · DEC ${sign}${dec}° ${decM}′ ${decS}″`;
};

let coordsInterval = null;

// 页面宽度
const getWidth = () => {
  store.setInnerWidth(window.innerWidth);
};

// 加载完成事件
const loadComplete = () => {
  nextTick(() => {
    // 欢迎提示
    helloInit();
    // 默哀模式
    checkDays();
  });
};

// 监听宽度变化
watch(
  () => store.innerWidth,
  (value) => {
    if (value < 721) {
      store.boxOpenState = false;
      store.setOpenState = false;
    }
  },
);

// 触摸事件相关变量
let touchStartY = 0;
let touchEndY = 0;

// 监听滚动事件
const handleScroll = () => {
  const currentScrollY = window.scrollY;
  
  // 向下滚动进入主页面
  if (currentScrollY > 50 && !showMainPage.value) {
    showMainPage.value = true;
    window.scrollTo(0, 0);
    // 进入主页面时自动切换背景
    changeBackgroundOnPageEnter();
  }
};

// 鼠标滚轮事件
const handleWheel = (event) => {
  // 如果相册页面或留言板页面打开，不响应滚轮返回
  if (store.albumOpenState || store.messageBoardOpenState) return;
  
  if (showMainPage.value && window.scrollY <= 0 && event.deltaY < 0) {
    // 向上滚动且在主页面顶部时，返回太空页面
    showMainPage.value = false;
    window.scrollTo(0, 0);
  }
};

// 触摸开始事件
const handleTouchStart = (event) => {
  touchStartY = event.touches[0].clientY;
};

// 触摸结束事件
const handleTouchEnd = (event) => {
  touchEndY = event.changedTouches[0].clientY;
  const touchDiff = touchStartY - touchEndY;
  
  // 如果相册页面打开，不响应触摸返回
  if (store.albumOpenState) return;
  
  // 向上滑动返回太空页面（滑动距离大于50px）
  if (touchDiff > 50 && showMainPage.value) {
    showMainPage.value = false;
    window.scrollTo(0, 0);
  }
};

// 进入主页面时自动切换背景
const changeBackgroundOnPageEnter = () => {
  // 确保使用本地壁纸类型
  store.coverType = "0";
  
  // 切换到下一个本地壁纸
  if (backgroundRef.value) {
    backgroundRef.value.nextLocalBackground();
    
    // 显示切换提示
    ElMessage({
      message: `已切换到壁纸 ${backgroundRef.value.currentLocalBgIndex}`,
      grouping: true,
      duration: 2000,
    });
  }
};

// 处理壁纸选择器更新本地壁纸索引
const handleUpdateLocalIndex = (index) => {
  if (backgroundRef.value) {
    backgroundRef.value.setLocalBackgroundIndex(index);
  }
};

onMounted(() => {
  updateCoords();
  coordsInterval = setInterval(updateCoords, 8000);

  cursorInit();

  // 屏蔽右键
  document.oncontextmenu = () => {
    ElMessage({
      message: "为了浏览体验，本站禁用右键",
      grouping: true,
      duration: 2000,
    });
    return false;
  };

  // 鼠标中键事件
  window.addEventListener("mousedown", (event) => {
    if (event.button == 1) {
      store.backgroundShow = !store.backgroundShow;
      ElMessage({
        message: `已${store.backgroundShow ? "开启" : "退出"}壁纸展示状态`,
        grouping: true,
      });
    }
  });

  // 监听当前页面宽度
  getWidth();
  window.addEventListener("resize", getWidth);
  
  // 监听滚动事件
  window.addEventListener("scroll", handleScroll);
  
  // 监听鼠标滚轮事件
  window.addEventListener("wheel", handleWheel);
  
  // 监听触摸事件
  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("touchend", handleTouchEnd);
  


  // 控制台输出
  const styleTitle1 = "font-size: 20px;font-weight: 600;color: rgb(244,167,89);";
  const styleTitle2 = "font-size:12px;color: rgb(244,167,89);";
  const styleContent = "color: rgb(30,152,255);";
  const title1 = "心想事橙";
  const title2 = `QC`;
  const content = `\n\n版本: ${config.version}\n主页: ${config.home}\nGithub: ${config.github}`;
  console.info(`%c${title1} %c${title2} %c${content}`, styleTitle1, styleTitle2, styleContent);
});

onBeforeUnmount(() => {
  if (coordsInterval) clearInterval(coordsInterval);
  window.removeEventListener("resize", getWidth);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("wheel", handleWheel);
  window.removeEventListener("touchstart", handleTouchStart);
  window.removeEventListener("touchend", handleTouchEnd);
});


</script>

<style lang="scss" scoped>
#main {
  position: relative;
  width: 100%;
  min-height: 100vh;
  transform: scale(1.2);
  transition: transform 0.3s;
  animation: fade-blur-main-in 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: 0.5s;

  &.space-active {
    transform: scale(1);
    animation: spaceFadeIn 1.2s ease-out forwards;
  }
}

// 太空欢迎页面
.space-welcome {
  position: relative;
  width: 100%;
  min-height: 200vh;
  z-index: 10;
}

  .space-content {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    z-index: 11;
    pointer-events: none;

  .space-status {
    position: fixed;
    top: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.7rem;
    letter-spacing: 1.5px;
    color: rgba(135, 206, 235, 0.45);
    font-family: "UnidreamLED", monospace;
    animation: statusFade 6s ease-in-out infinite;
    white-space: nowrap;

    .status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: rgba(78, 205, 196, 0.7);
      box-shadow: 0 0 6px rgba(78, 205, 196, 0.5);
      animation: statusPulse 3s ease-in-out infinite;
    }

    .status-divider {
      opacity: 0.25;
    }

    .status-coords {
      opacity: 0.4;
      font-size: 0.65rem;
    }
  }

}

.space-mission {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9;

  .space-elements {
    position: absolute;
    inset: 0;

    .space-element {
      position: absolute;
      font-size: 1.6rem;
      animation: elementFloat 6s ease-in-out infinite;
      opacity: 0.18;
      filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.08));

      &.el-1 { top: 6%; left: 2%; animation-delay: 0s; }
      &.el-2 { top: 18%; right: 2%; animation-delay: 1.2s; }
      &.el-3 { top: 72%; left: 1%; animation-delay: 2.4s; }
      &.el-4 { bottom: 12%; right: 2%; animation-delay: 0.6s; }
      &.el-5 { bottom: 28%; left: 3%; animation-delay: 1.8s; }
    }
  }
}

.scroll-hint {
  position: fixed;
  bottom: 1.2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  animation: hintFade 5s ease-in-out infinite;

  .scroll-text {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 0.5rem;
    letter-spacing: 0.5px;
    font-weight: 400;
  }

  .scroll-arrow-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .scroll-arrow {
    width: 8px;
    height: 8px;
    border-right: 1.5px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1.5px solid rgba(255, 255, 255, 0.2);
    transform: rotate(45deg);
    animation: hintBounce 3s ease-in-out infinite;

    &.scroll-arrow-2 {
      width: 6px;
      height: 6px;
      border-right: 1px solid rgba(135, 206, 235, 0.15);
      border-bottom: 1px solid rgba(135, 206, 235, 0.15);
      animation-delay: 0.4s;
    }
  }
}

.scroll-area {
  height: 100vh;
  width: 100%;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(45deg); }
  40% { transform: translateY(-10px) rotate(45deg); }
  60% { transform: translateY(-6px) rotate(45deg); }
}

@keyframes textGlow {
  0%, 100% { 
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.35);
    transform: scale(1);
  }
  50% { 
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 16px rgba(135, 206, 235, 0.35);
    transform: scale(1.02);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceUp {
  0%, 20%, 50%, 80%, 100% { 
    transform: translateY(0); 
  }
  40% { 
    transform: translateY(-4px); 
  }
  60% { 
    transform: translateY(-2px); 
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: scale(1.2);
    opacity: 0.6;
  }
}

@keyframes hintFade {
  0%, 100% { opacity: 0.18; }
  50% { opacity: 0.42; }
}

@keyframes hintBounce {
  0%, 100% { transform: translateY(0) rotate(45deg); }
  50% { transform: translateY(3px) rotate(45deg); }
}


@keyframes statusFade {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.65; }
}

@keyframes statusPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes spaceFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes elementFloat {
  0%, 100% { 
    transform: translateY(0px) scale(1) rotate(0deg); 
  }
  25% { 
    transform: translateY(-12px) scale(1.15) rotate(2deg); 
  }
  50% { 
    transform: translateY(-20px) scale(1.2) rotate(0deg); 
  }
  75% { 
    transform: translateY(-12px) scale(1.15) rotate(-2deg); 
  }
}

// 响应式设计
@media (max-width: 768px) {
  .space-content {
    padding: 0 1rem;

    .space-status {
      top: 1rem;
      font-size: 0.6rem;

      .status-coords {
        display: none;
      }
    }

    .space-features {
      flex-direction: column;
      gap: 0.5rem;
      
      .feature-item {
        padding: 0.5rem;
        
        .feature-icon {
          font-size: 2rem;
        }
        
        .feature-text {
          font-size: 0.8rem;
        }
      }
    }
    
    .space-mission .space-elements .space-element {
      font-size: 1.3rem;
      opacity: 0.22;
    }
  }

  .scroll-hint {
    bottom: 0.8rem;

    .scroll-text {
      font-size: 0.7rem;
    }
  }
}

// 主内容页面
.main-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  .container {
    width: 100%;
    min-height: 100vh;
    margin: 0 auto;
    padding: 0 0.5vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    .all {
      width: 100%;
      height: 100%;
      padding: 0 0.75rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    
    .more {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #00000080;
      backdrop-filter: blur(20px);
      z-index: 2;
      animation: fade 0.5s;
    }
    
    .album {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #00000080;
      backdrop-filter: blur(20px);
      z-index: 2;
      animation: fade 0.5s;
      overflow-y: auto;
    }
    
    .message-board {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #00000080;
      backdrop-filter: blur(20px);
      z-index: 2;
      animation: fade 0.5s;
      overflow-y: auto;
    }
    
    @media (max-width: 1200px) {
      padding: 0 2vw;
    }
  }
  
  .menu {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 84%;
    left: calc(50% - 28px);
    width: 56px;
    height: 34px;
    background: rgb(0 0 0 / 20%);
    backdrop-filter: blur(10px);
    border-radius: 6px;
    transition: transform 0.3s;
    animation: fade 0.5s;
    &:active {
      transform: scale(0.95);
    }
    .i-icon {
      transform: translateY(2px);
    }
    @media (min-width: 721px) {
      display: none;
    }
  }
  
  @media (max-height: 720px) {
    overflow-y: auto;
    overflow-x: hidden;
    .container {
      height: 721px;
      .more {
        height: 721px;
        width: calc(100% + 6px);
      }
      @media (min-width: 391px) {
        padding-left: 0.7vw;
        padding-right: 0.25vw;
        @media (max-width: 1200px) {
          padding-left: 2.3vw;
          padding-right: 1.75vw;
        }
        @media (max-width: 1100px) {
          padding-left: 2vw;
          padding-right: calc(2vw - 6px);
        }
        @media (max-width: 992px) {
          padding-left: 2.3vw;
          padding-right: 1.7vw;
        }
        @media (max-width: 900px) {
          padding-left: 2vw;
          padding-right: calc(2vw - 6px);
        }
      }
    }
    .menu {
      top: 605.64px;
      left: 170.5px;
      @media (min-width: 391px) {
        left: calc(50% - 25px);
      }
    }
    .f-ter {
      top: 675px;
      @media (min-width: 391px) {
        padding-left: 6px;
      }
    }
  }
  
  @media (max-width: 390px) {
    overflow-x: auto;
    .container {
      width: 391px;
    }
    .menu {
      left: 167.5px;
    }
    .f-ter {
      width: 391px;
    }
    @media (min-height: 721px) {
      overflow-y: auto;
    }
  }
  
  .return-hint {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 13px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    animation: fadeInUp 0.6s ease-out 2s both;
    opacity: 0.7;
    
    &:hover {
      background: rgba(0, 0, 0, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
      opacity: 0.9;
    }
    
    @media (max-width: 768px) {
      bottom: 20px;
      right: 20px;
      padding: 8px 12px;
      font-size: 11px;
      
      .hint-icon {
        font-size: 12px;
      }
    }
    
    .hint-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .hint-icon {
      font-size: 14px;
      color: rgba(135, 206, 235, 0.6);
      animation: bounceUp 2s ease-in-out infinite;
      text-shadow: 0 0 4px rgba(135, 206, 235, 0.2);
    }
    
    p {
      margin: 0;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 400;
      letter-spacing: 0.3px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
