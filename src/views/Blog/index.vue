<template>
  <div class="blog-container" @click.stop>
    <!-- 星云背景装饰 -->
    <div class="nebula-decoration">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="nebula nebula-3"></div>
      <div class="star-dust"></div>
    </div>

    <!-- 头部 -->
    <div class="blog-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-coords">
            <span class="coord-dot"></span>
            <span class="coord-text">SIGNAL · 随笔档案 · {{ filteredPosts.length }} ENTRIES</span>
          </div>
          <h1 class="blog-title">
            <span class="title-text">星河随笔</span>
          </h1>
          <p class="blog-subtitle">把思绪写成星光，记录漂流在宇宙里的每一段心事</p>
        </div>

        <div class="close-btn" @click.stop="closeBlog" title="返回">
          <Icon size="20"><CloseOne /></Icon>
        </div>
      </div>
    </div>

    <!-- 工具栏：分类筛选 + 搜索 -->
    <div class="blog-toolbar">
      <div class="category-chips">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="chip"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          <span class="chip-icon">{{ cat.icon }}</span>
          <span class="chip-label">{{ cat.label }}</span>
        </button>
      </div>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索随笔..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 精选随笔 -->
    <div v-if="featuredPost && activeCategory === 'all' && !searchKeyword" class="featured-section">
      <div class="featured-card" @click.stop="openPost(featuredPost)">
        <div class="featured-cover" :style="{ background: featuredPost.cover }">
          <div class="cover-glow"></div>
          <span class="orbit-ring"></span>
          <span class="featured-emoji">{{ featuredPost.emoji }}</span>
          <span class="featured-badge">★ 精选</span>
          <div class="card-shine"></div>
        </div>
        <div class="featured-info">
          <div class="post-meta">
            <span class="meta-category">{{ categoryLabel(featuredPost.category) }}</span>
            <span class="meta-dot">·</span>
            <span class="meta-date">{{ formatDate(featuredPost.date) }}</span>
            <span class="meta-dot">·</span>
            <span class="meta-read">{{ featuredPost.readTime }} 分钟阅读</span>
          </div>
          <h2 class="featured-title">{{ featuredPost.title }}</h2>
          <p class="featured-excerpt">{{ featuredPost.excerpt }}</p>
          <div class="post-tags">
            <span v-for="tag in featuredPost.tags" :key="tag" class="tag"># {{ tag }}</span>
          </div>
          <div class="read-more">
            <span>展开阅读</span>
            <span class="arrow">→</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 随笔列表 -->
    <div class="posts-grid" v-if="gridPosts.length > 0">
      <div
        v-for="(post, index) in gridPosts"
        :key="post.id"
        class="post-card"
        :style="{ animationDelay: index * 0.07 + 's' }"
        @click.stop="openPost(post)"
      >
        <div class="card-cover" :style="{ background: post.cover }">
          <span class="card-emoji">{{ post.emoji }}</span>
          <div class="card-cover-overlay"></div>
          <div class="card-shine"></div>
        </div>
        <div class="card-body">
          <div class="post-meta">
            <span class="meta-category">{{ categoryLabel(post.category) }}</span>
            <span class="meta-dot">·</span>
            <span class="meta-date">{{ formatDate(post.date) }}</span>
          </div>
          <h3 class="card-title">{{ post.title }}</h3>
          <p class="card-excerpt">{{ post.excerpt }}</p>
          <div class="card-footer">
            <div class="post-tags">
              <span v-for="tag in post.tags.slice(0, 2)" :key="tag" class="tag"># {{ tag }}</span>
            </div>
            <span class="card-read">{{ post.readTime }} min</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="no-posts">
      <div class="no-posts-icon">🛰️</div>
      <h3>这片星域暂无随笔</h3>
      <p>换个分类或关键词，继续探索吧</p>
    </div>

    <!-- 阅读视图 -->
    <Transition name="reader-fade">
      <div v-if="readerVisible" class="reader-overlay" @click.self="closePost">
        <div class="reader-panel" v-if="currentPost">
          <div class="reader-cover" :style="{ background: currentPost.cover }">
            <div class="reader-cover-overlay"></div>
            <span class="reader-emoji">{{ currentPost.emoji }}</span>
            <div class="reader-close" @click.stop="closePost" title="关闭">
              <Icon size="18"><CloseOne /></Icon>
            </div>
            <div class="reader-cover-meta">
              <span class="reader-category">{{ categoryLabel(currentPost.category) }}</span>
              <h2 class="reader-title">{{ currentPost.title }}</h2>
              <div class="reader-sub-meta">
                <span>{{ formatDate(currentPost.date) }}</span>
                <span class="meta-dot">·</span>
                <span>{{ currentPost.readTime }} 分钟阅读</span>
                <span class="meta-dot">·</span>
                <span>{{ currentPost.location }}</span>
              </div>
            </div>
          </div>
          <div class="reader-content">
            <p v-for="(para, idx) in currentPost.content" :key="idx" class="reader-para">
              {{ para }}
            </p>
            <div class="reader-tags">
              <span v-for="tag in currentPost.tags" :key="tag" class="tag"># {{ tag }}</span>
            </div>
            <div class="reader-signature">
              <span class="sig-line"></span>
              <span class="sig-text">— 写于 {{ currentPost.location }}</span>
            </div>
          </div>

          <!-- 上一篇/下一篇 -->
          <div class="reader-nav">
            <button class="nav-btn" :disabled="!prevPost" @click.stop="prevPost && openPost(prevPost)">
              <span class="nav-arrow">←</span>
              <span class="nav-text">{{ prevPost ? prevPost.title : '已是最早' }}</span>
            </button>
            <button class="nav-btn next" :disabled="!nextPost" @click.stop="nextPost && openPost(nextPost)">
              <span class="nav-text">{{ nextPost ? nextPost.title : '已是最新' }}</span>
              <span class="nav-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { CloseOne } from "@icon-park/vue-next";
