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

    <!-- 留言统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalMessages }}</div>
          <div class="stat-label">总留言</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <div class="stat-number">{{ todayMessages }}</div>
          <div class="stat-label">今日留言</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❤️</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalLikes }}</div>
          <div class="stat-label">总点赞</div>
        </div>
      </div>
    </div>

    <!-- 发表留言区域 -->
    <div class="post-section">
      <div class="post-card">
        <div class="post-header">
          <h3>💭 发表新留言</h3>
          <el-button 
            type="primary" 
            @click="showPostDialog = true"
            class="post-btn"
          >
            <Icon size="16">
              <Edit />
            </Icon>
            写留言
          </el-button>
        </div>
      </div>
    </div>

    <!-- 留言列表 -->
    <div class="messages-section">
      <div class="messages-header">
        <h3>📋 最新留言</h3>
        <div class="filter-controls">
          <el-select 
            v-model="sortBy" 
            placeholder="排序方式"
            class="sort-select"
            @change="handleSortChange"
          >
            <el-option label="最新发布" value="time-desc" />
            <el-option label="最早发布" value="time-asc" />
            <el-option label="最多点赞" value="likes-desc" />
            <el-option label="最多回复" value="replies-desc" />
          </el-select>
        </div>
      </div>

      <!-- 留言列表 -->
      <div class="messages-list" v-if="filteredMessages.length > 0">
        <div 
          v-for="(message, index) in filteredMessages" 
          :key="message.id"
          class="message-item"
        >
          <div class="message-header">
            <div class="user-info">
              <div class="avatar">
                <img :src="message.avatar" :alt="message.author" />
              </div>
              <div class="user-details">
                <h4 class="author-name">{{ message.author }}</h4>
                <span class="post-time">{{ formatTime(message.timestamp) }}</span>
              </div>
            </div>
            <div class="message-actions">
              <el-button 
                type="text" 
                @click="likeMessage(message.id)"
                :class="{ 'liked': message.isLiked }"
                class="action-btn like-btn"
              >
                <Icon size="16">
                  <Like />
                </Icon>
                <span>{{ message.likes }}</span>
              </el-button>
              <el-button 
                type="text" 
                @click="replyToMessage(message)"
                class="action-btn reply-btn"
              >
                <Icon size="16">
                  <Comment />
                </Icon>
                <span>{{ message.replies.length }}</span>
              </el-button>
            </div>
          </div>
          
          <div class="message-content">
            <p class="message-text">{{ message.content }}</p>
            <div class="message-tags" v-if="message.tags && message.tags.length">
              <el-tag 
                v-for="tag in message.tags" 
                :key="tag"
                size="small"
                class="tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <!-- 回复列表 -->
          <div class="replies-section" v-if="message.replies.length > 0">
            <div class="replies-header">
              <span class="replies-count">💬 {{ message.replies.length }} 条回复</span>
            </div>
            <div class="replies-list">
              <div 
                v-for="reply in message.replies.slice(0, 3)" 
                :key="reply.id"
                class="reply-item"
              >
                <div class="reply-user">
                  <img :src="reply.avatar" :alt="reply.author" class="reply-avatar" />
                  <span class="reply-author">{{ reply.author }}</span>
                  <span class="reply-time">{{ formatTime(reply.timestamp) }}</span>
                </div>
                <p class="reply-content">{{ reply.content }}</p>
              </div>
              <div 
                v-if="message.replies.length > 3" 
                class="more-replies"
                @click="showAllReplies(message)"
              >
                查看全部 {{ message.replies.length }} 条回复
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无留言提示 -->
      <div v-else class="no-messages">
        <div class="no-messages-icon">💬</div>
        <h3>暂无留言</h3>
        <p>成为第一个留言的人吧！</p>
      </div>
    </div>

    <!-- 发表留言对话框 -->
    <el-dialog
      v-model="showPostDialog"
      title="💬 发表新留言"
      width="60%"
      class="post-dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="post-form">
        <div class="form-row">
          <div class="form-group">
            <label>昵称 <span class="required">必填</span></label>
            <el-input 
              v-model="newMessage.author" 
              placeholder="请输入你的昵称"
              maxlength="20"
              show-word-limit
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>邮箱 <span class="required">必填</span></label>
            <el-input 
              v-model="newMessage.email" 
              placeholder="请输入你的邮箱"
              type="email"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>网址 <span class="optional">选填</span></label>
            <el-input 
              v-model="newMessage.website" 
              placeholder="请输入你的网址"
              class="form-input"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>留言内容</label>
          <el-input 
            v-model="newMessage.content" 
            type="textarea" 
            :rows="8"
            placeholder="万水千山总是情，来句评论行不行？"
            maxlength="500"
            show-word-limit
            class="form-textarea"
          />
        </div>
        
        <div class="form-group">
          <label>标签（可选）</label>
          <el-select
            v-model="newMessage.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或创建标签"
            class="tags-select"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="footer-left">
            <el-button class="emoji-btn" @click="showEmojiPicker = !showEmojiPicker">
              😊
            </el-button>
          </div>
          <div class="footer-right">
            <el-button @click="cancelPost" class="preview-btn">预览</el-button>
            <el-button 
              type="primary" 
              @click="submitMessage"
              :loading="submitting"
              :disabled="!newMessage.author || !newMessage.content || !newMessage.email"
              class="send-btn"
            >
              发送
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="showReplyDialog"
      title="💬 回复留言"
      width="50%"
      class="reply-dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="reply-form">
        <div class="original-message">
          <p class="original-content">{{ currentReplyTo?.content }}</p>
          <span class="original-author">— {{ currentReplyTo?.author }}</span>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>昵称 <span class="required">必填</span></label>
            <el-input 
              v-model="newReply.author" 
              placeholder="请输入你的昵称"
              maxlength="20"
              show-word-limit
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>邮箱 <span class="required">必填</span></label>
            <el-input 
              v-model="newReply.email" 
              placeholder="请输入你的邮箱"
              type="email"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>网址 <span class="optional">选填</span></label>
            <el-input 
              v-model="newReply.website" 
              placeholder="请输入你的网址"
              class="form-input"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>回复内容</label>
          <el-input 
            v-model="newReply.content" 
            type="textarea" 
            :rows="6"
            placeholder="写下你的回复..."
            maxlength="300"
            show-word-limit
            class="form-textarea"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="footer-left">
            <el-button class="emoji-btn" @click="showEmojiPicker = !showEmojiPicker">
              😊
            </el-button>
          </div>
          <div class="footer-right">
            <el-button @click="cancelReply" class="preview-btn">预览</el-button>
            <el-button 
              type="primary" 
              @click="submitReply"
              :loading="submitting"
              :disabled="!newReply.author || !newReply.content || !newReply.email"
              class="send-btn"
            >
              发送
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { CloseOne, Edit, Like, Comment } from "@icon-park/vue-next";
import { Icon } from "@vicons/utils";
import { mainStore } from "@/store";
import { ElMessage } from 'element-plus';

