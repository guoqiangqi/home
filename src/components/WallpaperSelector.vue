<template>
  <div class="wallpaper-selector" :class="{ collapsed: isCollapsed }">
    <!-- 折叠按钮 -->
    <div 
      class="collapse-btn" 
      @click="toggleCollapse" 
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      :title="isCollapsed ? '悬浮或点击展开壁纸选择' : '收起壁纸选择'"
    >
      <div class="btn-icon">
        <span v-if="isCollapsed">◀</span>
        <span v-else>▶</span>
      </div>
    </div>
    
    <!-- 壁纸选择面板 -->
    <div 
      class="selector-panel" 
      :class="{ 'panel-collapsing': isCollapsing }"
      v-show="!isCollapsed || isCollapsing"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="panel-header">
        <h3>壁纸选择</h3>
      </div>
      
      <div class="wallpaper-options">
        <!-- 本地壁纸 -->
        <div class="option-group">
          <h4>本地壁纸</h4>
          <div class="local-wallpapers">
            <div 
              v-for="i in 10" 
              :key="`local-${i}`"
              class="wallpaper-item"
              :class="{ active: store.coverType === '0' && currentLocalIndex === i }"
              @click="selectLocalWallpaper(i)"
            >
              <div class="wallpaper-preview">
                <img 
                  :src="`/images/background${i}.jpg`" 
                  :alt="`壁纸 ${i}`"
                  @error="handleImageError"
                />
              </div>
              <span class="wallpaper-label">{{ i }}</span>
            </div>
          </div>
        </div>
        
        <!-- 在线壁纸 -->
        <div class="option-group">
          <h4>在线壁纸</h4>
          <div class="online-wallpapers">
            <div 
              class="wallpaper-item"
              :class="{ active: store.coverType === '1' }"
              @click="selectOnlineWallpaper('1')"
            >
              <div class="wallpaper-preview">
                <div class="online-icon">🌅</div>
              </div>
              <span class="wallpaper-label">必应壁纸</span>
            </div>
            
            <div 
              class="wallpaper-item"
              :class="{ active: store.coverType === '2' }"
              @click="selectOnlineWallpaper('2')"
            >
              <div class="wallpaper-preview">
                <div class="online-icon">🏞️</div>
              </div>
              <span class="wallpaper-label">风景壁纸</span>
            </div>
            
            <div 
              class="wallpaper-item"
              :class="{ active: store.coverType === '3' }"
              @click="selectOnlineWallpaper('3')"
            >
              <div class="wallpaper-preview">
                <div class="online-icon">🎨</div>
              </div>
              <span class="wallpaper-label">动漫壁纸</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { mainStore } from "@/store";
import { ElMessage } from 'element-plus';

const store = mainStore();
const isCollapsed = ref(true); // 默认隐藏

// 鼠标悬浮相关变量
const isHovering = ref(false);
const hoverTimeout = ref(null);
const isCollapsing = ref(false);

const emit = defineEmits(['updateLocalIndex']);

// 当前本地壁纸索引
const currentLocalIndex = ref(1);

// 鼠标进入事件
const handleMouseEnter = () => {
  isHovering.value = true;
  isCollapsing.value = false;
  
  // 清除之前的定时器
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }
  
  // 立即展开
  if (isCollapsed.value) {
    isCollapsed.value = false;
  }
};

// 鼠标离开事件
const handleMouseLeave = () => {
  isHovering.value = false;
  
  // 延迟折叠，给用户一些时间
  hoverTimeout.value = setTimeout(() => {
    if (!isHovering.value) {
      startCollapseAnimation();
    }
  }, 300); // 300ms延迟，减少等待时间
};

// 开始折叠动画
const startCollapseAnimation = () => {
  isCollapsing.value = true;
  
  // 等待动画完成后隐藏面板
  setTimeout(() => {
    isCollapsed.value = true;
    isCollapsing.value = false;
  }, 300); // 动画持续时间
};

// 切换折叠状态
const toggleCollapse = () => {
  if (isCollapsed.value) {
    // 展开
    isCollapsed.value = false;
    isCollapsing.value = false;
  } else {
    // 折叠
    startCollapseAnimation();
  }
  
  // 清除悬浮状态
  isHovering.value = false;
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }
};

// 选择本地壁纸
const selectLocalWallpaper = (index) => {
  currentLocalIndex.value = index;
  store.coverType = "0";
  
  // 通知父组件更新壁纸索引
  emit('updateLocalIndex', index);
  
  ElMessage({
    message: `已切换到本地壁纸 ${index}`,
    grouping: true,
    duration: 2000,
  });
};

// 选择在线壁纸
const selectOnlineWallpaper = (type) => {
  store.coverType = type;
  
  const typeNames = {
    '1': '必应壁纸',
    '2': '风景壁纸', 
    '3': '动漫壁纸'
  };
  
  ElMessage({
    message: `已切换到${typeNames[type]}`,
    grouping: true,
    duration: 2000,
  });
};

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.style.display = 'none';
  event.target.parentElement.innerHTML = '<div class="error-icon">❌</div>';
};

