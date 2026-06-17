<template>
  <div :class="store.backgroundShow ? 'cover show' : 'cover'">
    <img
      v-show="store.imgLoadStatus"
      :src="bgUrl"
      class="bg"
      alt="cover"
      @load="imgLoadComplete"
      @error.once="imgLoadError"
      @animationend="imgAnimationEnd"
    />
    <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
    <Transition name="fade" mode="out-in">
      <a
        v-if="store.backgroundShow && store.coverType != '3'"
        class="down"
        :href="bgUrl"
        target="_blank"
      >
        下载壁纸
      </a>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { mainStore } from "@/store";
import { Error } from "@icon-park/vue-next";
import { ElMessage } from 'element-plus';

const store = mainStore();
const bgUrl = ref(null);
const imgTimeout = ref(null);
const loadingStartTime = ref(0);
const MIN_LOADING_MS = 2600;
const emit = defineEmits(["loadComplete"]);

// 当前本地壁纸编号 (1-10)
const currentLocalBgIndex = ref(1);

// 更换壁纸链接
const changeBg = (type) => {
  if (type == 0) {
    bgUrl.value = `/images/background${currentLocalBgIndex.value}.jpg`;
  } else if (type == 1) {
    bgUrl.value = "https://api.dujin.org/bing/1920.php";
  } else if (type == 2) {
    bgUrl.value = "https://api.vvhan.com/api/wallpaper/views";
  } else if (type == 3) {
    bgUrl.value = "https://api.vvhan.com/api/wallpaper/acg";
  }
};

// 图片加载完成
const imgLoadComplete = () => {
  const elapsed = Date.now() - loadingStartTime.value;
  const minWait = Math.max(0, MIN_LOADING_MS - elapsed);
  const jitter = Math.floor(Math.random() * 400) + 200;
  imgTimeout.value = setTimeout(() => {
    store.setImgLoadStatus(true);
  }, minWait + jitter);
};

// 图片动画完成
const imgAnimationEnd = () => {
  console.log("壁纸加载且动画完成");
  // 加载完成事件
  emit("loadComplete");
};

// 图片显示失败
const imgLoadError = () => {
  console.error("壁纸加载失败：", bgUrl.value);
  ElMessage({
    message: "壁纸加载失败，已临时切换回默认",
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  // 切换到下一个壁纸，避免无限循环
  currentLocalBgIndex.value = (currentLocalBgIndex.value % 10) + 1;
  bgUrl.value = `/images/background${currentLocalBgIndex.value}.jpg`;
};

// 切换到下一个本地壁纸
const nextLocalBackground = () => {
  const oldIndex = currentLocalBgIndex.value;
  currentLocalBgIndex.value = (currentLocalBgIndex.value % 10) + 1;
  console.log(`本地壁纸索引从 ${oldIndex} 切换到 ${currentLocalBgIndex.value}`);
};

// 设置本地壁纸索引
const setLocalBackgroundIndex = (index) => {
  if (index >= 1 && index <= 10) {
    currentLocalBgIndex.value = index;
    console.log(`设置本地壁纸索引为 ${index}`);
  }
};

// 监听壁纸切换
watch(
  () => store.coverType,
  (value) => {
    loadingStartTime.value = Date.now();
    changeBg(value);
    // 重置加载状态以确保新背景能正确加载
    store.setImgLoadStatus(false);
  },
);

// 监听本地壁纸索引变化
watch(
  () => currentLocalBgIndex.value,
  (newIndex) => {
    if (store.coverType === "0") {
      loadingStartTime.value = Date.now();
      const newBgUrl = `/images/background${newIndex}.jpg`;
      console.log(`切换到本地壁纸: ${newBgUrl}`);
      bgUrl.value = newBgUrl;
      // 重置加载状态以确保新背景能正确加载
      store.setImgLoadStatus(false);
    }
  },
);

onMounted(() => {
  loadingStartTime.value = Date.now();
  // 加载壁纸
  changeBg(store.coverType);
});

onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
});

// 暴露方法给父组件
defineExpose({
  nextLocalBackground,
  currentLocalBgIndex,
  setLocalBackgroundIndex
});
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    filter: blur(20px) brightness(0.3);
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade-blur-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 0.45s;
  }
  .gray {
    opacity: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);

    transition: 1.5s;
    &.hidden {
      opacity: 0;
      transition: 1.5s;
    }
  }
  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: block;
    padding: 20px 26px;
    border-radius: 8px;
    background-color: #00000030;
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }
    &:active {
      transform: scale(1);
    }
  }
}
</style>
