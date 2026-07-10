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
let rotY = 0

const init = () => {
  const canvas = canvasRef.value
  const s = props.size

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(s, s)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100)
  camera.position.set(0.6, 0.8, 2.2)
  camera.lookAt(0, 0, 0)

  // 环境光
  const ambient = new THREE.AmbientLight(0x4ecdc4, 0.6)
  scene.add(ambient)

  // 主光源（模拟星空蓝白）
  const keyLight = new THREE.DirectionalLight(0xc8e6ff, 1.8)
  keyLight.position.set(2, 3, 3)
  scene.add(keyLight)

  // 补光（暖色，底部）
  const fillLight = new THREE.DirectionalLight(0xff9955, 0.5)
  fillLight.position.set(-2, -1, 1)
  scene.add(fillLight)

  // 边缘光（科幻青）
  const rimLight = new THREE.DirectionalLight(0x4ecdc4, 1.2)
  rimLight.position.set(-1, 2, -3)
  scene.add(rimLight)

  const loader = new GLTFLoader()
  loader.load('/models/starship_texture.glb', (gltf) => {
    model = gltf.scene

    // 自动居中 + 缩放适配
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const boxSize = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z)
    model.position.sub(center)
    model.scale.setScalar(1.5 / maxDim)

    scene.add(model)
  })

  animate()
}

const animate = () => {
  animId = requestAnimationFrame(animate)
  if (model) {
    rotY += props.warp ? 0.06 : 0.008
    model.rotation.y = rotY
    // 缓慢俯仰摆动
    model.rotation.x = Math.sin(rotY * 0.3) * 0.12
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
