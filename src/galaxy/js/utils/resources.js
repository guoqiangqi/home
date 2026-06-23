import * as THREE from 'three'

import Experience from '../experience.js'
import EventEmitter from './event-emitter.js'

export default class Resources extends EventEmitter {
  constructor(sources, options = {}) {
    super()

    this.experience = new Experience()
    this.renderer = this.experience.renderer
    this.sources = sources

    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    // Loading screen elements
    this.loadingScreen = document.getElementById('loading-screen')
    this.loadingBar = document.getElementById('loading-bar')
    this.loadingPercentage = document.getElementById('loading-percentage')

    this.options = {
      ...options,
    }

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    // 仅实例化实际用到的加载器（sources.js 仅包含 texture / cubeTexture），
    // 避免引入 GLTF/DRACO/KTX2/FBX/EXR/SVG/OBJ/RGBE/Font 等大型扩展拖累打包体积。
    this.loaders = {}
    this.loaders.textureLoader = new THREE.TextureLoader()
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
  }

  startLoading() {
    for (const source of this.sources) {
      switch (source.type) {
        case 'texture': {
          this.loaders.textureLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'cubeTexture': {
          this.loaders.cubeTextureLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'video': {
          this.loadVideoTexture(source.path).then((file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        default: {
          console.warn(`[Resources] 未支持的资源类型: ${source.type}（已精简加载器，仅支持 texture/cubeTexture/video）`)
        }
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file
    this.loaded++

    // Update loading progress
    const progress = this.loadProgress
    const percentage = Math.round(progress * 100)

    if (this.loadingBar) {
      this.loadingBar.style.width = `${percentage}%`
    }
    if (this.loadingPercentage) {
      this.loadingPercentage.textContent = `${percentage}%`
    }

    if (this.loaded === this.toLoad) {
      // Hide loading screen with fade out animation
      if (this.loadingScreen) {
        this.loadingScreen.style.transition = 'opacity 0.5s ease-out'
        this.loadingScreen.style.opacity = '0'
        setTimeout(() => {
          this.loadingScreen.style.display = 'none'
        }, 500)
      }
      this.trigger('ready')
    }
  }

  loadVideoTexture(path) {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.src = path
      video.loop = true
      video.muted = true
      video.playsInline = true

      video.addEventListener('loadeddata', () => {
        const texture = new THREE.VideoTexture(video)
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.format = THREE.RGBFormat

        resolve(texture)
      })

      video.load()
    })
  }

  get loadProgress() {
    return this.loaded / this.toLoad
  }

  get isLoaded() {
    return this.loaded === this.toLoad
  }
}
