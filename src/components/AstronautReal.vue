<template>
  <div class="astronaut-real">
    <div class="astronaut-glow"></div>
    <div class="astronaut-shadow"></div>
    <svg class="astronaut-svg" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="arHelmet" cx="42%" cy="35%" r="58%">
          <stop offset="0%" stop-color="#f8f9fc" />
          <stop offset="55%" stop-color="#c8ced8" />
          <stop offset="100%" stop-color="#8890a0" />
        </radialGradient>
        <linearGradient id="arVisor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d4a850" />
          <stop offset="35%" stop-color="#f0d080" />
          <stop offset="60%" stop-color="#c09030" />
          <stop offset="100%" stop-color="#806020" />
        </linearGradient>
        <linearGradient id="arSuit" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f5f6fa" />
          <stop offset="50%" stop-color="#e0e4ec" />
          <stop offset="100%" stop-color="#b8bcc8" />
        </linearGradient>
        <linearGradient id="arShadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(0,0,0,0.15)" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>
        <linearGradient id="arDepth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.12)" />
          <stop offset="50%" stop-color="transparent" />
          <stop offset="100%" stop-color="rgba(0,0,0,0.2)" />
        </linearGradient>
        <filter id="arGlow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- 脐带缆 -->
      <path d="M 30 200 Q 10 240 20 270" stroke="rgba(200,210,220,0.3)" stroke-width="2" fill="none" />

      <!-- 喷气/姿态推进器微光 -->
      <ellipse cx="100" cy="272" rx="6" ry="10" fill="rgba(135,206,235,0.35)" class="thruster" />

      <!-- 背包 PLSS -->
      <rect x="72" y="148" width="56" height="70" rx="12" fill="#707880" />
      <rect x="78" y="154" width="44" height="20" rx="4" fill="#889098" />
      <rect x="82" y="180" width="36" height="8" rx="2" fill="#606870" opacity="0.6" />
      <rect x="82" y="194" width="36" height="8" rx="2" fill="#606870" opacity="0.6" />

      <!-- 躯干 -->
      <path d="M 68 148 Q 68 200 72 230 L 128 230 Q 132 200 132 148 Z" fill="url(#arSuit)" />
      <path d="M 68 148 Q 68 200 72 230 L 128 230 Q 132 200 132 148 Z" fill="url(#arShadow)" />

      <!-- 胸控面板 -->
      <rect x="88" y="168" width="24" height="20" rx="3" fill="#505860" />
      <rect x="92" y="172" width="6" height="6" rx="1" fill="#40c080" opacity="0.7" />
      <rect x="102" y="172" width="6" height="6" rx="1" fill="#e04040" opacity="0.6" />
      <rect x="92" y="180" width="16" height="4" rx="1" fill="#687078" />

      <!-- 腰带 -->
      <rect x="70" y="195" width="60" height="8" rx="3" fill="#989898" />
      <rect x="88" y="196" width="24" height="6" rx="2" fill="#c04020" opacity="0.8" />

      <!-- 左腿 -->
      <path d="M 76 228 L 72 268 Q 74 272 84 272 L 88 228 Z" fill="url(#arSuit)" />
      <!-- 右腿 -->
      <path d="M 112 228 L 116 268 Q 114 272 104 272 L 100 228 Z" fill="url(#arSuit)" />
      <!-- 靴子 -->
      <ellipse cx="80" cy="272" rx="12" ry="6" fill="#a0a4ac" />
      <ellipse cx="108" cy="272" rx="12" ry="6" fill="#a0a4ac" />

      <!-- 左臂 -->
      <path d="M 68 155 Q 40 165 32 190 Q 28 200 36 208 Q 44 212 50 200 Q 52 180 68 170 Z" fill="url(#arSuit)" />
      <circle cx="34" cy="206" r="12" fill="url(#arSuit)" />
      <circle cx="34" cy="206" r="9" fill="#d0d4dc" />

      <!-- 右臂 -->
      <path d="M 132 155 Q 160 165 168 185 Q 172 195 164 202 Q 156 206 150 195 Q 148 175 132 168 Z" fill="url(#arSuit)" />
      <circle cx="166" cy="198" r="12" fill="url(#arSuit)" />
      <circle cx="166" cy="198" r="9" fill="#d0d4dc" />

      <!-- 头盔 -->
      <circle cx="100" cy="95" r="52" fill="url(#arHelmet)" filter="url(#arGlow)" />
      <circle cx="100" cy="95" r="52" fill="url(#arDepth)" />
      <circle cx="100" cy="95" r="48" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
      <ellipse cx="100" cy="95" rx="48" ry="46" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="3" />

      <!-- 金色反光面罩 -->
      <ellipse cx="100" cy="98" rx="38" ry="32" fill="url(#arVisor)" />
      <ellipse cx="100" cy="98" rx="36" ry="30" fill="none" stroke="rgba(255,220,120,0.3)" stroke-width="1" />
      <ellipse cx="82" cy="82" rx="14" ry="8" fill="rgba(255,255,255,0.25)" transform="rotate(-25 82 82)" />
      <ellipse cx="118" cy="108" rx="8" ry="5" fill="rgba(255,255,255,0.1)" transform="rotate(15 118 108)" />

      <!-- 头盔接缝 -->
      <path d="M 55 95 Q 100 130 145 95" stroke="rgba(0,0,0,0.1)" stroke-width="1" fill="none" />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.astronaut-real {
  position: relative;
  width: min(22vw, 200px);
  height: min(30vw, 280px);
  transform-style: preserve-3d;
  transform: perspective(600px) rotateX(8deg);

  .astronaut-glow {
    position: absolute;
    inset: 5% 0%;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(135, 206, 235, 0.18) 0%, rgba(80, 120, 200, 0.06) 50%, transparent 75%);
    animation: glowPulse 4s ease-in-out infinite;
    transform: translateZ(-20px);
  }

  .astronaut-shadow {
    position: absolute;
    bottom: -5%;
    left: 10%;
    width: 80%;
    height: 12%;
    background: radial-gradient(ellipse, rgba(0, 0, 0, 0.35) 0%, transparent 70%);
    filter: blur(6px);
    transform: rotateX(80deg) translateZ(-30px);
  }

  .astronaut-svg {
    width: 100%;
    height: 100%;
    animation: astronautDrift 6s ease-in-out infinite;
    filter:
      drop-shadow(0 12px 25px rgba(0, 0, 0, 0.55))
      drop-shadow(0 0 20px rgba(135, 206, 235, 0.15));
    transform: translateZ(10px);

    .thruster {
      animation: thrusterPulse 0.6s ease-in-out infinite alternate;
    }
  }
}

@keyframes astronautDrift {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  33% { transform: translateY(-14px) rotate(1deg); }
  66% { transform: translateY(-8px) rotate(-1deg); }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes thrusterPulse {
  from { opacity: 0.25; transform: scaleY(0.8); }
  to { opacity: 0.5; transform: scaleY(1.2); }
}

@media (max-width: 768px) {
  .astronaut-real {
    width: min(40vw, 160px);
    height: min(55vw, 224px);
  }
}
</style>
