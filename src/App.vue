<template>
  <!-- 太空背景 -->
  <SpaceBackground v-if="!showMainPage" />
  
  <!-- 加载 -->
  <Loading />
  
  <!-- 壁纸 -->
  <Background ref="backgroundRef" @loadComplete="loadComplete" />
  
  <!-- 主界面 -->
  <Transition name="fade" mode="out-in">
    <main id="main" v-if="store.imgLoadStatus">
      <!-- 太空欢迎页面 -->
      <div v-if="!showMainPage" class="space-welcome">
        <div class="space-content">
          <div class="space-header">
            <h1 class="space-title">你好呀，欢迎来到我的乐园<span class="clap-icon" title="鼓掌">👏</span></h1>
            <div class="astronaut">👨‍🚀</div>
          </div>
          

          
          <div class="space-mission">
            <div class="space-elements">
              <span class="space-element">🚀</span>
              <span class="space-element">🛸</span>
              <span class="space-element">🛰️</span>
              <span class="space-element">☄️</span>
              <span class="space-element">🌌</span>
            </div>
          </div>
          
          <div class="scroll-hint">
            <div class="scroll-text">向下滚动开始探索</div>
            <div class="scroll-arrow-container">
              <div class="scroll-arrow"></div>
              <div class="scroll-arrow scroll-arrow-2"></div>
              <div class="scroll-arrow scroll-arrow-3"></div>
            </div>
          </div>
        </div>
        <!-- 滚动区域 -->
        <div class="scroll-area"></div>
      </div>
      
      <!-- 主内容页面 -->
      <div v-else class="main-page" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
        <div class="container" v-show="!store.backgroundShow">
          <section class="all" v-show="!store.setOpenState">
            <MainLeft />
            <MainRight v-show="!store.boxOpenState" />
            <Box v-show="store.boxOpenState" />
          </section>
          <section class="more" v-show="store.setOpenState" @click="store.setOpenState = false">
            <MoreSet />
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
        <div class="return-hint" v-show="showMainPage">
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
import SpaceBackground from "@/components/SpaceBackground.vue";
import WallpaperSelector from "@/components/WallpaperSelector.vue";
import cursorInit from "@/utils/cursor.js";
import config from "@/../package.json";

const store = mainStore();
const showMainPage = ref(false);
const backgroundRef = ref(null);

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
  // 自定义鼠标
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
  const title1 = "橙子の主页";
  const title2 = `QC`;
  const content = `\n\n版本: ${config.version}\n主页: ${config.home}\nGithub: ${config.github}`;
  console.info(`%c${title1} %c${title2} %c${content}`, styleTitle1, styleTitle2, styleContent);
});

