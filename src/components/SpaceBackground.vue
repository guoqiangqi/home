<template>
  <div class="space-background">
    <!-- 动态星星背景 -->
    <div class="stars-container">
      <div class="stars stars-1"></div>
      <div class="stars stars-2"></div>
      <div class="stars stars-3"></div>
    </div>
    
    <!-- 闪动星星 -->
    <div class="twinkling-stars">
      <div class="twinkle-star star-t1"></div>
      <div class="twinkle-star star-t2"></div>
      <div class="twinkle-star star-t3"></div>
      <div class="twinkle-star star-t4"></div>
      <div class="twinkle-star star-t5"></div>
      <div class="twinkle-star star-t6"></div>
      <div class="twinkle-star star-t7"></div>
      <div class="twinkle-star star-t8"></div>
      <div class="twinkle-star star-t9"></div>
      <div class="twinkle-star star-t10"></div>
      <div class="twinkle-star star-t11"></div>
      <div class="twinkle-star star-t12"></div>
      <div class="twinkle-star star-t13"></div>
      <div class="twinkle-star star-t14"></div>
      <div class="twinkle-star star-t15"></div>
    </div>
    
    <!-- 流星效果 -->
    <div class="meteors-container">
      <div class="meteor"></div>
    </div>
    
    <!-- 行星效果 -->
    <div class="planets">
      <div class="planet planet-1">🌍</div>
      <div class="planet planet-2">🌙</div>
      <div class="planet planet-sun">☀️</div>
    </div>
    
    <!-- 星云效果 -->
    <div class="nebula nebula-1"></div>
    <div class="nebula nebula-2"></div>
  </div>
</template>

<script setup>
// 太空背景组件 - 只负责背景效果
</script>

<style lang="scss" scoped>
.space-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

// 星星背景
.stars-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background: transparent;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(2px 2px at 20px 30px, #eee, transparent),
      radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 90px 40px, #fff, transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 160px 30px, #ddd, transparent);
    background-repeat: repeat;
    background-size: 200px 200px;
    animation: twinkle 4s ease-in-out infinite;
  }
}

.stars-1 {
  &::before {
    animation-delay: 0s;
  }
}

.stars-2 {
  &::before {
    background-size: 350px 350px;
    animation-delay: 1s;
  }
}

.stars-3 {
  &::before {
    background-size: 450px 450px;
    animation-delay: 2s;
  }
}

// 闪动星星
.twinkling-stars {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

// 流星效果
.meteors-container {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.meteor {
  position: absolute;
  width: 3px;
  height: 3px;
  background: linear-gradient(45deg, #fff, #87ceeb, #fff);
  border-radius: 50%;
  box-shadow: 
    0 0 8px rgba(255, 255, 255, 0.9),
    0 0 16px rgba(135, 206, 235, 0.7),
    0 0 24px rgba(255, 255, 255, 0.5);
  animation: meteorSlide 6s linear infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -20px;
    width: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), rgba(135, 206, 235, 0.6));
    transform: translateY(-50%);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: -40px;
    width: 15px;
    height: 0.5px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), rgba(135, 206, 235, 0.3));
    transform: translateY(-50%);
  }
}

.meteor {
  top: 30%;
  left: -50px;
}

.twinkle-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  animation: twinkleStar 3s ease-in-out infinite;
}

.star-t1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
  width: 4px;
  height: 4px;
  animation: twinkleStarLarge 4s ease-in-out infinite;
}

.star-t2 {
  top: 25%;
  left: 85%;
  animation-delay: 0.5s;
  width: 2px;
  height: 2px;
}

.star-t3 {
  top: 45%;
  left: 20%;
  animation-delay: 1s;
  width: 3.5px;
  height: 3.5px;
  animation: twinkleStarLarge 3.5s ease-in-out infinite;
}

.star-t4 {
  top: 35%;
  left: 75%;
  animation-delay: 1.5s;
  width: 1.5px;
  height: 1.5px;
}

.star-t5 {
  top: 65%;
  left: 15%;
  animation-delay: 2s;
  width: 2px;
  height: 2px;
}

.star-t6 {
  top: 55%;
  left: 80%;
  animation-delay: 2.5s;
  width: 4.5px;
  height: 4.5px;
  animation: twinkleStarLarge 4.5s ease-in-out infinite;
}

.star-t7 {
  top: 75%;
  left: 25%;
  animation-delay: 0.8s;
  width: 1.5px;
  height: 1.5px;
}

.star-t8 {
  top: 85%;
  left: 70%;
  animation-delay: 1.3s;
  width: 3px;
  height: 3px;
  animation: twinkleStarMedium 3.8s ease-in-out infinite;
}

.star-t9 {
  top: 10%;
  left: 50%;
  animation-delay: 0.3s;
  width: 2px;
  height: 2px;
}

