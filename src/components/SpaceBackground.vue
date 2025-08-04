<template>
  <div class="space-background">
    <!-- 动态星星背景 -->
    <div class="stars-container">
      <div class="stars stars-1"></div>
      <div class="stars stars-2"></div>
      <div class="stars stars-3"></div>
    </div>
    
    <!-- 流星效果 -->
    <div class="shooting-stars">
      <div class="shooting-star star-1"></div>
      <div class="shooting-star star-2"></div>
      <div class="shooting-star star-3"></div>
      <div class="shooting-star star-4"></div>
      <div class="shooting-star star-5"></div>
      <div class="shooting-star star-6"></div>
      <div class="shooting-star star-7"></div>
      <div class="shooting-star star-8"></div>
    </div>
    
    <!-- 行星效果 -->
    <div class="planets">
      <div class="planet planet-1">🌍</div>
      <div class="planet planet-2">🌙</div>
      <div class="planet planet-3">🪐</div>
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
    background-size: 300px 300px;
    animation-delay: 1s;
  }
}

.stars-3 {
  &::before {
    background-size: 400px 400px;
    animation-delay: 2s;
  }
}

// 流星效果
.shooting-stars {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shooting-star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #fff 0%, rgba(255,255,255,0.8) 30%, transparent 70%);
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(255,255,255,0.8);
}

.star-1 {
  top: 20%;
  left: -50px;
  animation: shootingStar1 8s linear infinite;
}

.star-2 {
  top: 60%;
  left: -50px;
  animation: shootingStar2 12s linear infinite;
  animation-delay: 3s;
}

.star-3 {
  top: 40%;
  left: -50px;
  animation: shootingStar3 10s linear infinite;
  animation-delay: 6s;
}

.star-4 {
  top: 25%;
  left: -50px;
  animation: shootingStar4 9s linear infinite;
  animation-delay: 2s;
}

.star-5 {
  top: 80%;
  left: -50px;
  animation: shootingStar5 11s linear infinite;
  animation-delay: 4s;
}

.star-6 {
  top: 50%;
  left: -50px;
  animation: shootingStar6 7s linear infinite;
  animation-delay: 8s;
}

.star-7 {
  top: 35%;
  left: -50px;
  animation: shootingStar7 9.5s linear infinite;
  animation-delay: 1s;
}

.star-8 {
  top: 75%;
  left: -50px;
  animation: shootingStar8 6.5s linear infinite;
  animation-delay: 5s;
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
  top: 15%;
  right: 10%;
  animation-delay: 0s;
}

.planet-2 {
  top: 70%;
  left: 5%;
  animation-delay: 2s;
}

.planet-3 {
  top: 30%;
  left: 15%;
  animation-delay: 4s;
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

@keyframes shootingStar1 {
  0% {
    transform: translateX(-50px) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 50px)) translateY(calc(15vh + 50px));
    opacity: 0;
  }
}

@keyframes shootingStar2 {
  0% {
    transform: translateX(-50px) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 50px)) translateY(calc(35vh + 50px));
    opacity: 0;
  }
}

@keyframes shootingStar3 {
  0% {
    transform: translateX(-50px) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 50px)) translateY(calc(55vh + 50px));
    opacity: 0;
  }
}

@keyframes shootingStar4 {
  0% {
    transform: translateX(-50px) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 50px)) translateY(calc(25vh + 50px));
    opacity: 0;
  }
}

@keyframes shootingStar5 {
  0% {
    transform: translateX(-50px) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 50px)) translateY(calc(45vh + 50px));
    opacity: 0;
  }
}

@keyframes shootingStar6 {
  0% {
    transform: translateX(-50px) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 50px)) translateY(calc(65vh + 50px));
    opacity: 0;
  }
}

@keyframes shootingStar7 {
  0% {
    transform: translateX(-50px) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 50px)) translateY(calc(30vh + 50px));
    opacity: 0;
  }
}

@keyframes shootingStar8 {
  0% {
    transform: translateX(-50px) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 50px)) translateY(calc(50vh + 50px));
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
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

// 响应式设计
@media (max-width: 768px) {
  .planet {
    font-size: 1.5rem;
  }
  
  .nebula-1 {
    width: 200px;
    height: 200px;
  }
  
  .nebula-2 {
    width: 150px;
    height: 150px;
  }
  
  .shooting-star {
    &::before {
      width: 80px;
      height: 1.5px;
    }
    
    &::after {
      width: 60px;
      height: 0.8px;
    }
  }
}
</style> 