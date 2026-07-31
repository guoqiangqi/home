<template>
  <!-- 太空背景 -->
  <SpaceBackground
    v-show="!showMainPage"
    :class="{
      'is-revealing': spaceRevealing,
      'splash-dimmed': !store.splashDone && !spaceRevealing,
    }"
  />
  
  <!-- 加载（仅首次进入） -->
  <Loading v-if="!store.splashDone" @exit-start="onSplashExitStart" />
  
  <!-- 壁纸 -->
  <Background ref="backgroundRef" @loadComplete="loadComplete" />
  
  <!-- 主界面 -->
  <Transition name="fade" mode="out-in">
    <main
      id="main"
      :class="{
        'space-active': !showMainPage,
        'splash-pending': !store.splashDone,
      }"
      v-if="store.imgLoadStatus"
    >
      <!-- 太空欢迎页面 -->
      <div
        v-if="!showMainPage"
        class="space-welcome"
        :class="{
          'splash-hidden': !store.splashDone && !spaceRevealing,
          'is-revealing': spaceRevealing,
        }"
      >
        <div class="space-content">
          <div class="space-status">
            <span class="status-dot"></span>
            <span class="status-text">{{ spaceStatusText }}</span>
            <span class="status-divider">|</span>
            <span class="status-coords">{{ currentCoords }}</span>
          </div>
        </div>

        <div class="scroll-hint">
          <div class="scroll-text">向下滚动开始探索</div>
          <div class="scroll-arrow-container">
            <div class="scroll-arrow"></div>
            <div class="scroll-arrow scroll-arrow-2"></div>
          </div>
        </div>

        <!-- 时空穿梭遮罩 -->
        <Transition name="warp-overlay-fade">
          <div class="warp-overlay" v-if="easterEggWarping">
            <div class="warp-lines"></div>
            <div class="warp-center-glow"></div>
            <div class="warp-text">INITIATING WARP DRIVE</div>
          </div>
        </Transition>

        <div class="scroll-area"></div>
      </div>

      <!-- 主内容页面 -->
      <div v-if="showMainPage" class="main-page" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
        <div class="container" v-show="!store.backgroundShow">
          <section class="all" v-show="!store.setOpenState && !store.albumOpenState && !store.blogOpenState && !store.catOpenState && !store.messageBoardOpenState && !store.musicPageOpenState && !store.panOpenState && !store.shipOpenState">
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
          <section class="blog" v-show="store.blogOpenState" @click="store.blogOpenState = false">
            <Blog />
          </section>
          <section class="cat" v-show="store.catOpenState" @click="store.catOpenState = false">
            <Cat />
          </section>
          <section class="message-board" v-show="store.messageBoardOpenState" @click="store.messageBoardOpenState = false">
            <MessageBoard />
          </section>
          <!-- 音乐页常驻挂载，迷你控制器复用其播放器实例 -->
          <section class="music-page" v-show="store.musicPageOpenState" @click="store.musicPageOpenState = false">
            <MusicPage />
          </section>
          <section class="pan" v-show="store.panOpenState" @click="store.panOpenState = false">
            <Pan />
          </section>
          <section class="starship" v-if="store.shipOpenState" @click.self="store.shipOpenState = false">
            <Starship />
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
        <div class="return-hint" v-show="showMainPage && !store.albumOpenState && !store.blogOpenState && !store.catOpenState && !store.messageBoardOpenState && !store.musicPageOpenState && !store.panOpenState && !store.shipOpenState">
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

  <!-- 星舰浮动入口：位于所有层级之外，fixed 定位不受 containing block 影响 -->
  <Transition name="sfe-fade">
    <div
      v-if="!showMainPage && store.splashDone"
      class="starship-float-entry"
      :class="{ 'entry-active': easterEggHovered, 'entry-warp': easterEggWarping }"
      @mouseenter="onEggHover(true)"
      @mouseleave="onEggHover(false)"
      @click="onEggClick"
    >
      <StarshipMiniCanvas class="sfe-ship" :size="miniCanvasSize" :warp="easterEggWarping" />
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
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
import Blog from "@/views/Blog/index.vue";
import Cat from "@/views/Cat/index.vue";
import MessageBoard from "@/views/MessageBoard/index.vue";
import MusicPage from "@/views/Music/index.vue";
import Pan from "@/views/Pan/index.vue";
import Starship from "@/views/Starship/index.vue";
import SpaceBackground from "@/components/SpaceBackground.vue";
import WallpaperSelector from "@/components/WallpaperSelector.vue";
import StarshipMiniCanvas from "@/components/StarshipMiniCanvas.vue";
import Experience from "@/galaxy/js/experience.js";
import cursorInit from "@/utils/cursor.js";
import config from "@/../package.json";

