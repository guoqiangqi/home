<template>
  <div class="album-container" @click.stop>
    <!-- 相册头部 -->
    <div class="album-header">
      <div class="header-content">
        <h1 class="album-title">📸 生活相册</h1>
        <p class="album-subtitle">记录每一个美好瞬间</p>
        <el-button 
          class="close-btn"
          @click="closeAlbum"
          type="text"
        >
          <Icon size="20">
            <CloseOne />
          </Icon>
        </el-button>
      </div>
    </div>

    <!-- 时间选择器 -->
    <div class="time-selector">
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期查看照片"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="handleDateChange"
        class="date-picker"
        :disabled-date="disabledDate"
      />
      <el-button 
        @click="showTodayPhotos"
        class="today-btn"
      >
        今天
      </el-button>
      <el-button 
        type="primary" 
        @click="showAllPhotos"
        class="all-btn"
      >
        全部照片
      </el-button>
    </div>

    <!-- 照片网格 -->
    <div class="photos-grid" v-if="currentPhotos.length > 0">
      <div 
        v-for="(photo, index) in currentPhotos" 
        :key="photo.id"
        class="photo-item"
        @click.stop="openPhotoViewer(photo, index)"
      >
        <img 
          :src="photo.url" 
          :alt="photo.title"
          class="photo-image"
          loading="lazy"
        />
        <div class="photo-overlay">
          <div class="photo-info">
            <div class="photo-header">
              <h3 class="photo-title">{{ photo.title }}</h3>
              <div class="photo-mood" v-if="photo.mood">
                <span class="mood-icon">{{ photo.mood }}</span>
              </div>
            </div>
            <p class="photo-date">{{ formatDate(photo.date) }}</p>
            <p class="photo-description">{{ photo.description }}</p>
            <div class="photo-tags" v-if="photo.tags && photo.tags.length">
              <el-tag 
                v-for="tag in photo.tags" 
                :key="tag"
                size="small"
                class="tag"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="photo-location" v-if="photo.location">
              <span class="location-icon">📍</span>
              <span>{{ photo.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无照片提示 -->
    <div v-else class="no-photos">
      <div class="no-photos-icon">📷</div>
      <h3>暂无照片</h3>
      <p>选择其他日期或添加新照片</p>
    </div>

    <!-- 照片查看器 -->
    <el-dialog
      v-model="photoViewerVisible"
      title="📸 照片查看"
      width="80%"
      class="photo-viewer-dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @click.stop
    >
      <div class="photo-viewer-content">
        <!-- 自定义关闭按钮 -->
        <div class="viewer-close-btn" @click.stop="closePhotoViewer" title="返回相册">
          <Icon size="20">
            <CloseOne />
          </Icon>
          <span class="close-text">返回相册</span>
        </div>
        <div class="photo-viewer-image">
          <img 
            :src="currentPhoto?.url" 
            :alt="currentPhoto?.title"
            class="viewer-image"
          />
        </div>
        <div class="photo-viewer-info">
          <div class="info-header">
            <h3>{{ currentPhoto?.title }}</h3>
            <div class="mood-display" v-if="currentPhoto?.mood">
              <span class="mood-text">心情: {{ currentPhoto?.mood }}</span>
            </div>
          </div>
          <p class="photo-date">{{ formatDate(currentPhoto?.date) }}</p>
          <p class="photo-description">{{ currentPhoto?.description }}</p>
          <div class="photo-tags" v-if="currentPhoto?.tags && currentPhoto?.tags.length">
            <span class="tags-label">标签:</span>
            <el-tag 
              v-for="tag in currentPhoto?.tags" 
              :key="tag"
              size="small"
              class="tag"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="photo-location" v-if="currentPhoto?.location">
            <span class="location-icon">📍</span>
            <span>{{ currentPhoto?.location }}</span>
          </div>
          <div class="photo-weather" v-if="currentPhoto?.weather">
            <span class="weather-icon">☀️</span>
            <span>{{ currentPhoto?.weather }}</span>
          </div>
        </div>
        <div class="photo-viewer-controls">
          <el-button @click="previousPhoto" :disabled="currentPhotoIndex === 0">
            <Icon size="16">
              <ArrowLeft />
            </Icon>
            上一张
          </el-button>
          <span class="photo-counter">{{ currentPhotoIndex + 1 }} / {{ currentPhotos.length }}</span>
          <el-button @click="nextPhoto" :disabled="currentPhotoIndex === currentPhotos.length - 1">
            下一张
            <Icon size="16">
              <ArrowRight />
            </Icon>
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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

// 生活照片数据 - 更丰富的内容
const photosData = ref([
  {
    id: 1,
    title: '清晨的第一缕阳光',
    description: '今天起得很早，看到了美丽的日出。阳光透过窗帘洒在书桌上，感觉整个世界都充满了希望。决定今天要好好工作，不辜负这美好的开始。',
    date: '2024-01-15',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
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
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop',
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
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop',
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
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
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
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
    mood: '✨',
    tags: ['星空', '回忆', '梦想'],
    location: '阳台',
    weather: '晴朗'
  },
  {
    id: 6,
    title: '雨天的读书时光',
    description: '外面下着小雨，坐在窗边读书。雨声很轻，书页翻动的声音很清晰。这样的时光很珍贵，让人感到平静。',
    date: '2024-01-25',
    url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&h=600&fit=crop',
    mood: '📚',
    tags: ['雨天', '读书', '平静'],
    location: '书房',
    weather: '小雨'
  },
  {
    id: 7,
    title: '第一次做蛋糕',
    description: '今天尝试做蛋糕，虽然不是很完美，但是过程很有趣。面粉撒得到处都是，但是看到成品的那一刻还是很开心的。',
    date: '2024-01-30',
    url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop',
    mood: '🎂',
    tags: ['烘焙', '第一次', '开心'],
    location: '厨房',
    weather: '室内'
  },
  {
    id: 8,
    title: '夕阳西下',
    description: '傍晚时分，夕阳把整个天空都染成了金黄色。站在高处看着夕阳慢慢落下，感觉时间都静止了。',
    date: '2024-01-30',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    mood: '🌅',
    tags: ['夕阳', '美景', '宁静'],
    location: '楼顶',
    weather: '晴朗'
  }
]);

// 计算属性
const today = computed(() => {
  const now = new Date();
  return now.toISOString().split('T')[0];
});

// 获取所有有照片的日期
const photoDates = computed(() => {
  return photosData.value.map(photo => photo.date);
});

// 获取每个日期的照片数量
const photoCountByDate = computed(() => {
  const countMap = {};
  photosData.value.forEach(photo => {
    countMap[photo.date] = (countMap[photo.date] || 0) + 1;
  });
  return countMap;
});

// 方法
const handleDateChange = (date) => {
  if (date) {
    filterPhotosByDate(date);
  }
};

const showTodayPhotos = () => {
  selectedDate.value = today.value;
  filterPhotosByDate(today.value);
};

const showAllPhotos = () => {
  selectedDate.value = '';
  currentPhotos.value = photosData.value;
};

// 禁用没有照片的日期
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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

const openPhotoViewer = (photo, index) => {
  currentPhoto.value = photo;
  currentPhotoIndex.value = index;
  photoViewerVisible.value = true;
};

const closePhotoViewer = () => {
  photoViewerVisible.value = false;
  currentPhoto.value = null;
  currentPhotoIndex.value = 0;
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

// 关闭相册
const closeAlbum = () => {
  store.albumOpenState = false;
};

// 生命周期
onMounted(() => {
  // 默认显示全部照片
  showAllPhotos();
});
</script>

<style lang="scss" scoped>
.album-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  color: white;
  position: relative;
}

.album-header {
  margin-bottom: 30px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    
    .album-title {
      font-size: 2.5rem;
      margin-bottom: 10px;
      font-weight: bold;
      text-align: center;
      flex: 1;
    }
    
    .album-subtitle {
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
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
  }
}

.time-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  
  .date-picker {
    width: 200px;
    
    :deep(.el-date-picker) {
      .el-picker-panel {
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        
        .el-picker-panel__header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px 16px 0 0;
          
          .el-picker-panel__icon-btn {
            color: white;
            
            &:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          }
          
          .el-date-picker__header-label {
            color: white;
            font-weight: 600;
            
            &:hover {
              color: rgba(255, 255, 255, 0.8);
            }
          }
        }
        
        .el-date-table {
          .el-date-table__header {
            th {
              color: #333;
              font-weight: 600;
              background: rgba(103, 126, 234, 0.05);
              font-size: 14px;
            }
          }
          
          .el-date-table__row {
            .el-date-table__cell {
              border-radius: 8px;
              margin: 2px;
              transition: all 0.3s ease;
              font-size: 14px;
              font-weight: 500;
              
              &.available {
                color: #333;
                
                &:hover {
                  background: rgba(103, 126, 234, 0.1);
                  transform: scale(1.05);
                }
                
                &.has-photos {
                  color: white;
                  font-weight: bold;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  border-radius: 8px;
                  position: relative;
                  box-shadow: 0 4px 15px rgba(103, 126, 234, 0.3);
                  
                  &:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(103, 126, 234, 0.4);
                  }
                  
                  &::after {
                    content: attr(data-photo-count);
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    font-size: 10px;
                    background: rgba(255, 255, 255, 0.9);
                    color: #667eea;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                    font-weight: bold;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                  }
                }
              }
              
              &.disabled {
                color: #c0c4cc;
                background: rgba(192, 196, 204, 0.1);
                cursor: not-allowed;
                opacity: 0.5;
                
                &:hover {
                  background: rgba(192, 196, 204, 0.1);
                  transform: none;
                }
              }
              
              &.current {
                background: rgba(103, 126, 234, 0.2);
                color: #667eea;
                font-weight: bold;
              }
              
              &.today {
                background: rgba(103, 126, 234, 0.3);
                color: #667eea;
                font-weight: bold;
                border: 2px solid #667eea;
              }
            }
          }
        }
      }
    }
  }
  
  .today-btn, .all-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 8px;
    padding: 8px 16px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.photo-item {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    
    .photo-overlay {
      opacity: 1;
    }
  }
  
  .photo-image {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
  }
  
  .photo-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
    padding: 25px;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    .photo-info {
      .photo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .photo-title {
          font-size: 1.3rem;
          margin-bottom: 0;
          font-weight: bold;
        }
        
        .photo-mood {
          .mood-icon {
            font-size: 1.5rem;
          }
        }
      }
      
      .photo-date {
        font-size: 0.9rem;
        opacity: 0.8;
        margin-bottom: 8px;
      }
      
      .photo-description {
        font-size: 0.9rem;
        opacity: 0.9;
        line-height: 1.5;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .photo-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
        
        .tag {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 0.8rem;
        }
      }
      
      .photo-location {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
  }
}

