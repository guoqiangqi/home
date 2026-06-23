<template>
  <div class="album-container" @click.stop>
    <!-- 星云背景装饰 -->
    <div class="nebula-decoration">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="star-dust"></div>
    </div>

    <!-- 相册头部 -->
    <div class="album-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-coords">
            <span class="coord-dot"></span>
            <span class="coord-text">MEMORY · 星海相册 · {{ photosData.length }} FRAMES</span>
          </div>
          <h1 class="album-title">
            <span class="title-text">星海相册</span>
          </h1>
          <p class="album-subtitle">把每一个值得珍藏的瞬间，封存进时间的星轨</p>
        </div>

        <div class="close-btn" @click.stop="closeAlbum" title="返回">
          <Icon size="20"><CloseOne /></Icon>
        </div>
      </div>
    </div>

    <!-- 工具栏：视图切换 + 时间筛选 -->
    <div class="album-toolbar">
      <!-- 视图模式切换 -->
      <div class="view-switch">
        <button
          class="switch-btn"
          :class="{ active: viewMode === 'card' }"
          @click="setViewMode('card')"
        >
          <span class="switch-icon">▦</span>
          <span class="switch-label">卡片</span>
        </button>
        <button
          class="switch-btn"
          :class="{ active: viewMode === 'timeline' }"
          @click="setViewMode('timeline')"
        >
          <span class="switch-icon">⊟</span>
          <span class="switch-label">时间线</span>
        </button>
        <span class="switch-indicator" :class="viewMode"></span>
      </div>

      <!-- 时间筛选 -->
      <div class="time-selector">
        <el-date-picker
          :key="pickerKey"
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
          :default-value="defaultPanelDate"
          @change="handleDateChange"
          @visible-change="onPickerVisibleChange"
          class="date-picker"
          popper-class="space-date-popper"
          :disabled-date="disabledDate"
        />
        <button
          class="filter-btn"
          :class="{ active: activeFilter === 'today' }"
          @click="showTodayPhotos"
        >今天</button>
        <button
          class="filter-btn"
          :class="{ active: activeFilter === 'all' }"
          @click="showAllPhotos"
        >全部</button>
      </div>
    </div>

    <!-- 视图区域 -->
    <Transition name="view-fade" mode="out-in">
    <!-- 卡片模式 -->
    <div v-if="viewMode === 'card'" class="card-view" key="card-view">
      <div class="photos-grid" v-if="currentPhotos.length > 0">
        <div
          v-for="(photo, index) in currentPhotos"
          :key="photo.id"
          class="photo-item"
          :style="{ animationDelay: index * 0.07 + 's' }"
          @click.stop="openPhotoViewer(photo, index)"
        >
          <div class="photo-shine"></div>
          <img :src="photo.url" :alt="photo.title" class="photo-image" loading="lazy" />
          <div class="photo-overlay">
            <div class="photo-info">
              <div class="photo-header">
                <h3 class="photo-title">{{ photo.title }}</h3>
                <span class="photo-mood" v-if="photo.mood">{{ photo.mood }}</span>
              </div>
              <p class="photo-date">{{ formatDate(photo.date) }}</p>
              <p class="photo-description">{{ photo.description }}</p>
              <div class="photo-tags" v-if="photo.tags && photo.tags.length">
                <span v-for="tag in photo.tags" :key="tag" class="tag"># {{ tag }}</span>
              </div>
              <div class="photo-location" v-if="photo.location">
                <span class="location-icon">📍</span>
                <span>{{ photo.location }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-photos">
        <div class="no-photos-icon">🛰️</div>
        <h3>这片星域暂无影像</h3>
        <p>选择其他日期继续探索</p>
      </div>
    </div>

    <!-- 时间线模式 -->
    <div v-else class="timeline-view" key="timeline-view">
      <div v-if="groupedPhotos.length > 0" class="timeline">
        <div class="timeline-line"></div>
        <div
          v-for="(group, gIndex) in groupedPhotos"
          :key="group.date"
          class="timeline-group"
          :style="{ animationDelay: gIndex * 0.1 + 's' }"
        >
          <div class="timeline-node">
            <span class="node-dot"></span>
            <div class="node-date">
              <span class="node-day">{{ formatDay(group.date) }}</span>
              <span class="node-year">{{ formatYearMonth(group.date) }}</span>
            </div>
            <span class="node-count">{{ group.photos.length }} 张</span>
          </div>
          <div class="timeline-photos">
            <div
              v-for="photo in group.photos"
              :key="photo.id"
              class="timeline-photo"
              @click.stop="openPhotoViewerByPhoto(photo)"
            >
              <div class="tl-photo-img">
                <img :src="photo.url" :alt="photo.title" loading="lazy" />
                <span class="tl-mood" v-if="photo.mood">{{ photo.mood }}</span>
              </div>
              <div class="tl-photo-info">
                <h4 class="tl-title">{{ photo.title }}</h4>
                <p class="tl-desc">{{ photo.description }}</p>
                <div class="tl-meta">
                  <span class="tl-location" v-if="photo.location">📍 {{ photo.location }}</span>
                  <div class="tl-tags" v-if="photo.tags && photo.tags.length">
                    <span v-for="tag in photo.tags.slice(0, 3)" :key="tag" class="tag"># {{ tag }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-photos">
        <div class="no-photos-icon">🛰️</div>
        <h3>这片星域暂无影像</h3>
        <p>选择其他日期继续探索</p>
      </div>
    </div>
    </Transition>

    <!-- 照片查看器 -->
    <Transition name="viewer-fade">
      <div v-if="photoViewerVisible" class="photo-viewer-overlay" @click.self="closePhotoViewer">
        <div class="viewer-panel" v-if="currentPhoto">
          <div class="viewer-close" @click.stop="closePhotoViewer" title="返回相册">
            <Icon size="18"><CloseOne /></Icon>
          </div>

          <div class="viewer-image-wrap">
            <img :src="currentPhoto.url" :alt="currentPhoto.title" class="viewer-image" />

            <button
              class="nav-arrow nav-prev"
              @click.stop="previousPhoto"
              :disabled="currentPhotoIndex === 0"
              title="上一张"
            >
              <Icon size="22"><ArrowLeft /></Icon>
            </button>
            <button
              class="nav-arrow nav-next"
              @click.stop="nextPhoto"
              :disabled="currentPhotoIndex === currentPhotos.length - 1"
              title="下一张"
            >
              <Icon size="22"><ArrowRight /></Icon>
            </button>

            <div class="photo-counter">{{ currentPhotoIndex + 1 }} / {{ currentPhotos.length }}</div>
          </div>

          <div class="viewer-info">
            <h4 class="viewer-title">
              {{ currentPhoto.title }}
              <span class="viewer-mood" v-if="currentPhoto.mood">{{ currentPhoto.mood }}</span>
            </h4>
            <p class="viewer-desc">{{ currentPhoto.description }}</p>
            <div class="viewer-meta">
              <span class="meta-pill">{{ formatDate(currentPhoto.date) }}</span>
              <span class="meta-pill" v-if="currentPhoto.location">📍 {{ currentPhoto.location }}</span>
              <span class="meta-pill" v-if="currentPhoto.weather">☀️ {{ currentPhoto.weather }}</span>
            </div>
            <div class="viewer-tags" v-if="currentPhoto.tags && currentPhoto.tags.length">
              <span v-for="tag in currentPhoto.tags" :key="tag" class="tag"># {{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ArrowLeft, ArrowRight, CloseOne } from "@icon-park/vue-next";
import { Icon } from "@vicons/utils";
import { mainStore } from "@/store";

// 响应式数据
const selectedDate = ref('');
const currentPhotos = ref([]);
const photoViewerVisible = ref(false);
const currentPhoto = ref(null);
const currentPhotoIndex = ref(0);
const store = mainStore();

// 当前筛选模式：'all' | 'today' | 'date'，用于按钮高亮
const activeFilter = ref('all');
// 用于在面板进入年/年代视图后强制回到初始视图（关闭即重建）
const pickerKey = ref(0);
// 日期面板默认定位到今天所在月份
const defaultPanelDate = new Date();

// 视图模式（持久化于 store）
const viewMode = computed(() => store.albumViewMode);
const setViewMode = (mode) => {
  store.albumViewMode = mode;
};

// 生活照片数据
const photosData = ref([
  {
    id: 1,
    title: '清晨的第一缕阳光',
    description: '今天起得很早，看到了美丽的日出。阳光透过窗帘洒在书桌上，感觉整个世界都充满了希望。决定今天要好好工作，不辜负这美好的开始。',
    date: '2024-01-15',
    url: 'https://99e3n0ajyhfj5o2d.public.blob.vercel-storage.com/1.jpg',
    mood: '😊',
    tags: ['清晨', '阳光', '希望'],
    location: '家里',
    weather: '晴天'
  },
  {
    id: 2,
    title: '与朋友的咖啡时光',
    description: '和老朋友在咖啡厅聊天，聊了很多过去的事情。时间过得真快，但我们的友谊依然如初。咖啡很香，心情很暖。',
    date: '2024-01-15',
    url: 'https://99e3n0ajyhfj5o2d.public.blob.vercel-storage.com/2.jpg',
    mood: '😌',
    tags: ['朋友', '咖啡', '回忆'],
    location: '星巴克咖啡厅',
    weather: '多云'
  },
  {
    id: 3,
    title: '春天的樱花',
    description: '樱花盛开的季节，粉色的花瓣随风飘舞。站在樱花树下，感受春天的气息，心情变得格外轻松。',
    date: '2024-01-20',
    url: 'https://99e3n0ajyhfj5o2d.public.blob.vercel-storage.com/3.jpg',
    mood: '🌸',
    tags: ['春天', '樱花', '自然'],
    location: '公园',
    weather: '微风'
  },
  {
    id: 4,
    title: '山间的小路',
    description: '周末去爬山，走在山间的小路上，呼吸着新鲜的空气。远离城市的喧嚣，感受大自然的宁静。',
    date: '2024-01-20',
    url: 'https://99e3n0ajyhfj5o2d.public.blob.vercel-storage.com/4.jpg',
    mood: '🌿',
    tags: ['爬山', '自然', '宁静'],
    location: '郊外山区',
    weather: '晴朗'
  },
  {
    id: 5,
    title: '深夜的星空',
    description: '今晚的星空特别美，看到了很多星星。想起了小时候在乡下看星星的日子，那时候的梦想现在都实现了吗？',
    date: '2024-01-25',
    url: 'https://99e3n0ajyhfj5o2d.public.blob.vercel-storage.com/5.jpg',
    mood: '✨',
    tags: ['星空', '回忆', '梦想'],
    location: '阳台',
    weather: '晴朗'
  },
  {
    id: 7,
    title: '第一次做蛋糕',
    description: '今天尝试做蛋糕，虽然不是很完美，但是过程很有趣。面粉撒得到处都是，但是看到成品的那一刻还是很开心的。',
    date: '2024-01-30',
    url: 'https://99e3n0ajyhfj5o2d.public.blob.vercel-storage.com/6.jpg',
    mood: '🎂',
    tags: ['烘焙', '第一次', '开心'],
    location: '厨房',
    weather: '室内'
  },
]);

// 计算属性
const today = computed(() => {
  const now = new Date();
  return now.toISOString().split('T')[0];
});

const photoDates = computed(() => photosData.value.map(photo => photo.date));

// 时间线分组：按日期倒序
const groupedPhotos = computed(() => {
  const groups = {};
  currentPhotos.value.forEach(photo => {
    if (!groups[photo.date]) groups[photo.date] = [];
    groups[photo.date].push(photo);
  });
  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a))
    .map(date => ({ date, photos: groups[date] }));
});

