import * as THREE from 'three'
import vertexShader from '@/galaxy/shaders/starship-particles/vertex.glsl'
import fragmentShader from '@/galaxy/shaders/starship-particles/fragment.glsl'

const isMobile = () => window.innerWidth < 768

export default class ParticleCloud {
  constructor(scene) {
    this.scene = scene
    this._opacity = 0.7
    this._exploded = false
    this._targetExplode = 0
    this._explodeProgress = 0
    this._build()
  }

  _build() {
    const count = isMobile() ? 1800 : 4000
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // 椭球分布
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.5 + Math.pow(Math.random(), 0.5) * 2.5

      const rx = r * 1.6  // 椭球比例
      const ry = r * 1.0
      const rz = r * 1.2

      positions[i * 3 + 0] = rx * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = ry * Math.cos(phi)
      positions[i * 3 + 2] = rz * Math.sin(phi) * Math.sin(theta)

      randoms[i] = Math.random()

      // 拆解时的速度方向（径向外扩）
      const vx = positions[i * 3 + 0]
      const vy = positions[i * 3 + 1]
      const vz = positions[i * 3 + 2]
      const len = Math.sqrt(vx * vx + vy * vy + vz * vz) + 0.001
      velocities[i * 3 + 0] = (vx / len) * (1.5 + Math.random() * 2.0)
      velocities[i * 3 + 1] = (vy / len) * (1.5 + Math.random() * 2.0)
      velocities[i * 3 + 2] = (vz / len) * (1.5 + Math.random() * 2.0)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
    geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3))

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 3.5 },
        uMouse: { value: new THREE.Vector2(9999, 9999) },
        uMouseInfluence: { value: 0.4 },
        uExplode: { value: 0 },
      },
    })

    this.points = new THREE.Points(geometry, this.material)
    this.scene.add(this.points)
  }

  setExploded(value) {
    this._exploded = value
  }

  setOpacity(value) {
    this._opacity = value
    this.material.uniforms.uSize.value = 3.5 * value
  }

  update(elapsed, mouse) {
    this.material.uniforms.uTime.value = elapsed
    if (mouse) {
      this.material.uniforms.uMouse.value.set(mouse.x, mouse.y)
    }

    // 平滑插值拆解状态
    const target = this._exploded ? 1 : 0
    this._explodeProgress += (target - this._explodeProgress) * 0.025
    this.material.uniforms.uExplode.value = this._explodeProgress

    // 慢速自转
    this.points.rotation.y = elapsed * 0.05
  }

  dispose() {
    this.points.geometry.dispose()
    this.material.dispose()
    this.scene.remove(this.points)
  }
}
