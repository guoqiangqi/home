uniform float uTime;
uniform float uSize;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform float uExplode;  // 0=assembled 1=exploded

attribute float aRandom;
attribute vec3 aVelocity;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec3 pos = position;

  // 爆炸态：粒子向外扩散
  float explodeFactor = uExplode * aRandom;
  pos += aVelocity * explodeFactor * 2.0;

  // 自旋扰动
  float angle = uTime * 0.15 + aRandom * 6.2831;
  float radius = length(pos.xz);
  float swirl = sin(uTime * 0.4 + aRandom * 3.14) * 0.08;
  pos.x += cos(angle) * swirl;
  pos.z += sin(angle) * swirl;
  pos.y += sin(uTime * 0.3 + aRandom * 2.0) * 0.15;

  // 鼠标排斥（在 NDC 空间近似计算）
  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vec4 clipPos = projectionMatrix * viewMatrix * worldPos;
  vec2 ndc = clipPos.xy / clipPos.w;
  vec2 mouseOffset = ndc - uMouse;
  float mouseDist = length(mouseOffset);
  float mousePush = smoothstep(0.3, 0.0, mouseDist) * uMouseInfluence;
  pos += normalize(vec3(mouseOffset.x, 0.0, mouseOffset.y)) * mousePush * 1.5;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // 粒子大小随距离衰减 + 闪烁
  float flicker = 0.7 + 0.3 * sin(uTime * 2.0 + aRandom * 10.0);
  gl_PointSize = uSize * flicker * (300.0 / -mvPosition.z);
  gl_PointSize = clamp(gl_PointSize, 1.0, 12.0);

  // 颜色：青 <-> 紫渐变
  float colorMix = aRandom;
  vec3 colorA = vec3(0.306, 0.804, 0.769); // #4ECDC4
  vec3 colorB = vec3(0.529, 0.420, 0.847); // #8773D8 -> 调亮
  vec3 colorC = vec3(0.529, 0.808, 0.922); // #87CEEB
  vec3 c = colorMix < 0.5
    ? mix(colorA, colorC, colorMix * 2.0)
    : mix(colorC, colorB, (colorMix - 0.5) * 2.0);
  vColor = c;

  // 透明度随距离和随机
  vAlpha = (0.5 + 0.5 * aRandom) * flicker;
}