import { Icon } from "@vicons/utils";
import { mainStore } from "@/store";

const store = mainStore();

// 分类
const categories = [
  { key: "all", label: "全部", icon: "🌌" },
  { key: "thought", label: "随想", icon: "💭" },
  { key: "life", label: "生活", icon: "🌱" },
  { key: "tech", label: "技术", icon: "🛰️" },
  { key: "travel", label: "旅途", icon: "🧭" },
];

const activeCategory = ref("all");
const searchKeyword = ref("");

// 随笔数据
const posts = ref([
  {
    id: 1,
    title: "在深夜里，与星空对话",
    excerpt: "凌晨两点，城市的灯火渐次熄灭，唯有星空依旧明亮。那一刻我忽然明白，孤独并不可怕，它只是另一种形式的辽阔。",
    category: "thought",
    date: "2024-03-18",
    readTime: 5,
    emoji: "✨",
    location: "阳台 · 北纬 30°",
    cover: "linear-gradient(135deg, #1a1a4e 0%, #2d1b69 50%, #0f3460 100%)",
    tags: ["孤独", "星空", "深夜随想"],
    featured: true,
    content: [
      "凌晨两点，城市的灯火渐次熄灭。我坐在阳台上，裹着一条旧毯子，仰头看着那片久违的星空。",
      "白天的喧嚣像潮水退去，留下的是一种近乎透明的安静。在这样的夜里，我总会想起很多事——那些未完成的梦、那些走散的人、那些来不及说出口的话。",
      "但奇怪的是，望着头顶那些亿万光年外的光，我竟不再感到焦虑。我们看到的星光，或许来自一颗早已熄灭的恒星。原来时间和距离，在宇宙面前都是这样温柔而无解。",
      "孤独并不可怕，它只是另一种形式的辽阔。当你学会与自己相处，整个宇宙都会成为你的同伴。",
      "我合上眼，听见风穿过楼宇的声音，像是某种古老的回应。这一夜，我睡得格外安稳。",
    ],
  },
  {
    id: 2,
    title: "代码之外，也有星辰大海",
    excerpt: "我们写下一行行代码，构建一个个虚拟世界。但别忘了，真实的世界同样需要我们去热爱、去感受、去生活。",
    category: "tech",
    date: "2024-03-10",
    readTime: 6,
    emoji: "🛰️",
    location: "书房 · 键盘前",
    cover: "linear-gradient(135deg, #0f3460 0%, #16537e 50%, #1a6b8a 100%)",
    tags: ["编程", "生活平衡", "感悟"],
    content: [
      "做了几年开发，我越来越觉得，写代码其实是一件浪漫的事。",
      "我们用逻辑搭建结构，用算法解决问题，用一行行字符创造出原本不存在的东西。这何尝不是一种造物的快感？就像造物主在虚空中点亮第一颗星。",
      "但代码再精妙，也只是工具。我曾沉迷于通宵 debug 的成就感，却忘了窗外的四季更替。后来我学会了在编译的间隙抬头看看天，给自己泡一杯茶。",
      "技术让我们抵达更远的地方，但真正让生命丰盈的，永远是那些屏幕之外的东西——一次日落，一场久别重逢，一段无所事事的午后。",
      "愿你既能在代码的宇宙里遨游，也能在真实的星辰大海中，找到属于自己的坐标。",
    ],
  },
  {
    id: 3,
    title: "春天来的时候，我在等一朵花开",
    excerpt: "阳台上的那盆植物，沉默了整个冬天。直到某个清晨，它毫无预兆地抽出了第一片新芽。",
    category: "life",
    date: "2024-02-28",
    readTime: 4,
    emoji: "🌱",
    location: "家 · 窗台",
    cover: "linear-gradient(135deg, #134e5e 0%, #1d6b5e 50%, #2e8b57 100%)",
    tags: ["春天", "生活", "希望"],
    content: [
      "去年秋天，朋友送了我一盆植物。整个冬天，它都安静地立在窗台，没有任何变化，我几乎以为它已经放弃了生长。",
      "我照常给它浇水，偶尔会忘记。它也从不抱怨，只是沉默着，像在积蓄某种看不见的力量。",
      "直到某个清晨，阳光斜斜地洒进来，我惊讶地发现，它毫无预兆地抽出了第一片嫩绿的新芽。那一刻，我心里某个角落也跟着柔软了起来。",
      "原来等待从来不是徒劳。有些生长发生在我们看不见的地方，安静、缓慢，却从未停止。",
      "春天来的时候，记得给自己也留一点破土而出的勇气。",
    ],
  },
  {
    id: 4,
    title: "一个人的旅途，遇见整个世界",
    excerpt: "背起行囊独自上路那天，我以为会很孤单。后来才知道，一个人的旅途，反而能遇见更辽阔的世界。",
    category: "travel",
    date: "2024-02-14",
    readTime: 7,
    emoji: "🧭",
    location: "途中 · 海岸线",
    cover: "linear-gradient(135deg, #2c3e50 0%, #34597a 50%, #4a90a4 100%)",
    tags: ["旅行", "独处", "成长"],
    content: [
      "背起行囊独自上路那天，我以为会很孤单。火车驶离站台时，窗外的城市渐渐模糊，我的心里却涌起一种久违的自由。",
      "一个人旅行，意味着所有的决定都由自己做出：在哪里停留，向谁问路，为哪一片风景驻足。这种掌控感，本身就是一种治愈。",
      "我在陌生的小镇遇见过热情的老人，在海边和素不相识的旅人聊到深夜，也曾在迷路时被一只猫带着走过整条巷子。",
      "原来一个人的旅途，并不孤单。当你向世界敞开自己，世界也会以意想不到的方式拥抱你。",
      "走得越远，越发现：旅行真正的意义，不是看了多少风景，而是在路上，重新认识了那个久违的自己。",
    ],
  },
  {
    id: 5,
    title: "关于时间，我想说的几件事",
    excerpt: "时间是最公平的东西，它给每个人的都一样多。可为什么有人活成了星辰，有人却在原地打转？",
    category: "thought",
    date: "2024-01-30",
    readTime: 5,
    emoji: "⏳",
    location: "咖啡馆 · 午后",
    cover: "linear-gradient(135deg, #3a1c71 0%, #4a2c8a 50%, #5d3a9b 100%)",
    tags: ["时间", "思考", "成长"],
    content: [
      "时间是最公平的东西，它给每个人的都一样多——每天二十四小时，不多也不少。",
      "可为什么有人活成了星辰，有人却在原地打转？我想，区别或许不在于拥有多少时间，而在于如何与时间相处。",
      "我们总爱说‘等以后有空了’，可‘以后’这两个字，吞噬了多少美好的当下。真正的自律，是把模糊的‘以后’，变成清晰的‘现在’。",
      "时间不会等人，但它会奖励那些认真对待它的人。哪怕每天只前进一点点，日积月累，也足以抵达很远的地方。",
      "愿我们都能成为时间的朋友，而不是它的囚徒。",
    ],
  },
  {
    id: 6,
    title: "雨天，适合读一本旧书",
    excerpt: "窗外下着雨，我泡了一壶茶，翻开一本读过很多遍的旧书。有些文字，每次重读都有新的滋味。",
    category: "life",
    date: "2024-01-15",
    readTime: 4,
    emoji: "📖",
    location: "家 · 书桌旁",
    cover: "linear-gradient(135deg, #232526 0%, #2c3e50 50%, #414345 100%)",
    tags: ["读书", "雨天", "慢生活"],
    content: [
      "窗外下着雨，雨点敲打着玻璃，发出细碎而温柔的声响。我泡了一壶茶，翻开一本读过很多遍的旧书。",
      "有些文字，每次重读都有新的滋味。年少时读不懂的句子，如今竟字字戳心；曾经一掠而过的段落，现在却让我停留许久。",
      "书没有变，是我变了。那些走过的路、经历的事，都成了重新理解一本书的钥匙。",
      "雨天最适合这样安静的独处。不必追逐什么，也不必证明什么，只是任由思绪在字里行间漫步。",
      "愿你也有这样的雨天，和一本值得一读再读的书。",
    ],
  },
]);

