<template>
  <!-- 太空背景 -->
  <SpaceBackground v-if="!showMainPage" />
  
  <!-- 加载 -->
  <Loading />
  
  <!-- 壁纸 -->
  <Background @loadComplete="loadComplete" />
  
  <!-- 主界面 -->
  <Transition name="fade" mode="out-in">
    <main id="main" v-if="store.imgLoadStatus">
      <!-- 太空欢迎页面 -->
      <div v-if="!showMainPage" class="space-welcome">
        <div class="space-content">
          <div class="space-header">
            <h1 class="space-title">欢迎来到太空</h1>
            <div class="astronaut">👨‍🚀</div>
            <div class="planet-icon">🌌</div>
          </div>
          

          
          <div class="space-mission">
            <p class="mission-text">准备开始你的太空之旅了吗？</p>
            <div class="space-elements">
              <span class="space-element">🚀</span>
              <span class="space-element">⭐</span>
              <span class="space-element">🌍</span>
              <span class="space-element">🌙</span>
            </div>
            <div class="mission-stats">
              <div class="stat-item">
                <span class="stat-number">∞</span>
                <span class="stat-label">可爱</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">24/7</span>
                <span class="stat-label">活力</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">100%</span>
                <span class="stat-label">幸福</span>
              </div>
            </div>
          </div>
          
          <div class="scroll-hint">
            <div class="scroll-text">向下滚动开始探索</div>
            <div class="scroll-arrow"></div>
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
        <div class="return-hint">
          <p>向上滑动返回太空页面</p>
        </div>
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
import cursorInit from "@/utils/cursor.js";
import config from "@/../package.json";

const store = mainStore();
const showMainPage = ref(false);

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
  top: 35%;
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
      animation: astronautFloat 4s ease-in-out infinite;
      display: block;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
      opacity: 0.9;
    }
    
    .planet-icon {
      font-size: 3.2rem;
      margin-bottom: 1.2rem;
      animation: float 3s ease-in-out infinite;
      display: block;
      opacity: 0.85;
    }
    
    .space-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: bold;
      margin-bottom: 1.5rem;
      margin-top: -2rem;
      font-family: "UnidreamLED", sans-serif;
      text-shadow: 0 0 20px rgba(255,255,255,0.5);
      background: linear-gradient(45deg, #fff, #87CEEB, #fff);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 3s ease-in-out infinite;
    }
    
    .space-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      color: #ccc;
      opacity: 0.9;
    }
  }
  

  
  .space-mission {
    margin-bottom: 3rem;
    animation: fadeInUp 1s ease-out 0.5s both;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .mission-text {
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      color: #ccc;
      margin-bottom: 1.5rem;
      font-style: italic;
    }
    
    .space-elements {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      width: 100%;
      
      .space-element {
        font-size: 1.5rem;
        animation: elementFloat 3s ease-in-out infinite;
        opacity: 0.8;
        
        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.5s; }
        &:nth-child(3) { animation-delay: 1s; }
        &:nth-child(4) { animation-delay: 1.5s; }
      }
    }
    
    .mission-stats {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 2rem;
      width: 100%;
      
      .stat-item {
        text-align: center;
        padding: 1rem;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.1);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #fff;
          display: block;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: #ccc;
          display: block;
          margin-top: 0.5rem;
        }
      }
    }
  }
  
  .scroll-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeInUp 1s ease-out 1s both;
    
    .scroll-text {
      font-size: 1.1rem;
      color: #ccc;
      margin-bottom: 1rem;
      opacity: 0.8;
    }
    
    .scroll-arrow {
      width: 30px;
      height: 30px;
      border-right: 2px solid #fff;
      border-bottom: 2px solid #fff;
      transform: rotate(45deg);
      animation: bounce 2s infinite;
      opacity: 0.7;
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
  60% { transform: translateY(-5px) rotate(45deg); }
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

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
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
    transform: translateY(0px) scale(1); 
  }
  50% { 
    transform: translateY(-8px) scale(1.1); 
  }
}

// 响应式设计
@media (max-width: 768px) {
  .space-content {
    padding: 0 1rem;
    
    .space-header {
      .astronaut {
        font-size: 2.5rem;
      }
      
      .planet-icon {
        font-size: 3rem;
      }
      
      .space-title {
        font-size: 2rem;
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
      .space-elements {
        gap: 0.5rem;
        
        .space-element {
          font-size: 1.2rem;
        }
      }
      
      .mission-stats {
        flex-direction: column;
        gap: 0.5rem;
        
        .stat-item {
          padding: 0.5rem;
          
          .stat-number {
            font-size: 1.5rem;
          }
          
          .stat-label {
            font-size: 0.7rem;
          }
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
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 1000;
    backdrop-filter: blur(10px);
    
    p {
      margin: 0;
      color: #ccc;
    }
  }
}
</style>