// 监听壁纸类型变化，同步本地壁纸索引
watch(() => store.coverType, (newType) => {
  if (newType === '0') {
    // 当切换到本地壁纸时，保持当前索引
  }
});

// 接收父组件传递的当前本地壁纸索引
const props = defineProps({
  currentLocalIndex: {
    type: Number,
    default: 1
  }
});

// 监听props变化，同步本地索引
watch(() => props.currentLocalIndex, (newIndex) => {
  if (newIndex && newIndex >= 1 && newIndex <= 10) {
    currentLocalIndex.value = newIndex;
  }
}, { immediate: true });

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
});
</script>

<style lang="scss" scoped>
.wallpaper-selector {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  transition: all 0.3s ease;
  animation: fadeInLeft 0.8s ease-out 1s both;
  
  &.collapsed {
    .selector-panel {
      transform: translateX(-100%);
      opacity: 0;
    }
  }
  
  // 在移动端隐藏
  @media (max-width: 720px) {
    display: none;
  }
}

.collapse-btn {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(-1px);
  width: 24px;
  height: 48px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
  backdrop-filter: blur(6px);
  border-radius: 0 6px 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.03);
  opacity: 0.5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  // 扩大悬浮区域
  &::after {
    content: '';
    position: absolute;
    left: -20px;
    top: -20px;
    width: 64px;
    height: 88px;
    background: transparent;
    z-index: -1;
  }
  
  &:hover {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3));
    transform: translateY(-50%) translateX(-1px) scale(1.01);
    border-color: rgba(255, 255, 255, 0.08);
    opacity: 0.7;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(-50%) translateX(-1px) scale(0.99);
  }
  
  // 添加悬浮提示动画
  &::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid rgba(135, 206, 235, 0.6);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
    left: -12px;
  }
  
  .btn-icon {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    font-weight: 300;
    transition: all 0.25s ease;
    line-height: 1;
  }
  
  &:hover .btn-icon {
    color: rgba(255, 255, 255, 0.8);
  }
  
  // 添加悬浮提示文字
  &:hover::after {
    content: '悬浮展开';
    position: absolute;
    left: -80px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    animation: fadeInOut 2s ease-in-out;
  }
}

.selector-panel {
  width: 280px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(25px);
  border-radius: 0 16px 16px 0;
  padding: 24px;
  overflow-y: auto;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: slideInLeft 0.5s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  opacity: 1;
  transform: translateX(0);
  
  // 折叠动画
  &.panel-collapsing {
    animation: slideOutLeft 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.panel-header {
  margin-bottom: 24px;
  
  h3 {
    color: white;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
    background: linear-gradient(45deg, #fff, #87CEEB);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.option-group {
  margin-bottom: 28px;
  
  h4 {
    color: #87CEEB;
    margin: 0 0 16px 0;
    font-size: 15px;
    font-weight: 600;
    text-shadow: 0 0 10px rgba(135, 206, 235, 0.5);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 30px;
      height: 2px;
      background: linear-gradient(90deg, #87CEEB, transparent);
      border-radius: 1px;
    }
  }
}

.local-wallpapers,
.online-wallpapers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.wallpaper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  padding: 10px;
  border: 1px solid transparent;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: scale(1.05);
    border-color: rgba(135, 206, 235, 0.3);
    box-shadow: 0 4px 15px rgba(135, 206, 235, 0.2);
  }
  
  &.active {
    background: rgba(135, 206, 235, 0.15);
    border: 2px solid #87CEEB;
    box-shadow: 0 0 20px rgba(135, 206, 235, 0.4);
  }
}

.wallpaper-preview {
  width: 64px;
  height: 42px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 6px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .online-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    background: linear-gradient(135deg, #87CEEB, #4A90E2, #6A5ACD);
    background-size: 200% 200%;
    animation: gradientShift 3s ease-in-out infinite;
  }
  
  .error-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: rgba(255, 0, 0, 0.2);
    color: #ff6b6b;
  }
}

.wallpaper-label {
  color: white;
  font-size: 12px;
  text-align: center;
  font-weight: 500;
}

// 响应式设计
@media (max-width: 768px) {
  .selector-panel {
    width: 260px;
    padding: 18px;
  }
  
  .local-wallpapers,
  .online-wallpapers {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .wallpaper-preview {
    width: 56px;
    height: 38px;
  }
  
  .wallpaper-label {
    font-size: 12px;
  }
  
  .panel-header h3 {
    font-size: 18px;
  }
  
  .option-group h4 {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .wallpaper-selector {
    display: none; // 在很小的屏幕上隐藏壁纸选择器
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutLeft {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-100%);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  20%, 80% { opacity: 1; }
}


</style> 