// 响应式数据
const store = mainStore();
const showPostDialog = ref(false);
const showReplyDialog = ref(false);
const showEmojiPicker = ref(false);
const submitting = ref(false);
const sortBy = ref('time-desc');
const currentReplyTo = ref(null);

// 新留言数据
const newMessage = ref({
  author: '',
  email: '',
  website: '',
  content: '',
  tags: []
});

// 新回复数据
const newReply = ref({
  author: '',
  email: '',
  website: '',
  content: ''
});

// 可用标签
const availableTags = ref([
  '心情', '生活', '工作', '学习', '旅行', '美食', '音乐', '电影', '读书', '运动'
]);

// 留言数据
const messagesData = ref([
  {
    id: 1,
    author: '小明',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face',
    content: '今天天气真好，心情也很不错！希望每个人都能保持好心情，享受生活的美好。',
    timestamp: new Date('2024-01-15T10:30:00'),
    likes: 12,
    isLiked: false,
    tags: ['心情', '生活'],
    replies: [
      {
        id: 1,
        author: '小红',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        content: '确实，好天气能带来好心情！',
        timestamp: new Date('2024-01-15T11:00:00')
      },
      {
        id: 2,
        author: '小李',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        content: '我也觉得今天特别舒服，适合出去走走。',
        timestamp: new Date('2024-01-15T11:15:00')
      }
    ]
  },
  {
    id: 2,
    author: '小华',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    content: '最近在学习Vue.js，感觉很有趣。前端开发真的需要不断学习新技术，大家有什么好的学习资源推荐吗？',
    timestamp: new Date('2024-01-14T15:20:00'),
    likes: 8,
    isLiked: true,
    tags: ['学习', '技术'],
    replies: [
      {
        id: 3,
        author: '技术达人',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        content: '推荐Vue官方文档，还有Vue Mastery的课程也不错！',
        timestamp: new Date('2024-01-14T16:00:00')
      }
    ]
  },
  {
    id: 3,
    author: '小美',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
    content: '今天做了一道新菜，虽然卖相一般，但味道还不错。做饭真的是一件很治愈的事情，看着食材变成美食的过程很享受。',
    timestamp: new Date('2024-01-13T18:45:00'),
    likes: 15,
    isLiked: false,
    tags: ['美食', '生活'],
    replies: []
  },
  {
    id: 4,
    author: '小强',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face',
    content: '刚刚看完一部很棒的电影，推荐给大家：《星际穿越》。剧情、特效、音乐都很棒，值得一看！',
    timestamp: new Date('2024-01-12T20:30:00'),
    likes: 20,
    isLiked: false,
    tags: ['电影', '推荐'],
    replies: [
      {
        id: 4,
        author: '电影爱好者',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        content: '我也看过，确实很棒！诺兰的电影都很经典。',
        timestamp: new Date('2024-01-12T21:00:00')
      },
      {
        id: 5,
        author: '小华',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        content: '谢谢推荐，今晚就去看！',
        timestamp: new Date('2024-01-12T21:30:00')
      }
    ]
  }
]);