.no-photos {
  text-align: center;
  padding: 60px 20px;
  
  .no-photos-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  p {
    opacity: 0.8;
  }
}

.photo-viewer-dialog {
  :deep(.el-dialog) {
    background: rgba(0, 0, 0, 0.95);
    border-radius: 16px;
    
    .el-dialog__header {
      color: white;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .el-dialog__body {
      padding: 0;
    }
  }
}

.photo-viewer-content {
  position: relative;
  
  .viewer-close-btn {
    position: absolute;
    top: -40px;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 1000;
    padding: 8px 16px;
    gap: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .close-text {
      font-size: 12px;
      font-weight: 500;
    }
    
    &:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  .photo-viewer-image {
    text-align: center;
    margin-bottom: 20px;
    
    .viewer-image {
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
      border-radius: 12px;
    }
  }
  
  .photo-viewer-info {
    padding: 25px;
    text-align: left;
    color: white;
    
    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h3 {
        font-size: 1.8rem;
        margin-bottom: 0;
        font-weight: bold;
      }
      
      .mood-display {
        .mood-text {
          font-size: 1.2rem;
          opacity: 0.9;
        }
      }
    }
    
    .photo-date {
      font-size: 1.1rem;
      opacity: 0.8;
      margin-bottom: 15px;
    }
    
    .photo-description {
      font-size: 1rem;
      opacity: 0.9;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .photo-tags {
      margin-bottom: 15px;
      
      .tags-label {
        font-size: 0.9rem;
        opacity: 0.8;
        margin-right: 10px;
      }
      
      .tag {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        margin-right: 8px;
        margin-bottom: 5px;
      }
    }
    
    .photo-location, .photo-weather {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      opacity: 0.8;
      margin-bottom: 8px;
    }
  }
  
  .photo-viewer-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    .photo-counter {
      color: white;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .el-button {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .album-container {
    padding: 15px;
  }
  
  .album-header {
    .header-content {
      .album-title {
        font-size: 2rem;
      }
    }
  }
  
  .time-selector {
    flex-direction: column;
    gap: 10px;
    
    .date-picker {
      width: 100%;
    }
  }
  
  .photos-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .photo-item {
    .photo-image {
      height: 220px;
    }
    
    .photo-overlay {
      padding: 20px;
      
      .photo-info {
        .photo-header {
          .photo-title {
            font-size: 1.1rem;
          }
        }
        
        .photo-description {
          -webkit-line-clamp: 2;
        }
      }
    }
  }
}
</style> 