onBeforeUnmount(() => {
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
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
    z-index: 11;
    max-width: 800px;
    width: 100%;
    padding: 0 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
  
  .space-header {
    margin-bottom: 3rem;
    animation: fadeInDown 1s ease-out;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .astronaut {
      font-size: 2.5rem;
      margin-bottom: 0.8rem;
      margin-top: 4rem;
      animation: astronautFloat 4s ease-in-out infinite;
      display: block;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
      opacity: 0.9;
    }
    

    
    .space-title {
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      margin-bottom: 1.5rem;
      margin-top: -16rem;
      font-style: italic;
      text-shadow: 0 0 20px rgba(255,255,255,0.5);
      background: linear-gradient(45deg, #fff, #87CEEB, #fff);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 3s ease-in-out infinite;
      
      .clap-icon {
        display: inline-block;
        font-size: 1.2em;
        margin-left: 0.3em;
        animation: clapAnimation 2s ease-in-out infinite;
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
        -webkit-text-fill-color: initial;
        background: none;
        -webkit-background-clip: initial;
      }
    }
    
    .space-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      color: #ccc;
      opacity: 0.9;
    }
  }
  

  
  .space-mission {
    margin-bottom: 18rem;
    animation: fadeInUp 1s ease-out 0.5s both;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    

    
    .space-elements {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 4rem;
      margin-bottom: 2rem;
      margin-top: 2rem;
      width: 100%;
      max-width: 600px;
      
      .space-element {
        font-size: 2rem;
        animation: elementFloat 4s ease-in-out infinite;
        opacity: 0.9;
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.2) rotate(5deg);
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6));
        }
        
        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.8s; }
        &:nth-child(3) { animation-delay: 1.6s; }
        &:nth-child(4) { animation-delay: 2.4s; }
        &:nth-child(5) { animation-delay: 3.2s; }
      }
    }
    

  }
  
  .scroll-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeInUp 1s ease-out 1s both;
    position: relative;
    
    .scroll-text {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 9rem;
      margin-top: -1rem;
      opacity: 0.65;
      text-shadow: 0 0 6px rgba(255, 255, 255, 0.35);
      font-weight: 420;
      letter-spacing: 0.6px;
      animation: textGlow 3s ease-in-out infinite;
    }
    
    .scroll-arrow-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-bottom: 1rem;
      margin-top: -7rem;
    }
    
    .scroll-arrow {
      width: 18px;
      height: 18px;
      border-right: 2.5px solid rgba(255, 255, 255, 0.7);
      border-bottom: 2.5px solid rgba(255, 255, 255, 0.7);
      transform: rotate(45deg);
      animation: bounce 2.5s infinite;
      opacity: 0.65;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      
      &.scroll-arrow-2 {
        width: 14px;
        height: 14px;
        border-right: 2px solid rgba(135, 206, 235, 0.6);
        border-bottom: 2px solid rgba(135, 206, 235, 0.6);
        animation-delay: 0.3s;
        opacity: 0.5;
      }
      
      &.scroll-arrow-3 {
        width: 10px;
        height: 10px;
        border-right: 1.5px solid rgba(74, 144, 226, 0.5);
        border-bottom: 1.5px solid rgba(74, 144, 226, 0.5);
        animation-delay: 0.6s;
        opacity: 0.4;
      }
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

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes astronautFloat {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  25% { 
    transform: translateY(-15px) rotate(5deg); 
  }
  50% { 
    transform: translateY(-25px) rotate(0deg); 
  }
  75% { 
    transform: translateY(-15px) rotate(-5deg); 
  }
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

@keyframes clapAnimation {
  0%, 100% { 
    transform: scale(1) rotate(0deg); 
  }
  25% { 
    transform: scale(1.1) rotate(5deg); 
  }
  50% { 
    transform: scale(1.2) rotate(0deg); 
  }
  75% { 
    transform: scale(1.1) rotate(-5deg); 
  }
}

// 响应式设计
@media (max-width: 768px) {
  .space-content {
    padding: 0 1rem;
    
    .space-header {
      .astronaut {
        font-size: 2.5rem;
        margin-top: 1.5rem;
      }
      

      
      .space-title {
        font-size: 1.2rem;
        
        .clap-icon {
          font-size: 1.1em;
          margin-left: 0.2em;
        }
      }
      
      .space-subtitle {
        font-size: 1rem;
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
    
    .space-mission {
      margin-bottom: 12rem;
      
      .space-elements {
        gap: 1rem;
        max-width: 400px;
        margin-top: 1.5rem;
        
        .space-element {
          font-size: 1.5rem;
        }
      }
      

    }
    
    .scroll-hint {
      .scroll-text {
        font-size: 1rem;
        margin-bottom: 3rem;
        margin-top: -0.5rem;
      }
      
      .scroll-arrow-container {
        gap: 6px;
        margin-bottom: 0.5rem;
        margin-top: -4rem;
      }
      
      .scroll-arrow {
        width: 16px;
        height: 16px;
        
        &.scroll-arrow-2 {
          width: 12px;
          height: 12px;
        }
        
        &.scroll-arrow-3 {
          width: 8px;
          height: 8px;
        }
      }
      

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