// 方法
const handleDateChange = (date) => {
  if (date) {
    activeFilter.value = 'date';
    filterPhotosByDate(date);
  } else {
    // 清空选择时重置为未选状态并显示全部
    showAllPhotos();
  }
};

// 面板关闭后强制重建，保证下次打开回到初始的当月日历视图
const onPickerVisibleChange = (visible) => {
  if (!visible) {
    pickerKey.value++;
  }
};

const showTodayPhotos = () => {
  activeFilter.value = 'today';
  selectedDate.value = today.value;
  filterPhotosByDate(today.value);
};

const showAllPhotos = () => {
  activeFilter.value = 'all';
  // 置为 null 使日期选择器回到未选状态（重新打开时显示当前月那页日历）
  selectedDate.value = null;
  currentPhotos.value = photosData.value;
};

const disabledDate = (time) => {
  const dateStr = time.toISOString().split('T')[0];
  return !photoDates.value.includes(dateStr);
};

const filterPhotosByDate = (date) => {
  currentPhotos.value = photosData.value.filter(photo => photo.date === date);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
};

const formatDay = (dateString) => {
  const date = new Date(dateString);
  return String(date.getDate()).padStart(2, '0');
};

const formatYearMonth = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()} / ${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const openPhotoViewer = (photo, index) => {
  currentPhoto.value = photo;
  currentPhotoIndex.value = index;
  photoViewerVisible.value = true;
};

// 时间线模式下根据照片对象定位索引
const openPhotoViewerByPhoto = (photo) => {
  const index = currentPhotos.value.findIndex(p => p.id === photo.id);
  openPhotoViewer(photo, index >= 0 ? index : 0);
};

const closePhotoViewer = () => {
  photoViewerVisible.value = false;
  setTimeout(() => {
    currentPhoto.value = null;
    currentPhotoIndex.value = 0;
  }, 300);
};

const previousPhoto = () => {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--;
    currentPhoto.value = currentPhotos.value[currentPhotoIndex.value];
  }
};

