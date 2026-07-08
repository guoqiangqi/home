import * as THREE from 'three'

/**
 * 粒子云护盾
 * 在飞船周围球壳上分布大量粒子，形成流动的云雾状能量场
 */
export default class ShieldEffect {
  constructor(scene, radius = 3) {
    this.scene = scene
    this._radius = radius
    this._visible = false
    this._opacity = 0
    this._targetOpacity = 0

    const COUNT = 8000
    const positions = new Float32Array(COUNT * 3)
    const seeds     = new Float32Array(COUNT)   // 每颗粒子的随机种子
    const scales    = new Float32Array(COUNT)   // 粒子大小变化

    // 斐波那契球面分布 + 径向扰动，形成密实连续的透明光盾壳面
    const golden = Math.PI * (3 - Math.sqrt(5))
    const shellR = radius
    for (let i = 0; i < COUNT; i++) {
      const t  = (i + 0.5) / COUNT
      const y  = 1 - 2 * t
      const r2 = Math.sqrt(Math.max(0, 1 - y * y))
      const th = golden * i
      const x  = Math.cos(th) * r2
      const z  = Math.sin(th) * r2
      // 径向扰动极小，粒子紧密贴合球面形成连续壳
      const rr = shellR * (0.985 + Math.random() * 0.03)
      positions[i * 3]     = x * rr
      positions[i * 3 + 1] = y * rr
      positions[i * 3 + 2] = z * rr
      seeds[i]  = Math.random()
      scales[i] = 1.2 + Math.random() * 1.4
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed',  new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uColor:   { value: new THREE.Color('#9ee8e3') },
        uOpacity: { value: 0 },
        uPixel:   { value: 1 }, // 像素比，用于点大小
      },
      vertexShader: `
        attribute float aSeed;
        attribute float aScale;
        uniform float uTime;
        uniform float uOpacity;
        uniform float uPixel;
        varying float vSeed;
        varying float vGlow;
        void main() {
          vSeed = aSeed;
          // 个体闪烁：每颗粒子按自己的 seed 独立呼吸
          float flick = 0.55 + 0.45 * sin(uTime * 1.8 + aSeed * 28.0);
          // 慢速径向呼吸：整体云壳轻微涨缩
          float breath = 0.92 + 0.08 * sin(uTime * 0.9 + aSeed * 6.28);
          vGlow = flick * uOpacity;

          vec3 pos = position * breath;
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          float size = aScale * (2.8 + flick * 1.5) * uPixel;
          gl_PointSize = size * (180.0 / -mvPos.z);
          gl_PointSize = clamp(gl_PointSize, 1.0, 14.0);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vSeed;
        varying float vGlow;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float core = 1.0 - smoothstep(0.0, 0.2, d);
          float soft = 1.0 - smoothstep(0.0, 0.5, d);
          // 中心微白 + 青色主体，大量重叠形成连续透明壳
          vec3 col = mix(uColor, vec3(1.0), core * 0.35);
          float alpha = vGlow * (core * 0.35 + soft * 0.22);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(geo, this.material)
    this.points.visible = false
    this.points.frustumCulled = false
    this.scene.add(this.points)

    // 用于像素比同步
    this._syncPixel = (renderer) => {
      this.material.uniforms.uPixel.value = renderer ? renderer.getPixelRatio() : 1
    }
  }

  setVisible(value) {
    this._visible = value
    this._targetOpacity = value ? 1.0 : 0.0
    if (value) this.points.visible = true
  }

  setColor(hexColor) {
    this.material.uniforms.uColor.value.set(hexColor)
  }

  /** 同步像素比（在 resize 时由外部调用） */
  syncPixelRatio(renderer) {
    this._syncPixel(renderer)
  }

  update(elapsed) {
    this.material.uniforms.uTime.value = elapsed
    // 平滑淡入淡出
    this._opacity += (this._targetOpacity - this._opacity) * 0.05
    this.material.uniforms.uOpacity.value = this._opacity

    // 粒子云缓慢自转，营造能量场流动感
    this.points.rotation.y = elapsed * 0.08
    this.points.rotation.x = Math.sin(elapsed * 0.05) * 0.15

    if (!this._visible && this._opacity < 0.005) {
      this.points.visible = false
    }
  }

  dispose() {
    this.points.geometry.dispose()
    this.material.dispose()
    this.scene.remove(this.points)
  }
}
