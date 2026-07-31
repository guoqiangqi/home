import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import StarshipModel from './StarshipModel.js'
import ShieldEffect from './ShieldEffect.js'
import LightingSystem from './LightingSystem.js'
import AstronautModel from './AstronautModel.js'

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
    this._initAstronautLayer()
    this._loadModel()
    this._initAstronautDrag()
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

  // 宇航员独立图层：独立场景 + 固定相机，与星舰 OrbitControls 完全解耦
  _initAstronautLayer() {
    this.astronautScene = new THREE.Scene()
    this.astronautCamera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 50)
    this.astronautCamera.position.set(0, 0, 5)
    this.astronautCamera.lookAt(0, 0, 0)

    // 图层专属灯光（overlay 场景无法复用主场景灯光）
    const ambient = new THREE.AmbientLight(0xffffff, 0.55)
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(2, 3, 4)
    const rim = new THREE.DirectionalLight(0x88ccff, 0.8)
    rim.position.set(-3, 1, -2)
    this.astronautScene.add(ambient, key, rim)
  }


  _loadModel() {
    let starshipProgress = 0
    let astronautProgress = 0
    let starshipReady = false
    let astronautReady = false

    const reportProgress = () => {
      // 星舰加载占 70%，宇航员加载占 30%，使整体加载进度更平滑
      const p = starshipProgress * 0.7 + astronautProgress * 0.3
      this.onLoadProgress?.(p)
    }

    const tryComplete = () => {
      if (!starshipReady || !astronautReady) return
      this.onLoadComplete?.()
    }

    // 星舰模型加载
    this.model = new StarshipModel(this.scene, this.renderer, {
      onProgress: (p) => {
        starshipProgress = p
        reportProgress()
      },
      onReady: () => {
        starshipReady = true
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
        tryComplete()
      },
    })

    // 宇航员模型加载（独立图层，作为星舰补充）
    this.astronaut = new AstronautModel(this.astronautScene, this.astronautCamera, {
      onProgress: (p) => {
        astronautProgress = p
        reportProgress()
      },
      onReady: () => {
        astronautReady = true
        tryComplete()
      },
    })
  }

  // ─── 宇航员拖拽（捕获阶段拦截，避免触发星舰 OrbitControls）────────────

  _initAstronautDrag() {
    this._raycaster = new THREE.Raycaster()
    this._pointerNDC = new THREE.Vector2()
    this._dragging = false
    this._dragOffset = new THREE.Vector3()
    this._dragPoint = new THREE.Vector3()

    this._onPointerDown = (e) => {
      if (!this._hitAstronaut(e)) return
      // 命中宇航员：拦截事件，OrbitControls 收不到，星舰保持不动
      e.stopImmediatePropagation()
      e.preventDefault()
      this._dragging = true
      this._pointerToPlane(e, this._dragPoint)
      this._dragOffset.copy(this.astronaut.basePosition).sub(this._dragPoint)
      this.canvas.style.cursor = 'grabbing'
      this.canvas.setPointerCapture?.(e.pointerId)
    }

    this._onPointerMove = (e) => {
      if (this._dragging) {
        this._pointerToPlane(e, this._dragPoint)
        this.astronaut?.setBasePosition(this._dragPoint.add(this._dragOffset))
        return
      }
      // 悬停提示：指到宇航员时显示可抓取光标
      this.canvas.style.cursor = this._hitAstronaut(e) ? 'grab' : ''
    }

    this._onPointerUp = (e) => {
      if (!this._dragging) return
      this._dragging = false
      this.canvas.style.cursor = ''
      this.canvas.releasePointerCapture?.(e.pointerId)
    }

    // capture: true 保证先于 OrbitControls 的监听器执行
    this.canvas.addEventListener('pointerdown', this._onPointerDown, { capture: true })
    this.canvas.addEventListener('pointermove', this._onPointerMove, { capture: true })
    window.addEventListener('pointerup', this._onPointerUp, { capture: true })
  }

  _updatePointerNDC(e) {
    const rect = this.canvas.getBoundingClientRect()
    this._pointerNDC.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )
  }

  _hitAstronaut(e) {
    if (!this.astronaut?.group) return false
    this._updatePointerNDC(e)
    this._raycaster.setFromCamera(this._pointerNDC, this.astronautCamera)
    return this._raycaster.intersectObject(this.astronaut.group, true).length > 0
  }

  // 将指针位置换算到宇航员所在的 z=0 平面（宇航员相机空间）
  _pointerToPlane(e, out) {
    this._updatePointerNDC(e)
    this._raycaster.setFromCamera(this._pointerNDC, this.astronautCamera)
    const { origin, direction } = this._raycaster.ray
    const t = -origin.z / direction.z
    out.copy(origin).addScaledVector(direction, t)
    return out
  }

  _startLoop() {
    const clock = new THREE.Clock()
    const loop = () => {
      if (this._disposed) return
      this._animId = requestAnimationFrame(loop)
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      // 同步 autoRotate 状态（防止其它路径误改），保证星舰自动旋转
      if (this.controls) {
        this.controls.autoRotate = this.state.autoRotate
        this.controls.autoRotateSpeed = this.state.rotateSpeed
        this.controls.update()
      }
      this.model?.update(elapsed, delta)
      this.astronaut?.update(elapsed, delta)
      this.shield?.update(elapsed)
      this.lighting?.update(elapsed)

      // 先渲染星舰主场景，再叠加渲染独立的宇航员图层
      this.renderer.render(this.scene, this.camera)
      this.renderer.autoClear = false
      this.renderer.clearDepth()
      this.renderer.render(this.astronautScene, this.astronautCamera)
      this.renderer.autoClear = true
    }
    loop()
  }

  _handleResize() {
    if (this._disposed || !this.canvas) return
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.astronautCamera.aspect = w / h
    this.astronautCamera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
    this.shield?.syncPixelRatio(this.renderer)
  }

  // ─── 公开控制 API（供 CockpitPanel 调用）─────────────────────────────

  toggleExplode() {
    this.state.exploded = !this.state.exploded
    this.model?.setExploded(this.state.exploded)
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
    this.canvas.removeEventListener('pointerdown', this._onPointerDown, { capture: true })
    this.canvas.removeEventListener('pointermove', this._onPointerMove, { capture: true })
    window.removeEventListener('pointerup', this._onPointerUp, { capture: true })
    this.canvas.style.cursor = ''
    this.controls.dispose()
    this.model?.dispose()
    this.astronaut?.dispose()
    this.shield?.dispose()
    this.lighting?.dispose()
    if (this._bgTexture) {
      this._bgTexture.dispose()
    }
    this.renderer.dispose()
    this.renderer.forceContextLoss?.()
  }
}