// 计算属性
const featuredPost = computed(() => posts.value.find((p) => p.featured) || posts.value[0]);

const sortedPosts = computed(() =>
  [...posts.value].sort((a, b) => new Date(b.date) - new Date(a.date))
);

const filteredPosts = computed(() => {
  let result = sortedPosts.value;
  if (activeCategory.value !== "all") {
    result = result.filter((p) => p.category === activeCategory.value);
  }
  const kw = searchKeyword.value.trim().toLowerCase();
  if (kw) {
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.excerpt.toLowerCase().includes(kw) ||
        p.tags.some((t) => t.toLowerCase().includes(kw))
    );
  }
  return result;
});

// 网格中显示的随笔（在全部分类无搜索时排除精选，避免重复）
const gridPosts = computed(() => {
  if (activeCategory.value === "all" && !searchKeyword.value) {
    return filteredPosts.value.filter((p) => p.id !== featuredPost.value.id);
  }
  return filteredPosts.value;
});

// 阅读视图
const readerVisible = ref(false);
const currentPost = ref(null);

const readerList = computed(() => sortedPosts.value);

const currentIndex = computed(() =>
  currentPost.value ? readerList.value.findIndex((p) => p.id === currentPost.value.id) : -1
);

const prevPost = computed(() => {
  const i = currentIndex.value;
  return i >= 0 && i < readerList.value.length - 1 ? readerList.value[i + 1] : null;
});

