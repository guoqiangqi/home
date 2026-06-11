import * as THREE from 'three'

import Camera from './camera.js'
import Renderer from './renderer.js'
import sources from './sources.js'
import Debug from './utils/debug.js'
import IMouse from './utils/imouse.js'
import Resources from './utils/resources.js'
import Sizes from './utils/sizes.js'
import Stats from './utils/stats.js'
import Time from './utils/time.js'
import PhysicsWorld from './world/physics-world.js'
import World from './world/world.js'

let instance = null

function disposeObject3D(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose()
    }
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) {
            value.dispose()
          }
        })
        material.dispose()
      })
    }
  })
}

export default class Experience {
  constructor(canvas, options = {}) {
    if (instance) {
      return instance
    }

    instance = this
    this.options = options

    this.canvas = canvas

    this.debug = new Debug()
    this.stats = new Stats()
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.camera = new Camera({ enableScrollZoom: options.enableScrollZoom ?? false })
    this.renderer = new Renderer()
    this.resources = new Resources(sources)
    this.physics = new PhysicsWorld()
    this.iMouse = new IMouse()
    this.world = new World()

    this._onResize = () => {
      this.resize()
    }
    this._onTick = () => {
      this.update()
    }

    this.sizes.on('resize', this._onResize)
    this.time.on('tick', this._onTick)
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    this.camera.update()
    this.world.update()
    this.renderer.update()
    this.stats.update()
    this.iMouse.update()
  }

  static destroy() {
    if (!instance) {
      return
    }

    const exp = instance
    instance = null

    exp.time.stop()
    exp.sizes.off('resize')
    exp.time.off('tick')
    exp.sizes.dispose()
    exp.camera.dispose()

    disposeObject3D(exp.scene)

    exp.renderer.instance.dispose()
    exp.renderer.instance.forceContextLoss?.()

    if (exp.debug.active && exp.debug.ui) {
      exp.debug.ui.dispose()
    }

    if (exp.stats.active && exp.stats.stats?.dom) {
      exp.stats.stats.dom.remove()
    }

    exp.canvas = null
  }
}