const nextPhoto = () => {
  if (currentPhotoIndex.value < currentPhotos.value.length - 1) {
    currentPhotoIndex.value++;
    currentPhoto.value = currentPhotos.value[currentPhotoIndex.value];
  }
};

const closeAlbum = () => {
  store.albumOpenState = false;
};

// 键盘控制
const handleKeydown = (e) => {
  if (photoViewerVisible.value) {
    if (e.key === 'Escape') closePhotoViewer();
    else if (e.key === 'ArrowLeft') previousPhoto();
    else if (e.key === 'ArrowRight') nextPhoto();
  } else if (e.key === 'Escape') {
    closeAlbum();
  }
};

onMounted(() => {
  showAllPhotos();
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss" scoped>
.album-container {
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
      right: -6%;
      background: radial-gradient(circle, rgba(78, 205, 196, 0.4), transparent 70%);
    }
    &.nebula-2 {
      width: 360px;
      height: 360px;
      bottom: 8%;
      left: -8%;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.35), transparent 70%);
      animation-delay: 5s;
    }
  }

  .star-dust {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 25% 25%, rgba(255, 255, 255, 0.7), transparent),
      radial-gradient(1px 1px at 65% 65%, rgba(255, 255, 255, 0.5), transparent),
      radial-gradient(1px 1px at 85% 30%, rgba(135, 206, 235, 0.6), transparent),
      radial-gradient(1.5px 1.5px at 45% 80%, rgba(255, 255, 255, 0.5), transparent);
    opacity: 0.55;
    animation: twinkle 5s ease-in-out infinite;
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