const store = mainStore();
const showMainPage = ref(false);
const backgroundRef = ref(null);
const spaceRevealing = ref(false);
const warpLanded = ref(false);

// 星舰缩略 canvas 尺寸（响应式）
const miniCanvasSize = window.innerWidth < 768 ? 54 : 72

// 彩蛋：星舰入口
const easterEggHovered = ref(false);
const easterEggWarping = ref(false);
let eggWarpTimer = null;

const onEggHover = (v) => {
  if (easterEggWarping.value) return;
  easterEggHovered.value = v;
};

const onEggClick = () => {
  if (easterEggWarping.value) return;
  easterEggWarping.value = true;
  easterEggHovered.value = false;
  // 时空穿梭动画结束后打开星舰
  eggWarpTimer = setTimeout(() => {
    easterEggWarping.value = false;
    // 确保先切到主页面（starship 在主页中显示）
    showMainPage.value = true;
    store.shipOpenState = true;
  }, 1600);
};

const spaceStatusText = computed(() => {
  if (spaceRevealing.value && !warpLanded.value) return "WARP IN PROGRESS";
  return "SYSTEM ONLINE";
});

const onSplashExitStart = () => {
  spaceRevealing.value = true;
  setTimeout(() => {
    warpLanded.value = true;
  }, 2200);
};

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

// 进入主页面时暂停太空引擎渲染、返回时无缝恢复（避免销毁重建带来的卡顿）
watch(showMainPage, (isMain) => {
  if (isMain) {
    Experience.pause();
  } else {
    Experience.resume();
  }
});

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
  // 如果任意全屏内页打开，不响应滚轮返回
  if (store.albumOpenState || store.blogOpenState || store.catOpenState || store.messageBoardOpenState || store.musicPageOpenState || store.panOpenState || store.shipOpenState) return;
  
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
  
  // 如果任意全屏内页打开，不响应触摸返回
  if (store.albumOpenState || store.blogOpenState || store.catOpenState || store.messageBoardOpenState || store.musicPageOpenState || store.panOpenState || store.shipOpenState) return;
  
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
  if (eggWarpTimer) clearTimeout(eggWarpTimer);
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

  &.splash-pending {
    animation: none;
    transform: scale(1);
    opacity: 1;
  }

  &.space-active {
    transform: scale(1);

    &:not(.splash-pending) {
      animation: spaceFadeIn 1.2s ease-out forwards;
    }
  }

  &.space-active.splash-pending {
    animation: none;
  }
}

// 太空欢迎页面
.space-welcome {
  position: relative;
  width: 100%;
  min-height: 200vh;
  z-index: 10;

  .space-content,
  .space-mission,
  .scroll-hint {
    transition: none;
  }

  &.splash-hidden {
    .space-content,
    .space-mission,
    .scroll-hint {
      opacity: 0;
      transform: translateY(18px);
    }
  }

  &.is-revealing {
    .space-content {
      animation: spaceUiReveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.8s forwards;
    }

    .space-mission {
      animation: spaceUiReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) 1s forwards;
    }

    .scroll-hint {
      animation:
        spaceUiReveal 1s cubic-bezier(0.22, 1, 0.36, 1) 1.2s forwards,
        hintFade 5s ease-in-out 2.2s infinite;
    }
  }
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

