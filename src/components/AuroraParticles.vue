<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

interface AuroraParticlesProps {
  count?: number;
  color1?: string;
  color2?: string;
  speed?: number;
  maxSize?: number;
  bandCenter?: number;
  bandSpread?: number;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
}

const props = withDefaults(defineProps<AuroraParticlesProps>(), {
  count: 90,
  color1: '#c8e6ff',
  color2: '#7b5cff',
  speed: 1.0,
  maxSize: 2.6,
  bandCenter: 0.5,
  bandSpread: 0.28,
  enableMouseInteraction: true,
  mouseInfluence: 1.0
});

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  drift: number;
  rise: number;
  sway: number;
  swayPhase: number;
  twinklePhase: number;
  twinkleSpeed: number;
  mix: number;
}

const containerRef = ref<HTMLDivElement | null>(null);

let cleanup: (() => void) | null = null;

const setup = () => {
  if (!containerRef.value) return;
  const container = containerRef.value;
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const c1 = hexToRgb(props.color1);
  const c2 = hexToRgb(props.color2);

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  const target = { x: 0.5, y: 0.5 };
  const current = { x: 0.5, y: 0.5 };

  let particles: Particle[] = [];

  const spawnY = () => {
    // 围绕极光带中心做高斯式聚集，越靠近带中心粒子越密集
    const g = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
    return props.bandCenter + g * 2 * props.bandSpread;
  };

  const makeParticle = (initial: boolean): Particle => ({
    x: Math.random(),
    y: initial ? spawnY() : props.bandCenter + props.bandSpread + Math.random() * 0.25,
    size: (0.4 + Math.random() * 0.6) * props.maxSize,
    baseAlpha: 0.25 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 0.00006,
    rise: (0.00004 + Math.random() * 0.00012) * props.speed,
    sway: 0.0006 + Math.random() * 0.0014,
    swayPhase: Math.random() * Math.PI * 2,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.6 + Math.random() * 1.8,
    mix: Math.random()
  });

  const initParticles = () => {
    particles = [];
    for (let i = 0; i < props.count; i++) {
      particles.push(makeParticle(true));
    }
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = container.offsetWidth;
    height = container.offsetHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
  };

  resize();
  initParticles();
  window.addEventListener('resize', resize);

  function handleMouseMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    target.x = (e.clientX - rect.left) / rect.width;
    target.y = (e.clientY - rect.top) / rect.height;
  }
  function handleMouseLeave() {
    target.x = 0.5;
    target.y = 0.5;
  }
  if (props.enableMouseInteraction) {
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
  }

  let rafId: number;
  let lastTime = performance.now();

  const render = (now: number) => {
    rafId = requestAnimationFrame(render);
    const dt = Math.min(now - lastTime, 50);
    lastTime = now;
    const t = now * 0.001;

    current.x += (target.x - current.x) * 0.04;
    current.y += (target.y - current.y) * 0.04;
    const mouseDx = (current.x - 0.5) * 0.04 * props.mouseInfluence;
    const mouseDy = (current.y - 0.5) * 0.02 * props.mouseInfluence;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (const p of particles) {
      p.y -= p.rise * dt;
      p.x += p.drift * dt + Math.sin(t * p.twinkleSpeed * 0.5 + p.swayPhase) * p.sway * (dt / 16.6);

      // 漂出顶部后从底部重新生成
      if (p.y < props.bandCenter - props.bandSpread - 0.15) {
        Object.assign(p, makeParticle(false));
      }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;

      const twinkle = 0.55 + 0.45 * Math.sin(t * p.twinkleSpeed + p.twinklePhase);

      // 距极光带中心越远越暗，使粒子自然融入光带
      const distFromBand = Math.abs(p.y - props.bandCenter) / (props.bandSpread + 0.2);
      const bandFalloff = Math.max(0, 1 - distFromBand * distFromBand);

      const alpha = p.baseAlpha * twinkle * bandFalloff;
      if (alpha <= 0.01) continue;

      const px = (p.x + mouseDx) * width;
      const py = (p.y + mouseDy) * height;
      const radius = p.size * (0.6 + twinkle * 0.6);

      const r = Math.round(c1[0] + (c2[0] - c1[0]) * p.mix);
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * p.mix);
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * p.mix);

      const glow = ctx.createRadialGradient(px, py, 0, px, py, radius * 4);
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      glow.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`);
      glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, radius * 4, 0, Math.PI * 2);
      ctx.fill();

      // 中心更亮的核心
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  rafId = requestAnimationFrame(render);

  cleanup = () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    if (props.enableMouseInteraction) {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    }
    if (canvas.parentNode === container) container.removeChild(canvas);
  };
};

onMounted(() => {
  setup();
});

onBeforeUnmount(() => {
  cleanup?.();
});

watch(
  () => [
    props.count,
    props.color1,
    props.color2,
    props.speed,
    props.maxSize,
    props.bandCenter,
    props.bandSpread,
    props.enableMouseInteraction,
    props.mouseInfluence
  ],
  () => {
    cleanup?.();
    setup();
  }
);
</script>

<template>
  <div ref="containerRef" class="aurora-particles-container" />
</template>

<style scoped>
.aurora-particles-container {
  width: 100%;
  height: 100%;
}
</style>
