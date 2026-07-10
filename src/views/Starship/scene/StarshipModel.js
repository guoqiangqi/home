import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

/**
 * 构建太空科幻环境贴图（程序化 CubeRenderTarget，用于金属反射）
 */
function buildSpaceEnvMap(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  const scene = new THREE.Scene()
  const colors = [
    new THREE.Color(0x020818),
    new THREE.Color(0x061830),
    new THREE.Color(0x0a0f28),
  ]

  const skyGeo = new THREE.SphereGeometry(10, 16, 16)
  const skyMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })
  const colAttr = []
  const posAttr = skyGeo.attributes.position
  for (let i = 0; i < posAttr.count; i++) {
    const y = posAttr.getY(i)
    const t = (y / 10 + 1) / 2
    const c = new THREE.Color().lerpColors(colors[2], t > 0.5 ? colors[0] : colors[1], t > 0.5 ? (t - 0.5) * 2 : t * 2)
    colAttr.push(c.r, c.g, c.b)
  }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(colAttr, 3))
  scene.add(new THREE.Mesh(skyGeo, skyMat))

  const lights = [
    { pos: new THREE.Vector3(5, 3, -8), color: new THREE.Color(0x4ecdc4), intensity: 3 },
    { pos: new THREE.Vector3(-6, -2, -7), color: new THREE.Color(0x6677ff), intensity: 2 },
    { pos: new THREE.Vector3(0, 6, -5), color: new THREE.Color(0xa78bff), intensity: 1.5 },
  ]
  lights.forEach(({ pos, color, intensity }) => {
    const l = new THREE.PointLight(color, intensity, 20)
    l.position.copy(pos)
    scene.add(l)
  })

  const envMap = pmremGenerator.fromScene(scene).texture
  pmremGenerator.dispose()
  return envMap
}

/**
 * 语义化部件分区：根据顶点 Y 坐标范围将几何体分配到对应的飞船部件
 * 部件定义（基于归一化 Y 范围 0~1）：
 *   - 主炮/鼻锥     (0.82 ~ 1.00)  —— noseCone
 *   - 驾驶舱        (0.62 ~ 0.82)  —— cockpit
 *   - 舰体中段      (0.38 ~ 0.62)  —— midSection
 *   - 武器/侧翼     (0.20 ~ 0.38)  —— wings
 *   - 引擎舱/尾部   (0.00 ~ 0.20)  —— engineBay
 */
const PART_DEFS = [
  {
    key: 'noseCone',
    label: '鼻锥',
    yMin: 0.82, yMax: 1.00,
    // 向前上方炸开
    explodeDir: new THREE.Vector3(0, 0.7, -0.7).normalize(),
    explodeDist: 2.8,
    delay: 0.0,
  },
  {
    key: 'cockpit',
    label: '驾驶舱',
    yMin: 0.62, yMax: 0.82,
    explodeDir: new THREE.Vector3(0, 0.5, -0.4).normalize(),
    explodeDist: 2.2,
    delay: 0.06,
  },
  {
    key: 'midSection',
    label: '舰体中段',
    yMin: 0.38, yMax: 0.62,
    explodeDir: new THREE.Vector3(0, 0, 0), // 中段留在原位（微微向外）
    explodeDist: 0.6,
    delay: 0.12,
  },
  {
    key: 'wings',
    label: '侧翼',
    yMin: 0.20, yMax: 0.38,
    explodeDir: new THREE.Vector3(0, -0.3, 0.5).normalize(),
    explodeDist: 2.4,
    delay: 0.18,
  },
  {
    key: 'engineBay',
    label: '引擎舱',
    yMin: 0.00, yMax: 0.20,
    // 向下后方炸开
    explodeDir: new THREE.Vector3(0, -0.6, 0.8).normalize(),
    explodeDist: 2.6,
    delay: 0.24,
  },
]

/**
 * 将 Mesh 几何体按归一化 Y 范围分配到部件 bucket
 * 返回 Map<partKey, BufferGeometry>
 */