const nextPost = computed(() => {
  const i = currentIndex.value;
  return i > 0 ? readerList.value[i - 1] : null;
});

const categoryLabel = (key) => {
  const c = categories.find((c) => c.key === key);
  return c ? c.label : key;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
};

const openPost = (post) => {
  currentPost.value = post;
  readerVisible.value = true;
};

const closePost = () => {
  readerVisible.value = false;
  setTimeout(() => {
    currentPost.value = null;
  }, 300);
};

const closeBlog = () => {
  store.blogOpenState = false;
};

// ESC 关闭
const handleKeydown = (e) => {
  if (e.key === "Escape") {
    if (readerVisible.value) closePost();
    else closeBlog();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style lang="scss" scoped>
.blog-container {
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
      left: -6%;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.45), transparent 70%);
    }
    &.nebula-2 {
      width: 360px;
      height: 360px;
      top: 35%;
      right: -8%;
      background: radial-gradient(circle, rgba(78, 205, 196, 0.35), transparent 70%);
      animation-delay: 4s;
    }
    &.nebula-3 {
      width: 300px;
      height: 300px;
      bottom: 5%;
      left: 20%;
      background: radial-gradient(circle, rgba(135, 206, 235, 0.28), transparent 70%);
      animation-delay: 8s;
    }
  }

  .star-dust {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.7), transparent),
      radial-gradient(1px 1px at 60% 70%, rgba(255, 255, 255, 0.5), transparent),
      radial-gradient(1px 1px at 80% 20%, rgba(135, 206, 235, 0.6), transparent),
      radial-gradient(1px 1px at 40% 85%, rgba(255, 255, 255, 0.5), transparent),
      radial-gradient(1.5px 1.5px at 90% 60%, rgba(255, 255, 255, 0.4), transparent);
    background-size: 100% 100%;
    opacity: 0.6;
    animation: twinkle 5s ease-in-out infinite;
  }
}

