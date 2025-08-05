<template>
  <div class="wallpaper-selector" :class="{ collapsed: isCollapsed }">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? '展开壁纸选择' : '收起壁纸选择'">
      <div class="btn-icon">
        <span v-if="isCollapsed">◀</span>
        <span v-else>▶</span>
      </div>
    </div>
    
    <!-- 壁纸选择面板 -->
    <div class="selector-panel" v-show="!isCollapsed">
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
import { ref, computed, watch } from 'vue';
import { mainStore } from "@/store";
import { ElMessage } from 'element-plus';

const store = mainStore();
const isCollapsed = ref(true); // 默认隐藏

const emit = defineEmits(['updateLocalIndex']);

// 当前本地壁纸索引
const currentLocalIndex = ref(1);

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
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
}

.selector-panel {
  width: 280px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(25px);
  border-radius: 0 16px 16px 0;
  padding: 24px;
  overflow-y: auto;
  transition: transform 0.3s ease;
  animation: slideInLeft 0.5s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
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

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
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


</style> 