.star-t10 {
  top: 30%;
  left: 45%;
  animation-delay: 1.8s;
  width: 1.8px;
  height: 1.8px;
}

.star-t11 {
  top: 50%;
  left: 60%;
  animation-delay: 0.7s;
  width: 3.2px;
  height: 3.2px;
  animation: twinkleStarMedium 3.2s ease-in-out infinite;
}

.star-t12 {
  top: 70%;
  left: 40%;
  animation-delay: 2.2s;
  width: 1.6px;
  height: 1.6px;
}

.star-t13 {
  top: 20%;
  left: 30%;
  animation-delay: 1.2s;
  width: 5px;
  height: 5px;
  animation: twinkleStarLarge 5s ease-in-out infinite;
}

.star-t14 {
  top: 40%;
  left: 90%;
  animation-delay: 0.9s;
  width: 1.9px;
  height: 1.9px;
}

.star-t15 {
  top: 60%;
  left: 5%;
  animation-delay: 1.6s;
  width: 2.8px;
  height: 2.8px;
  animation: twinkleStarMedium 3.6s ease-in-out infinite;
}





// 行星效果
.planets {
  position: absolute;
  width: 100%;
  height: 100%;
}

.planet {
  position: absolute;
  font-size: 2rem;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.planet-1 {
  top: 70%;
  right: 10%;
  animation-delay: 0s;
}

.planet-2 {
  top: 15%;
  right: 10%;
  animation-delay: 2s;
}

.planet-sun {
  top: 5%;
  left: 5%;
  font-size: 2rem;
  opacity: 0.8;
  animation: sunGlow 4s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(255, 165, 0, 0.6));
}

// 星云效果
.nebula {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.1) 0%, transparent 70%);
  animation: nebulaFloat 20s ease-in-out infinite;
}

.nebula-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 20%;
  animation-delay: 0s;
}

.nebula-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 10s;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes twinkleStar {
  0%, 100% { 
    opacity: 0.2;
    transform: scale(1);
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  }
  25% { 
    opacity: 0.8;
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
  }
  50% { 
    opacity: 1;
    transform: scale(1.4);
    box-shadow: 0 0 12px rgba(255, 255, 255, 1), 0 0 20px rgba(135, 206, 235, 0.6);
  }
  75% { 
    opacity: 0.6;
    transform: scale(1.1);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
  }
}

@keyframes twinkleStarLarge {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
  }
  25% { 
    opacity: 0.9;
    transform: scale(1.3);
    box-shadow: 0 0 12px rgba(255, 255, 255, 1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.6);
    box-shadow: 0 0 18px rgba(255, 255, 255, 1), 0 0 30px rgba(135, 206, 235, 0.8), 0 0 40px rgba(255, 255, 255, 0.4);
  }
  75% { 
    opacity: 0.7;
    transform: scale(1.2);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
  }
}

@keyframes twinkleStarMedium {
  0%, 100% { 
    opacity: 0.25;
    transform: scale(1);
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.85);
  }
  25% { 
    opacity: 0.85;
    transform: scale(1.25);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.95);
  }
  50% { 
    opacity: 1;
    transform: scale(1.5);
    box-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 25px rgba(135, 206, 235, 0.7);
  }
  75% { 
    opacity: 0.65;
    transform: scale(1.15);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.85);
  }
}





@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes sunGlow {
  0%, 100% { 
    transform: scale(1);
    filter: drop-shadow(0 0 20px rgba(255, 165, 0, 0.6));
  }
  50% { 
    transform: scale(1.1);
    filter: drop-shadow(0 0 30px rgba(255, 165, 0, 0.8));
  }
}

@keyframes nebulaFloat {
  0%, 100% { 
    transform: translateX(0) translateY(0) scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: translateX(20px) translateY(-20px) scale(1.1);
    opacity: 0.6;
  }
}

// 流星动画
@keyframes meteorSlide {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 100px));
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .planet {
    font-size: 1.5rem;
  }
  
  .planet-sun {
    font-size: 1.8rem;
  }
  
  .nebula-1 {
    width: 200px;
    height: 200px;
  }
  
  .nebula-2 {
    width: 150px;
    height: 150px;
  }
  
  // 移动端流星适配
  .meteor {
    width: 2.5px;
    height: 2.5px;
    
    &::before {
      width: 15px;
      height: 0.8px;
    }
    
    &::after {
      width: 12px;
      height: 0.4px;
    }
  }
  
  .twinkle-star {
    width: 1.5px;
    height: 1.5px;
  }
  
  .star-t1 {
    width: 2.8px;
    height: 2.8px;
  }
  
  .star-t3 {
    width: 2.4px;
    height: 2.4px;
  }
  
  .star-t6 {
    width: 3px;
    height: 3px;
  }
  
  .star-t8, .star-t11, .star-t15 {
    width: 2px;
    height: 2px;
  }
  
  .star-t13 {
    width: 3.2px;
    height: 3.2px;
  }
}
</style> 