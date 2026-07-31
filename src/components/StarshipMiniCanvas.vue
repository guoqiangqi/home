<template>
  <canvas ref="canvasRef" class="mini-canvas" :width="size" :height="size"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const props = defineProps({
  size: { type: Number, default: 80 },
  warp: { type: Boolean, default: false },
})

const canvasRef = ref(null)

let renderer, scene, camera, model, animId
let t = 0
// 基准位置（模型居中后的原点），供小范围漂浮叠加位移
let basePos = new THREE.Vector3()
// 基准朝向：稍微面向左侧
const BASE_YAW = -0.5

const init = () => {
  const canvas = canvasRef.value
  const s = props.size

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(s, s)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100)
  camera.position.set(0, 0.15, 2.4)
  camera.lookAt(0, 0.15, 0)

  // 环境光：柔和的冷白，均匀铺底，避免整体染上高饱和青色
  const ambient = new THREE.AmbientLight(0xbfd4e6, 0.6)
  scene.add(ambient)

  // 主光源（星白，自然照明）
  const keyLight = new THREE.DirectionalLight(0xdcecff, 1.2)
  keyLight.position.set(2, 3, 3)
  scene.add(keyLight)

  // 补光（极淡暖色，柔化背光面）
  const fillLight = new THREE.DirectionalLight(0xffd8b8, 0.32)
  fillLight.position.set(-2, -1, 1)
  scene.add(fillLight)

  // 边缘光（收敛为淡冷白，仅勾勒轮廓，不做科幻高亮）
  const rimLight = new THREE.DirectionalLight(0xaac8e6, 0.45)
  rimLight.position.set(-1, 2, -3)
  scene.add(rimLight)

  const loader = new GLTFLoader()
  loader.load('/models/astronaut_texture.glb', (gltf) => {
    model = gltf.scene

    // 自动居中 + 缩放适配
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const boxSize = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z)
    model.position.sub(center)
    // 正立宇航员适配圆形入口
    model.scale.setScalar(1.4 / maxDim)
    // 基准朝向稍向左侧，并记录居中后的基准位置
    model.rotation.y = BASE_YAW
    basePos.copy(model.position)

    scene.add(model)
  })

  animate()
}

const animate = () => {
  animId = requestAnimationFrame(animate)
  if (model) {
    if (props.warp) {
      // warp 时：大幅摆动，回到基准位置
      t += 0.06
      model.rotation.y = BASE_YAW + Math.sin(t * 0.6) * 0.9
      model.rotation.x = Math.sin(t * 0.3) * 0.05
      model.rotation.z = 0
      model.position.copy(basePos)
    } else {
      // 平时：保持稍面向左侧，在附近做小范围漂浮与轻微旋转
      t += 0.01
      model.rotation.y = BASE_YAW + Math.sin(t * 0.6) * 0.12
      model.rotation.x = Math.sin(t * 0.45) * 0.05
      model.rotation.z = Math.sin(t * 0.3) * 0.03
      model.position.x = basePos.x + Math.sin(t * 0.5) * 0.06
      model.position.y = basePos.y + Math.sin(t * 0.7 + 1.0) * 0.05
      model.position.z = basePos.z + Math.sin(t * 0.4 + 2.0) * 0.03
    }
  }
  renderer?.render(scene, camera)
}

const dispose = () => {
  if (animId) cancelAnimationFrame(animId)
  renderer?.dispose()
  if (model) {
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry?.dispose()
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => m?.dispose())
      }
    })
  }
}

onMounted(init)
onBeforeUnmount(dispose)
</script>

<style scoped>
.mini-canvas {
  display: block;
  border-radius: 50%;
}
</style>
