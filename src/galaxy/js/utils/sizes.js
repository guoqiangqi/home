import EventEmitter from './event-emitter.js'

export default class Sizes extends EventEmitter {
  constructor() {
    super()

    this.width = window.innerWidth
    this.height = window.innerHeight
    this.aspect = this.width / this.height
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    this._onResize = () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.aspect = this.width / this.height
      this.pixelRatio = Math.min(window.devicePixelRatio, 2)
      this.trigger('resize')
    }

    window.addEventListener('resize', this._onResize)
  }

  dispose() {
    window.removeEventListener('resize', this._onResize)
  }
}