function partitionMeshByPartDefs(geometry, yMin, yMax, scale, center) {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry.clone()
  const posAttr = geo.attributes.position
  const normalAttr = geo.attributes.normal
  const uvAttr = geo.attributes.uv

  const range = yMax - yMin || 1

  // bucket: partKey -> { positions, normals, uvs }
  const buckets = {}
  PART_DEFS.forEach((def) => {
    buckets[def.key] = { positions: [], normals: [], uvs: [] }
  })

  const triCount = posAttr.count / 3
  for (let t = 0; t < triCount; t++) {
    const i0 = t * 3, i1 = t * 3 + 1, i2 = t * 3 + 2
    const cy = (posAttr.getY(i0) + posAttr.getY(i1) + posAttr.getY(i2)) / 3
    // 归一化 Y（0=底部, 1=顶部）
    const normalizedY = Math.max(0, Math.min(1, (cy - yMin) / range))

    // 找到归属部件
    let targetKey = PART_DEFS[PART_DEFS.length - 1].key
    for (const def of PART_DEFS) {
      if (normalizedY >= def.yMin && normalizedY <= def.yMax) {
        targetKey = def.key
        break
      }
    }

    const b = buckets[targetKey]
    for (const i of [i0, i1, i2]) {
      b.positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
      if (normalAttr) b.normals.push(normalAttr.getX(i), normalAttr.getY(i), normalAttr.getZ(i))
      if (uvAttr) b.uvs.push(uvAttr.getX(i), uvAttr.getY(i))
    }
  }

  const result = {}
  Object.entries(buckets).forEach(([key, b]) => {
    if (b.positions.length === 0) return
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.positions, 3))
    if (b.normals.length) g.setAttribute('normal', new THREE.Float32BufferAttribute(b.normals, 3))
    if (b.uvs.length) g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uvs, 2))
    result[key] = g
  })
  return result
}

export default class StarshipModel {
  constructor(scene, renderer, { onProgress, onReady } = {}) {
    this.scene = scene
    this.renderer = renderer
    this.group = null
    /** @type {Array<{mesh, partDef, originalPos, explodeRot}>} */
    this.parts = []
    this._exploded = false
    this._explodeProgress = 0
    this._targetProgress = 0
    this._engineTime = 0
    this._envMap = null

    // 尾焰系统挂在 group 下，随飞船一起变换
    this._thrusterGroup = null
    this._thrusterSystem = null

    // 飞船整体尺寸，供尾焰定位使用
    this._shipSize = new THREE.Vector3(1, 1, 1)
    this._shipYMin = -1

    this._load(onProgress, onReady)
  }