// 计算属性
const totalMessages = computed(() => messagesData.value.length);

const todayMessages = computed(() => {
  const today = new Date();
  const todayStr = today.toDateString();
  return messagesData.value.filter(msg => 
    new Date(msg.timestamp).toDateString() === todayStr
  ).length;
});

const totalLikes = computed(() => {
  return messagesData.value.reduce((total, msg) => total + msg.likes, 0);
});

const filteredMessages = computed(() => {
  let sorted = [...messagesData.value];
  
  switch (sortBy.value) {
    case 'time-desc':
      sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      break;
    case 'time-asc':
      sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      break;
    case 'likes-desc':
      sorted.sort((a, b) => b.likes - a.likes);
      break;
    case 'replies-desc':
      sorted.sort((a, b) => b.replies.length - a.replies.length);
      break;
  }
  
  return sorted;
});

// 方法
const formatTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return time.toLocaleDateString('zh-CN');
};

const handleSortChange = () => {
  // 排序逻辑已在计算属性中处理
};

const likeMessage = (messageId) => {
  const message = messagesData.value.find(msg => msg.id === messageId);
  if (message) {
    message.isLiked = !message.isLiked;
    message.likes += message.isLiked ? 1 : -1;
    
    ElMessage({
      message: message.isLiked ? '点赞成功！' : '取消点赞',
      type: 'success'
    });
  }
};

const replyToMessage = (message) => {
  currentReplyTo.value = message;
  newReply.value = {
    author: '',
    email: '',
    website: '',
    content: ''
  };
  showReplyDialog.value = true;
};

const showAllReplies = (message) => {
  // 这里可以实现查看全部回复的功能
  ElMessage({
    message: `查看 ${message.replies.length} 条回复`,
    type: 'info'
  });
};