@keyframes nebulaDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.08); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.75; }
}

// 头部
.blog-header {
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

    .blog-title {
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

    .blog-subtitle {
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
.blog-toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 30px;

  .category-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 30px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;

      .chip-icon {
        font-size: 0.95rem;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        transform: translateY(-2px);
      }

      &.active {
        background: linear-gradient(135deg, rgba(78, 205, 196, 0.25), rgba(102, 126, 234, 0.25));
        border-color: rgba(78, 205, 196, 0.5);
        color: #fff;
        box-shadow: 0 4px 16px rgba(78, 205, 196, 0.2);
      }
    }
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: rgba(78, 205, 196, 0.5);
      background: rgba(255, 255, 255, 0.07);
    }

    .search-icon {
      font-size: 0.85rem;
      opacity: 0.6;
    }

    .search-input {
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 0.85rem;
      width: 160px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}

// 通用元信息
.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  flex-wrap: wrap;

  .meta-category {
    color: #4ecdc4;
    font-weight: 600;
  }

  .meta-dot {
    opacity: 0.4;
  }
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .tag {
    font-size: 0.72rem;
    color: rgba(135, 206, 235, 0.75);
    background: rgba(135, 206, 235, 0.08);
    border: 1px solid rgba(135, 206, 235, 0.15);
    padding: 3px 10px;
    border-radius: 20px;
    transition: all 0.3s ease;
  }
}

// 卡片流光扫过
.card-shine {
  position: absolute;
  top: 0;
  left: -60%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent,
    rgba(255, 255, 255, 0.18),
    rgba(255, 255, 255, 0.05),
    transparent
  );
  transform: translateX(0) skewX(-18deg);
  transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
  z-index: 1;
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

