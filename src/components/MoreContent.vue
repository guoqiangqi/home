<template>
  <div class="more-content">
    <div class="content-header">
      <planet theme="two-tone" size="20" :fill="['#efefef', '#00000020']" />
      <span>关于本站</span>
    </div>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">站点名称</span>
        <span class="info-value">{{ siteName }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">版本</span>
        <span class="info-value">v{{ version }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">作者</span>
        <span class="info-value">{{ siteAuthor }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">简介</span>
        <span class="info-value desc">{{ siteDes }}</span>
      </div>
    </div>
    <div class="motto">
      <Icon size="14"><QuoteLeft /></Icon>
      <span>{{ motto }}</span>
      <Icon size="14"><QuoteRight /></Icon>
    </div>
  </div>
</template>

<script setup>
import { Planet } from "@icon-park/vue-next";
import { Icon } from "@vicons/utils";
import { QuoteLeft, QuoteRight } from "@vicons/fa";
import config from "@/../package.json";

const siteName = import.meta.env.VITE_SITE_NAME || "个人主页";
const siteAuthor = import.meta.env.VITE_SITE_AUTHOR || "";
const siteDes = import.meta.env.VITE_SITE_DES || "";
const motto = import.meta.env.VITE_DESC_TEXT || "探索未知，发现精彩";
const version = config.version;
</script>

<style lang="scss" scoped>
.more-content {
  width: 100%;
  margin-top: 10px;

  .content-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    opacity: 0.9;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem 1rem;
    margin-bottom: 1rem;

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .info-label {
        font-size: 0.7rem;
        opacity: 0.5;
        letter-spacing: 0.5px;
      }

      .info-value {
        font-size: 0.85rem;
        opacity: 0.85;

        &.desc {
          font-size: 0.8rem;
          line-height: 1.4;
          opacity: 0.7;
        }
      }
    }
  }

  .motto {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.6rem 0.8rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    font-size: 0.8rem;
    opacity: 0.75;
    font-style: oblique;
    line-height: 1.5;
  }
}
</style>
