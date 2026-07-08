import * as THREE from 'three'

export default class LightingSystem {
  constructor(scene) {
    this.scene = scene
    this._engineTime = 0
    this._engineOn = true
    this._shieldOn = false

    // ── 环境光（保证贴图基础亮度）
    this.ambient = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(this.ambient)

    // ── 主方向光（顶前方，白色主照明）
    this.main = new THREE.DirectionalLight(0xffffff, 1.2)
    this.main.position.set(4, 8, 6)
    this.main.castShadow = true
    this.main.shadow.mapSize.set(2048, 2048)
    this.main.shadow.camera.near = 0.5
    this.main.shadow.camera.far = 40
    this.main.shadow.camera.left = -8
    this.main.shadow.camera.right = 8
    this.main.shadow.camera.top = 8
    this.main.shadow.camera.bottom = -8
    this.main.shadow.bias = -0.0005
    scene.add(this.main)

    // ── 青色科幻补光（左上）
    this.fill = new THREE.DirectionalLight(0x4ecdc4, 0.6)
    this.fill.position.set(-5, 4, 3)
    scene.add(this.fill)

    // ── 冷蓝轮廓背光（后方）
    this.rim = new THREE.DirectionalLight(0x3366ff, 0.5)
    this.rim.position.set(-3, 1, -8)
    scene.add(this.rim)

    // ── 底部紫色反射（地面反光模拟）
    this.bottom = new THREE.DirectionalLight(0x8844cc, 0.25)
    this.bottom.position.set(0, -6, 2)
    scene.add(this.bottom)

    // ── 引擎尾焰点光源（贴图模型头朝 -X，尾部在 +X）
    this.engineLight1 = new THREE.PointLight(0x00e5ff, 1.8, 5.0)
    this.engineLight1.position.set(2.2, 0.0, 0.3)
    scene.add(this.engineLight1)

    this.engineLight2 = new THREE.PointLight(0x00b4ff, 1.5, 4.5)
    this.engineLight2.position.set(2.2, 0.0, -0.3)
    scene.add(this.engineLight2)

    // ── 引擎核心点
    this.engineCore = new THREE.PointLight(0x88ddff, 1.4, 3.5)
    this.engineCore.position.set(2.5, 0.0, 0.0)
    scene.add(this.engineCore)

    // ── 护盾辉光
    this.shieldGlow = new THREE.PointLight(0x4ecdc4, 0, 10.0)
    this.shieldGlow.position.set(0, 0, 0)
    scene.add(this.shieldGlow)

    // ── 头部装饰点光（-X 方向头部）
    this.accentTop = new THREE.PointLight(0x7755ff, 0.8, 4.5)
    this.accentTop.position.set(-2.0, 0.5, 0.0)
    scene.add(this.accentTop)

    // ── 前置射灯：单个 SpotLight（对有几何体的近距物体生效）
    this.spotLight = new THREE.SpotLight(0xaaddff, 0, 12, Math.PI / 16, 0.1, 1.8)
    this.spotLight.position.set(-1.6, 0.0, 0.0)
    this.spotLight.target.position.set(-7.0, 0.0, 0.0)
    scene.add(this.spotLight)
    scene.add(this.spotLight.target)

    // ── 体积光柱粒子（模拟光束在太空中的散射效果）
    this._beamParticles = null
    this._beamGroup = new THREE.Group()
    scene.add(this._beamGroup)
    this._buildBeamParticles()

    this._spotOn = false
    this._spotColor = new THREE.Color(0xaaddff)
  }