// 精选随笔
.featured-section {
  position: relative;
  z-index: 1;
  padding: 8px 30px 28px;

  .featured-card {
    display: flex;
    gap: 28px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    backdrop-filter: blur(12px);
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.4s ease, box-shadow 0.4s ease;
    opacity: 0;
    animation: cardReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;

    &:hover {
      transform: translateY(-6px);
      border-color: rgba(78, 205, 196, 0.35);
      box-shadow: 0 20px 50px rgba(0, 0, 8, 0.5), 0 0 40px rgba(78, 205, 196, 0.1);

      .cover-glow {
        opacity: 1;
      }

      .read-more .arrow {
        transform: translateX(6px);
      }

      .card-shine {
        transform: translateX(260%) skewX(-18deg);
      }
    }

    .featured-cover {
      position: relative;
      width: 42%;
      min-height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .cover-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15), transparent 60%);
        opacity: 0.5;
        transition: opacity 0.4s ease;
      }

      .orbit-ring {
        position: absolute;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        border: 1px dashed rgba(255, 255, 255, 0.25);
        animation: orbitSpin 24s linear infinite;

        &::after {
          content: "";
          position: absolute;
          top: -3px;
          left: 50%;
          width: 6px;
          height: 6px;
          margin-left: -3px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
        }
      }

      .featured-emoji {
        position: relative;
        z-index: 1;
        font-size: 5rem;
        filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.4));
        animation: float 5s ease-in-out infinite;
      }

      .featured-badge {
        position: absolute;
        top: 16px;
        left: 16px;
        font-size: 0.72rem;
        padding: 5px 12px;
        background: rgba(0, 0, 8, 0.45);
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255, 215, 100, 0.4);
        color: #ffd76e;
        border-radius: 20px;
        letter-spacing: 1px;
      }
    }

    .featured-info {
      flex: 1;
      padding: 30px 30px 30px 0;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .featured-title {
        font-size: 1.7rem;
        font-weight: 700;
        margin: 14px 0 12px;
        line-height: 1.4;
        background: linear-gradient(135deg, #fff, #cfe9ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .featured-excerpt {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.8;
        margin-bottom: 18px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .read-more {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 18px;
        font-size: 0.9rem;
        color: #4ecdc4;
        font-weight: 500;

        .arrow {
          transition: transform 0.3s ease;
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes orbitSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 随笔网格
.posts-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 0 30px;

  .post-card {
    position: relative;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    backdrop-filter: blur(12px);
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.4s ease, box-shadow 0.4s ease;
    display: flex;
    flex-direction: column;
    opacity: 0;
    animation: cardReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;

    // 渐变描边光晕
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 18px;
      padding: 1px;
      background: linear-gradient(135deg, rgba(78, 205, 196, 0.5), rgba(167, 139, 255, 0.4), transparent 60%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      z-index: 2;
    }

    &:hover {
      transform: translateY(-8px);
      border-color: rgba(78, 205, 196, 0.3);
      box-shadow: 0 18px 40px rgba(0, 0, 8, 0.5), 0 0 30px rgba(78, 205, 196, 0.08);

      &::before {
        opacity: 1;
      }

      .card-cover .card-emoji {
        transform: scale(1.15) rotate(-5deg);
      }

      .card-cover-overlay {
        opacity: 0.3;
      }

      .card-shine {
        transform: translateX(220%) skewX(-18deg);
      }
    }

    .card-cover {
      position: relative;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .card-emoji {
        font-size: 3.2rem;
        filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.35));
        transition: transform 0.4s ease;
        z-index: 1;
      }

      .card-cover-overlay {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.2), transparent 60%);
        opacity: 0;
        transition: opacity 0.4s ease;
      }
    }

    .card-body {
      flex: 1;
      padding: 18px 20px 20px;
      display: flex;
      flex-direction: column;

      .card-title {
        font-size: 1.15rem;
        font-weight: 700;
        margin: 10px 0 8px;
        line-height: 1.45;
        color: #fff;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .card-excerpt {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.7;
        margin-bottom: 16px;
        flex: 1;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;

        .card-read {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.4);
          font-family: "UnidreamLED", monospace;
          white-space: nowrap;
        }
      }
    }
  }
}