const submitMessage = async () => {
  if (!newMessage.value.author || !newMessage.value.content || !newMessage.value.email) {
    ElMessage({
      message: '请填写昵称、邮箱和留言内容',
      type: 'warning'
    });
    return;
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newMessage.value.email)) {
    ElMessage({
      message: '请输入正确的邮箱格式',
      type: 'warning'
    });
    return;
  }
  
  submitting.value = true;
  
  // 模拟提交延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newMsg = {
    id: Date.now(),
    author: newMessage.value.author,
    avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=50&h=50&fit=crop&crop=face`,
    content: newMessage.value.content,
    timestamp: new Date(),
    likes: 0,
    isLiked: false,
    tags: newMessage.value.tags,
    replies: []
  };
  
  messagesData.value.unshift(newMsg);
  
  // 重置表单
  newMessage.value = {
    author: '',
    email: '',
    website: '',
    content: '',
    tags: []
  };
  
  showPostDialog.value = false;
  submitting.value = false;
  
  ElMessage({
    message: '留言发表成功！',
    type: 'success'
  });
};

const cancelPost = () => {
  newMessage.value = {
    author: '',
    email: '',
    website: '',
    content: '',
    tags: []
  };
  showPostDialog.value = false;
};

const submitReply = async () => {
  if (!newReply.value.author || !newReply.value.content || !newReply.value.email) {
    ElMessage({
      message: '请填写昵称、邮箱和回复内容',
      type: 'warning'
    });
    return;
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newReply.value.email)) {
    ElMessage({
      message: '请输入正确的邮箱格式',
      type: 'warning'
    });
    return;
  }
  
  submitting.value = true;
  
  // 模拟提交延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newReplyData = {
    id: Date.now(),
    author: newReply.value.author,
    avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=50&h=50&fit=crop&crop=face`,
    content: newReply.value.content,
    timestamp: new Date()
  };
  
  if (currentReplyTo.value) {
    currentReplyTo.value.replies.push(newReplyData);
  }
  
  // 重置表单
  newReply.value = {
    author: '',
    email: '',
    website: '',
    content: ''
  };
  
  showReplyDialog.value = false;
  submitting.value = false;
  
  ElMessage({
    message: '回复发表成功！',
    type: 'success'
  });
};

const cancelReply = () => {
  newReply.value = {
    author: '',
    email: '',
    website: '',
    content: ''
  };
  showReplyDialog.value = false;
};

// 关闭留言板
const closeMessageBoard = () => {
  store.messageBoardOpenState = false;
};

// 生命周期
onMounted(() => {
  // 初始化
});
</script>

<style lang="scss" scoped>
.message-board-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  color: white;
  position: relative;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.2) 50%, rgba(102, 126, 234, 0.3) 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 100%);
    background-size: 400% 400%;
    animation: gradientShift 20s ease infinite reverse;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(102, 126, 234, 0.03) 0%, transparent 50%);
    animation: float 6s ease-in-out infinite;
    z-index: -1;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-20px) rotate(1deg);
    }
    66% {
      transform: translateY(10px) rotate(-1deg);
    }
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.message-board-header {
  margin-bottom: 30px;
  
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
      background: linear-gradient(135deg, #fff 0%, #667eea 50%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  .stat-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      
      &::before {
        left: 100%;
      }
    }
    
    .stat-icon {
      font-size: 2rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
    }
    
    .stat-info {
      flex: 1;
      
      .stat-number {
        font-size: 1.8rem;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 5px;
        text-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        animation: glow 2s ease-in-out infinite alternate;
      }
      
      @keyframes glow {
        from {
          text-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }
        to {
          text-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 0 30px rgba(102, 126, 234, 0.6);
        }
      }
      
      .stat-label {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
  }
}

.post-section {
  margin-bottom: 30px;
  
  .post-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 25px;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover::before {
      left: 100%;
    }
    
    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        font-size: 1.3rem;
        margin: 0;
        color: white;
      }
      
      .post-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
        background-size: 200% 200%;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        color: white;
        font-weight: 500;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          background-position: 100% 100%;
          
          &::before {
            left: 100%;
          }
        }
        
        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

.messages-section {
  .messages-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      font-size: 1.3rem;
      margin: 0;
      color: white;
    }
    
    .filter-controls {
      .sort-select {
        width: 150px;
        
        :deep(.el-input__wrapper) {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          
          .el-input__inner {
            color: white;
            
            &::placeholder {
              color: rgba(255, 255, 255, 0.6);
            }
          }
        }
      }
    }
  }
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .user-details {
        .author-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 5px 0;
          color: white;
        }
        
        .post-time {
          font-size: 0.85rem;
          opacity: 0.7;
        }
      }
    }
    
    .message-actions {
      display: flex;
      gap: 10px;
      
      .action-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        padding: 8px 12px;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        
        &.liked {
          background: rgba(102, 126, 234, 0.3);
          border-color: #667eea;
          color: #667eea;
        }
      }
    }
  }
  
  .message-content {
    margin-bottom: 15px;
    
    .message-text {
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 12px;
      color: white;
    }
    
    .message-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .tag {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 0.8rem;
      }
    }
  }
  
  .replies-section {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 15px;
    
    .replies-header {
      margin-bottom: 10px;
      
      .replies-count {
        font-size: 0.9rem;
        opacity: 0.7;
      }
    }
    
    .replies-list {
      .reply-item {
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        
        &:last-child {
          border-bottom: none;
        }
        
        .reply-user {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
          
          .reply-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            object-fit: cover;
          }
          
          .reply-author {
            font-size: 0.85rem;
            font-weight: 500;
            color: white;
          }
          
          .reply-time {
            font-size: 0.75rem;
            opacity: 0.6;
          }
        }
        
        .reply-content {
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          padding-left: 32px;
        }
      }
      
      .more-replies {
        text-align: center;
        padding: 10px 0;
        color: #667eea;
        font-size: 0.9rem;
        cursor: pointer;
        transition: color 0.3s ease;
        
        &:hover {
          color: #8b9dc3;
        }
      }
    }
  }
}