// ── 星舰浮动入口（右下角明显展示）────────────────────────────────────
.starship-float-entry {
  position: fixed;
  bottom: 14vh;
  right: 4vw;
  z-index: 13;
  width: 72px;
  height: 72px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  .sfe-ship {
    display: block;
    border-radius: 50%;
    // 仅用极淡的中性阴影交代空间感，不再叠加霓虹辉光
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.35));
    // 仅保留柔和的漂浮，移除闪烁脉冲动画
    animation: shipFloat 5s ease-in-out infinite;
    transform-origin: center;
    transition: filter 0.4s ease, transform 0.4s ease;
    pointer-events: none;
    user-select: none;
  }

  .sfe-hint {
    position: absolute;
    right: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    padding: 5px 14px;
    background: rgba(0, 6, 20, 0.9);
    border: 1px solid rgba(78, 205, 196, 0.4);
    border-radius: 20px;
    font-family: 'UnidreamLED', monospace;
    font-size: 0.6rem;
    letter-spacing: 1.5px;
    color: rgba(78, 205, 196, 0.95);
    backdrop-filter: blur(12px);
    box-shadow: 0 0 14px rgba(78, 205, 196, 0.15);
    pointer-events: none;

    .sh-icon { font-size: 0.75rem; }
  }

  &:hover .sfe-ship, &.entry-active .sfe-ship {
    // 悬停时只做很轻微的放大与阴影加深，不爆发霓虹光
    filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.42));
    transform: scale(1.06);
  }

  &.entry-warp .sfe-ship {
    filter: drop-shadow(0 0 12px rgba(150, 190, 255, 0.35));
    transform: scale(0.55) translateY(-24px);
    transition: filter 0.3s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (max-width: 768px) {
    bottom: 12vh;
    right: 5vw;
    width: 54px;
    height: 54px;
  }
}

@keyframes shipFloat {
  0%, 100% { transform: translateY(0px) rotate(-8deg); }
  25% { transform: translateY(-7px) rotate(-5deg); }
  50% { transform: translateY(-12px) rotate(-8deg); }
  75% { transform: translateY(-7px) rotate(-11deg); }
}

.sfe-fade-enter-active { transition: opacity 0.8s ease 0.4s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.4s; }
.sfe-fade-leave-active { transition: opacity 0.4s ease; }
.sfe-fade-enter-from, .sfe-fade-leave-to { opacity: 0; transform: translateY(12px) scale(0.9); }

// ── 彩蛋：星舰异常信号入口 ──────────────────────────────────────────
.easter-egg-signal {
  position: fixed;
  bottom: 18vh;
  right: 5vw;
  z-index: 12;
  width: 18px;
  height: 18px;
  cursor: pointer;
  // 平时极其低调：透明度很低
  opacity: 0.18;
  transition: opacity 0.6s ease, transform 0.4s ease;

  &:hover, &.signal-active {
    opacity: 0.85;
    transform: scale(1.15);
  }

  &.signal-warp {
    opacity: 1;
    transform: scale(2.5);
    transition: opacity 0.3s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .signal-core {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: #4ecdc4;
    box-shadow: 0 0 6px 2px rgba(78, 205, 196, 0.8);
    animation: eggCoreGlow 3s ease-in-out infinite;
  }

  .signal-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px solid rgba(78, 205, 196, 0.5);
    animation: eggRingPulse 3s ease-out infinite;

    &.signal-ring-1 {
      width: 14px; height: 14px;
      animation-delay: 0s;
    }
    &.signal-ring-2 {
      width: 26px; height: 26px;
      border-color: rgba(78, 205, 196, 0.3);
      animation-delay: 0.5s;
    }
    &.signal-ring-3 {
      width: 40px; height: 40px;
      border-color: rgba(135, 206, 235, 0.15);
      animation-delay: 1s;
    }
  }

  .signal-hint {
    position: absolute;
    right: calc(100% + 14px);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    padding: 5px 12px;
    background: rgba(0, 8, 24, 0.82);
    border: 1px solid rgba(78, 205, 196, 0.3);
    border-radius: 20px;
    font-family: 'UnidreamLED', monospace;
    font-size: 0.6rem;
    letter-spacing: 1px;
    color: rgba(135, 206, 235, 0.8);
    backdrop-filter: blur(10px);
    pointer-events: none;

    .sh-icon { color: #4ecdc4; font-size: 0.7rem; }
  }
}

@keyframes eggCoreGlow {
  0%, 100% { box-shadow: 0 0 6px 2px rgba(78, 205, 196, 0.7); }
  50% { box-shadow: 0 0 10px 4px rgba(78, 205, 196, 1.0), 0 0 20px 6px rgba(78, 205, 196, 0.4); }
}

@keyframes eggRingPulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
}

