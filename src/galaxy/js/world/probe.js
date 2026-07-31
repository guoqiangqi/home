import * as THREE from 'three'

import Experience from '../experience.js'

/**
 * Probe - 深空探测器（Deep-Space Probe）
 *
 * 移植自 threejs-x-space「Orbital Playground」场景的 DeepSpaceProbe（R3F 组件），
 * 用原生 Three.js 重建并做了科幻化强化：
 *   - 彩虹镀膜金箔主体 + 青色能量缝隙灯带
 *   - 双层全息陀螺环绕机身缓慢进动
 *   - 天线锅扫描波束 + 向外扩散的信号涟漪环
 *   - 太阳能板导轨上滑动的能量脉冲，翼尖红 / 绿航行频闪灯
 *   - 离子引擎尾焛 + 巡航拖尾光迹
 *
 * 行为（三星系统页面）：
 *   - 在三星系统内侧做倾斜圆轨道巡航，机头（+Z）始终朝向飞行方向
 *   - 行星用的是自定义 shader 光照，场景内无真实灯光，
 *     故探测器自带专属灯光（只影响探测器自身的实体材质）
 *   - 离子引擎默认常开，保持巡航感
 */

// 探测器机头朝向（与原实现一致）
const PROBE_FORWARD = new THREE.Vector3(0, 0, 1)

export default class Probe {
  constructor({ orbitRadius = 3.0, orbitSpeed = 0.16, orbitTilt = 0.5, scale = 0.3 } = {}) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time

    this._orbitRadius = orbitRadius
    this._orbitSpeed = orbitSpeed
    this._orbitTilt = orbitTilt
    this._engineOn = true

    this._materials = []
    this._geometries = []

    // 巡航姿态计算的复用对象，避免每帧分配
    this._pos = new THREE.Vector3()
    this._nextPos = new THREE.Vector3()
    this._dir = new THREE.Vector3()
    this._quat = new THREE.Quaternion()