// 空状态
.no-posts {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 80px 20px;

  .no-posts-icon {
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

// 阅读视图
.reader-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4vh 16px;
  background: rgba(0, 0, 8, 0.75);
  backdrop-filter: blur(16px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(78, 205, 196, 0.6), rgba(102, 126, 234, 0.6));
    border-radius: 10px;
  }

  .reader-panel {
    position: relative;
    width: 100%;
    max-width: 760px;
    background: linear-gradient(180deg, rgba(20, 22, 48, 0.92), rgba(10, 12, 28, 0.95));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 30px 80px rgba(0, 0, 8, 0.6);
    margin-bottom: 4vh;
  }

  .reader-cover {
    position: relative;
    min-height: 220px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;

    .reader-cover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0, 0, 8, 0.1) 0%, rgba(10, 12, 28, 0.85) 100%);
    }

    .reader-emoji {
      position: absolute;
      top: 24px;
      left: 30px;
      font-size: 3.5rem;
      filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.4));
      animation: float 5s ease-in-out infinite;
    }

    .reader-close {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 2;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      background: rgba(0, 0, 8, 0.4);
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

    .reader-cover-meta {
      position: relative;
      z-index: 1;

      .reader-category {
        font-size: 0.78rem;
        color: #4ecdc4;
        font-weight: 600;
        letter-spacing: 1px;
      }

      .reader-title {
        font-size: 1.9rem;
        font-weight: 800;
        margin: 10px 0 12px;
        line-height: 1.35;
        color: #fff;
        text-shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
      }

      .reader-sub-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);

        .meta-dot {
          opacity: 0.4;
        }
      }
    }
  }

  .reader-content {
    padding: 32px 40px 8px;

    .reader-para {
      font-size: 1rem;
      line-height: 2;
      color: rgba(255, 255, 255, 0.82);
      margin-bottom: 20px;
      text-align: justify;
      letter-spacing: 0.3px;

      &:first-of-type::first-letter {
        float: left;
        font-size: 3.4rem;
        line-height: 1;
        padding: 4px 12px 4px 0;
        margin-top: 4px;
        font-weight: 700;
        background: linear-gradient(135deg, #87ceeb, #4ecdc4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .reader-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 28px 0 20px;
    }

    .reader-signature {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 24px 0 8px;

      .sig-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      }

      .sig-text {
        font-size: 0.82rem;
        color: rgba(255, 255, 255, 0.45);
        font-style: italic;
        white-space: nowrap;
      }
    }
  }

  .reader-nav {
    display: flex;
    gap: 14px;
    padding: 16px 40px 36px;

    .nav-btn {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 18px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      font-size: 0.82rem;
      transition: all 0.3s ease;
      overflow: hidden;

      &.next {
        justify-content: flex-end;
        text-align: right;
      }

      .nav-text {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .nav-arrow {
        color: #4ecdc4;
        flex-shrink: 0;
      }

      &:hover:not(:disabled) {
        background: rgba(78, 205, 196, 0.12);
        border-color: rgba(78, 205, 196, 0.35);
        color: #fff;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }
}

// 阅读视图过渡
.reader-fade-enter-active,
.reader-fade-leave-active {
  transition: opacity 0.3s ease;

  .reader-panel {
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

.reader-fade-enter-from,
.reader-fade-leave-to {
  opacity: 0;

  .reader-panel {
    transform: translateY(30px) scale(0.97);
  }
}

// 响应式
@media (max-width: 768px) {
  .blog-header {
    padding: 36px 18px 6px;

    .title-section .blog-title {
      font-size: 2.4rem;
    }
    .title-section .blog-subtitle {
      font-size: 0.9rem;
    }
  }

  .blog-toolbar {
    padding: 18px;
    flex-direction: column;
    align-items: stretch;

    .search-box {
      justify-content: center;
      .search-input {
        width: 100%;
      }
    }
  }

  .featured-section {
    padding: 4px 18px 20px;

    .featured-card {
      flex-direction: column;
      gap: 0;

      .featured-cover {
        width: 100%;
        min-height: 180px;
      }

      .featured-info {
        padding: 22px;
      }
    }
  }

  .posts-grid {
    grid-template-columns: 1fr;
    padding: 0 18px;
    gap: 18px;
  }

  .reader-overlay {
    padding: 2vh 10px;

    .reader-cover {
      min-height: 180px;
      padding: 24px 20px;

      .reader-cover-meta .reader-title {
        font-size: 1.5rem;
      }
    }

    .reader-content {
      padding: 24px 22px 6px;

      .reader-para {
        font-size: 0.95rem;
        line-height: 1.9;
      }
    }

    .reader-nav {
      padding: 12px 22px 28px;
      flex-direction: column;
    }
  }
}
</style>
