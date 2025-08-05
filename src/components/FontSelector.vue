<template>
  <div class="font-selector">
    <div class="font-options">
      <div 
        v-for="font in fonts" 
        :key="font.name"
        :class="['font-option', { active: currentFont === font.family }]"
        @click="selectFont(font.family)"
      >
        <span :style="{ fontFamily: font.family }" class="font-preview">
          {{ siteUrl }}
        </span>
        <span class="font-name">{{ font.name }}</span>
      </div>
    </div>
    <div class="font-actions">
      <el-button 
        size="small" 
        type="info" 
        @click="resetFont"
        class="reset-btn"
      >
        重置为默认字体
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentLogoFont, setLogoFont, resetToDefaultFont } from '@/utils/fontInit'

const currentFont = ref('Satisfy')

// 站点链接处理
const siteUrl = computed(() => {
  const url = import.meta.env.VITE_SITE_URL;
  if (!url) return "imsyy.top";
  // 判断协议前缀
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const urlFormat = url.replace(/^(https?:\/\/)/, "");
    return urlFormat;
  }
  return url;
});

const fonts = [
  {
    name: 'Satisfy',
    family: 'Satisfy, cursive'
  },
  {
    name: 'Dancing Script',
    family: 'Dancing Script, cursive'
  },
  {
    name: 'Great Vibes',
    family: 'Great Vibes, cursive'
  },
  {
    name: 'Kaushan Script',
    family: 'Kaushan Script, cursive'
  },
  {
    name: 'Allura',
    family: 'Allura, cursive'
  }
]

const selectFont = (fontFamily) => {
  currentFont.value = fontFamily
  setLogoFont(fontFamily)
}

const resetFont = () => {
  resetToDefaultFont()
  currentFont.value = 'Satisfy, cursive'
}

onMounted(() => {
  // 初始化时加载保存的字体
  const savedFont = getCurrentLogoFont()
  currentFont.value = savedFont
})
</script>

<style lang="scss" scoped>
.font-selector {
  margin: 20px 0;
  
  .font-options {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    
    .font-option {
      padding: 12px 16px;
      border: 2px solid transparent;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
      text-align: center;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
      
      &.active {
        border-color: #4CAF50;
        background: rgba(76, 175, 80, 0.2);
      }
      
      .font-preview {
        display: block;
        font-size: 1.2rem;
        font-weight: 500;
        margin-bottom: 5px;
        color: #fff;
      }
      
      .font-name {
        display: block;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
        font-family: 'HarmonyOS_Regular', sans-serif;
      }
    }
    
    .font-actions {
      margin-top: 15px;
      text-align: center;
      
      .reset-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
}
</style> 