  // 体积光柱粒子：单束，从飞船头部宽口出发，远端收窄，模拟大气散射光束
  _buildBeamParticles() {
    const BEAM_COUNT = 480
    const BEAM_LEN = 2.0
    const NEAR_R = 0.45   // 船头处光束半径（宽）
    const FAR_R  = 0.06   // 末端半径（窄）
    const positions = new Float32Array(BEAM_COUNT * 3)
    const seeds     = new Float32Array(BEAM_COUNT)

    for (let i = 0; i < BEAM_COUNT; i++) {
      const t = Math.random()                        // 0=船头 1=远端
      const x = -1.6 - t * BEAM_LEN
      const coneR = (NEAR_R + (FAR_R - NEAR_R) * t) * Math.sqrt(Math.random())
      const angle = Math.random() * Math.PI * 2
      positions[i * 3]     = x
      positions[i * 3 + 1] = Math.cos(angle) * coneR
      positions[i * 3 + 2] = Math.sin(angle) * coneR
      seeds[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xaaddff) },
        uLen:   { value: BEAM_LEN },
        uTime:  { value: 0 },
      },
      vertexShader: `
        uniform float uLen;
        uniform float uTime;
        attribute float aSeed;
        varying float vT;
        varying float vAxis;   // 离中心轴的归一化距离 (0=轴心 1=边缘)
        varying float vFlick;
        void main() {
          vT = clamp((-position.x - 1.6) / uLen, 0.0, 1.0);
          // 当前截面半径
          float nearR = 0.45;
          float farR  = 0.06;
          float sectionR = nearR + (farR - nearR) * vT;
          // 离中心轴距离 → 归一化 0~1
          float radial = length(position.yz);
          vAxis = clamp(radial / max(sectionR, 0.001), 0.0, 1.0);
          // 个体闪烁（大气湍流感）
          vFlick = 0.7 + 0.3 * sin(uTime * 3.5 + aSeed * 31.4) * cos(uTime * 2.1 + aSeed * 17.0);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          float size = mix(4.0, 0.7, vT) * (0.6 + vFlick * 0.5);
          gl_PointSize = size * (250.0 / -mvPos.z);
          gl_PointSize = clamp(gl_PointSize, 0.4, 11.0);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vT;
        varying float vAxis;
        varying float vFlick;
        uniform vec3 uColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          // 柔和圆形粒子
          float core = 1.0 - smoothstep(0.0, 0.18, d);
          float soft = 1.0 - smoothstep(0.0, 0.5, d);
          // 沿光束长度衰减
          float fade = 1.0 - vT * vT;
          // 截面亮度：轴心亮，边缘暗（高斯分布感）
          float axisGlow = exp(-vAxis * vAxis * 3.5);
          vec3 col = mix(uColor, vec3(1.0), core * 0.55 * axisGlow);
          float alpha = fade * vFlick * (core * 0.55 + soft * 0.32) * (0.4 + axisGlow * 0.8);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(geo, mat)
    points.visible = false
    this._beamGroup.add(points)
    this._beamPoints = points
    this._beamMat = mat
  }

  setMainColor(color) {
    this.fill.color.copy(color).lerp(new THREE.Color(0x4ecdc4), 0.4)
    this.rim.color.copy(color).lerp(new THREE.Color(0x1a4fff), 0.6)
    this._spotColor.copy(color).lerp(new THREE.Color(0xaaddff), 0.6)
    if (this._spotOn) {
      this.spotLight.color.copy(this._spotColor)
      this._beamMat?.uniforms.uColor.value.copy(this._spotColor)
    }
  }

  setSpotLights(on) {
    this._spotOn = on
    this.spotLight.intensity = on ? 6.0 : 0
    if (on) {
      this.spotLight.color.copy(this._spotColor)
    }
    if (this._beamPoints) this._beamPoints.visible = on
  }

  setMainIntensity(value) {
    this.main.intensity = value * 1.2
    this.fill.intensity = value * 0.5
    this.ambient.intensity = 0.6 + value * 0.25
  }

  setEngineLights(on) {
    this._engineOn = on
    if (!on) {
      this.engineLight1.intensity = 0
      this.engineLight2.intensity = 0
      this.engineCore.intensity = 0
    }
  }

  activateShieldGlow() {
    this._shieldOn = true
    this.shieldGlow.intensity = 3.0
  }

  deactivateShieldGlow() {
    this._shieldOn = false
    this.shieldGlow.intensity = 0
  }

  update(elapsed) {
    if (this._engineOn) {
      // 双频叠加闪烁
      const f1 = Math.sin(elapsed * 8.0) * 0.3 + Math.sin(elapsed * 13.7) * 0.15
      const f2 = Math.sin(elapsed * 7.5 + 1.2) * 0.3 + Math.sin(elapsed * 11.3 + 2.1) * 0.15
      this.engineLight1.intensity = 1.6 + f1
      this.engineLight2.intensity = 1.3 + f2
      this.engineCore.intensity = 1.1 + Math.sin(elapsed * 18.0) * 0.4
    }

    // 顶部装饰灯缓慢呼吸
    this.accentTop.intensity = 0.8 + 0.4 * Math.sin(elapsed * 1.8)

    // 护盾呼吸
    if (this._shieldOn) {
      this.shieldGlow.intensity = 2.5 + 0.8 * Math.sin(elapsed * 3.0)
    }

    // 光柱粒子时间动画
    if (this._beamMat) {
      this._beamMat.uniforms.uTime.value = elapsed
    }
  }

  dispose() {
    ;[
      this.ambient, this.main, this.fill, this.rim, this.bottom,
      this.engineLight1, this.engineLight2, this.engineCore,
      this.shieldGlow, this.accentTop,
      this.spotLight, this.spotLight?.target,
    ].filter(Boolean).forEach((l) => this.scene.remove(l))
    if (this._beamGroup) {
      this._beamPoints?.geometry.dispose()
      this._beamMat?.dispose()
      this.scene.remove(this._beamGroup)
    }
  }
}