  _load(onProgress, onReady) {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      '/models/starship_texture.glb',
      (gltf) => {
        this._setup(gltf)
        onReady?.()
      },
      (event) => {
        if (event.lengthComputable) onProgress?.(event.loaded / event.total)
      },
      (err) => console.error('[StarshipModel] load error', err)
    )
  }

  _setup(gltf) {
    const root = gltf.scene

    // 计算原始包围盒
    const box = new THREE.Box3().setFromObject(root)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const scale = 2.8 / Math.max(size.x, size.y, size.z)

    // 原始 Y 范围（用于归一化）
    const rawYMin = box.min.y
    const rawYMax = box.max.y
    const rawYRange = rawYMax - rawYMin || 1

    // 构建科幻环境贴图
    this._envMap = buildSpaceEnvMap(this.renderer)
    this.scene.environment = this._envMap

    this.group = new THREE.Group()
    this.scene.add(this.group)

    // 收集 mesh
    const sourceMeshes = []
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) sourceMeshes.push(child)
    })

    // 为每个 PART_DEF 建立一个合并后的 Mesh
    // partMeshes: Map<partKey, { geometry accumulated, material }>
    // 我们先收集各 partKey 的 positions/normals/uvs，然后统一建 Mesh
    const partAccum = {}
    PART_DEFS.forEach((def) => {
      partAccum[def.key] = { positions: [], normals: [], uvs: [], material: null }
    })

    sourceMeshes.forEach((srcMesh) => {
      const geoCopy = srcMesh.geometry.clone()
      srcMesh.updateWorldMatrix(true, false)
      geoCopy.applyMatrix4(srcMesh.matrixWorld)
      if (!geoCopy.attributes.normal) geoCopy.computeVertexNormals()

      const partGeos = partitionMeshByPartDefs(geoCopy, rawYMin, rawYMax, scale, center)

      const srcMat = Array.isArray(srcMesh.material) ? srcMesh.material[0] : srcMesh.material

      Object.entries(partGeos).forEach(([key, geo]) => {
        const posAttr = geo.attributes.position
        const normalAttr = geo.attributes.normal
        const uvAttr = geo.attributes.uv
        const acc = partAccum[key]

        for (let i = 0; i < posAttr.count; i++) {
          acc.positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
          if (normalAttr) acc.normals.push(normalAttr.getX(i), normalAttr.getY(i), normalAttr.getZ(i))
          if (uvAttr) acc.uvs.push(uvAttr.getX(i), uvAttr.getY(i))
        }

        // 优先使用第一个遇到的有效材质
        if (!acc.material && srcMat instanceof THREE.MeshStandardMaterial) {
          acc.material = srcMat
        }
      })
    })

    // 构建各部件 Mesh，计算各自质心（用于拆解偏移）
    PART_DEFS.forEach((def) => {
      const acc = partAccum[def.key]
      if (acc.positions.length === 0) return

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(acc.positions, 3))
      if (acc.normals.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(acc.normals, 3))
      if (acc.uvs.length) geo.setAttribute('uv', new THREE.Float32BufferAttribute(acc.uvs, 2))
      geo.computeBoundingBox()

      // 质心（世界空间，未 scale）
      const partCenter = new THREE.Vector3()
      geo.boundingBox.getCenter(partCenter)
      // 把质心平移到原点
      geo.translate(-partCenter.x, -partCenter.y, -partCenter.z)

      // 强化材质
      const baseMat = acc.material
      let mat
      if (baseMat instanceof THREE.MeshStandardMaterial) {
        mat = baseMat.clone()
        mat.metalness = Math.min(1.0, (mat.metalness ?? 0.3) + 0.4)
        mat.roughness = Math.max(0.05, (mat.roughness ?? 0.8) - 0.35)
        mat.envMap = this._envMap
        mat.envMapIntensity = 1.4
        if (!mat.emissive || mat.emissive.getHex() === 0) {
          mat.emissive = new THREE.Color(0x0a1a2a)
          mat.emissiveIntensity = 0.15
        }
        mat.needsUpdate = true
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: 0x445566,
          metalness: 0.7,
          roughness: 0.3,
          envMap: this._envMap,
        })
      }

      const mesh = new THREE.Mesh(geo, mat)
      // 缩放后的质心坐标（飞船坐标系）
      const scaledCenter = partCenter.clone().sub(center).multiplyScalar(scale)
      mesh.position.copy(scaledCenter)
      mesh.scale.setScalar(scale)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData.partKey = def.key
      mesh.userData.partLabel = def.label

      this.group.add(mesh)

      this.parts.push({
        mesh,
        partDef: def,
        originalPos: scaledCenter.clone(),
        explodeRot: new THREE.Euler(
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.25
        ),
      })
    })

    // 记录缩放后飞船尺寸，供尾焰定位
    this._shipSize.copy(size).multiplyScalar(scale)
    this._shipYMin = (rawYMin - center.y) * scale
    // 贴图模型头朝 -X，尾部在 +X 端；引擎喷口沿 Z 轴左右对称
    this._thrusterOriginX = (box.max.x - center.x) * scale   // 尾部 X（已居中后）
    this._thrusterSpreadZ = size.z * scale * 0.264            // 喷口 Z 向间距（再扩大30%）

    // 初始化尾焰（挂载到 group 下）
    this._buildThrusters()
  }

  /**
   * 尾焰粒子系统 — 挂载在 this.group 下，位置随飞船自动同步
   * 喷口位置基于飞船实际底部 Y，向 +Z（飞船朝向后方）喷出
   */
  _buildThrusters() {
    if (!this.group) return

    this._thrusterGroup = new THREE.Group()
    this.group.add(this._thrusterGroup)

    const COUNT = 520
    const positions  = new Float32Array(COUNT * 3)
    const velocities = new Float32Array(COUNT * 3)
    const lifetimes  = new Float32Array(COUNT)
    const ages       = new Float32Array(COUNT)
    // 每颗粒子的"层级"：0=核心高温 1=中温 2=外晕，用于颜色分层
    const layers     = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      lifetimes[i] = 0.2 + Math.random() * 0.3   // 缩短寿命，尾焰更短
      ages[i]      = Math.random() * lifetimes[i]
      layers[i]    = Math.floor(Math.random() * 3)  // 0/1/2
      this._resetParticle(i, positions, velocities)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float age;
        attribute float lifetime;
        attribute float layer;
        varying float vAlpha;
        varying float vT;
        varying float vLayer;
        void main() {
          float t = clamp(age / lifetime, 0.0, 1.0);
          vT     = t;
          vLayer = layer;
          // alpha：出生时快速升起，消亡时缓慢淡出
          vAlpha = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.55, 1.0, t));
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          // 核心层(0)最大，外晕层(2)最小
          float baseSize = layer < 0.5 ? 7.0 : (layer < 1.5 ? 5.0 : 3.2);
          float size = baseSize * (1.0 - t * 0.72);
          gl_PointSize = size * (280.0 / -mvPos.z);
          gl_PointSize = clamp(gl_PointSize, 0.8, 22.0);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying float vT;
        varying float vLayer;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          // 柔和圆形粒子，中心实，边缘散
          float core = 1.0 - smoothstep(0.0, 0.18, d);
          float soft = 1.0 - smoothstep(0.05, 0.5, d);

          vec3 color;
          if (vLayer < 0.5) {
            // 核心层：喷出口附近 白→青白→青，最亮
            vec3 tip   = vec3(1.0,  1.0,  1.0);       // 白核
            vec3 mid   = vec3(0.55, 0.98, 1.0);       // 青白
            vec3 tail  = vec3(0.15, 0.72, 1.0);       // 亮青
            color = vT < 0.35 ? mix(tip, mid, vT / 0.35) : mix(mid, tail, (vT - 0.35) / 0.65);
          } else if (vLayer < 1.5) {
            // 中温层：青→蓝青，带轻微橙色暖调作为对比
            vec3 warm  = vec3(0.4,  0.92, 0.98);
            vec3 cool  = vec3(0.1,  0.45, 0.95);
            color = mix(warm, cool, vT);
          } else {
            // 外晕层：深蓝→透明，扩散柔化边缘
            vec3 edge  = vec3(0.05, 0.25, 0.75);
            vec3 fade  = vec3(0.02, 0.12, 0.45);
            color = mix(edge, fade, vT);
          }

          float alphaMult = vLayer < 0.5 ? 1.0 : (vLayer < 1.5 ? 0.68 : 0.38);
          float alpha = vAlpha * alphaMult * (core * 0.85 + soft * 0.42);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const ageAttr  = new THREE.BufferAttribute(ages, 1)
    const lifeAttr = new THREE.BufferAttribute(lifetimes, 1)
    const layerAttr = new THREE.BufferAttribute(layers, 1)
    geo.setAttribute('age', ageAttr)
    geo.setAttribute('lifetime', lifeAttr)
    geo.setAttribute('layer', layerAttr)

    const points = new THREE.Points(geo, mat)
    points.visible = false   // 默认不可见，由 setEngineOn 控制
    this._thrusterGroup.add(points)

    this._thrusterSystem = {
      points,
      positions,
      velocities,
      lifetimes,
      ages,
      layers,
      ageAttr,
      layerAttr,
      count: COUNT,
      on: false,
    }
  }

  /**
   * 重置单颗粒子到引擎喷口（飞船本地坐标系）
   * 喷口在飞船底部，向下方（-Y）或后方（+Z）喷出，
   * 具体方向取决于模型朝向，这里两者都支持
   */
  _resetParticle(i, positions, velocities) {
    // 贴图模型头朝 -X，尾部在 +X，引擎喷口沿 Z 轴左右对称
    const tailX   = this._thrusterOriginX ?? 2.0
    const spreadZ = this._thrusterSpreadZ  ?? 0.20

    // 两个引擎喷口，Z 轴左右对称，喷口本身收紧
    const side    = i % 2 === 0 ? 1 : -1
    const engineZ = side * spreadZ
    const engineX = tailX + 0.05   // 稍微远离飞船尾部发动机（向外 0.05）
    const engineY = 0.0

    // 喷口出生扩散极小，形成细腻的锥形束
    const nozzleSpread = 0.03
    positions[i * 3]     = engineX + (Math.random() - 0.5) * nozzleSpread
    positions[i * 3 + 1] = engineY + (Math.random() - 0.5) * nozzleSpread
    positions[i * 3 + 2] = engineZ + (Math.random() - 0.5) * nozzleSpread

    // 层级决定速度：核心快而直，外晕慢而散
    const layer = this._thrusterSystem?.layers?.[i] ?? (i % 3)
    const baseSpeed  = layer === 0 ? (2.0 + Math.random() * 0.6)   // 核心：快
                     : layer === 1 ? (1.5 + Math.random() * 0.5)   // 中温：中
                                   : (1.0 + Math.random() * 0.4)   // 外晕：慢
    // 横向扩散角：核心窄（0.05），外晕宽（0.20）
    const spread = layer === 0 ? 0.05 : layer === 1 ? 0.12 : 0.22
    velocities[i * 3]     = baseSpeed
    velocities[i * 3 + 1] = (Math.random() - 0.5) * spread
    velocities[i * 3 + 2] = (Math.random() - 0.5) * spread
  }

  setExploded(value) {
    this._exploded = value
    this._targetProgress = value ? 1 : 0
  }

  setEngineOn(value) {
    if (this._thrusterSystem) {
      this._thrusterSystem.on = value
      this._thrusterSystem.points.visible = value
    }
  }

  _easeInOutQuart(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
  }

  update(elapsed, delta) {
    if (!this.parts.length) return

    // ── 拆解动画 ──────────────────────────────────────────────
    const targetP = this._targetProgress
    if (Math.abs(this._explodeProgress - targetP) > 0.0005) {
      this._explodeProgress = THREE.MathUtils.lerp(this._explodeProgress, targetP, delta * 1.4 * 3.5)
    } else {
      this._explodeProgress = targetP
    }

    const progress = this._explodeProgress

    this.parts.forEach((part) => {
      const def = part.partDef
      const localP = Math.max(0, Math.min(1, (progress - def.delay) / (1 - def.delay + 0.001)))
      const eased = this._easeInOutQuart(localP)

      // 各部件沿预定义方向炸开
      // 中段（midSection）额外增加左右随机偏移感
      let dir = def.explodeDir.clone()
      if (def.key === 'midSection') {
        // 中段轻微向外均匀扩散
        dir = new THREE.Vector3(
          part.originalPos.x > 0 ? 0.4 : (part.originalPos.x < 0 ? -0.4 : 0),
          0,
          0.15
        ).normalize()
      }
      // 翼部左右对称
      if (def.key === 'wings') {
        const side = part.originalPos.x >= 0 ? 1 : -1
        dir = new THREE.Vector3(side * 1.0, -0.3, 0.4).normalize()
      }

      const offset = dir.multiplyScalar(def.explodeDist * eased)
      const target = part.originalPos.clone().add(offset)

      const lerpT = 0.10
      part.mesh.position.lerp(target, lerpT)

      part.mesh.rotation.x = THREE.MathUtils.lerp(0, part.explodeRot.x, eased)
      part.mesh.rotation.y = THREE.MathUtils.lerp(0, part.explodeRot.y, eased)
      part.mesh.rotation.z = THREE.MathUtils.lerp(0, part.explodeRot.z, eased)
    })

    // ── 尾焰粒子（在 group 本地空间更新）──────────────────────
    const ts = this._thrusterSystem
    if (ts && ts.on) {
      ts.points.visible = true
      const drag = 1.0 - delta * 2.0  // 速度衰减系数（适当减阻，尾焰更长）
      for (let i = 0; i < ts.count; i++) {
        ts.ages[i] += delta
        if (ts.ages[i] >= ts.lifetimes[i]) {
          ts.ages[i] = 0
          ts.layers[i] = Math.floor(Math.random() * 3)
          this._resetParticle(i, ts.positions, ts.velocities)
        }
        // 施加阻力让粒子减速，产生火焰末端收窄的视觉效果
        ts.velocities[i * 3]     *= drag
        ts.velocities[i * 3 + 1] *= drag
        ts.velocities[i * 3 + 2] *= drag
        ts.positions[i * 3]     += ts.velocities[i * 3]     * delta
        ts.positions[i * 3 + 1] += ts.velocities[i * 3 + 1] * delta
        ts.positions[i * 3 + 2] += ts.velocities[i * 3 + 2] * delta
      }
      ts.points.geometry.attributes.position.needsUpdate = true
      ts.ageAttr.needsUpdate = true
      ts.layerAttr.needsUpdate = true
    }

    this._engineTime += delta
  }

  dispose() {
    if (this.group) {
      this.group.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
          else child.material.dispose()
        }
      })
      this.scene.remove(this.group)
    }
    this._envMap?.dispose()
  }
}
