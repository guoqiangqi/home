import EventEmitter from './event-emitter.js'

export default class Time extends EventEmitter {
  constructor() {
    super()

    this.start = Date.now()
    this.current = this.start
    this.elapsed = 0
    this.delta = 16
    this.rafId = null

    this.rafId = window.requestAnimationFrame(() => {
      this.tick()
    })
  }

  tick() {
    const currentTime = Date.now()
    this.delta = currentTime - this.current
    this.current = currentTime
    this.elapsed = this.current - this.start

    this.trigger('tick')

    this.rafId = window.requestAnimationFrame(() => {
      this.tick()
    })
  }

  stop() {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  // 无缝恢复：将暂停期间的时长从计时中扣除，避免 elapsed/delta 跳变导致画面突变
  play() {
    if (this.rafId !== null) {
      return
    }

    const now = Date.now()
    const pausedDuration = now - this.current
    this.start += pausedDuration
    this.current = now
    this.delta = 16

    this.rafId = window.requestAnimationFrame(() => {
      this.tick()
    })
  }
}