    this.group = new THREE.Group()
    this.group.scale.setScalar(scale)
    this._build()
    this.scene.add(this.group)
  }

  // ─── 材质 / 几何工厂（登记以便统一 dispose）──────────────────────────

  _geo(geometry) {
    this._geometries.push(geometry)
    return geometry
  }

  _mat(material) {
    this._materials.push(material)
    return material
  }

  _standard(opts) {
    return this._mat(new THREE.MeshStandardMaterial(opts))
  }

  _physical(opts) {
    return this._mat(new THREE.MeshPhysicalMaterial(opts))
  }

  _basic(opts) {
    return this._mat(new THREE.MeshBasicMaterial(opts))
  }

  // ─── 模型构建（几何参数与原 DeepSpaceProbe 一致）────────────────────

  _build() {
    this._buildBody()
    this._buildSolarPanels()
    this._buildAntenna()
    this._buildBoom()
    this._buildSensorDome()
    this._buildIonDrive()
    this._buildThrusters()
    this._buildHoloRings()
    this._buildTrail()
    this._buildSelfLight()
  }

  // 探测器专属灯光：场景中行星为 shader 光照，没有真实灯，
  // 这里的灯随探测器移动，只照亮探测器自身的金属材质
  _buildSelfLight() {
    const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x2a2438, 1.1)
    const key = new THREE.PointLight(0xfff2dd, 2.6, 6)
    key.position.set(1.2, 1.6, 0.8)
    this.group.add(hemi, key)
  }

  _buildBody() {
    // 金箔包覆主体：彩虹镀膜 + 清漆，随视角泛出油膜光泽
    const body = new THREE.Mesh(
      this._geo(new THREE.BoxGeometry(0.35, 0.28, 0.42)),
      this._physical({
        color: 0xc9862e,
        metalness: 0.85,
        roughness: 0.32,
        clearcoat: 0.5,
        iridescence: 0.55,
        iridescenceIOR: 1.3,
      })
    )
    body.castShadow = true
    body.receiveShadow = true
    this.group.add(body)

    // 前部仪器面板：深色玻化面罩，搭配能量缝隙灯带
    const panel = new THREE.Mesh(
      this._geo(new THREE.BoxGeometry(0.29, 0.23, 0.04)),
      this._physical({ color: 0x0d1622, metalness: 0.6, roughness: 0.18, clearcoat: 1.0 })
    )
    panel.position.set(0, 0, 0.225)
    panel.castShadow = true
    this.group.add(panel)

    // 能量缝隙灯带：前面板四边发光边框 + 机身两侧纵向光线，整体呼吸脉动
    this._seamMat = this._basic({
      color: 0x4ef5ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    const seamHGeo = this._geo(new THREE.BoxGeometry(0.3, 0.008, 0.006))
    const seamVGeo = this._geo(new THREE.BoxGeometry(0.008, 0.23, 0.006))
    const seamSideGeo = this._geo(new THREE.BoxGeometry(0.006, 0.006, 0.4))
    for (const y of [-0.115, 0.115]) {
      const seam = new THREE.Mesh(seamHGeo, this._seamMat)
      seam.position.set(0, y, 0.247)
      this.group.add(seam)
    }
    for (const x of [-0.145, 0.145]) {
      const seam = new THREE.Mesh(seamVGeo, this._seamMat)
      seam.position.set(x, 0, 0.247)
      this.group.add(seam)
    }
    for (const x of [-0.176, 0.176]) {
      const seam = new THREE.Mesh(seamSideGeo, this._seamMat)
      seam.position.set(x, 0.09, 0)
      this.group.add(seam)
    }

    // 尾部发动机舱
    const engineHousing = new THREE.Mesh(
      this._geo(new THREE.CylinderGeometry(0.11, 0.15, 0.16, 20)),
      this._standard({ color: 0x252b34, metalness: 0.92, roughness: 0.24 })
    )
    engineHousing.position.set(0, 0, -0.27)
    engineHousing.rotation.x = Math.PI / 2
    engineHousing.castShadow = true
    this.group.add(engineHousing)
  }

  _buildSolarPanels() {
    const armGeo = this._geo(new THREE.BoxGeometry(0.17, 0.035, 0.055))
    const armMat = this._standard({ color: 0xa9adb4, metalness: 0.82, roughness: 0.3 })
    const wingGeo = this._geo(new THREE.BoxGeometry(0.78, 0.026, 0.31))
    const wingMat = this._physical({ color: 0x0a3264, metalness: 0.48, roughness: 0.28, clearcoat: 0.8 })
    const cellLineGeo = this._geo(new THREE.BoxGeometry(0.009, 0.004, 0.3))
    const cellLineMat = this._basic({ color: 0x76baf0, toneMapped: false })
    const railGeo = this._geo(new THREE.BoxGeometry(0.77, 0.004, 0.008))
    const railMat = this._basic({ color: 0x4b86b8, toneMapped: false })
    const sliderGeo = this._geo(new THREE.BoxGeometry(0.06, 0.007, 0.012))
    const sliderMat = this._basic({
      color: 0x9ff3ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    const strobeGeo = this._geo(new THREE.SphereGeometry(0.018, 10, 10))

    this._panels = []
    this._sliders = []
    this._strobes = []
    for (const x of [-0.51, 0.51]) {
      const wing = new THREE.Group()
      wing.position.set(x, 0, -0.02)

      const arm = new THREE.Mesh(armGeo, armMat)
      arm.position.set(-Math.sign(x) * 0.24, 0, 0)
      wing.add(arm)

      const board = new THREE.Mesh(wingGeo, wingMat)
      board.castShadow = true
      wing.add(board)

      // 电池片分隔线与导轨（发光细节）
      for (const offset of [-0.22, 0, 0.22]) {
        const line = new THREE.Mesh(cellLineGeo, cellLineMat)
        line.position.set(offset, 0.017, 0)
        wing.add(line)
      }
      for (const offset of [-0.095, 0.095]) {
        const rail = new THREE.Mesh(railGeo, railMat)
        rail.position.set(0, 0.018, offset)
        wing.add(rail)

        // 能量脉冲：沿导轨来回滑动的亮条，两翧方向相反
        const slider = new THREE.Mesh(sliderGeo, sliderMat)
        slider.position.set(0, 0.02, offset)
        wing.add(slider)
        this._sliders.push({ mesh: slider, dir: Math.sign(x), phase: offset * 3 })
      }

      // 翼尖航行频闪灯：左红右绿，交替闪烁
      const strobe = new THREE.Mesh(
        strobeGeo,
        this._basic({
          color: x < 0 ? 0xff4455 : 0x44ff88,
          transparent: true,
          opacity: 0.35,
          toneMapped: false,
        })
      )
      strobe.position.set(Math.sign(x) * 0.37, 0.035, 0)
      wing.add(strobe)
      this._strobes.push({ mesh: strobe, phase: x < 0 ? 0 : Math.PI })

      this.group.add(wing)
      this._panels.push(wing)
    }
  }

  _buildAntenna() {
    this._antenna = new THREE.Group()
    this._antenna.position.set(0, 0.16, 0.16)

    // 高增益天线锅（车削曲面）
    const dishProfile = [
      new THREE.Vector2(0.025, 0),
      new THREE.Vector2(0.14, 0.012),
      new THREE.Vector2(0.29, 0.105),
    ]
    const dish = new THREE.Mesh(
      this._geo(new THREE.LatheGeometry(dishProfile, 48)),
      this._physical({
        color: 0xe9e5d9,
        metalness: 0.86,
        roughness: 0.24,
        clearcoat: 0.45,
        side: THREE.DoubleSide,
      })
    )
    dish.rotation.x = -Math.PI / 2
    dish.castShadow = true
    this._antenna.add(dish)

    // 馈源杆与馈源球
    const feedRod = new THREE.Mesh(
      this._geo(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 10)),
      this._standard({ color: 0x696f77, metalness: 0.9, roughness: 0.24 })
    )
    feedRod.position.set(0, 0, -0.19)
    feedRod.rotation.x = Math.PI / 2
    this._antenna.add(feedRod)

    const feedTip = new THREE.Mesh(
      this._geo(new THREE.SphereGeometry(0.035, 12, 12)),
      this._standard({
        color: 0xd4ab5c,
        metalness: 0.85,
        roughness: 0.28,
        emissive: 0x66d9ff,
        emissiveIntensity: 0.8,
      })
    )
    feedTip.position.set(0, 0, -0.34)
    this._antenna.add(feedTip)

    // 天线锅口发光环
    const rim = new THREE.Mesh(
      this._geo(new THREE.TorusGeometry(0.29, 0.006, 8, 48)),
      this._basic({
        color: 0x7fe4ff,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
    )
    rim.position.set(0, 0, 0.105)
    this._antenna.add(rim)

    // 扫描波束：从锅面向外张开的光锥，亮度呼吸脉动
    this._scanBeamMat = this._basic({
      color: 0x66d9ff,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    const beam = new THREE.Mesh(this._geo(new THREE.ConeGeometry(0.3, 0.95, 24, 1, true)), this._scanBeamMat)
    beam.rotation.x = Math.PI / 2
    beam.position.set(0, 0, -0.475)
    this._antenna.add(beam)

    // 信号涟漪：三道向外扩散淡出的光环
    this._ripples = []
    const rippleGeo = this._geo(new THREE.RingGeometry(0.92, 1.0, 48))
    for (let i = 0; i < 3; i++) {
      const mat = this._basic({
        color: 0x8fe9ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
      const ripple = new THREE.Mesh(rippleGeo, mat)
      this._antenna.add(ripple)
      this._ripples.push({ mesh: ripple, mat, offset: i / 3 })
    }

    this.group.add(this._antenna)
  }

  _buildBoom() {
    // 磁强计悬臂 + RTG 电源
    const boom = new THREE.Group()
    boom.position.set(0, -0.2, -0.03)

    const rod = new THREE.Mesh(
      this._geo(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 10)),
      this._standard({ color: 0x9499a2, metalness: 0.86, roughness: 0.3 })
    )
    rod.rotation.z = Math.PI / 2
    boom.add(rod)

    const rtg = new THREE.Mesh(
      this._geo(new THREE.CylinderGeometry(0.055, 0.075, 0.16, 16)),
      this._standard({ color: 0x353b46, metalness: 0.88, roughness: 0.3 })
    )
    rtg.position.set(0.27, 0, 0)
    rtg.rotation.z = Math.PI / 2
    rtg.castShadow = true
    boom.add(rtg)

    this.group.add(boom)
  }

  _buildSensorDome() {
    // 光学传感器圆罩：自发光脉动，像正在工作的监视器
    this._domeMat = this._physical({
      color: 0x75b9df,
      metalness: 0.3,
      roughness: 0.18,
      transmission: 0.18,
      emissive: 0x2bb8ff,
      emissiveIntensity: 0.6,
    })
    const dome = new THREE.Mesh(this._geo(new THREE.SphereGeometry(0.055, 14, 14)), this._domeMat)
    dome.position.set(0.13, 0.16, -0.04)
    this.group.add(dome)
  }

  _buildHoloRings() {
    // 双层全息陀螺环：绕机身缓慢进动，营造导航陀螺 / 力场发生器的感觉
    const ringMat = this._basic({
      color: 0x55e6ff,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    this._holoRingA = new THREE.Mesh(this._geo(new THREE.TorusGeometry(0.52, 0.0035, 6, 80)), ringMat)
    this._holoRingB = new THREE.Mesh(this._geo(new THREE.TorusGeometry(0.6, 0.0025, 6, 80)), ringMat)
    this.group.add(this._holoRingA, this._holoRingB)
  }

  _buildTrail() {
    // 巡航拖尾：跟随历史位置的逐级缩小光点链（世界空间，直接挂到场景）
    this._trailCount = 34
    this._trailPoints = Array.from({ length: this._trailCount }, () => new THREE.Vector3())
    this._trailInit = false
    this._trailLastSample = 0
    this._trailDummy = new THREE.Object3D()
    this._trailMat = this._basic({
      color: 0x5fd7ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    this._trail = new THREE.InstancedMesh(
      this._geo(new THREE.SphereGeometry(0.05, 8, 8)),
      this._trailMat,
      this._trailCount
    )
    this._trail.frustumCulled = false
    this.scene.add(this._trail)
  }

  _buildIonDrive() {
    // 离子引擎：双层锥形尾焰 + 点光源；关机时仅显示喷口余晖圆片
    this._ionDrive = new THREE.Group()
    this._ionDrive.position.set(0, 0, -0.51)
    this._ionDrive.rotation.x = -Math.PI / 2

    this._ionLight = new THREE.PointLight(0x70cfff, 2.2, 2.4)
    this._ionDrive.add(this._ionLight)

    this._outerPlume = new THREE.Mesh(
      this._geo(new THREE.ConeGeometry(0.12, 0.72, 20, 1, true)),
      this._basic({
        color: 0x3caeff,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
    )
    this._ionDrive.add(this._outerPlume)

    this._innerPlume = new THREE.Mesh(
      this._geo(new THREE.ConeGeometry(0.055, 0.55, 16, 1, true)),
      this._basic({
        color: 0xdff8ff,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      })
    )
    this._ionDrive.add(this._innerPlume)
    this.group.add(this._ionDrive)

    // 待机余晖
    this._idleGlow = new THREE.Group()
    this._idleLight = new THREE.PointLight(0xb8ddff, 0.75, 1.2)
    this._idleGlow.add(this._idleLight)

    const glowDisc = new THREE.Mesh(
      this._geo(new THREE.CircleGeometry(0.075, 18)),
      this._basic({ color: 0x7fcfff, transparent: true, opacity: 0.42, toneMapped: false })
    )
    glowDisc.position.set(0, 0, -0.37)
    this._idleGlow.add(glowDisc)
    this.group.add(this._idleGlow)

    this._syncEngineVisual()
  }

  _buildThrusters() {
    // 侧向姿态推进器（引擎开启时随机脉冲）
    this._thrusters = new THREE.Group()
    const jetGeo = this._geo(new THREE.ConeGeometry(0.026, 0.16, 10, 1, true))
    const jetMat = this._basic({
      color: 0xa8e9ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    for (const side of [-1, 1]) {
      const jet = new THREE.Mesh(jetGeo, jetMat)
      jet.position.set(side * 0.25, 0.12, -0.14)
      jet.rotation.z = side * -Math.PI / 2
      this._thrusters.add(jet)
    }
    this.group.add(this._thrusters)
    this._syncEngineVisual()
  }

  _syncEngineVisual() {
    if (this._ionDrive) this._ionDrive.visible = this._engineOn
    if (this._idleGlow) this._idleGlow.visible = !this._engineOn
    if (this._thrusters) this._thrusters.visible = this._engineOn
  }

  // ─── 公开 API ────────────────────────────────────────────────────────

  setEngineOn(value) {
    this._engineOn = !!value
    this._syncEngineVisual()
  }

  update() {
    if (!this.group) return
    // 场景 Time 单位为毫秒，换算为秒
    const elapsed = this.time.elapsed * 0.001

    // 在三星系统内侧的倾斜圆轨道，叠加轻微的高度起伏
    const angle = elapsed * this._orbitSpeed
    this._orbitPoint(angle, elapsed, this._pos)
    this._orbitPoint(angle + 0.01, elapsed + 0.01, this._nextPos)
    this.group.position.copy(this._pos)

    // 机头对准飞行方向（沿轨道切线）
    this._dir.copy(this._nextPos).sub(this._pos).normalize()
    this._quat.setFromUnitVectors(PROBE_FORWARD, this._dir)
    this.group.quaternion.slerp(this._quat, 0.15)

    // 天线锅缓慢摆动扫描
    if (this._antenna) this._antenna.rotation.z = Math.sin(elapsed * 0.38) * 0.08

    // 扫描波束呼吸 + 信号涟漪向外扩散淡出
    this._scanBeamMat.opacity = 0.05 + (Math.sin(elapsed * 1.6) * 0.5 + 0.5) * 0.08
    for (const r of this._ripples) {
      const t = (elapsed * 0.35 + r.offset) % 1
      const s = 0.12 + t * 0.55
      r.mesh.scale.setScalar(s)
      r.mesh.position.z = -0.12 - t * 0.5
      r.mat.opacity = (1 - t) * 0.4
    }

    // 能量缝隙灯带呼吸脉动
    this._seamMat.opacity = 0.55 + (Math.sin(elapsed * 2.3) * 0.5 + 0.5) * 0.45

    // 传感器圆罩心跳式发光
    this._domeMat.emissiveIntensity = 0.35 + (Math.sin(elapsed * 3.1) * 0.5 + 0.5) * 0.9

    // 全息陀螺环：双环异轴反向进动
    this._holoRingA.rotation.set(elapsed * 0.55, elapsed * 0.32, 0)
    this._holoRingB.rotation.set(-elapsed * 0.38, 0, elapsed * 0.47)

    // 导轨能量脉冲滑动（三角波往复）
    for (const s of this._sliders) {
      const t = (elapsed * 0.6 * s.dir + s.phase) % 1
      const tri = Math.abs(((t + 1) % 1) * 2 - 1)
      s.mesh.position.x = (tri - 0.5) * 0.66
    }

    // 翼尖航行频闪灯：锐利的双闪节奏
    for (const s of this._strobes) {
      const t = (elapsed * 1.4 + s.phase / (Math.PI * 2)) % 1
      const on = t < 0.06 || (t > 0.12 && t < 0.18)
      s.mesh.scale.setScalar(on ? 1.6 : 0.7)
      s.mesh.material.opacity = on ? 1 : 0.35
    }

    // 巡航拖尾：首帧用当前位置铺满；之后按固定时间间隔采样，拖尾更长更像光带
    if (!this._trailInit) {
      this._trailPoints.forEach((p) => p.copy(this._pos))
      this._trailInit = true
    }
    if (elapsed - this._trailLastSample > 0.06) {
      this._trailLastSample = elapsed
      for (let i = this._trailCount - 1; i > 0; i--) {
        this._trailPoints[i].copy(this._trailPoints[i - 1])
      }
    }
    this._trailPoints[0].copy(this._pos)
    for (let i = 0; i < this._trailCount; i++) {
      const fade = 1 - i / this._trailCount
      this._trailDummy.position.copy(this._trailPoints[i])
      this._trailDummy.scale.setScalar(0.25 + fade * fade * 0.75)
      this._trailDummy.updateMatrix()
      this._trail.setMatrixAt(i, this._trailDummy.matrix)
    }
    this._trail.instanceMatrix.needsUpdate = true
    // 引擎开启时拖尾更亮更实
    this._trailMat.opacity = this._engineOn ? 0.3 : 0.14

    // 太阳能板呼吸式微倾
    if (this._panels) {
      const sway = Math.sin(elapsed * 0.3) * 0.05
      this._panels[0].rotation.x = sway
      this._panels[1].rotation.x = -sway
    }

    // 引擎开启：尾焰脉动 + 推进器闪烁
    if (this._engineOn) {
      const pulse = 1 + Math.sin(elapsed * 17) * 0.09
      this._outerPlume.scale.set(1, pulse, 1)
      this._innerPlume.scale.set(1, 1 / pulse, 1)
      const jetPulse = Math.max(0.18, Math.sin(elapsed * 4.7) * 1.2)
      this._thrusters.scale.setScalar(jetPulse)
    }
  }

  _orbitPoint(angle, elapsed, out) {
    const r = this._orbitRadius
    out.set(
      Math.cos(angle) * r,
      Math.sin(angle) * r * Math.sin(this._orbitTilt) + Math.sin(elapsed * 0.4) * 0.12,
      Math.sin(angle) * r * Math.cos(this._orbitTilt)
    )
  }

  destroy() {
    this.group?.parent?.remove(this.group)
    if (this._trail) {
      this._trail.parent?.remove(this._trail)
      this._trail.dispose()
      this._trail = null
    }
    this._geometries.forEach((g) => g.dispose())
    this._materials.forEach((m) => m.dispose())
    this._geometries = []
    this._materials = []
    this.group = null
  }
}