.no-messages {
  text-align: center;
  padding: 60px 20px;
  
  .no-messages-icon {
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

.post-dialog, .reply-dialog {
  :deep(.el-dialog) {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    .el-dialog__header {
      color: #333;
      border-bottom: 1px solid #e4e7ed;
      padding: 20px 24px;
      
      .el-dialog__title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #333;
      }
    }
    
    .el-dialog__body {
      color: #333;
      padding: 24px;
    }
    
    .el-dialog__footer {
      border-top: 1px solid #e4e7ed;
      padding: 16px 24px;
    }
  }
}

.post-form, .reply-form {
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 15px;
    }
  }
  
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
      
      .required {
        color: #f56c6c;
        font-size: 0.8rem;
        margin-left: 4px;
      }
      
      .optional {
        color: #909399;
        font-size: 0.8rem;
        margin-left: 4px;
      }
    }
    
    .form-input, .form-textarea {
      :deep(.el-input__wrapper) {
        background: #ffffff;
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }
        
        &:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
        
        .el-input__inner, .el-textarea__inner {
          color: #333;
          font-size: 0.9rem;
          
          &::placeholder {
            color: #c0c4cc;
          }
        }
      }
    }
    
    .tags-select {
      width: 100%;
      
      :deep(.el-input__wrapper) {
        background: #ffffff;
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        
        &:hover {
          border-color: #667eea;
        }
        
        &:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
      }
    }
  }
}

.original-message {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  
  .original-content {
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0 0 8px 0;
    color: #333;
  }
  
  .original-author {
    font-size: 0.8rem;
    color: #909399;
    font-style: italic;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .footer-left {
    .emoji-btn {
      background: #f5f7fa;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      
      &:hover {
        background: #ecf5ff;
        border-color: #667eea;
        transform: scale(1.05);
      }
    }
  }
  
  .footer-right {
    display: flex;
    gap: 12px;
    
    .preview-btn {
      background: #ffffff;
      border: 1px solid #dcdfe6;
      color: #606266;
      border-radius: 6px;
      padding: 8px 16px;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #667eea;
        color: #667eea;
      }
    }
    
    .send-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      border-radius: 6px;
      padding: 8px 20px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
      
      &:disabled {
        background: #c0c4cc;
        transform: none;
        box-shadow: none;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .message-board-container {
    padding: 15px;
  }
  
  .message-board-header {
    .header-content {
      .message-board-title {
        font-size: 2rem;
      }
    }
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 15px;
    
    .stat-card {
      padding: 15px;
      
      .stat-icon {
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
      }
      
      .stat-info {
        .stat-number {
          font-size: 1.5rem;
        }
      }
    }
  }
  
  .post-section {
    .post-card {
      padding: 20px;
      
      .post-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
        
        .post-btn {
          align-self: flex-end;
        }
      }
    }
  }
  
  .messages-section {
    .messages-header {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
      
      .filter-controls {
        .sort-select {
          width: 100%;
        }
      }
    }
  }
  
  .message-item {
    padding: 20px;
    
    .message-header {
      .user-info {
        .avatar {
          width: 40px;
          height: 40px;
        }
        
        .user-details {
          .author-name {
            font-size: 1rem;
          }
        }
      }
      
      .message-actions {
        .action-btn {
          padding: 6px 10px;
          font-size: 0.85rem;
        }
      }
    }
    
    .message-content {
      .message-text {
        font-size: 0.9rem;
      }
    }
  }
  
  .post-dialog, .reply-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      margin: 5vh auto !important;
    }
  }
}
</style> 