// 头部
.album-header {
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

    .album-title {
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

    .album-subtitle {
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

// 工具栏
.album-toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 30px;
}

// 视图切换分段控件
.view-switch {
  position: relative;
  display: inline-flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 4px;

  .switch-btn {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    cursor: pointer;
    border-radius: 26px;
    transition: color 0.3s ease;

    .switch-icon {
      font-size: 0.95rem;
    }

    &.active {
      color: #fff;
    }
  }

  .switch-indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(102, 126, 234, 0.3));
    border: 1px solid rgba(78, 205, 196, 0.4);
    border-radius: 26px;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);

    &.timeline {
      transform: translateX(100%);
    }
  }
}

// 时间筛选
.time-selector {
  display: flex;
  align-items: center;
  gap: 10px;

  .date-picker {
    width: 160px;
  }

  .filter-btn {
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      transform: translateY(-2px);
    }

    // 当前生效的筛选高亮
    &.active {
      background: linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(102, 126, 234, 0.3));
      border-color: rgba(78, 205, 196, 0.6);
      color: #fff;
      box-shadow: 0 0 14px rgba(78, 205, 196, 0.25);
    }
  }
}

// 通用标签
.tag {
  font-size: 0.72rem;
  color: rgba(135, 206, 235, 0.75);
  background: rgba(135, 206, 235, 0.08);
  border: 1px solid rgba(135, 206, 235, 0.15);
  padding: 3px 10px;
  border-radius: 20px;
}