// 提示文字淡入淡出
.signal-hint-fade-enter-active, .signal-hint-fade-leave-active {
  transition: all 0.3s ease;
}
.signal-hint-fade-enter-from, .signal-hint-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(8px);
}

// ── 时空穿梭遮罩 ─────────────────────────────────────────────────────
.warp-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: radial-gradient(ellipse at center, rgba(0, 20, 40, 0.0) 0%, rgba(0, 8, 24, 0.95) 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .warp-lines {
    position: absolute;
    inset: 0;
    background:
      repeating-conic-gradient(
        from 0deg at 50% 50%,
        transparent 0deg,
        rgba(78, 205, 196, 0.03) 0.5deg,
        transparent 1deg
      );
    animation: warpSpin 0.6s linear infinite;
    transform-origin: center;
  }

  .warp-center-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(78, 205, 196, 0.6) 0%, rgba(100, 130, 255, 0.3) 40%, transparent 70%);
    animation: warpGlow 0.4s ease-in-out infinite alternate;
  }

  .warp-text {
    position: relative;
    font-family: 'UnidreamLED', monospace;
    font-size: 0.75rem;
    letter-spacing: 4px;
    color: rgba(135, 206, 235, 0.85);
    text-shadow: 0 0 12px rgba(78, 205, 196, 0.8);
    animation: warpTextFlicker 0.3s ease-in-out infinite;
  }
}

@keyframes warpSpin {
  to { transform: rotate(360deg); }
}

@keyframes warpGlow {
  from { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
  to { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
}

@keyframes warpTextFlicker {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; text-shadow: 0 0 20px rgba(78, 205, 196, 1.0); }
}

.warp-overlay-fade-enter-active {
  transition: opacity 0.25s ease;
}
.warp-overlay-fade-leave-active {
  transition: opacity 0.5s ease;
}
.warp-overlay-fade-enter-from, .warp-overlay-fade-leave-to {
  opacity: 0;
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

// 星舰页面入场：保持不透明，仅微缩放，避免背后桌面页面闪现
@keyframes starshipIn {
  from { transform: scale(1.04); }
  to   { transform: scale(1); }
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

@keyframes spaceUiReveal {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
    
    .blog {
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

    .cat {
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

    // 覆盖层优雅滚动条
    .album,
    .blog,
    .cat,
    .message-board,
    .music-page,
    .pan {
      &::-webkit-scrollbar {
        width: 7px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, rgba(78, 205, 196, 0.5), rgba(102, 126, 234, 0.5));
        border-radius: 10px;
        &:hover {
          background: linear-gradient(180deg, rgba(78, 205, 196, 0.75), rgba(102, 126, 234, 0.75));
        }
      }
    }
    
    .message-board,
    .music-page,
    .pan {
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

    .starship {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #000818;
      z-index: 2;
      animation: starshipIn 0.4s ease;
      overflow: hidden;
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
