import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/**
 * AstronautModel - 星舰页面的宇航员模型（独立图层，可拖拽）
 *
 * 设计原则：
 *   - 宇航员位于独立的 overlay 场景，由独立的「固定相机」渲染，
 *     与星舰的 OrbitControls（拖拽 / 缩放 / 自动旋转）完全解耦：
 *     鼠标控制星舰时宇航员不跟随；拖动宇航员时星舰也不动
 *   - 支持被拖拽到页面任意位置（拖拽逻辑由 StarshipExperience 驱动，
 *     通过 setBasePosition 更新基准位置）
 *   - 在基准位置上叠加小幅慢速漂浮，保持太空失重感
 */
export default class AstronautModel {
  constructor(scene, camera, { onProgress, onReady } = {}) {
    this.scene = scene
    this.camera = camera

    this.group = null
    this.root = null
    this._loaded = false

    // 基准位置（拖拽修改的目标），漂浮动画在此基础上叠加
    this.basePosition = new THREE.Vector3()
    this._initBasePosition()

    this._targetSize = 0.7
    this._scale = 1

    this._load(onProgress, onReady)
  }

  // 依据固定相机的视锥，把默认基准位置放在画面左下角
  _initBasePosition() {
    const { halfW, halfH } = this._viewHalfSize()
    this.basePosition.set(-halfW * 0.55, -halfH * 0.5, 0)
  }

  // 固定相机在 z=0 平面上的可视半宽 / 半高
  _viewHalfSize() {
    const dist = this.camera.position.z
    const halfH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * dist
    const halfW = halfH * this.camera.aspect
    return { halfW, halfH }
  }

  _load(onProgress, onReady) {
    const loader = new GLTFLoader()
    loader.load(
      '/models/astronaut_texture.glb',
      (gltf) => {
        this._setup(gltf)
        this._loaded = true
        onReady?.()
      },
      (event) => {
        if (event.lengthComputable) onProgress?.(event.loaded / event.total)
      },
      (err) => console.error('[AstronautModel] load error', err)
    )
  }

  _setup(gltf) {
    const root = gltf.scene
    this.root = root

    const box = new THREE.Box3().setFromObject(root)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z) || 1
    this._scale = this._targetSize / maxDim

    this.group = new THREE.Group()
    this.scene.add(this.group)

    root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry = child.geometry.clone()
        this._computeSmoothNormals(child.geometry)
        this._optimizeMaterial(child)
      }
    })

    root.position.sub(center)
    root.scale.setScalar(this._scale)
    this.group.add(root)

    // 基准姿态：与入口 mini canvas 一致，朝右（屏幕右）偏转一小角度，
    // 每帧在此基础上叠加失重摇摆旋转
    this._baseRotationY = 0.35

    this._updateMotion(0)
  }

  _optimizeMaterial(mesh) {
    const oldMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
    if (oldMat instanceof THREE.MeshStandardMaterial) {
      const mat = oldMat.clone()
      if (mat.normalMap) mat.normalScale = new THREE.Vector2(0.25, 0.25)
      mat.bumpMap = null
      mat.bumpScale = 0
      if (mat.roughnessMap) {
        mat.roughnessMap = null
        mat.roughness = 0.82
      } else {
        mat.roughness = Math.max(0.7, Math.min(0.9, (mat.roughness ?? 0.7) + 0.15))
      }
      mat.metalness = Math.min(0.25, mat.metalness ?? 0.1)
      mat.envMapIntensity = 1.0
      mesh.material = mat
      return
    }
    mesh.material = new THREE.MeshStandardMaterial({
      color: 0xf4f6f8,
      metalness: 0.12,
      roughness: 0.82,
      envMapIntensity: 0.9,
    })
  }

  _computeSmoothNormals(geometry) {
    if (!geometry) return
    geometry.computeVertexNormals()
  }

  // 拖拽时更新基准位置（限制在可视范围内，避免被拖出画面找不回来）
  setBasePosition(pos) {
    const { halfW, halfH } = this._viewHalfSize()
    const margin = 0.15
    this.basePosition.set(
      THREE.MathUtils.clamp(pos.x, -halfW + margin, halfW - margin),
      THREE.MathUtils.clamp(pos.y, -halfH + margin, halfH - margin),
      0
    )
  }

  _updateMotion(elapsed) {
    if (!this.group) return
    // 基准位置 + 小范围自主漂移（双频叠加，轨迹更有机；纯自身动画，与星舰交互完全解耦）
    this.group.position.set(
      this.basePosition.x + Math.sin(elapsed * 0.21) * 0.16 + Math.sin(elapsed * 0.43 + 2.1) * 0.05,
      this.basePosition.y + Math.sin(elapsed * 0.27 + 1.0) * 0.12 + Math.cos(elapsed * 0.38) * 0.04,
      this.basePosition.z + Math.cos(elapsed * 0.17) * 0.1
    )

    // 失重摇摆：绕三轴的小幅慢速旋转，像在太空中缓慢翻转飘动
    this.group.rotation.set(
      Math.sin(elapsed * 0.19 + 0.6) * 0.1, // 俯仰轻摆
      this._baseRotationY + Math.sin(elapsed * 0.13) * 0.28, // 左右慢转（幅度稍大）
      Math.sin(elapsed * 0.23 + 1.4) * 0.08 // 侧向摇摆
    )
  }

  update(elapsed) {
    if (!this.group || !this._loaded) return
    this._updateMotion(elapsed)
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
      this.group.parent?.remove(this.group)
    }
  }
}