// ===== 卡片模式 =====
.card-view {
  position: relative;
  z-index: 1;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  padding: 0 30px;
}

.photo-item {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.4s ease, box-shadow 0.4s ease;
  opacity: 0;
  animation: cardReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;

  // 流光扫过
  .photo-shine {
    position: absolute;
    top: 0;
    left: -60%;
    width: 50%;
    height: 100%;
    z-index: 2;
    background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.16), transparent);
    transform: translateX(0) skewX(-18deg);
    transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(78, 205, 196, 0.3);
    box-shadow: 0 18px 45px rgba(0, 0, 8, 0.55), 0 0 30px rgba(78, 205, 196, 0.1);

    .photo-overlay {
      opacity: 1;
    }
    .photo-image {
      transform: scale(1.06);
    }
    .photo-shine {
      transform: translateX(360%) skewX(-18deg);
    }
  }

  .photo-image {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
    transition: transform 0.5s ease;
  }

  .photo-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(5, 6, 20, 0.95) 0%, rgba(5, 6, 20, 0.4) 50%, transparent 100%);
    padding: 22px;
    display: flex;
    align-items: flex-end;
    opacity: 0;
    transition: opacity 0.4s ease;

    .photo-info {
      width: 100%;

      .photo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        .photo-title {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .photo-mood {
          font-size: 1.4rem;
        }
      }

      .photo-date {
        font-size: 0.78rem;
        color: #4ecdc4;
        margin-bottom: 8px;
      }

      .photo-description {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.75);
        line-height: 1.6;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .photo-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 10px;
      }

      .photo-location {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.76rem;
        color: rgba(255, 255, 255, 0.55);
      }
    }
  }
}

// ===== 时间线模式 =====
.timeline-view {
  position: relative;
  z-index: 1;
  padding: 10px 30px 0;
}

.timeline {
  position: relative;
  padding-left: 30px;

  .timeline-line {
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 7px;
    width: 2px;
    background: linear-gradient(180deg, rgba(78, 205, 196, 0.6), rgba(102, 126, 234, 0.4), transparent);
  }

  .timeline-group {
    position: relative;
    margin-bottom: 40px;
    opacity: 0;
    animation: timelineReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;

    &:last-child {
      margin-bottom: 10px;
    }
  }

  .timeline-node {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
    margin-left: -30px;

    .node-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: radial-gradient(circle, #4ecdc4 30%, rgba(78, 205, 196, 0.2) 70%);
      border: 2px solid rgba(78, 205, 196, 0.5);
      box-shadow: 0 0 12px rgba(78, 205, 196, 0.6);
      flex-shrink: 0;
      animation: nodePulse 3s ease-in-out infinite;
    }

    .node-date {
      display: flex;
      align-items: baseline;
      gap: 8px;

      .node-day {
        font-size: 1.8rem;
        font-weight: 800;
        font-family: "UnidreamLED", monospace;
        background: linear-gradient(135deg, #87ceeb, #4ecdc4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .node-year {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.5);
        font-family: "UnidreamLED", monospace;
        letter-spacing: 1px;
      }
    }

    .node-count {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.45);
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  }

  .timeline-photos {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .timeline-photo {
    display: flex;
    gap: 18px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);

    &:hover {
      transform: translateX(8px);
      border-color: rgba(78, 205, 196, 0.3);
      box-shadow: 0 12px 32px rgba(0, 0, 8, 0.45), 0 0 24px rgba(78, 205, 196, 0.08);

      .tl-photo-img img {
        transform: scale(1.08);
      }
    }

    .tl-photo-img {
      position: relative;
      width: 180px;
      flex-shrink: 0;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        min-height: 130px;
        object-fit: cover;
        display: block;
        transition: transform 0.5s ease;
      }

      .tl-mood {
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 1.2rem;
        filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
      }
    }

    .tl-photo-info {
      flex: 1;
      padding: 16px 18px 16px 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;

      .tl-title {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .tl-desc {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.65);
        line-height: 1.6;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .tl-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;

        .tl-location {
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.55);
          white-space: nowrap;
        }

        .tl-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
      }
    }
  }
}

