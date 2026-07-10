import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/**
 * AstronautModel - 星舰页面的宇航员补充模型（纯装饰，无交互）
 *
 * 设计原则：
 *   - 宇航员作为 scene 子节点，每帧根据相机视线定位到页面左下角世界位置
 *     （不挂在 camera 下，避免污染 OrbitControls，保证星舰 autoRotate 正常）
 *   - 姿态与入口 mini canvas 截图完全一致：3/4 正面、轻微俯视，保持稳定不变
 *   - 仅在锚点附近做小幅度、慢速度的轻盈漂浮
 *   - 不发光、不投射、无光晕，对星舰效果零影响
 */
export default class AstronautModel {
  constructor(scene, renderer, camera, { onProgress, onReady } = {}) {
    this.scene = scene
    this.renderer = renderer
    this.camera = camera

    this.group = null
    this.root = null
    this._loaded = false

    // 锚点：相机前方左下角的相机局部偏移
    this._anchor = new THREE.Vector3(-2.0, -1.1, -4.0)

    this._orientReady = false

    // 复用对象
    this._camPos = new THREE.Vector3()
    this._camFwd = new THREE.Vector3()
    this._camRight = new THREE.Vector3()
    this._camUp = new THREE.Vector3()
    this._tmpQuat = new THREE.Quaternion()
    this._lookMtx = new THREE.Matrix4()
    this._lookTarget = new THREE.Vector3()
    this._target = new THREE.Vector3()

    this._targetSize = 0.7
    this._scale = 1

    this._load(onProgress, onReady)
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
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    root.position.sub(center)
    root.scale.setScalar(this._scale)
    this.group.add(root)

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

  _updateMotion(elapsed) {
    if (!this.group || !this.camera) return
    this.camera.updateMatrixWorld(true)

    this.camera.getWorldPosition(this._camPos)
    this.camera.getWorldQuaternion(this._tmpQuat)
    this._camFwd.set(0, 0, -1).applyQuaternion(this._tmpQuat)
    this._camRight.set(1, 0, 0).applyQuaternion(this._tmpQuat)
    this._camUp.set(0, 1, 0).applyQuaternion(this._tmpQuat)

    const ax = this._anchor.x, ay = this._anchor.y, az = this._anchor.z
    const ox = ax + Math.sin(elapsed * 0.21) * 0.16
    const oy = ay + Math.sin(elapsed * 0.27 + 1.0) * 0.12
    const oz = az + Math.cos(elapsed * 0.17) * 0.10

    this._target
      .copy(this._camPos)
      .addScaledVector(this._camFwd, -oz)
      .addScaledVector(this._camRight, ox)
      .addScaledVector(this._camUp, oy)

    this.group.position.copy(this._target)
  }

  update(elapsed) {
    this._elapsed = elapsed
    if (!this.group || !this._loaded) return

    this.group.scale.setScalar(1)

    if (!this._orientReady) {
      this._initOrientation()
      this._orientReady = true
    }

    this._updateMotion(elapsed)
  }

  _initOrientation() {
    if (!this.camera) return
    this.camera.updateMatrixWorld(true)
    this.camera.getWorldPosition(this._camPos)
    this.camera.getWorldQuaternion(this._tmpQuat)
    this._camFwd.set(0, 0, -1).applyQuaternion(this._tmpQuat)
    this._camUp.set(0, 1, 0).applyQuaternion(this._tmpQuat)
    // 模型 +Z 指向 +camFwd（与相机视线同向），即从相机视角看是背面（与入口 mini canvas 一致）
    this._lookTarget.copy(this._camFwd)
    this._lookMtx.lookAt(new THREE.Vector3(0, 0, 0), this._lookTarget, this._camUp)
    this.group.quaternion.setFromRotationMatrix(this._lookMtx)
    // 整体朝右（屏幕右）偏转一小角度，让姿态更自然
    this.group.rotateY(0.35)
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
