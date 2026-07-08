import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import StarshipModel from './StarshipModel.js'
import ShieldEffect from './ShieldEffect.js'
import LightingSystem from './LightingSystem.js'

export default class StarshipExperience {
  constructor(canvas) {
    this.canvas = canvas
    this.width = canvas.clientWidth
    this.height = canvas.clientHeight
    this._disposed = false
    this._animId = null

    // 事件回调（由 Vue 层注入）
    this.onLoadProgress = null
    this.onLoadComplete = null
    this.onStateChange = null

    // 当前状态
    this.state = {
      exploded: false,
      shieldOn: false,
      engineOn: false,
      autoRotate: true,
      rotateSpeed: 0.2,
      lightColor: '#4ecdc4',
      lightIntensity: 1.5,
      ambientPreset: 'cruise', // 'cruise' | 'combat' | 'silent'
    }

    this._initRenderer()
    this._initScene()
    this._initCamera()
    this._initControls()
    this._initLights()
    this._initStarfield()
    this._initMouse()
    this._loadModel()
    this._startLoop()
    this._onResize = this._handleResize.bind(this)
    window.addEventListener('resize', this._onResize)
  }

  _initRenderer() {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: dpr < 2,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(this.width, this.height, false)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000510)
    this.scene.fog = new THREE.FogExp2(0x000510, 0.008)
  }

  _initStarfield() {
    // 使用与进入页相同的银河系照片作为背景
    const loader = new THREE.TextureLoader()
    loader.load('/textures/galaxy/2k_stars_milky_way.jpg', (tex) => {
      this.scene.background = tex
      this._bgTexture = tex
    })
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 200)
    // 斜俯视 3/4 视角，能同时看到飞船长度、宽度和顶部
    this.camera.position.set(2.8, 4.0, 3.6)
    this.camera.lookAt(0, 0, 0)
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.minDistance = 2
    this.controls.maxDistance = 20
    this.controls.maxPolarAngle = Math.PI * 0.85
    this.controls.minPolarAngle = Math.PI * 0.05
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = this.state.rotateSpeed
    this.controls.target.set(0, 0, 0)
  }

  _initLights() {
    this.lighting = new LightingSystem(this.scene)
  }

  _initMouse() {
    this._mouse = new THREE.Vector2(9999, 9999)
    this._onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this._mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this._mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }
    this.canvas.addEventListener('mousemove', this._onMouseMove)
  }

  _loadModel() {
    this.model = new StarshipModel(this.scene, this.renderer, {
      onProgress: (p) => this.onLoadProgress?.(p),
      onReady: () => {
        this.onLoadComplete?.()
        if (this.model.group) {
          const box = new THREE.Box3().setFromObject(this.model.group)
          const size = new THREE.Vector3()
          box.getSize(size)
          const radius = size.length() * 0.55
          this.shield = new ShieldEffect(this.scene, radius)
          this.shield.setVisible(false)
          this.shield.syncPixelRatio(this.renderer)
        }
        // 同步初始引擎状态（默认关闭）
        this.model?.setEngineOn(this.state.engineOn)
        this.lighting?.setEngineLights(this.state.engineOn)
      },
    })
  }

  _startLoop() {
    const clock = new THREE.Clock()
    const loop = () => {
      if (this._disposed) return
      this._animId = requestAnimationFrame(loop)
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      this.controls.update()
      this.model?.update(elapsed, delta)
      this.shield?.update(elapsed)
      this.lighting?.update(elapsed)

      this.renderer.render(this.scene, this.camera)
    }
    loop()
  }

  _handleResize() {
    if (this._disposed || !this.canvas) return
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
    this.shield?.syncPixelRatio(this.renderer)
  }

  // ─── 公开控制 API（供 CockpitPanel 调用）─────────────────────────────

  toggleExplode() {
    this.state.exploded = !this.state.exploded
    this.model?.setExploded(this.state.exploded)
    this.particles?.setExploded(this.state.exploded)
    this.onStateChange?.('exploded', this.state.exploded)
  }

  setExploded(value) {
    if (this.state.exploded === value) return
    this.state.exploded = value
    this.model?.setExploded(value)
    this.onStateChange?.('exploded', value)
  }

  setShield(value) {
    this.state.shieldOn = value
    this.shield?.setVisible(value)
    if (value) this.lighting.activateShieldGlow()
    else this.lighting.deactivateShieldGlow()
    this.onStateChange?.('shieldOn', value)
  }

  setEngine(value) {
    this.state.engineOn = value
    this.model?.setEngineOn(value)
    this.lighting.setEngineLights(value)
    this.onStateChange?.('engineOn', value)
  }

  setSpotLight(value) {
    this.state.spotLightOn = value
    this.lighting.setSpotLights(value)
    this.onStateChange?.('spotLightOn', value)
  }

  setAutoRotate(value) {
    this.state.autoRotate = value
    this.controls.autoRotate = value
  }

  setRotateSpeed(value) {
    this.state.rotateSpeed = value
    this.controls.autoRotateSpeed = value
  }

  setLightColor(hexColor) {
    this.state.lightColor = hexColor
    this.lighting.setMainColor(new THREE.Color(hexColor))
  }

  setLightIntensity(value) {
    this.state.lightIntensity = value
    this.lighting.setMainIntensity(value)
  }



  setPreset(preset) {
    this.state.ambientPreset = preset
    const presets = {
      cruise: { lightColor: '#4ecdc4', lightIntensity: 1.5, engineOn: true, shieldOn: false },
      combat: { lightColor: '#ff4444', lightIntensity: 2.2, engineOn: true, shieldOn: true },
      silent: { lightColor: '#334466', lightIntensity: 0.5, engineOn: false, shieldOn: false },
    }
    const cfg = presets[preset]
    if (!cfg) return
    this.setLightColor(cfg.lightColor)
    this.setLightIntensity(cfg.lightIntensity)
    this.setEngine(cfg.engineOn)
    this.setShield(cfg.shieldOn)
    this.onStateChange?.('preset', preset)
  }

  // ─── 销毁 ────────────────────────────────────────────────────────────

  destroy() {
    this._disposed = true
    if (this._animId) cancelAnimationFrame(this._animId)
    window.removeEventListener('resize', this._onResize)
    this.canvas.removeEventListener('mousemove', this._onMouseMove)
    this.controls.dispose()
    this.model?.dispose()
    this.shield?.dispose()
    this.lighting?.dispose()
    if (this._bgTexture) {
      this._bgTexture.dispose()
    }
    this.renderer.dispose()
    this.renderer.forceContextLoss?.()
  }
}