@keyframes nodePulse {
  0%, 100% { box-shadow: 0 0 12px rgba(78, 205, 196, 0.6); }
  50% { box-shadow: 0 0 20px rgba(78, 205, 196, 0.9); }
}

// 空状态
.no-photos {
  text-align: center;
  padding: 80px 20px;

  .no-photos-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: float 4s ease-in-out infinite;
  }

  h3 {
    font-size: 1.4rem;
    margin-bottom: 10px;
    color: rgba(255, 255, 255, 0.85);
  }

  p {
    color: rgba(255, 255, 255, 0.5);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(26px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes timelineReveal {
  from {
    opacity: 0;
    transform: translateX(-18px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// ===== 照片查看器 =====
.photo-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vh 16px;
  background: rgba(0, 0, 8, 0.82);
  backdrop-filter: blur(16px);

  .viewer-panel {
    position: relative;
    width: 100%;
    max-width: 920px;
    max-height: 92vh;
    background: linear-gradient(180deg, rgba(20, 22, 48, 0.92), rgba(10, 12, 28, 0.95));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 30px 80px rgba(0, 0, 8, 0.6);
    display: flex;
    flex-direction: column;
  }

  .viewer-close {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 3;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(0, 0, 8, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }
  }

  .viewer-image-wrap {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);

    .viewer-image {
      max-width: 100%;
      max-height: 62vh;
      object-fit: contain;
      display: block;
    }

    .nav-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: rgba(0, 0, 8, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &.nav-prev { left: 16px; }
      &.nav-next { right: 16px; }

      &:hover:not(:disabled) {
        background: rgba(78, 205, 196, 0.3);
        border-color: rgba(78, 205, 196, 0.5);
        transform: translateY(-50%) scale(1.1);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .photo-counter {
      position: absolute;
      bottom: 14px;
      right: 16px;
      font-family: "UnidreamLED", monospace;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(0, 0, 8, 0.5);
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      letter-spacing: 1px;
    }
  }

  .viewer-info {
    flex-shrink: 0;
    padding: 22px 28px 26px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);

    .viewer-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 10px;

      .viewer-mood {
        font-size: 1.4rem;
      }
    }

    .viewer-desc {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.75;
      margin-bottom: 16px;
    }

    .viewer-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 12px;

      .meta-pill {
        font-size: 0.76rem;
        color: rgba(255, 255, 255, 0.7);
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 5px 12px;
        border-radius: 20px;
      }
    }

    .viewer-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

// 视图切换过渡
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

// 查看器过渡
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.3s ease;

  .viewer-panel {
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;

  .viewer-panel {
    transform: scale(0.95);
  }
}

// 日期选择器输入框深色适配见全局 style.scss（.album-container .date-picker），
// scoped :deep 无法稳定覆盖 Element 的底色变量，故移至全局。

// 响应式
@media (max-width: 768px) {
  .album-header {
    padding: 36px 18px 6px;

    .title-section .album-title {
      font-size: 2.4rem;
    }
    .title-section .album-subtitle {
      font-size: 0.9rem;
    }
  }

  .album-toolbar {
    padding: 18px;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;

    .view-switch {
      justify-content: center;
      .switch-btn {
        flex: 1;
        justify-content: center;
      }
    }

    .time-selector {
      justify-content: center;
      flex-wrap: wrap;

      .date-picker {
        width: 100%;
      }
    }
  }

  .photos-grid {
    grid-template-columns: 1fr;
    padding: 0 18px;
    gap: 18px;

    .photo-item {
      .photo-overlay {
        opacity: 1;
        background: linear-gradient(to top, rgba(5, 6, 20, 0.95) 0%, rgba(5, 6, 20, 0.2) 60%, transparent 100%);
      }
    }
  }

  .timeline-view {
    padding: 6px 16px 0;
  }

  .timeline {
    .timeline-photo {
      flex-direction: column;
      gap: 0;

      .tl-photo-img {
        width: 100%;
        height: 160px;
      }

      .tl-photo-info {
        padding: 16px;
      }
    }
  }

  .photo-viewer-overlay {
    padding: 2vh 10px;

    .viewer-image-wrap .viewer-image {
      max-height: 50vh;
    }

    .viewer-info {
      padding: 18px 18px 22px;
    }
  }
}
</style>
